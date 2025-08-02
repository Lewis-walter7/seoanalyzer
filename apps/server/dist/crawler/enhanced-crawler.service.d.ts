import { EventEmitter } from 'events';
import { CrawlJob, CrawlResult, CrawlerOptions } from './interfaces/crawler.interfaces';
/**
 * Enhanced Crawler Service with performance optimization and SEO analysis
 */
export declare class EnhancedCrawlerService extends EventEmitter {
    private readonly logger;
    private robotsUtil;
    private seoAnalyzer;
    private activeCrawls;
    private defaultOptions;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    /**
     * Start crawling with enhanced performance and SEO analysis
     */
    crawl(job: CrawlJob): Promise<CrawlResult>;
    /**
     * Enhanced crawl execution with better concurrency and batching
     */
    private executeEnhancedCrawl;
    /**
     * Enhanced single page crawling with retry logic
     */
    private crawlSinglePageEnhancedWithRetry;
    /**
     * Enhanced single page crawling with SEO analysis
     */
    private crawlSinglePageEnhanced;
    /**
     * Perform comprehensive SEO analysis
     */
    private performSeoAnalysis;
    /**
     * Enhanced page data extraction with better performance
     */
    private extractEnhancedPageData;
    /**
     * Optimized asset extraction
     */
    private extractAssetsOptimized;
    /**
     * Extract asset URLs with error handling
     */
    private extractAssetUrls;
    /**
     * Optimized meta tag extraction
     */
    private extractMetaTagsOptimized;
    /**
     * Decode HTML entities
     */
    private decodeHtmlEntities;
    /**
     * Optimized heading extraction with proper typing
     */
    private extractHeadingsOptimized;
    /**
     * Enhanced URL discovery with smart filtering
     */
    private addDiscoveredUrlsEnhanced;
    /**
     * Check if URL should be skipped for performance
     */
    private shouldSkipUrl;
    /**
     * Optimized crawl delay with domain-based caching
     */
    private respectCrawlDelayOptimized;
    /**
     * Extract status code from error
     */
    private extractStatusCode;
    /**
     * Generate enhanced crawl result with performance stats
     */
    private generateEnhancedCrawlResult;
    /**
     * Enhanced progress emission
     */
    private emitProgress;
    /**
     * Calculate estimated time remaining
     */
    private calculateEstimatedTimeRemaining;
    /**
     * Job validation
     */
    private validateCrawlJob;
    getCrawlStatus(jobId: string): CrawlResult | null;
    cancelCrawl(jobId: string): boolean;
    getActiveCrawls(): string[];
    private cleanup;
    updateOptions(options: Partial<CrawlerOptions>): void;
    getStats(): any;
}
