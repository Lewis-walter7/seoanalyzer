import { OnModuleInit } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlResult } from './interfaces/crawler.interfaces';
import { CreateCrawlJobDto } from './dto/create-crawl-job.dto';
export declare class UpdateCrawlerOptionsDto {
    concurrency?: number;
    defaultUserAgent?: string;
    defaultTimeout?: number;
    defaultRetries?: number;
    respectRobotsTxt?: boolean;
    defaultCrawlDelay?: number;
}
export declare class CrawlerController implements OnModuleInit {
    private readonly crawlerService;
    private readonly logger;
    constructor(crawlerService: CrawlerService);
    onModuleInit(): void;
    private setupEventListeners;
    /**
     * Start a new crawl job
     */
    createCrawlJob(dto: CreateCrawlJobDto): Promise<CrawlResult>;
    /**
     * Get status of a crawl job
     */
    /**
     * Cancel a crawl job
     */
    /**
     * Get all active crawl jobs
     */
    /**
     * Get crawler statistics
     */
    getCrawlerStats(): Promise<any>;
    /**
     * Update crawler options
     */
    updateCrawlerOptions(dto: UpdateCrawlerOptionsDto): Promise<{
        updated: boolean;
    }>;
    /**
     * Health check endpoint
     */
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
}
