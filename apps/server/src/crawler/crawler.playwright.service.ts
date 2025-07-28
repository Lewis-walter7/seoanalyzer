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

@Injectable()
export class CrawlerPlaywrightService extends EventEmitter {
  private readonly logger = new Logger(CrawlerPlaywrightService.name);
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

    this.emit('crawl-started', jobId);
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

      while (crawlState.urlQueue.size > 0 && processedCount < job.maxPages) {
        const urlsToProcess = Array.from(crawlState.urlQueue).slice(0, Math.min(5, job.maxPages - processedCount));
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
        const isAllowed = await this.robotsUtil.isAllowed(url, userAgent);

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
      await page.setUserAgent(job.userAgent || this.defaultOptions.defaultUserAgent);

      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: job.timeout || this.defaultOptions.defaultTimeout });

      if (!response) {
        throw new Error('Failed to load page');
      }

      const html = await page.content();
      const title = await page.title();
      
      const crawledPage: CrawledPage = {
        url,
        title,
        statusCode: response.status(),
        contentType: response.headers()['content-type'],
        size: html.length,
        loadTime: response.timing().responseEnd - response.timing().requestStart,
        depth: crawlState.currentDepth,
        links: [],
        assets: {
          images: [],
          scripts: [],
          stylesheets: [],
        },
        meta: {},
        headings: {},
        timestamp: new Date(),
      };

      crawledPages.set(url, crawledPage);

      this.addDiscoveredUrls([], url, crawlState);

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

  // The validateCrawlJob, generateCrawlResult, emitProgress, addDiscoveredUrls methods remain unchanged from the existing service.

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

