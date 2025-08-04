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
var EnhancedCrawlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedCrawlerService = void 0;
const common_1 = require("@nestjs/common");
const events_1 = require("events");
const robots_util_1 = require("./utils/robots.util");
const seo_analyzer_util_1 = require("./utils/seo-analyzer.util");
const url_util_1 = require("./utils/url.util");
/**
 * Enhanced Crawler Service with performance optimization and SEO analysis
 */
let EnhancedCrawlerService = EnhancedCrawlerService_1 = class EnhancedCrawlerService extends events_1.EventEmitter {
    logger = new common_1.Logger(EnhancedCrawlerService_1.name);
    robotsUtil;
    seoAnalyzer;
    activeCrawls = new Map();
    defaultOptions = {
        concurrency: 8, // Balanced concurrency
        defaultUserAgent: 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
        defaultTimeout: 20000,
        defaultRetries: 2,
        respectRobotsTxt: true,
        defaultCrawlDelay: 500,
        defaultMaxPages: 1000
    };
    constructor() {
        super();
        this.robotsUtil = new robots_util_1.RobotsUtil();
        this.seoAnalyzer = new seo_analyzer_util_1.SeoAnalyzer();
        this.setMaxListeners(200);
    }
    async onModuleInit() {
        this.logger.log('🚀 Enhanced Crawler initialized with performance optimizations');
    }
    async onModuleDestroy() {
        await this.cleanup();
    }
    /**
     * Start crawling with enhanced performance and SEO analysis
     */
    async crawl(job) {
        const jobId = job.id || (0, url_util_1.generateCrawlId)();
        this.logger.log(`Starting enhanced crawl job ${jobId} for ${job.urls.join(', ')}`);
        // Validate job parameters
        this.validateCrawlJob(job);
        // Initialize crawl state with optimized settings
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
                concurrency: job.concurrency || this.defaultOptions.concurrency,
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
            activeCrawls: 0,
        };
        // Add initial URLs to queue
        job.urls.forEach(url => {
            const normalizedUrl = (0, url_util_1.normalizeUrl)(url);
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
            // Start crawling with enhanced batching
            const result = await this.executeEnhancedCrawl(crawlState);
            this.emit('crawl-finished', result);
            return result;
        }
        catch (error) {
            this.logger.error(`Enhanced crawl job ${jobId} failed:`, error);
            const errorResult = this.generateEnhancedCrawlResult(crawlState, false);
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
     * Enhanced crawl execution with better concurrency and batching
     */
    async executeEnhancedCrawl(crawlState) {
        const { jobId, job } = crawlState;
        try {
            this.emit('crawl-started', jobId);
            // Use a simpler approach - process URLs continuously without artificial depth barriers
            while (crawlState.urlQueue.size > 0 && crawlState.processedUrls.size < job.maxPages) {
                // Calculate optimal batch size based on remaining capacity
                const remainingPages = job.maxPages - crawlState.processedUrls.size;
                const batchSize = Math.min(job.concurrency, crawlState.urlQueue.size, remainingPages);
                const urlsToProcess = Array.from(crawlState.urlQueue).slice(0, batchSize);
                // Remove processed URLs from queue
                urlsToProcess.forEach(url => crawlState.urlQueue.delete(url));
                this.logger.log(`Processing batch of ${urlsToProcess.length} URLs (Queue: ${crawlState.urlQueue.size})`);
                // Process URLs concurrently with enhanced error handling
                const crawlPromises = urlsToProcess.map(url => this.crawlSinglePageEnhancedWithRetry(url, crawlState));
                await Promise.allSettled(crawlPromises);
                // Update progress
                this.emitProgress(crawlState);
                // Brief pause between batches to be respectful
                if (crawlState.urlQueue.size > 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            // Mark crawl as completed
            return this.generateEnhancedCrawlResult(crawlState, true);
        }
        catch (error) {
            this.logger.error(`Error during enhanced crawl execution for job ${jobId}:`, error);
            return this.generateEnhancedCrawlResult(crawlState, false);
        }
    }
    /**
     * Enhanced single page crawling with retry logic
     */
    async crawlSinglePageEnhancedWithRetry(url, crawlState) {
        const { job } = crawlState;
        let lastError = null;
        for (let attempt = 0; attempt < job.retries; attempt++) {
            try {
                await crawlState.semaphore.acquire();
                await this.crawlSinglePageEnhanced(url, crawlState);
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
                statusCode: this.extractStatusCode(lastError),
                timestamp: new Date(),
                depth: crawlState.currentDepth,
            };
            crawlState.errors.push(crawlError);
            this.emit('crawl-error', crawlError);
        }
    }
    /**
     * Enhanced single page crawling with SEO analysis
     */
    async crawlSinglePageEnhanced(url, crawlState) {
        const { job, processedUrls, crawledPages, domainDelays, lastCrawlTime } = crawlState;
        // Skip if already processed
        if (processedUrls.has(url)) {
            return;
        }
        processedUrls.add(url);
        crawlState.activeCrawls++;
        const startTime = Date.now();
        try {
            // Check robots.txt if enabled (with caching for performance)
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
            // Respect crawl delay (optimized)
            await this.respectCrawlDelayOptimized(url, domainDelays, lastCrawlTime, job.crawlDelay);
            // Fetch the page with optimized settings
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), job.timeout);
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
            // Extract page data with enhanced parsing
            const crawledPage = this.extractEnhancedPageData(url, html, response, loadTime, crawlState.currentDepth);
            // Perform SEO analysis
            const seoAudit = this.performSeoAnalysis(html, url, loadTime);
            const enhancedPage = { ...crawledPage, seoAudit };
            // Store crawled page
            crawledPages.set(url, enhancedPage);
            // Add discovered URLs to queue (with smart filtering)
            this.addDiscoveredUrlsEnhanced(crawledPage.links, url, crawlState);
            // Emit page crawled event with SEO data
            this.emit('page-crawled', enhancedPage);
            // Update last crawl time for domain
            const domain = (0, url_util_1.extractDomain)(url);
            lastCrawlTime.set(domain, Date.now());
        }
        catch (error) {
            throw error;
        }
        finally {
            crawlState.activeCrawls--;
        }
    }
    /**
     * Perform comprehensive SEO analysis
     */
    performSeoAnalysis(html, url, loadTime) {
        try {
            const seoAudit = this.seoAnalyzer.analyzeHtml(html, url);
            return this.seoAnalyzer.updatePerformanceScore(seoAudit, loadTime);
        }
        catch (error) {
            this.logger.warn(`SEO analysis failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
            return {
                titleExists: false,
                titleTooLong: false,
                titleTooShort: false,
                metaDescriptionExists: false,
                metaDescriptionTooLong: false,
                metaDescriptionTooShort: false,
                h1Count: 0,
                h1Tags: [],
                h2Count: 0,
                h3Count: 0,
                h4Count: 0,
                h5Count: 0,
                h6Count: 0,
                hasMultipleH1: false,
                missingH1: true,
                hasCanonical: false,
                hasRobotsMeta: false,
                isIndexable: true,
                isFollowable: true,
                hasSchemaOrg: false,
                schemaOrgTypes: [],
                jsonLdCount: 0,
                microdataCount: 0,
                rdfaCount: 0,
                totalImages: 0,
                imagesWithoutAlt: 0,
                imagesWithAlt: 0,
                imagesWithoutTitle: 0,
                imagesOptimized: false,
                internalLinksCount: 0,
                externalLinksCount: 0,
                brokenLinksCount: 0,
                noFollowLinksCount: 0,
                internalLinks: [],
                externalLinks: [],
                brokenLinks: [],
                hasValidLang: false,
                hasOpenGraph: false,
                hasTwitterCard: false,
                hasViewport: false,
                hasCharset: false,
                isHttps: false,
                hasSitemapReference: false,
                performanceScore: 0,
                seoScore: 0,
                accessibilityScore: 0,
                issues: [`SEO analysis failed: ${error instanceof Error ? error.message : String(error)}`],
            };
        }
    }
    /**
     * Enhanced page data extraction with better performance
     */
    extractEnhancedPageData(url, html, response, loadTime, depth) {
        // Use more efficient regex patterns
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const title = titleMatch ? this.decodeHtmlEntities(titleMatch[1].trim()) : undefined;
        // Extract links with improved performance
        const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
        const links = linkMatches
            .map(match => {
            const hrefMatch = match.match(/href=["']([^"']+)["']/i);
            return hrefMatch ? hrefMatch[1] : null;
        })
            .filter((link) => link !== null && link.length > 0)
            .map(link => {
            try {
                return (0, url_util_1.normalizeUrl)((0, url_util_1.resolveUrl)(url, link));
            }
            catch {
                return null;
            }
        })
            .filter((link) => link !== null && (0, url_util_1.isValidUrl)(link))
            .slice(0, 500); // Limit links to prevent memory issues
        // Extract assets efficiently
        const assets = this.extractAssetsOptimized(html, url);
        // Extract meta tags efficiently
        const meta = this.extractMetaTagsOptimized(html, url);
        // Extract headings efficiently
        const headings = this.extractHeadingsOptimized(html);
        return {
            url,
            title,
            statusCode: response.status,
            contentType: response.headers.get('content-type') || undefined,
            size: html.length,
            loadTime,
            depth,
            html: html.length > 100000 ? html.substring(0, 100000) + '...' : html, // Limit HTML size
            links: Array.from(new Set(links)),
            assets,
            meta,
            headings,
            timestamp: new Date(),
        };
    }
    /**
     * Optimized asset extraction
     */
    extractAssetsOptimized(html, baseUrl) {
        const images = this.extractAssetUrls(html, /<img[^>]*src=["']([^"']+)["'][^>]*>/gi, baseUrl);
        const scripts = this.extractAssetUrls(html, /<script[^>]*src=["']([^"']+)["'][^>]*>/gi, baseUrl);
        const stylesheets = this.extractAssetUrls(html, /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi, baseUrl);
        return { images, scripts, stylesheets };
    }
    /**
     * Extract asset URLs with error handling
     */
    extractAssetUrls(html, regex, baseUrl) {
        const matches = html.match(regex) || [];
        return matches
            .map(match => {
            const srcMatch = match.match(/(?:src|href)=["']([^"']+)["']/i);
            if (!srcMatch)
                return null;
            try {
                return (0, url_util_1.resolveUrl)(baseUrl, srcMatch[1]);
            }
            catch {
                return null;
            }
        })
            .filter((url) => url !== null)
            .slice(0, 100); // Limit to prevent memory issues
    }
    /**
     * Optimized meta tag extraction
     */
    extractMetaTagsOptimized(html, baseUrl) {
        const meta = {};
        const metaMatches = html.match(/<meta[^>]*>/gi) || [];
        metaMatches.forEach(match => {
            const nameMatch = match.match(/name=["']([^"']+)["']/i) || match.match(/property=["']([^"']+)["']/i);
            const contentMatch = match.match(/content=["']([^"']*)["']/i);
            if (nameMatch && contentMatch) {
                const name = nameMatch[1].toLowerCase();
                const content = this.decodeHtmlEntities(contentMatch[1]);
                // Map common meta tags
                const metaMap = {
                    'description': 'description',
                    'keywords': 'keywords',
                    'robots': 'robots',
                    'og:title': 'ogTitle',
                    'og:description': 'ogDescription',
                    'og:image': 'ogImage',
                    'twitter:title': 'twitterTitle',
                    'twitter:description': 'twitterDescription',
                };
                const mappedName = metaMap[name];
                if (mappedName) {
                    meta[mappedName] = content;
                }
            }
        });
        // Extract canonical URL
        const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
        if (canonicalMatch) {
            try {
                meta.canonical = (0, url_util_1.resolveUrl)(baseUrl, canonicalMatch[1]);
            }
            catch {
                // Invalid canonical URL, ignore
            }
        }
        return meta;
    }
    /**
     * Decode HTML entities
     */
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
    /**
     * Optimized heading extraction with proper typing
     */
    extractHeadingsOptimized(html) {
        const headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
        for (let i = 1; i <= 6; i++) {
            const headingMatches = html.match(new RegExp(`<h${i}[^>]*>([^<]*)</h${i}>`, 'gi')) || [];
            headings[`h${i}`] = headingMatches
                .map(match => this.decodeHtmlEntities(match.replace(/<[^>]*>/g, '').trim()))
                .filter(Boolean)
                .slice(0, 20); // Limit headings
        }
        return headings;
    }
    /**
     * Enhanced URL discovery with smart filtering
     */
    addDiscoveredUrlsEnhanced(links, parentUrl, crawlState) {
        const { job, urlQueue, processedUrls } = crawlState;
        let addedCount = 0;
        const maxNewUrls = Math.min(100, job.maxPages - processedUrls.size); // Increased limit per page
        this.logger.debug(`Discovering URLs from ${parentUrl}: found ${links.length} links`);
        for (const link of links) {
            if (addedCount >= maxNewUrls)
                break;
            // Skip if already processed or queued
            if (processedUrls.has(link) || urlQueue.has(link)) {
                continue;
            }
            // Check if we've reached the page limit
            if (processedUrls.size + urlQueue.size >= job.maxPages) {
                this.logger.debug(`Reached max pages limit (${job.maxPages})`);
                break;
            }
            // Skip non-HTTP(S) URLs early
            if (!link.startsWith('http://') && !link.startsWith('https://')) {
                continue;
            }
            // Check domain restrictions first
            if (job.allowedDomains && !(0, url_util_1.isAllowedDomain)(link, job.allowedDomains)) {
                this.logger.debug(`URL ${link} filtered out - not in allowed domains`);
                continue;
            }
            // Check exclude patterns early
            if (job.excludePatterns && (0, url_util_1.matchesPatterns)(link, job.excludePatterns)) {
                this.logger.debug(`URL ${link} filtered out - matches exclude pattern`);
                continue;
            }
            // Check include patterns if specified
            if (job.includePatterns && !(0, url_util_1.matchesPatterns)(link, job.includePatterns)) {
                this.logger.debug(`URL ${link} filtered out - doesn't match include pattern`);
                continue;
            }
            // Skip common non-content URLs for better performance
            if (this.shouldSkipUrl(link)) {
                this.logger.debug(`URL ${link} filtered out - should skip`);
                continue;
            }
            // Check depth limit - be more permissive
            const linkDepth = (0, url_util_1.getUrlDepth)(link, job.urls[0]);
            if (linkDepth > job.maxDepth) {
                this.logger.debug(`URL ${link} filtered out - depth ${linkDepth} > max ${job.maxDepth}`);
                continue;
            }
            // Add to queue
            urlQueue.add(link);
            addedCount++;
            this.logger.debug(`Added URL to queue: ${link} (depth: ${linkDepth})`);
        }
        if (addedCount > 0) {
            this.logger.debug(`Added ${addedCount} new URLs to queue from ${parentUrl}`);
        }
        else {
            this.logger.debug(`No new URLs added from ${parentUrl} (${links.length} links checked)`);
        }
    }
    /**
     * Check if URL should be skipped for performance
     */
    shouldSkipUrl(url) {
        const skipPatterns = [
            // File extensions that shouldn't be crawled
            /\.(css|js|jpg|jpeg|png|gif|svg|ico|pdf|zip|exe|dmg|woff|woff2|ttf|eot|map)$/i,
            // Feed and API endpoints
            /\/feed\/?$/i,
            /\/rss\/?$/i,
            /\/wp-json\//i,
            /\/api\//i,
            // Admin areas
            /\/wp-admin\//i,
            /\/admin\//i,
            // Authentication
            /\/login/i,
            /\/logout/i,
            /\/register/i,
            /\/signup/i,
            // Non-content URLs
            /mailto:/i,
            /tel:/i,
            /javascript:/i,
            /^#/,
            // Query parameters that often indicate dynamic/non-SEO content
            /\?.*(?:action|ajax|nonce|token)=/i,
        ];
        // Be more permissive with content URLs
        // Only skip if it clearly matches a skip pattern
        return skipPatterns.some(pattern => pattern.test(url));
    }
    /**
     * Optimized crawl delay with domain-based caching
     */
    async respectCrawlDelayOptimized(url, domainDelays, lastCrawlTime, jobCrawlDelay) {
        const domain = (0, url_util_1.extractDomain)(url);
        const lastCrawl = lastCrawlTime.get(domain) || 0;
        const delay = jobCrawlDelay || domainDelays.get(domain) || this.defaultOptions.defaultCrawlDelay;
        const timeSinceLastCrawl = Date.now() - lastCrawl;
        const waitTime = Math.max(0, delay - timeSinceLastCrawl);
        if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    /**
     * Extract status code from error
     */
    extractStatusCode(error) {
        if (typeof error === 'object' && error !== null && 'status' in error) {
            return error.status;
        }
        return undefined;
    }
    /**
     * Generate enhanced crawl result with performance stats
     */
    generateEnhancedCrawlResult(crawlState, completed) {
        const { jobId, startTime, crawledPages, errors } = crawlState;
        const endTime = new Date();
        // Calculate statistics - properly type the pages
        const pages = Array.from(crawledPages.values());
        const totalLoadTime = pages.reduce((sum, page) => sum + (page.loadTime || 0), 0);
        const avgLoadTime = pages.length > 0 ? totalLoadTime / pages.length : 0;
        const successRate = pages.length > 0 ? pages.length / (pages.length + errors.length) : 0;
        // Calculate overall performance score
        const performanceScores = pages
            .map(page => page.seoAudit?.performanceScore)
            .filter((score) => score !== undefined && !isNaN(score));
        const avgPerformanceScore = performanceScores.length > 0
            ? performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length
            : undefined;
        return {
            jobId,
            pages: pages, // Cast to expected type
            errors,
            progress: {
                totalUrls: crawledPages.size + errors.length,
                processedUrls: crawledPages.size,
                pendingUrls: crawlState.urlQueue.size,
                errorUrls: errors.length,
                currentDepth: crawlState.currentDepth,
                startTime,
                estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(crawlState),
            },
            completed,
            startTime,
            endTime,
            totalDuration: endTime.getTime() - startTime.getTime(),
            stats: {
                avgLoadTime,
                successRate,
                crawlDuration: endTime.getTime() - startTime.getTime(),
                performanceScore: avgPerformanceScore,
            },
        };
    }
    /**
     * Enhanced progress emission
     */
    emitProgress(crawlState) {
        const { jobId, startTime, urlQueue, processedUrls, errors } = crawlState;
        const progress = {
            totalUrls: urlQueue.size + processedUrls.size,
            processedUrls: processedUrls.size,
            pendingUrls: urlQueue.size,
            errorUrls: errors.length,
            currentDepth: crawlState.currentDepth,
            startTime,
            estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(crawlState),
        };
        this.emit('crawl-progress', progress);
    }
    /**
     * Calculate estimated time remaining
     */
    calculateEstimatedTimeRemaining(crawlState) {
        const { startTime, processedUrls, job } = crawlState;
        const elapsed = Date.now() - startTime.getTime();
        const processed = processedUrls.size;
        if (processed === 0)
            return undefined;
        const avgTimePerPage = elapsed / processed;
        const remaining = job.maxPages - processed;
        return Math.round(avgTimePerPage * remaining);
    }
    /**
     * Job validation
     */
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
        if (job.maxPages && job.maxPages > 10000) {
            this.logger.warn(`Large page limit (${job.maxPages}) may impact performance`);
        }
        job.urls.forEach(url => {
            if (!(0, url_util_1.isValidUrl)(url)) {
                throw new Error(`Invalid URL: ${url}`);
            }
        });
    }
    // Public API methods
    getCrawlStatus(jobId) {
        const crawlState = this.activeCrawls.get(jobId);
        if (!crawlState) {
            return null;
        }
        return this.generateEnhancedCrawlResult(crawlState, false);
    }
    cancelCrawl(jobId) {
        const crawlState = this.activeCrawls.get(jobId);
        if (!crawlState) {
            return false;
        }
        this.activeCrawls.delete(jobId);
        this.logger.log(`Enhanced crawl job ${jobId} cancelled`);
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
        this.logger.log('🔄 Enhanced crawler cleaned up');
    }
    updateOptions(options) {
        this.defaultOptions = { ...this.defaultOptions, ...options };
        this.logger.log('Enhanced crawler options updated');
    }
    getStats() {
        return {
            activeCrawls: this.activeCrawls.size,
            robotsCacheStats: this.robotsUtil.getCacheStats(),
            defaultOptions: this.defaultOptions,
            mode: 'enhanced',
            features: ['performance-scoring', 'seo-analysis', 'optimized-batching', 'smart-filtering'],
        };
    }
};
exports.EnhancedCrawlerService = EnhancedCrawlerService;
exports.EnhancedCrawlerService = EnhancedCrawlerService = EnhancedCrawlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EnhancedCrawlerService);
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
