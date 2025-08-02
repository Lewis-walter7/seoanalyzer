import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import {
  CrawlJob,
  CrawledPage,
  CrawlError,
  CrawlProgress,
  CrawlResult,
  CrawlerOptions,
  PageHeadings,
} from './interfaces/crawler.interfaces';
import { RobotsUtil } from './utils/robots.util';
import { SeoAnalyzer, SeoAuditData } from './utils/seo-analyzer.util';
import {
  normalizeUrl,
  resolveUrl,
  matchesPatterns,
  extractDomain,
  isAllowedDomain,
  isValidUrl,
  getUrlDepth,
  generateCrawlId,
} from './utils/url.util';

/**
 * Enhanced Crawler Service with performance optimization and SEO analysis
 */
@Injectable()
export class EnhancedCrawlerService extends EventEmitter {
  private readonly logger = new Logger(EnhancedCrawlerService.name);
  private robotsUtil: RobotsUtil;
  private seoAnalyzer: SeoAnalyzer;
  private activeCrawls = new Map<string, any>();
  private defaultOptions: Required<CrawlerOptions> = {
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
    this.robotsUtil = new RobotsUtil();
    this.seoAnalyzer = new SeoAnalyzer();
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
  async crawl(job: CrawlJob): Promise<CrawlResult> {
    const jobId = job.id || generateCrawlId();
    
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
      urlQueue: new Set<string>(),
      processedUrls: new Set<string>(),
      crawledPages: new Map<string, CrawledPage & { seoAudit?: SeoAuditData }>(),
      errors: [] as CrawlError[],
      currentDepth: 0,
      domainDelays: new Map<string, number>(),
      lastCrawlTime: new Map<string, number>(),
      semaphore: new Semaphore(job.concurrency || this.defaultOptions.concurrency),
      activeCrawls: 0,
    };

    // Add initial URLs to queue
    job.urls.forEach(url => {
      const normalizedUrl = normalizeUrl(url);
      if (isValidUrl(normalizedUrl)) {
        crawlState.urlQueue.add(normalizedUrl);
        this.logger.log(`Added URL to queue: ${normalizedUrl}`);
      } else {
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
    } catch (error) {
      this.logger.error(`Enhanced crawl job ${jobId} failed:`, error);
      const errorResult = this.generateEnhancedCrawlResult(crawlState, false);
      this.emit('crawl-error', {
        url: 'unknown',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        depth: 0,
      });
      throw errorResult;
    } finally {
      this.activeCrawls.delete(jobId);
    }
  }

  /**
   * Enhanced crawl execution with better concurrency and batching
   */
  private async executeEnhancedCrawl(crawlState: any): Promise<CrawlResult> {
    const { jobId, job } = crawlState;
    
    try {
      this.emit('crawl-started', jobId);
      
      while (crawlState.urlQueue.size > 0 && crawlState.processedUrls.size < job.maxPages) {
        // Calculate optimal batch size based on remaining capacity
        const remainingPages = job.maxPages - crawlState.processedUrls.size;
        const batchSize = Math.min(
          job.concurrency,
          crawlState.urlQueue.size,
          remainingPages
        );

        const urlsToProcess = Array.from(crawlState.urlQueue).slice(0, batchSize) as string[];
        
        // Remove processed URLs from queue
        urlsToProcess.forEach(url => crawlState.urlQueue.delete(url));

        this.logger.log(`Processing batch of ${urlsToProcess.length} URLs (Depth: ${crawlState.currentDepth})`);

        // Process URLs concurrently with enhanced error handling
        const crawlPromises = urlsToProcess.map(url => 
          this.crawlSinglePageEnhancedWithRetry(url, crawlState)
        );

        await Promise.allSettled(crawlPromises);

        // Update progress
        this.emitProgress(crawlState);

        // Check if we should continue to next depth
        if (crawlState.currentDepth >= job.maxDepth) {
          this.logger.log(`Reached max depth ${job.maxDepth}, stopping crawl`);
          break;
        }

        crawlState.currentDepth++;
        
        // Brief pause between batches to be respectful
        if (crawlState.urlQueue.size > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Mark crawl as completed
      return this.generateEnhancedCrawlResult(crawlState, true);
      
    } catch (error) {
      this.logger.error(`Error during enhanced crawl execution for job ${jobId}:`, error);
      return this.generateEnhancedCrawlResult(crawlState, false);
    }
  }

  /**
   * Enhanced single page crawling with retry logic
   */
  private async crawlSinglePageEnhancedWithRetry(url: string, crawlState: any): Promise<void> {
    const { job } = crawlState;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < job.retries; attempt++) {
      try {
        await crawlState.semaphore.acquire();
        await this.crawlSinglePageEnhanced(url, crawlState);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Attempt ${attempt + 1}/${job.retries} failed for ${url}: ${lastError.message}`);
        
        if (attempt < job.retries - 1) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } finally {
        crawlState.semaphore.release();
      }
    }
    
    // All retries failed
    if (lastError) {
      const crawlError: CrawlError = {
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
  private async crawlSinglePageEnhanced(url: string, crawlState: any): Promise<void> {
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
          const domain = extractDomain(url);
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
      const domain = extractDomain(url);
      lastCrawlTime.set(domain, Date.now());
      
    } catch (error) {
      throw error;
    } finally {
      crawlState.activeCrawls--;
    }
  }

  /**
   * Perform comprehensive SEO analysis
   */
  private performSeoAnalysis(html: string, url: string, loadTime: number): SeoAuditData {
    try {
      const seoAudit = this.seoAnalyzer.analyzeHtml(html, url);
      return this.seoAnalyzer.updatePerformanceScore(seoAudit, loadTime);
    } catch (error) {
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
  private extractEnhancedPageData(
    url: string,
    html: string,
    response: Response,
    loadTime: number,
    depth: number
  ): CrawledPage {
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
      .filter((link): link is string => link !== null && link.length > 0)
      .map(link => {
        try {
          return normalizeUrl(resolveUrl(url, link));
        } catch {
          return null;
        }
      })
      .filter((link): link is string => link !== null && isValidUrl(link))
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
  private extractAssetsOptimized(html: string, baseUrl: string) {
    const images = this.extractAssetUrls(html, /<img[^>]*src=["']([^"']+)["'][^>]*>/gi, baseUrl);
    const scripts = this.extractAssetUrls(html, /<script[^>]*src=["']([^"']+)["'][^>]*>/gi, baseUrl);
    const stylesheets = this.extractAssetUrls(html, /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi, baseUrl);

    return { images, scripts, stylesheets };
  }

  /**
   * Extract asset URLs with error handling
   */
  private extractAssetUrls(html: string, regex: RegExp, baseUrl: string): string[] {
    const matches = html.match(regex) || [];
    return matches
      .map(match => {
        const srcMatch = match.match(/(?:src|href)=["']([^"']+)["']/i);
        if (!srcMatch) return null;
        try {
          return resolveUrl(baseUrl, srcMatch[1]);
        } catch {
          return null;
        }
      })
      .filter((url): url is string => url !== null)
      .slice(0, 100); // Limit to prevent memory issues
  }

  /**
   * Optimized meta tag extraction
   */
  private extractMetaTagsOptimized(html: string, baseUrl: string): Record<string, any> {
    const meta: Record<string, any> = {};
    const metaMatches = html.match(/<meta[^>]*>/gi) || [];
    
    metaMatches.forEach(match => {
      const nameMatch = match.match(/name=["']([^"']+)["']/i) || match.match(/property=["']([^"']+)["']/i);
      const contentMatch = match.match(/content=["']([^"']*)["']/i);
      
      if (nameMatch && contentMatch) {
        const name = nameMatch[1].toLowerCase();
        const content = this.decodeHtmlEntities(contentMatch[1]);
        
        // Map common meta tags
        const metaMap: Record<string, string> = {
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
        meta.canonical = resolveUrl(baseUrl, canonicalMatch[1]);
      } catch {
        // Invalid canonical URL, ignore
      }
    }

    return meta;
  }

  /**
   * Decode HTML entities
   */
  private decodeHtmlEntities(text: string): string {
    const entities: { [key: string]: string } = {
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
  private extractHeadingsOptimized(html: string): PageHeadings {
    const headings: PageHeadings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
    
    for (let i = 1; i <= 6; i++) {
      const headingMatches = html.match(new RegExp(`<h${i}[^>]*>([^<]*)</h${i}>`, 'gi')) || [];
      headings[`h${i}` as keyof PageHeadings] = headingMatches
        .map(match => this.decodeHtmlEntities(match.replace(/<[^>]*>/g, '').trim()))
        .filter(Boolean)
        .slice(0, 20); // Limit headings
    }
    
    return headings;
  }

  /**
   * Enhanced URL discovery with smart filtering
   */
  private addDiscoveredUrlsEnhanced(links: string[], parentUrl: string, crawlState: any): void {
    const { job, urlQueue, processedUrls } = crawlState;
    let addedCount = 0;
    const maxNewUrls = Math.min(50, job.maxPages - processedUrls.size); // Limit new URLs per page

    for (const link of links) {
      if (addedCount >= maxNewUrls) break;
      
      // Skip if already processed or queued
      if (processedUrls.has(link) || urlQueue.has(link)) {
        continue;
      }

      // Check if we've reached the page limit
      if (processedUrls.size + urlQueue.size >= job.maxPages) {
        break;
      }

      // Check depth limit
      const linkDepth = getUrlDepth(link, job.urls[0]);
      if (linkDepth > job.maxDepth) {
        continue;
      }

      // Check domain restrictions
      if (job.allowedDomains && !isAllowedDomain(link, job.allowedDomains)) {
        continue;
      }

      // Check include/exclude patterns
      if (job.excludePatterns && matchesPatterns(link, job.excludePatterns)) {
        continue;
      }

      if (job.includePatterns && !matchesPatterns(link, job.includePatterns)) {
        continue;
      }

      // Skip common non-content URLs for better performance
      if (this.shouldSkipUrl(link)) {
        continue;
      }

      // Skip non-HTTP(S) URLs
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        continue;
      }

      // Add to queue
      urlQueue.add(link);
      addedCount++;
    }

    if (addedCount > 0) {
      this.logger.debug(`Added ${addedCount} new URLs to queue from ${parentUrl}`);
    }
  }

  /**
   * Check if URL should be skipped for performance
   */
  private shouldSkipUrl(url: string): boolean {
    const skipPatterns = [
      /\.(css|js|jpg|jpeg|png|gif|svg|ico|pdf|zip|exe|dmg|woff|woff2|ttf|eot)$/i,
      /\/feed\/?$/i,
      /\/rss\/?$/i,
      /\/wp-admin\//i,
      /\/admin\//i,
      /\/login/i,
      /\/logout/i,
      /\/register/i,
      /\/search\?/i,
      /\/tag\//i,
      /\/category\//i,
      /mailto:/i,
      /tel:/i,
      /javascript:/i,
    ];

    return skipPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Optimized crawl delay with domain-based caching
   */
  private async respectCrawlDelayOptimized(
    url: string,
    domainDelays: Map<string, number>,
    lastCrawlTime: Map<string, number>,
    jobCrawlDelay?: number
  ): Promise<void> {
    const domain = extractDomain(url);
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
  private extractStatusCode(error: any): number | undefined {
    if (typeof error === 'object' && error !== null && 'status' in error) {
      return (error as { status?: number }).status;
    }
    return undefined;
  }

  /**
   * Generate enhanced crawl result with performance stats
   */
  private generateEnhancedCrawlResult(crawlState: any, completed: boolean): CrawlResult {
    const { jobId, startTime, crawledPages, errors } = crawlState;
    const endTime = new Date();
    
    // Calculate statistics - properly type the pages
    const pages: (CrawledPage & { seoAudit?: SeoAuditData })[] = Array.from(crawledPages.values());
    const totalLoadTime = pages.reduce((sum: number, page) => sum + (page.loadTime || 0), 0);
    const avgLoadTime = pages.length > 0 ? totalLoadTime / pages.length : 0;
    const successRate = pages.length > 0 ? pages.length / (pages.length + errors.length) : 0;
    
    // Calculate overall performance score
    const performanceScores = pages
      .map(page => page.seoAudit?.performanceScore)
      .filter((score): score is number => score !== undefined && !isNaN(score));
    
    const avgPerformanceScore = performanceScores.length > 0 
      ? performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length 
      : undefined;

    return {
      jobId,
      pages: pages as CrawledPage[], // Cast to expected type
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
  private emitProgress(crawlState: any): void {
    const { jobId, startTime, urlQueue, processedUrls, errors } = crawlState;
    
    const progress: CrawlProgress = {
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
  private calculateEstimatedTimeRemaining(crawlState: any): number | undefined {
    const { startTime, processedUrls, job } = crawlState;
    const elapsed = Date.now() - startTime.getTime();
    const processed = processedUrls.size;
    
    if (processed === 0) return undefined;
    
    const avgTimePerPage = elapsed / processed;
    const remaining = job.maxPages - processed;
    
    return Math.round(avgTimePerPage * remaining);
  }

  /**
   * Job validation
   */
  private validateCrawlJob(job: CrawlJob): void {
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
      if (!isValidUrl(url)) {
        throw new Error(`Invalid URL: ${url}`);
      }
    });
  }

  // Public API methods
  getCrawlStatus(jobId: string): CrawlResult | null {
    const crawlState = this.activeCrawls.get(jobId);
    if (!crawlState) {
      return null;
    }

    return this.generateEnhancedCrawlResult(crawlState, false);
  }

  cancelCrawl(jobId: string): boolean {
    const crawlState = this.activeCrawls.get(jobId);
    if (!crawlState) {
      return false;
    }

    this.activeCrawls.delete(jobId);
    this.logger.log(`Enhanced crawl job ${jobId} cancelled`);
    
    return true;
  }

  getActiveCrawls(): string[] {
    return Array.from(this.activeCrawls.keys());
  }

  private async cleanup(): Promise<void> {
    // Cancel all active crawls
    for (const jobId of this.activeCrawls.keys()) {
      this.cancelCrawl(jobId);
    }
    
    this.robotsUtil.clearCache();
    this.activeCrawls.clear();
    this.logger.log('🔄 Enhanced crawler cleaned up');
  }

  updateOptions(options: Partial<CrawlerOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    this.logger.log('Enhanced crawler options updated');
  }

  getStats(): any {
    return {
      activeCrawls: this.activeCrawls.size,
      robotsCacheStats: this.robotsUtil.getCacheStats(),
      defaultOptions: this.defaultOptions,
      mode: 'enhanced',
      features: ['performance-scoring', 'seo-analysis', 'optimized-batching', 'smart-filtering'],
    };
  }
}

/**
 * Simple semaphore implementation for controlling concurrency
 */
class Semaphore {
  private permits: number;
  private waitQueue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
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