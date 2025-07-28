import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import {
  CrawlJob,
  CrawledPage,
  CrawlError,
  CrawlProgress,
  CrawlResult,
  CrawlerOptions,
} from './interfaces/crawler.interfaces';
import { RobotsUtil } from './utils/robots.util';
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
 * Fallback CrawlerService that uses fetch instead of Playwright
 * This is useful for testing and environments where Playwright isn't available
 */
@Injectable()
export class CrawlerService extends EventEmitter {
  private readonly logger = new Logger(CrawlerService.name);
  private robotsUtil: RobotsUtil;
  private activeCrawls = new Map<string, any>();
  private defaultOptions: Required<CrawlerOptions> = {
    concurrency: 5,
    defaultUserAgent: 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
    defaultTimeout: 30000,
    defaultRetries: 3,
    respectRobotsTxt: true,
    defaultCrawlDelay: 1000,
  };

  constructor() {
    super();
    this.robotsUtil = new RobotsUtil();
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
  async crawl(job: CrawlJob): Promise<CrawlResult> {
    const jobId = job.id || generateCrawlId();
    
    this.logger.log(`Starting fallback crawl job ${jobId} for ${job.urls.join(', ')}`);
    
    // Validate job parameters
    this.validateCrawlJob(job);
    
    // Initialize crawl state
    const crawlState = {
      jobId,
      job,
      startTime: new Date(),
      urlQueue: new Set<string>(),
      processedUrls: new Set<string>(),
      crawledPages: new Map<string, CrawledPage>(),
      errors: [],
      currentDepth: 0,
      domainDelays: new Map<string, number>(),
      lastCrawlTime: new Map<string, number>(),
    };

    // Add initial URLs to queue
    job.urls.forEach(url => {
      const normalizedUrl = normalizeUrl(url);
      if (isValidUrl(normalizedUrl)) {
        crawlState.urlQueue.add(normalizedUrl);
      }
    });

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
    return new Promise<CrawlResult>((resolve, reject) => {
    this.once('crawl-finished', (result: CrawlResult) => {
      if (result.jobId === jobId) {
        resolve(result);
      }
    });

    this.once('crawl-error', (error: CrawlError) => {
      reject(error);
    });

    this.executeCrawl(crawlState).catch(err => {
      this.logger.error(`Crawl job ${jobId} failed:`, err);
      reject(err);
    });
  });
  }

  /**
   * Execute the crawl job using fetch
   */
  private async executeCrawl(crawlState: any): Promise<void> {
    const { jobId, job } = crawlState;
    
    try {
      let processedCount = 0;
      
      while (crawlState.urlQueue.size > 0 && processedCount < job.maxPages) {
        const urlsToProcess = Array.from(crawlState.urlQueue).slice(0, Math.min(5, job.maxPages - processedCount));
        crawlState.urlQueue.clear();

        // Process URLs with limited concurrency
        const crawlPromises = (urlsToProcess as string[]).map(url => 
          this.crawlSinglePageWithFetch(url, crawlState)
        );

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
      
    } catch (error) {
      this.logger.error(`Error during crawl execution for job ${jobId}:`, error);
      const result = this.generateCrawlResult(crawlState, false);
      this.emit('crawl-finished', result);
      this.activeCrawls.delete(jobId);
    }
  }

  /**
   * Crawl a single page using fetch
   */
  private async crawlSinglePageWithFetch(url: string, crawlState: any): Promise<void> {
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
          const domain = extractDomain(url);
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
      const domain = extractDomain(url);
      lastCrawlTime.set(domain, Date.now());
      
    } catch (error) {
      this.logger.error(`Error crawling ${url}:`, (error as Error).message);
      
      const crawlError: CrawlError = {
        url,
        error: (error instanceof Error) ? error.message : String(error),
        statusCode:
          typeof error === 'object' &&
          error !== null &&
          'status' in error
            ? (error as { status?: number }).status
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
  private extractPageDataFromHTML(
    url: string,
    html: string,
    response: Response,
    loadTime: number,
    depth: number
  ): CrawledPage {
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
      .filter((link): link is string => link !== null)
      .map(link => resolveUrl(url, link))
      .filter(link => isValidUrl(link))
      .map(link => normalizeUrl(link));

    // Extract images
    const imageMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
    const images = imageMatches
      .map(match => {
        const srcMatch = match.match(/src=["']([^"']+)["']/i);
        return srcMatch ? resolveUrl(url, srcMatch[1]) : null;
      })
      .filter((x): x is string => x !== null)

    // Extract scripts
    const scriptMatches = html.match(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
    const scripts = scriptMatches
      .map(match => {
        const srcMatch = match.match(/src=["']([^"']+)["']/i);
        return srcMatch ? resolveUrl(url, srcMatch[1]) : null;
      })
      .filter((x): x is string => x !== null)

    // Extract stylesheets
    const cssMatches = html.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
    const stylesheets = cssMatches
      .map(match => {
        const hrefMatch = match.match(/href=["']([^"']+)["']/i);
        return hrefMatch ? resolveUrl(url, hrefMatch[1]) : null;
      })
      .filter((x): x is string => x !== null)

    // Extract meta tags
    const meta: any = {};
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
    const headings: any = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
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
  private addDiscoveredUrls(links: string[], parentUrl: string, crawlState: any): void {
    const { job, urlQueue, processedUrls, currentDepth } = crawlState;

    links.forEach(link => {
      // Skip if already processed or queued
      if (processedUrls.has(link) || urlQueue.has(link)) {
        return;
      }

      // Check depth limit
      const linkDepth = getUrlDepth(link, job.urls[0]);
      if (linkDepth >= job.maxDepth) {
        return;
      }

      // Check domain restrictions
      if (!isAllowedDomain(link, job.allowedDomains)) {
        return;
      }

      // Check include/exclude patterns
      if (job.excludePatterns && matchesPatterns(link, job.excludePatterns)) {
        return;
      }

      if (job.includePatterns && !matchesPatterns(link, job.includePatterns)) {
        return;
      }

      // Add to queue
      urlQueue.add(link);
    });
  }

  private async respectCrawlDelay(
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

  private validateCrawlJob(job: CrawlJob): void {
    if (!job.urls || job.urls.length === 0) {
      throw new Error('At least one URL must be provided');
    }

    if (job.maxDepth < 0 || job.maxPages < 1) {
      throw new Error('Invalid depth or pages limit');
    }

    job.urls.forEach(url => {
      if (!isValidUrl(url)) {
        throw new Error(`Invalid URL: ${url}`);
      }
    });
  }

  private emitProgress(crawlState: any): void {
    const { jobId, startTime, urlQueue, processedUrls, errors } = crawlState;
    
    const progress: CrawlProgress = {
      totalUrls: urlQueue.size + processedUrls.size,
      processedUrls: processedUrls.size,
      pendingUrls: urlQueue.size,
      errorUrls: errors.length,
      currentDepth: crawlState.currentDepth,
      startTime,
    };

    this.emit('crawl-progress', progress);
  }

  private generateCrawlResult(crawlState: any, completed: boolean): CrawlResult {
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
  getCrawlStatus(jobId: string): CrawlResult | null {
    const crawlState = this.activeCrawls.get(jobId);
    if (!crawlState) {
      return null;
    }

    return this.generateCrawlResult(crawlState, false);
  }

  cancelCrawl(jobId: string): boolean {
    const crawlState = this.activeCrawls.get(jobId);
    if (!crawlState) {
      return false;
    }

    this.activeCrawls.delete(jobId);
    this.logger.log(`Crawl job ${jobId} cancelled`);
    
    return true;
  }

  getActiveCrawls(): string[] {
    return Array.from(this.activeCrawls.keys());
  }

  private async cleanup(): Promise<void> {
    this.robotsUtil.clearCache();
    this.activeCrawls.clear();
    this.logger.log('🔄 Fallback crawler cleaned up');
  }

  updateOptions(options: Partial<CrawlerOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    this.logger.log('Crawler options updated');
  }

  getStats(): any {
    return {
      activeCrawls: this.activeCrawls.size,
      robotsCacheStats: this.robotsUtil.getCacheStats(),
      defaultOptions: this.defaultOptions,
      mode: 'fallback',
    };
  }
}
