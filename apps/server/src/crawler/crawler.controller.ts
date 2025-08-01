import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlJob, CrawlResult, CrawlerOptions } from './interfaces/crawler.interfaces';
import { CreateCrawlJobDto } from './dto/create-crawl-job.dto';
import { CrawlerPlaywrightService } from './crawler.playwright.service';
import { generateCrawlId } from './utils/url.util';

export class UpdateCrawlerOptionsDto {
  concurrency?: number;
  defaultUserAgent?: string;
  defaultTimeout?: number;
  defaultRetries?: number;
  respectRobotsTxt?: boolean;
  defaultCrawlDelay?: number;
}

@Controller('api/crawler')
export class CrawlerController implements OnModuleInit {
  private readonly logger = new Logger(CrawlerController.name);

  constructor(private readonly crawlerService: CrawlerService) {}

  onModuleInit() {
    if (!this.crawlerService || typeof this.crawlerService.on !== 'function') {
      this.logger.warn('CrawlerService not initialized or not an EventEmitter');
      return;
    }
    this.setupEventListeners();
  }


  private setupEventListeners(): void {
    this.crawlerService.on('crawl-started', (jobId: string) => {
      this.logger.log(`Crawl job ${jobId} started`);
    });

    this.crawlerService.on('page-crawled', (page) => {
      this.logger.debug(`Page crawled: ${page.url} (${page.statusCode})`);
    });

    this.crawlerService.on('crawl-error', (error) => {
      this.logger.warn(`Crawl error: ${error.url} - ${error.error}`);
    });

    this.crawlerService.on('crawl-progress', (progress) => {
      this.logger.debug(
        `Crawl progress: ${progress.processedUrls}/${progress.totalUrls} processed`
      );
    });

    this.crawlerService.on('crawl-finished', (result: CrawlResult) => {
      this.logger.log(
        `Crawl job ${result.jobId} finished: ${result.pages.length} pages, ${result.errors.length} errors`
      );
    });
  }

  /**
   * Start a new crawl job
   */
  @Post('jobs')
  async createCrawlJob(
    @Body() dto: CreateCrawlJobDto
  ): Promise<CrawlResult> {
    try {
      // Validate input
      if (!dto.urls || dto.urls.length === 0) {
        throw new HttpException('At least one URL must be provided', HttpStatus.BAD_REQUEST);
      }

      if (dto.maxDepth < 0 || dto.maxPages < 1) {
        throw new HttpException('Invalid depth or pages limit', HttpStatus.BAD_REQUEST);
      }

      const crawlJob: CrawlJob = {
        id: generateCrawlId(), // Generate a proper ID
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
      return result

    } catch (error) {
      this.logger.error('Error creating crawl job:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create crawl job', HttpStatus.INTERNAL_SERVER_ERROR);
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
  @Get('stats')
  async getCrawlerStats() {
    try {
      this.logger.debug('Attempting to get crawler stats...');
      const stats = this.crawlerService.getStats();
      this.logger.debug('Successfully retrieved stats:', stats);
      return stats;
    } catch (error) {
      this.logger.error('Error getting crawler stats:', error);
      this.logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
      this.logger.error('Error type:', typeof error);
      this.logger.error('Error message:', error instanceof Error ? error.message : String(error));
      throw new HttpException(
        `Failed to get crawler stats: ${error instanceof Error ? error.message : String(error)}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update crawler options
   */
  @Post('options')
  async updateCrawlerOptions(@Body() dto: UpdateCrawlerOptionsDto): Promise<{ updated: boolean }> {
    try {
      const options: Partial<CrawlerOptions> = {};

      if (dto.concurrency !== undefined) options.concurrency = dto.concurrency;
      if (dto.defaultUserAgent !== undefined) options.defaultUserAgent = dto.defaultUserAgent;
      if (dto.defaultTimeout !== undefined) options.defaultTimeout = dto.defaultTimeout;
      if (dto.defaultRetries !== undefined) options.defaultRetries = dto.defaultRetries;
      if (dto.respectRobotsTxt !== undefined) options.respectRobotsTxt = dto.respectRobotsTxt;
      if (dto.defaultCrawlDelay !== undefined) options.defaultCrawlDelay = dto.defaultCrawlDelay;

      this.crawlerService.updateOptions(options);

      return { updated: true };
    } catch (error) {
      this.logger.error('Error updating crawler options:', error);
      throw new HttpException(
        'Failed to update crawler options',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
