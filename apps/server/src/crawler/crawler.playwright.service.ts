import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { chromium, Page, Browser } from 'playwright';
import PQueue from 'p-queue';
import {
  CrawlJob,
  CrawledPage,
  CrawlError,
  CrawlProgress,
  CrawlResult,
  CrawlerOptions,
  CrawlStats,
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
  extractSeoUrls,
} from './utils/url.util';

@Injectable()
export class CrawlerPlaywrightService extends EventEmitter {
  private readonly logger = new Logger(CrawlerPlaywrightService.name);
  private robotsUtil: RobotsUtil;
  private activeCrawls = new Map<string, any>();
  private defaultOptions: Required<CrawlerOptions> & { defaultRenderTime: number } = {
    concurrency: 5,
    defaultUserAgent: 'Mozilla/5.0 (compatible; SEO-Analyzer-Bot/1.0; +https://seo-analyzer.com/bot)',
    defaultTimeout: 30000,
    defaultRetries: 3,
    respectRobotsTxt: true,
    defaultCrawlDelay: 1000,
    defaultRenderTime: 5000, // Max render time in milliseconds
    defaultMaxPages: 1000,
  };

  constructor() {
    super();
    this.robotsUtil = new RobotsUtil();
    this.setMaxListeners(100);
  }

  async onModuleInit() {
    this.logger.log('🚀 Playwright Crawler initialized');
  }

  async onModuleDestroy() {
    await this.cleanup();
  }

  async crawl(job: CrawlJob): Promise<CrawlResult> {
    const jobId = job.id || generateCrawlId();

    this.logger.log(`Starting playwright crawl job ${jobId} for ${job.urls.join(', ')}`);

    this.validateCrawlJob(job);

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

    job.urls.forEach(url => {
      const normalizedUrl = normalizeUrl(url);
      if (isValidUrl(normalizedUrl)) {
        crawlState.urlQueue.add(normalizedUrl);
      }
    });

    this.activeCrawls.set(jobId, crawlState);

    // Emit crawl-started event immediately
    this.emit('crawl-started', jobId);

    const browser = await chromium.launch({ headless: true });
    await this.executeCrawl(browser, crawlState).catch(error => {
      this.logger.error(`Crawl job ${jobId} failed:`, error);
      this.emit('crawl-error', {
        url: 'unknown',
        error: error.message,
        timestamp: new Date(),
        depth: 0,
      });
    });
    return new Promise<CrawlResult>((resolve, reject) => {
      this.once('crawl-finished', (result: CrawlResult) => {
        if (result.jobId === jobId) {
          resolve(result);
        }
        browser.close();
      });

      this.once('crawl-error', (error: CrawlError) => {
        reject(error);
        browser.close();
      });
    });
  }

  private async executeCrawl(browser: Browser, crawlState: any): Promise<void> {
    const { jobId, job } = crawlState;
    const queue = new PQueue({ concurrency: this.defaultOptions.concurrency });

    try {
      let processedCount = 0;
      const urlQueue = crawlState.urlQueue as Set<string>;

      while (crawlState.urlQueue.size > 0 && processedCount < job.maxPages) {
        const urlQueue = crawlState.urlQueue as Set<string>;
        const urlsToProcess = Array.from(urlQueue).slice(0, Math.min(5, job.maxPages - processedCount));
        crawlState.urlQueue.clear();

        await Promise.allSettled(
          urlsToProcess.map(url =>
            queue.add(() => this.crawlSinglePageWithPlaywright(url, crawlState, browser))
          )
        );
        processedCount += urlsToProcess.length;

        this.emitProgress(crawlState);

        if (crawlState.currentDepth >= job.maxDepth) {
          break;
        }

        crawlState.currentDepth++;
      }

      const result = this.generateCrawlResult(crawlState, true);
      this.emit('crawl-finished', result);

      this.activeCrawls.delete(jobId);
    } catch (error) {
      this.logger.error(`Error during crawl execution for job ${jobId}:`, error);
      const result = this.generateCrawlResult(crawlState, false);
      this.emit('crawl-finished', result);
      this.activeCrawls.delete(jobId);
    }
  }

