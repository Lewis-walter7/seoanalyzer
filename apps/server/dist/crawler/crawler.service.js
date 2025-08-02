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
        defaultMaxPages: 1000, // Default max pages to crawl
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
        const jobId = job.id || (0, url_util_1.generateCrawlId)();
        this.logger.log(`Starting fallback crawl job ${jobId} for ${job.urls.join(', ')}`);
        // Validate job parameters
        this.validateCrawlJob(job);
        // Initialize crawl state
        const crawlState = {
            jobId,
            job: {
                ...job,
                maxPages: job.maxPages || this.defaultOptions.defaultMaxPages,
                maxDepth: job.maxDepth || 3,
                timeout: job.timeout || this.defaultOptions.defaultTimeout,
                retries: job.retries || this.defaultOptions.defaultRetries,
                crawlDelay: job.crawlDelay || this.defaultOptions.defaultCrawlDelay,
                userAgent: job.userAgent || this.defaultOptions.defaultUserAgent,
                respectRobotsTxt: job.respectRobotsTxt !== false ? this.defaultOptions.respectRobotsTxt : false,
            },
            startTime: new Date(),
            urlQueue: new Set(),
            processedUrls: new Set(),
            crawledPages: new Map(),
            errors: [],
            currentDepth: 0,
            domainDelays: new Map(),
            lastCrawlTime: new Map(),
            semaphore: new Semaphore(job.concurrency || this.defaultOptions.concurrency),
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
        try {
            // Start crawling
            const result = await this.executeCrawl(crawlState);
            this.emit('crawl-finished', result);
            return result;
        }
        catch (error) {
            this.logger.error(`Crawl job ${jobId} failed:`, error);
            const errorResult = this.generateCrawlResult(crawlState, false);
            this.emit('crawl-error', {
                url: 'unknown',
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                depth: 0,
            });
            throw errorResult;
        }
        finally {
            this.activeCrawls.delete(jobId);
        }
    }
    /**
     * Execute the crawl job using fetch
     */
    async executeCrawl(crawlState) {
        const { jobId, job } = crawlState;
        try {
            this.emit('crawl-started', jobId);
            while (crawlState.urlQueue.size > 0 && crawlState.processedUrls.size < job.maxPages) {
                const urlsToProcess = Array.from(crawlState.urlQueue)
                    .slice(0, Math.min(job.concurrency || this.defaultOptions.concurrency, job.maxPages - crawlState.processedUrls.size));
                // Clear processed URLs from queue
                urlsToProcess.forEach(url => crawlState.urlQueue.delete(url));
                // Process URLs with controlled concurrency
                const crawlPromises = urlsToProcess.map((url) => this.crawlSinglePageWithRetry(url, crawlState));
                await Promise.allSettled(crawlPromises);
                // Update progress
                this.emitProgress(crawlState);
                // Check if we've reached max depth
                if (crawlState.currentDepth >= job.maxDepth) {
                    this.logger.log(`Reached max depth ${job.maxDepth}, stopping crawl`);
                    break;
                }
                crawlState.currentDepth++;
                // Small delay between batches to prevent overwhelming the server
                if (crawlState.urlQueue.size > 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            // Mark crawl as completed
            return this.generateCrawlResult(crawlState, true);
        }
        catch (error) {
            this.logger.error(`Error during crawl execution for job ${jobId}:`, error);
            return this.generateCrawlResult(crawlState, false);
        }
    }
    /**
     * Crawl a single page with retry logic
     */
    async crawlSinglePageWithRetry(url, crawlState) {
        const { job } = crawlState;
        let lastError = null;
        for (let attempt = 0; attempt < job.retries; attempt++) {
            try {
                await crawlState.semaphore.acquire();
                await this.crawlSinglePageWithFetch(url, crawlState);
                return;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                this.logger.warn(`Attempt ${attempt + 1}/${job.retries} failed for ${url}: ${lastError.message}`);
                if (attempt < job.retries - 1) {
                    // Exponential backoff
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            finally {
                crawlState.semaphore.release();
            }
        }
        // All retries failed
        if (lastError) {
            const crawlError = {
                url,
                error: lastError.message,
                timestamp: new Date(),
                depth: crawlState.currentDepth,
            };
            crawlState.errors.push(crawlError);
            this.emit('crawl-error', crawlError);
        }
    }
    /**
     * Crawl a single page using fetch
     */
    async crawlSinglePageWithFetch(url, crawlState) {
        const { job, processedUrls, crawledPages, domainDelays, lastCrawlTime } = crawlState;
        // Skip if already processed
        if (processedUrls.has(url)) {
            return;
        }
        processedUrls.add(url);
        const startTime = Date.now();
        // Check robots.txt if enabled
        if (job.respectRobotsTxt) {
            const isAllowed = await this.robotsUtil.isAllowed(url, job.userAgent);
            if (!isAllowed) {
                this.logger.debug(`URL blocked by robots.txt: ${url}`);
                return;
            }
            // Get crawl delay from robots.txt
            const robotsCrawlDelay = await this.robotsUtil.getCrawlDelay(url, job.userAgent);
            if (robotsCrawlDelay) {
                const domain = (0, url_util_1.extractDomain)(url);
                domainDelays.set(domain, robotsCrawlDelay);
            }
        }
        // Respect crawl delay
        await this.respectCrawlDelay(url, domainDelays, lastCrawlTime, job.crawlDelay);
        // Fetch the page
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), job.timeout);
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': job.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    ...job.customHeaders,
                },
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('text/html')) {
                this.logger.debug(`Skipping non-HTML content: ${url} (${contentType})`);
                return;
            }
            const html = await response.text();
            const loadTime = Date.now() - startTime;
            // Extract page data using basic HTML parsing
            const crawledPage = this.extractPageDataFromHTML(url, html, response, loadTime, crawlState.currentDepth);
            // Store crawled page
            crawledPages.set(url, crawledPage);
            // Add discovered URLs to queue for next depth level
            this.addDiscoveredUrls(crawledPage.links, url, crawlState);
            // Emit page crawled event
            this.emit('page-crawled', crawledPage);
            // Update last crawl time for domain
            const domain = (0, url_util_1.extractDomain)(url);
            lastCrawlTime.set(domain, Date.now());
        }
        catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    /**
     * Extract page data from HTML using basic parsing
     */
    extractPageDataFromHTML(url, html, response, loadTime, depth) {
        // Basic HTML parsing using regex (not as accurate as DOM parsing, but works)
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const title = titleMatch ? this.decodeHtmlEntities(titleMatch[1].trim()) : undefined;
        // Extract links
        const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
        const links = linkMatches
            .map(match => {
            const hrefMatch = match.match(/href=["']([^"']+)["']/i);
            return hrefMatch ? hrefMatch[1] : null;
        })
            .filter((link) => link !== null)
            .map(link => {
            try {
                return (0, url_util_1.normalizeUrl)((0, url_util_1.resolveUrl)(url, link));
            }
            catch {
                return null;
            }
        })
            .filter((link) => link !== null && (0, url_util_1.isValidUrl)(link));
        // Extract images
        const imageMatches = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
        const images = imageMatches
            .map(match => {
            const srcMatch = match.match(/src=["']([^"']+)["']/i);
            if (!srcMatch)
                return null;
            try {
                return (0, url_util_1.resolveUrl)(url, srcMatch[1]);
            }
            catch {
                return null;
            }
        })
            .filter((x) => x !== null);
        // Extract scripts
        const scriptMatches = html.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
        const scripts = scriptMatches
            .map(match => {
            const srcMatch = match.match(/src=["']([^"']+)["']/i);
            if (!srcMatch)
                return null;
            try {
                return (0, url_util_1.resolveUrl)(url, srcMatch[1]);
            }
            catch {
                return null;
            }
        })
            .filter((x) => x !== null);
        // Extract stylesheets
        const cssMatches = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
        const stylesheets = cssMatches
            .map(match => {
            const hrefMatch = match.match(/href=["']([^"']+)["']/i);
            if (!hrefMatch)
                return null;
            try {
                return (0, url_util_1.resolveUrl)(url, hrefMatch[1]);
            }
            catch {
                return null;
            }
        })
            .filter((x) => x !== null);
        // Extract meta tags
        const meta = {};
        const metaMatches = html.match(/<meta[^>]*>/gi) || [];
        metaMatches.forEach(match => {
            const nameMatch = match.match(/name=["']([^"']+)["']/i) || match.match(/property=["']([^"']+)["']/i);
            const contentMatch = match.match(/content=["']([^"']*)["']/i);
            if (nameMatch && contentMatch) {
                const name = nameMatch[1].toLowerCase();
                const content = this.decodeHtmlEntities(contentMatch[1]);
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
                    case 'twitter:title':
                        meta.twitterTitle = content;
                        break;
                    case 'twitter:description':
                        meta.twitterDescription = content;
                        break;
                }
            }
        });
        // Extract canonical URL
        const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
        if (canonicalMatch) {
            try {
                meta.canonical = (0, url_util_1.resolveUrl)(url, canonicalMatch[1]);
            }
            catch {
                // Invalid canonical URL, ignore
            }
        }
        // Extract headings
        const headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
        for (let i = 1; i <= 6; i++) {
            const headingMatches = html.match(new RegExp(`<h${i}[^>]*>([^<]*)</h${i}>`, 'gi')) || [];
            headings[`h${i}`] = headingMatches
                .map(match => this.decodeHtmlEntities(match.replace(/<[^>]*>/g, '').trim()))
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
    decodeHtmlEntities(text) {
        const entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&nbsp;': ' ',
        };
        return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity);
    }
    addDiscoveredUrls(links, parentUrl, crawlState) {
        const { job, urlQueue, processedUrls } = crawlState;
        links.forEach(link => {
            // Skip if already processed or queued
            if (processedUrls.has(link) || urlQueue.has(link)) {
                return;
            }
            // Check if we've reached the page limit
            if (processedUrls.size + urlQueue.size >= job.maxPages) {
                return;
            }
            // Check depth limit
            const linkDepth = (0, url_util_1.getUrlDepth)(link, job.urls[0]);
            if (linkDepth > job.maxDepth) {
                return;
            }
            // Check domain restrictions
            if (job.allowedDomains && !(0, url_util_1.isAllowedDomain)(link, job.allowedDomains)) {
                this.logger.debug(`URL ${link} filtered out - not in allowed domains: ${job.allowedDomains.join(', ')}`);
                return;
            }
            // Check exclude patterns
            if (job.excludePatterns && (0, url_util_1.matchesPatterns)(link, job.excludePatterns)) {
                this.logger.debug(`URL ${link} filtered out - matches exclude pattern`);
                return;
            }
            // Check include patterns
            if (job.includePatterns && !(0, url_util_1.matchesPatterns)(link, job.includePatterns)) {
                this.logger.debug(`URL ${link} filtered out - doesn't match include pattern`);
                return;
            }
            // Skip non-HTTP(S) URLs
            if (!link.startsWith('http://') && !link.startsWith('https://')) {
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
        if (job.maxDepth !== undefined && job.maxDepth < 0) {
            throw new Error('maxDepth cannot be negative');
        }
        if (job.maxPages !== undefined && job.maxPages < 1) {
            throw new Error('maxPages must be at least 1');
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
                pendingUrls: crawlState.urlQueue.size,
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
        // Cancel all active crawls
        for (const jobId of this.activeCrawls.keys()) {
            this.cancelCrawl(jobId);
        }
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
/**
 * Simple semaphore implementation for controlling concurrency
 */
class Semaphore {
    permits;
    waitQueue = [];
    constructor(permits) {
        this.permits = permits;
    }
    async acquire() {
        if (this.permits > 0) {
            this.permits--;
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.waitQueue.push(resolve);
        });
    }
    release() {
        this.permits++;
        if (this.waitQueue.length > 0) {
            const next = this.waitQueue.shift();
            if (next) {
                this.permits--;
                next();
            }
        }
    }
}
