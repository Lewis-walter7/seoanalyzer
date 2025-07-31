import { CrawlerService } from "../crawler.service";
import { CrawlResult } from '../interfaces/crawler.interfaces';
/**
 * Example usage of the CrawlerService
 * This demonstrates how to use the crawler service with various configurations
 */
export declare class CrawlerExample {
    private readonly crawlerService;
    constructor(crawlerService: CrawlerService);
    /**
     * Basic website crawl example
     */
    basicCrawlExample(): Promise<CrawlResult>;
    /**
     * Advanced crawl with custom configuration
     */
    advancedCrawlExample(): Promise<CrawlResult>;
    /**
     * E-commerce site crawl example (respecting robots.txt and rate limits)
     */
    ecommerceCrawlExample(): Promise<CrawlResult>;
    /**
     * News site crawl example (JavaScript disabled for faster crawling)
     */
    newsSiteCrawlExample(): Promise<CrawlResult>;
    /**
     * Monitor crawl progress and get real-time updates
     */
    monitorCrawlProgress(jobId: string): Promise<void>;
    /**
     * Demonstrate crawler statistics and management
     */
    demonstrateCrawlerManagement(): Promise<void>;
    /**
     * Example of crawling multiple sites simultaneously
     */
    multipleSitesCrawlExample(): Promise<CrawlResult[]>;
}
/**
 * Usage examples
 */
export declare const CRAWLER_USAGE_EXAMPLES: {
    basic: string;
    advanced: string;
    monitoring: string;
    cancellation: string;
};