  private async crawlSinglePageWithPlaywright(url: string, crawlState: any, browser: Browser): Promise<void> {
    const { job, processedUrls, crawledPages, errors, domainDelays, lastCrawlTime } = crawlState;

    if (processedUrls.has(url)) {
      return;
    }

    processedUrls.add(url);

    let page: Page | null = null;
    try {
      if (job.respectRobotsTxt !== false && this.defaultOptions.respectRobotsTxt) {
        const userAgent = job.userAgent || this.defaultOptions.defaultUserAgent;
        const isAllowed = await this.robotsUtil.isAllowed(url, userAgent, job.allowedPaths);

        if (!isAllowed) {
          this.logger.debug(`URL blocked by robots.txt: ${url}`);
          return;
        }

        const robotsCrawlDelay = await this.robotsUtil.getCrawlDelay(url, userAgent);
        if (robotsCrawlDelay) {
          const domain = extractDomain(url);
          domainDelays.set(domain, robotsCrawlDelay);
        }
      }

      await this.respectCrawlDelay(url, domainDelays, lastCrawlTime, job.crawlDelay);

      page = await browser.newPage();
      const userAgent = job.userAgent || this.defaultOptions.defaultUserAgent;
      await page.setExtraHTTPHeaders({
        'User-Agent': userAgent
      });

      const startTime = Date.now();
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: job.timeout || this.defaultOptions.defaultTimeout 
      });

      if (!response) {
        throw new Error('Failed to load page');
      }

      // Wait for additional rendering time for dynamic content
      const maxRenderTime = job.renderTime || this.defaultOptions.defaultRenderTime;
      await page.waitForTimeout(maxRenderTime);

      // Snapshot HTML after rendering
      const html = await page.content();
      const title = await page.title();
      const loadTime = Date.now() - startTime;
      
      const crawledPage: CrawledPage = {
        url,
        title,
        statusCode: response.status(),
        contentType: response.headers()['content-type'] || 'text/html',
        size: html.length,
        loadTime,
        depth: crawlState.currentDepth,
        html, // Include HTML content for SEO analysis
        links: [],
        assets: {
          images: [],
          scripts: [],
          stylesheets: [],
        },
        meta: {},
        headings: {
          h1: [],
          h2: [],
          h3: [],
          h4: [],
          h5: [],
          h6: []
        },
        timestamp: new Date(),
      };

      crawledPages.set(url, crawledPage);

      // Extract links from the rendered HTML and add them to the crawl queue
      const discoveredLinks = this.extractLinksFromHtml(html, url);
      this.addDiscoveredUrls(discoveredLinks, url, crawlState);

      this.emit('page-crawled', crawledPage);

