"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CrawlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerService = void 0;
const common_1 = require("@nestjs/common");
const events_1 = require("events");
const robots_util_1 = require("./utils/robots.util");
const url_util_1 = require("./utils/url.util");
/**
 * Fallback CrawlerService that uses fetch instead of Playwright
 * This is useful for testing and environments where Playwright isn't available
 */
let CrawlerService = CrawlerService_1 = class CrawlerService extends events_1.EventEmitter {
    logger = new common_1.Logger(CrawlerService_1.name);
    robotsUtil;
    activeCrawls = new Map();
    defaultOptions = {
        concurrency: 5,
        defaultUserAgent: 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
        defaultTimeout: 30000,
        defaultRetries: 3,
        respectRobotsTxt: true,
        defaultCrawlDelay: 1000,
    };
    constructor() {
        super();
        this.robotsUtil = new robots_util_1.RobotsUtil();
        this.setMaxListeners(100);
    }
    async onModuleInit() {
        this.logger.log('🚀 Fallback Crawler initialized (using fetch instead of Playwright)');
    }
    async onModuleDestroy() {
        await this.cleanup();
    }
    /**
     * Start crawling a website using fetch
     */
    async crawl(job) {
        const jobId = job.id;
        this.logger.log(`Starting fallback crawl job ${jobId} for ${job.urls.join(', ')}`);
        // Validate job parameters
        this.validateCrawlJob(job);
        // Initialize crawl state
        const crawlState = {
            jobId,
            job,
            startTime: new Date(),
            urlQueue: new Set(),
            processedUrls: new Set(),
            crawledPages: new Map(),
            errors: [],
            currentDepth: 0,
            domainDelays: new Map(),
            lastCrawlTime: new Map(),
        };
        // Add initial URLs to queue
        job.urls.forEach(url => {
            const normalizedUrl = (0, url_util_1.normalizeUrl)(url);
            this.logger.log(`Processing URL: ${url} -> ${normalizedUrl}`);
            if ((0, url_util_1.isValidUrl)(normalizedUrl)) {
                crawlState.urlQueue.add(normalizedUrl);
                this.logger.log(`Added URL to queue: ${normalizedUrl}`);
            }
            else {
                this.logger.warn(`Invalid URL skipped: ${normalizedUrl}`);
            }
        });
        this.logger.log(`Initial queue size: ${crawlState.urlQueue.size}`);
        // Store active crawl
        this.activeCrawls.set(jobId, crawlState);
        // Start crawling asynchronously
        this.executeCrawl(crawlState).catch(error => {
            this.logger.error(`Crawl job ${jobId} failed:`, error);
            this.emit('crawl-error', {
                url: 'unknown',
                error: error.message,
                timestamp: new Date(),
                depth: 0,
            });
        });
        this.emit('crawl-started', jobId);
        return new Promise((resolve, reject) => {
            this.once('crawl-finished', (result) => {
                if (result.jobId === jobId) {
                    resolve(result);
                }
            });
            this.once('crawl-error', (error) => {
                reject(error);
            });
        });
    }
    /**
     * Execute the crawl job using fetch
     */
    async executeCrawl(crawlState) {
        const { jobId, job } = crawlState;
        try {
            let processedCount = 0;
            while (crawlState.urlQueue.size > 0 && processedCount < job.maxPages) {
                const urlsToProcess = Array.from(crawlState.urlQueue).slice(0, Math.min(5, job.maxPages - processedCount));
                crawlState.urlQueue.clear();
                // Process URLs with limited concurrency
                const crawlPromises = urlsToProcess.map(url => this.crawlSinglePageWithFetch(url, crawlState));
                await Promise.allSettled(crawlPromises);
                processedCount += urlsToProcess.length;
                // Update progress
                this.emitProgress(crawlState);
                // Check if we've reached max depth
                if (crawlState.currentDepth >= job.maxDepth) {
                    break;
                }
                crawlState.currentDepth++;
            }
            // Mark crawl as completed
            const result = this.generateCrawlResult(crawlState, true);
            this.emit('crawl-finished', result);
            // Clean up
            this.activeCrawls.delete(jobId);
        }
        catch (error) {
            this.logger.error(`Error during crawl execution for job ${jobId}:`, error);
            const result = this.generateCrawlResult(crawlState, false);
            this.emit('crawl-finished', result);
            this.activeCrawls.delete(jobId);
        }
    }
    /**
     * Crawl a single page using fetch
     */
    async crawlSinglePageWithFetch(url, crawlState) {
        const { job, processedUrls, crawledPages, errors, domainDelays, lastCrawlTime } = crawlState;
        // Skip if already processed
        if (processedUrls.has(url)) {
            return;
        }
        processedUrls.add(url);
        const startTime = Date.now();
        try {
            // Check robots.txt if enabled
            if (job.respectRobotsTxt !== false && this.defaultOptions.respectRobotsTxt) {
                const userAgent = job.userAgent || this.defaultOptions.defaultUserAgent;
                const isAllowed = await this.robotsUtil.isAllowed(url, userAgent);
                if (!isAllowed) {
                    this.logger.debug(`URL blocked by robots.txt: ${url}`);
                    return;
                }
                // Get crawl delay from robots.txt
                const robotsCrawlDelay = await this.robotsUtil.getCrawlDelay(url, userAgent);
                if (robotsCrawlDelay) {
                    const domain = (0, url_util_1.extractDomain)(url);
                    domainDelays.set(domain, robotsCrawlDelay);
                }
            }
            // Respect crawl delay
            await this.respectCrawlDelay(url, domainDelays, lastCrawlTime, job.crawlDelay);
            // Fetch the page
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), job.timeout || this.defaultOptions.defaultTimeout);
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': job.userAgent || this.defaultOptions.defaultUserAgent,
                    ...job.customHeaders,
                },
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const html = await response.text();
            const loadTime = Date.now() - startTime;
            // Extract page data using basic HTML parsing
            const crawledPage = this.extractPageDataFromHTML(url, html, response, loadTime, crawlState.currentDepth);
            // Store crawled page
            crawledPages.set(url, crawledPage);
            // Add discovered URLs to queue
            this.addDiscoveredUrls(crawledPage.links, url, crawlState);
            // Emit page crawled event
            this.emit('page-crawled', crawledPage);
            // Update last crawl time for domain
            const domain = (0, url_util_1.extractDomain)(url);
            lastCrawlTime.set(domain, Date.now());
        }
        catch (error) {
            this.logger.error(`Error crawling ${url}:`, error.message);
            const crawlError = {
                url,
                error: (error instanceof Error) ? error.message : String(error),
                statusCode: typeof error === 'object' &&
                    error !== null &&
                    'status' in error
                    ? error.status
                    : undefined,
                timestamp: new Date(),
                depth: crawlState.currentDepth,
            };
            errors.push(crawlError);
            this.emit('crawl-error', crawlError);
        }
    }
    /**
     * Extract page data from HTML using basic parsing
     */
    extractPageDataFromHTML(url, html, response, loadTime, depth) {
        // Basic HTML parsing using regex (not as accurate as DOM parsing, but works)
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : undefined;
        // Extract links
        const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
        const links = linkMatches
            .map(match => {
            const hrefMatch = match.match(/href=["']([^"']+)["']/i);
            return hrefMatch ? hrefMatch[1] : null;
        })
            .filter((link) => link !== null)
            .map(link => (0, url_util_1.resolveUrl)(url, link))
            .filter(link => (0, url_util_1.isValidUrl)(link))
            .map(link => (0, url_util_1.normalizeUrl)(link));
        // Extract images
        const imageMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
        const images = imageMatches
            .map(match => {
            const srcMatch = match.match(/src=["']([^"']+)["']/i);
            return srcMatch ? (0, url_util_1.resolveUrl)(url, srcMatch[1]) : null;
        })
            .filter((x) => x !== null);
        // Extract scripts
        const scriptMatches = html.match(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
        const scripts = scriptMatches
            .map(match => {
            const srcMatch = match.match(/src=["']([^"']+)["']/i);
            return srcMatch ? (0, url_util_1.resolveUrl)(url, srcMatch[1]) : null;
        })
            .filter((x) => x !== null);
        // Extract stylesheets
        const cssMatches = html.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
        const stylesheets = cssMatches
            .map(match => {
            const hrefMatch = match.match(/href=["']([^"']+)["']/i);
            return hrefMatch ? (0, url_util_1.resolveUrl)(url, hrefMatch[1]) : null;
        })
            .filter((x) => x !== null);
        // Extract meta tags
        const meta = {};
        const metaMatches = html.match(/<meta[^>]+>/gi) || [];
        metaMatches.forEach(match => {
            const nameMatch = match.match(/name=["']([^"']+)["']/i) || match.match(/property=["']([^"']+)["']/i);
            const contentMatch = match.match(/content=["']([^"']+)["']/i);
            if (nameMatch && contentMatch) {
                const name = nameMatch[1].toLowerCase();
                const content = contentMatch[1];
                switch (name) {
                    case 'description':
                        meta.description = content;
                        break;
                    case 'keywords':
                        meta.keywords = content;
                        break;
                    case 'robots':
                        meta.robots = content;
                        break;
                    case 'og:title':
                        meta.ogTitle = content;
                        break;
                    case 'og:description':
                        meta.ogDescription = content;
                        break;
                    case 'og:image':
                        meta.ogImage = content;
                        break;
                }
            }
        });
        // Extract canonical URL
        const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
        if (canonicalMatch) {
            meta.canonical = canonicalMatch[1];
        }
        // Extract headings
        const headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
        for (let i = 1; i <= 6; i++) {
            const headingMatches = html.match(new RegExp(`<h${i}[^>]*>([^<]*)</h${i}>`, 'gi')) || [];
            headings[`h${i}`] = headingMatches
                .map(match => match.replace(/<[^>]*>/g, '').trim())
                .filter(Boolean);
        }
        return {
            url,
            title,
            statusCode: response.status,
            contentType: response.headers.get('content-type') || undefined,
            size: html.length,
            loadTime,
            depth,
            html, // Include HTML content for SEO analysis
            links: Array.from(new Set(links)),
            assets: {
                images,
                scripts,
                stylesheets,
            },
            meta,
            headings,
            timestamp: new Date(),
        };
    }
    // Copy all the utility methods from the main service
    addDiscoveredUrls(links, parentUrl, crawlState) {
        const { job, urlQueue, processedUrls, currentDepth } = crawlState;
        links.forEach(link => {
            // Skip if already processed or queued
            if (processedUrls.has(link) || urlQueue.has(link)) {
                return;
            }
            // Check depth limit
            const linkDepth = (0, url_util_1.getUrlDepth)(link, job.urls[0]);
            if (linkDepth >= job.maxDepth) {
                return;
            }
            // Check domain restrictions
            if (!(0, url_util_1.isAllowedDomain)(link, job.allowedDomains)) {
                return;
            }
            // Check include/exclude patterns
            if (job.excludePatterns && (0, url_util_1.matchesPatterns)(link, job.excludePatterns)) {
                return;
            }
            if (job.includePatterns && !(0, url_util_1.matchesPatterns)(link, job.includePatterns)) {
                return;
            }
            // Add to queue
            urlQueue.add(link);
        });
    }
    async respectCrawlDelay(url, domainDelays, lastCrawlTime, jobCrawlDelay) {
        const domain = (0, url_util_1.extractDomain)(url);
        const lastCrawl = lastCrawlTime.get(domain) || 0;
        const delay = jobCrawlDelay || domainDelays.get(domain) || this.defaultOptions.defaultCrawlDelay;
        const timeSinceLastCrawl = Date.now() - lastCrawl;
        const waitTime = Math.max(0, delay - timeSinceLastCrawl);
        if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    validateCrawlJob(job) {
        if (!job.urls || job.urls.length === 0) {
            throw new Error('At least one URL must be provided');
        }
        if (job.maxDepth < 0 || job.maxPages < 1) {
            throw new Error('Invalid depth or pages limit');
        }
        job.urls.forEach(url => {
            if (!(0, url_util_1.isValidUrl)(url)) {
                throw new Error(`Invalid URL: ${url}`);
            }
        });
    }
    emitProgress(crawlState) {
        const { jobId, startTime, urlQueue, processedUrls, errors } = crawlState;
        const progress = {
            totalUrls: urlQueue.size + processedUrls.size,
            processedUrls: processedUrls.size,
            pendingUrls: urlQueue.size,
            errorUrls: errors.length,
            currentDepth: crawlState.currentDepth,
            startTime,
        };
        this.emit('crawl-progress', progress);
    }
    generateCrawlResult(crawlState, completed) {
        const { jobId, startTime, crawledPages, errors } = crawlState;
        const endTime = new Date();
        return {
            jobId,
            pages: Array.from(crawledPages.values()),
            errors,
            progress: {
                totalUrls: crawledPages.size + errors.length,
                processedUrls: crawledPages.size,
                pendingUrls: 0,
                errorUrls: errors.length,
                currentDepth: crawlState.currentDepth,
                startTime,
            },
            completed,
            startTime,
            endTime,
            totalDuration: endTime.getTime() - startTime.getTime(),
        };
    }
    // Public API methods
    getCrawlStatus(jobId) {
        const crawlState = this.activeCrawls.get(jobId);
        if (!crawlState) {
            return null;
        }
        return this.generateCrawlResult(crawlState, false);
    }
    cancelCrawl(jobId) {
        const crawlState = this.activeCrawls.get(jobId);
        if (!crawlState) {
            return false;
        }
        this.activeCrawls.delete(jobId);
        this.logger.log(`Crawl job ${jobId} cancelled`);
        return true;
    }
    getActiveCrawls() {
        return Array.from(this.activeCrawls.keys());
    }
    async cleanup() {
        this.robotsUtil.clearCache();
        this.activeCrawls.clear();
        this.logger.log('🔄 Fallback crawler cleaned up');
    }
    updateOptions(options) {
        this.defaultOptions = { ...this.defaultOptions, ...options };
        this.logger.log('Crawler options updated');
    }
    getStats() {
        return {
            activeCrawls: this.activeCrawls.size,
            robotsCacheStats: this.robotsUtil.getCacheStats(),
            defaultOptions: this.defaultOptions,
            mode: 'fallback',
        };
    }
};
exports.CrawlerService = CrawlerService;
exports.CrawlerService = CrawlerService = CrawlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CrawlerService);
