import { EventEmitter } from 'events';
import { CrawlJob, CrawlResult, CrawlerOptions } from './interfaces/crawler.interfaces';
/**
 * Fallback CrawlerService that uses fetch instead of Playwright
 * This is useful for testing and environments where Playwright isn't available
 */
export declare class CrawlerService extends EventEmitter {
    private readonly logger;
    private robotsUtil;
    private activeCrawls;
    private defaultOptions;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    /**
     * Start crawling a website using fetch
     */
    crawl(job: CrawlJob): Promise<CrawlResult>;
    /**
     * Execute the crawl job using fetch
     */
    private executeCrawl;
    /**
     * Crawl a single page with retry logic
     */
    private crawlSinglePageWithRetry;
    /**
     * Crawl a single page using fetch
     */
    private crawlSinglePageWithFetch;
    /**
     * Extract page data from HTML using basic parsing
     */
    private extractPageDataFromHTML;
    private decodeHtmlEntities;
    private addDiscoveredUrls;
    private respectCrawlDelay;
    private validateCrawlJob;
    private emitProgress;
    private generateCrawlResult;
    getCrawlStatus(jobId: string): CrawlResult | null;
    cancelCrawl(jobId: string): boolean;
    getActiveCrawls(): string[];
    private cleanup;
    updateOptions(options: Partial<CrawlerOptions>): void;
    getStats(): any;
}
