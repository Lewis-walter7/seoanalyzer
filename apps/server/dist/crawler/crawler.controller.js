"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CrawlerController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerController = exports.UpdateCrawlerOptionsDto = void 0;
const common_1 = require("@nestjs/common");
const enhanced_crawler_service_1 = require("./enhanced-crawler.service");
const create_crawl_job_dto_1 = require("./dto/create-crawl-job.dto");
const url_util_1 = require("./utils/url.util");
class UpdateCrawlerOptionsDto {
    concurrency;
    defaultUserAgent;
    defaultTimeout;
    defaultRetries;
    respectRobotsTxt;
    defaultCrawlDelay;
}
exports.UpdateCrawlerOptionsDto = UpdateCrawlerOptionsDto;
let CrawlerController = CrawlerController_1 = class CrawlerController {
    crawlerService;
    logger = new common_1.Logger(CrawlerController_1.name);
    constructor(crawlerService) {
        this.crawlerService = crawlerService;
    }
    onModuleInit() {
        if (!this.crawlerService || typeof this.crawlerService.on !== 'function') {
            this.logger.warn('CrawlerService not initialized or not an EventEmitter');
            return;
        }
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.crawlerService.on('crawl-started', (jobId) => {
            this.logger.log(`Crawl job ${jobId} started`);
        });
        this.crawlerService.on('page-crawled', (page) => {
            this.logger.debug(`Page crawled: ${page.url} (${page.statusCode})`);
        });
        this.crawlerService.on('crawl-error', (error) => {
            this.logger.warn(`Crawl error: ${error.url} - ${error.error}`);
        });
        this.crawlerService.on('crawl-progress', (progress) => {
            this.logger.debug(`Crawl progress: ${progress.processedUrls}/${progress.totalUrls} processed`);
        });
        this.crawlerService.on('crawl-finished', (result) => {
            this.logger.log(`Crawl job ${result.jobId} finished: ${result.pages.length} pages, ${result.errors.length} errors`);
        });
    }
    /**
     * Start a new crawl job
     */
    async createCrawlJob(dto) {
        try {
            // Validate input
            if (!dto.urls || dto.urls.length === 0) {
                throw new common_1.HttpException('At least one URL must be provided', common_1.HttpStatus.BAD_REQUEST);
            }
            if (dto.maxDepth < 0 || dto.maxPages < 1) {
                throw new common_1.HttpException('Invalid depth or pages limit', common_1.HttpStatus.BAD_REQUEST);
            }
            const crawlJob = {
                id: (0, url_util_1.generateCrawlId)(), // Generate a proper ID
                urls: dto.urls,
                maxDepth: dto.maxDepth,
                maxPages: dto.maxPages,
                userAgent: dto.userAgent,
                disableJavaScript: dto.disableJavaScript,
                respectRobotsTxt: dto.respectRobotsTxt,
                crawlDelay: dto.crawlDelay,
                allowedDomains: dto.allowedDomains,
                excludePatterns: dto.excludePatterns,
                includePatterns: dto.includePatterns,
                customHeaders: dto.customHeaders,
                viewport: dto.viewport,
                timeout: dto.timeout,
                retries: dto.retries,
            };
            const result = await this.crawlerService.crawl(crawlJob);
            // Wrap the crawl in a Promise to wait for results
            return result;
        }
        catch (error) {
            this.logger.error('Error creating crawl job:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to create crawl job', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * Get status of a crawl job
     */
    // @Get('jobs/:jobId')
    // async getCrawlJobStatus(@Param('jobId') jobId: string) {
    //   try {
    //     const status = this.crawlerService.getCrawlStatus(jobId);
    //     if (!status) {
    //       throw new HttpException(
    //         'Crawl job not found',
    //         HttpStatus.NOT_FOUND
    //       );
    //     }
    //     return status;
    //   } catch (error) {
    //     this.logger.error(`Error getting crawl job ${jobId} status:`, error);
    //     if (error instanceof HttpException) {
    //       throw error;
    //     }
    //     throw new HttpException(
    //       'Failed to get crawl job status',
    //       HttpStatus.INTERNAL_SERVER_ERROR
    //     );
    //   }
    // }
    /**
     * Cancel a crawl job
     */
    // @Delete('jobs/:jobId')
    // async cancelCrawlJob(@Param('jobId') jobId: string): Promise<{ cancelled: boolean }> {
    //   try {
    //     const cancelled = this.crawlerService.cancelCrawl(jobId);
    //     if (!cancelled) {
    //       throw new HttpException(
    //         'Crawl job not found or already completed',
    //         HttpStatus.NOT_FOUND
    //       );
    //     }
    //     return { cancelled: true };
    //   } catch (error) {
    //     this.logger.error(`Error cancelling crawl job ${jobId}:`, error);
    //     if (error instanceof HttpException) {
    //       throw error;
    //     }
    //     throw new HttpException(
    //       'Failed to cancel crawl job',
    //       HttpStatus.INTERNAL_SERVER_ERROR
    //     );
    //   }
    // }
    /**
     * Get all active crawl jobs
     */
    // @Get('jobs')
    // async getActiveCrawlJobs(): Promise<{ jobs: string[] }> {
    //   try {
    //     const jobs = this.crawlerService.getActiveCrawls();
    //     return { jobs };
    //   } catch (error) {
    //     this.logger.error('Error getting active crawl jobs:', error);
    //     throw new HttpException(
    //       'Failed to get active crawl jobs',
    //       HttpStatus.INTERNAL_SERVER_ERROR
    //     );
    //   }
    // }
    /**
     * Get crawler statistics
     */
    async getCrawlerStats() {
        try {
            this.logger.debug('Attempting to get crawler stats...');
            const stats = this.crawlerService.getStats();
            this.logger.debug('Successfully retrieved stats:', stats);
            return stats;
        }
        catch (error) {
            this.logger.error('Error getting crawler stats:', error);
            this.logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
            this.logger.error('Error type:', typeof error);
            this.logger.error('Error message:', error instanceof Error ? error.message : String(error));
            throw new common_1.HttpException(`Failed to get crawler stats: ${error instanceof Error ? error.message : String(error)}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * Update crawler options
     */
    async updateCrawlerOptions(dto) {
        try {
            const options = {};
            if (dto.concurrency !== undefined)
                options.concurrency = dto.concurrency;
            if (dto.defaultUserAgent !== undefined)
                options.defaultUserAgent = dto.defaultUserAgent;
            if (dto.defaultTimeout !== undefined)
                options.defaultTimeout = dto.defaultTimeout;
            if (dto.defaultRetries !== undefined)
                options.defaultRetries = dto.defaultRetries;
            if (dto.respectRobotsTxt !== undefined)
                options.respectRobotsTxt = dto.respectRobotsTxt;
            if (dto.defaultCrawlDelay !== undefined)
                options.defaultCrawlDelay = dto.defaultCrawlDelay;
            this.crawlerService.updateOptions(options);
            return { updated: true };
        }
        catch (error) {
            this.logger.error('Error updating crawler options:', error);
            throw new common_1.HttpException('Failed to update crawler options', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * Health check endpoint
     */
    async healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.CrawlerController = CrawlerController;
__decorate([
    (0, common_1.Post)('jobs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_crawl_job_dto_1.CreateCrawlJobDto]),
    __metadata("design:returntype", Promise)
], CrawlerController.prototype, "createCrawlJob", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CrawlerController.prototype, "getCrawlerStats", null);
__decorate([
    (0, common_1.Post)('options'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateCrawlerOptionsDto]),
    __metadata("design:returntype", Promise)
], CrawlerController.prototype, "updateCrawlerOptions", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CrawlerController.prototype, "healthCheck", null);
exports.CrawlerController = CrawlerController = CrawlerController_1 = __decorate([
    (0, common_1.Controller)('api/crawler'),
    __metadata("design:paramtypes", [enhanced_crawler_service_1.EnhancedCrawlerService])
], CrawlerController);
