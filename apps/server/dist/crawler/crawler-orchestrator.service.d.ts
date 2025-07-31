import { OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectCreatedEvent } from '../projects/events/project-created.event';
export declare const CRAWLER_SERVICE_TOKEN = "CRAWLER_SERVICE_TOKEN";
export declare class CrawlerOrchestratorService implements OnModuleInit {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly crawlerPlaywrightService;
    private readonly logger;
    private seoAnalyzer;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, crawlerPlaywrightService: any);
    onModuleInit(): void;
    private setupCrawlerEventListeners;
    /**
     * Handle project analysis request (triggered by analyze button)
     */
    private handleProjectAnalysisRequested;
    handleProjectCreated(event: ProjectCreatedEvent): Promise<void>;
    private startCrawlAsync;
    private storePages;
    private handleCrawlStarted;
    private handlePageCrawled;
    private handleCrawlProgress;
    private handleCrawlError;
    private handleCrawlFinished;
    private storePagesFromResult;
}