      const domain = extractDomain(url);
      lastCrawlTime.set(domain, Date.now());
    } catch (error) {
      this.logger.error(`Error crawling ${url}:`, (error as Error).message);

      const crawlError: CrawlError = {
        url,
        error: (error instanceof Error) ? error.message : String(error),
        statusCode: 0,
        timestamp: new Date(),
        depth: crawlState.currentDepth,
      };

      errors.push(crawlError);
      this.emit('crawl-error', crawlError);
    } finally {
      if (page) {
        await page.close();
      }
    }
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
      throw new Error('No URLs provided for crawling');
    }

    // Set default maxPages if not specified
    if (!job.maxPages) {
      job.maxPages = this.defaultOptions.defaultMaxPages;
    }

    if (job.maxPages && job.maxPages <= 0) {
      throw new Error('maxPages must be greater than 0');
    }

    if (job.maxDepth && job.maxDepth < 0) {
      throw new Error('maxDepth must be non-negative');
    }

    // Validate URLs
    for (const url of job.urls) {
      if (!isValidUrl(url)) {
        throw new Error(`Invalid URL: ${url}`);
      }
    }
  }

  private generateCrawlResult(crawlState: any, completed: boolean): CrawlResult {
    const { jobId, job, startTime, crawledPages, errors, progress } = crawlState;
    
    const stats = {
      avgLoadTime: this.calculateAverageLoadTime(crawledPages),
      successRate: crawledPages.size / (crawledPages.size + errors.length),
      crawlDuration: Date.now() - startTime.getTime(),
    };

    const performanceScore = this.calculatePerformanceScore(stats);
    stats.successRate = performanceScore;
    this.logger.log(`Crawl Performance Score: ${performanceScore.toFixed(2)}`);
    this.logger.log(`Crawl Stats - Success Rate: ${(stats.successRate * 100).toFixed(1)}%, Avg Load Time: ${stats.avgLoadTime.toFixed(0)}ms, Duration: ${(stats.crawlDuration / 1000).toFixed(1)}s`);
    
    return {
      jobId,
      startTime,
      endTime: new Date(),
      completed,
      progress,
      pages: Array.from(crawledPages.values()),
      errors,
      stats,
    };
  }

  private calculatePerformanceScore(stats: CrawlStats): number {
    const { avgLoadTime, successRate, crawlDuration } = stats;
    let score = 100;

    // Deduct points for higher load times and lower success rates
    score -= (avgLoadTime / 1000) * 5; // 5 points deduction per second
    score -= (1 - successRate) * 50; // Up to 50 points deduction

    // Ensure the score is within bounds
    return Math.max(0, Math.min(100, score));
  }

  private calculateAverageLoadTime(crawledPages: Map<string, CrawledPage>): number {
    if (crawledPages.size === 0) return 0;
    
    const totalLoadTime = Array.from(crawledPages.values())
      .reduce((sum, page) => sum + page.loadTime, 0);
    
    return totalLoadTime / crawledPages.size;
  }

  private emitProgress(crawlState: any): void {
    const { crawledPages, errors, urlQueue, currentDepth, startTime } = crawlState;

    const progress: CrawlProgress = {
      totalUrls: Math.min(
        crawlState.job.maxPages,
        crawledPages.size + urlQueue.size + errors.length
      ),
      processedUrls: crawledPages.size,
      pendingUrls: urlQueue.size,
      errorUrls: errors.length,
      currentDepth,
      startTime, 
    };

    this.emit('crawl-progress', progress);
  }


  private addDiscoveredUrls(links: string[], baseUrl: string, crawlState: any): void {
    const { job, urlQueue, processedUrls } = crawlState;
    
    for (const link of links) {
      try {
        const resolvedUrl = resolveUrl(link, baseUrl);
        const normalizedUrl = normalizeUrl(resolvedUrl);
        
        if (!isValidUrl(normalizedUrl)) continue;
        if (processedUrls.has(normalizedUrl)) continue;
        if (urlQueue.has(normalizedUrl)) continue;
        
        // Check depth limit
        const depth = getUrlDepth(normalizedUrl, job.urls[0]);
        if (depth > job.maxDepth) continue;
        
        // Check domain restrictions
        if (job.allowedDomains && job.allowedDomains.length > 0) {
          if (!isAllowedDomain(normalizedUrl, job.allowedDomains)) continue;
        }
        
        // Check include/exclude patterns
        if (job.includePatterns && job.includePatterns.length > 0) {
          if (!matchesPatterns(normalizedUrl, job.includePatterns)) continue;
        }
        
        if (job.excludePatterns && job.excludePatterns.length > 0) {
          if (matchesPatterns(normalizedUrl, job.excludePatterns)) continue;
        }
        
        urlQueue.add(normalizedUrl);
      } catch (error) {
        this.logger.debug(`Failed to process discovered URL: ${link}`, error);
      }
    }
  }

  /**
   * Extract links from HTML content using SEO-focused filtering
   */
  private extractLinksFromHtml(html: string, baseUrl: string): string[] {
    return extractSeoUrls(html, baseUrl);
  }

  private async cleanup(): Promise<void> {
    this.robotsUtil.clearCache();
    this.activeCrawls.clear();
    this.logger.log('🔄 Playwright crawler cleaned up');
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
      mode: 'playwright',
    };
  }
}

