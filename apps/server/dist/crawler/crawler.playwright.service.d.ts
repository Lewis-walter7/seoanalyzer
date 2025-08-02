import { EventEmitter } from 'events';
import { CrawlJob, CrawlResult, CrawlerOptions } from './interfaces/crawler.interfaces';
export declare class CrawlerPlaywrightService extends EventEmitter {
    private readonly logger;
    private robotsUtil;
    private activeCrawls;
    private defaultOptions;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    crawl(job: CrawlJob): Promise<CrawlResult>;
    private executeCrawl;
    private crawlSinglePageWithPlaywright;
    private respectCrawlDelay;
    private validateCrawlJob;
    private generateCrawlResult;
    private calculatePerformanceScore;
    private calculateAverageLoadTime;
    private emitProgress;
    private addDiscoveredUrls;
    /**
     * Extract links from HTML content using SEO-focused filtering
     */
    private extractLinksFromHtml;
    private cleanup;
    updateOptions(options: Partial<CrawlerOptions>): void;
    getStats(): any;
}
