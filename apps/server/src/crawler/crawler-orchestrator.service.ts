import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectCreatedEvent } from '../projects/events/project-created.event';
import { 
  CrawlJob, 
  CrawledPage, 
  CrawlError, 
  CrawlProgress, 
  CrawlResult 
} from './interfaces/crawler.interfaces';
import { SeoAnalyzer, SeoAuditData } from './utils/seo-analyzer.util';

// Injection token to avoid circular dependencies
export const CRAWLER_SERVICE_TOKEN = 'CRAWLER_SERVICE_TOKEN';

@Injectable()
export class CrawlerOrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(CrawlerOrchestratorService.name);

  private seoAnalyzer: SeoAnalyzer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CRAWLER_SERVICE_TOKEN) private readonly crawlerPlaywrightService: any,
  ) {
    this.seoAnalyzer = new SeoAnalyzer();
  }

  onModuleInit() {
    this.setupCrawlerEventListeners();
  }

  private setupCrawlerEventListeners(): void {
    if (!this.crawlerPlaywrightService || typeof this.crawlerPlaywrightService.on !== 'function') {
      this.logger.warn('CrawlerPlaywrightService not available or not an EventEmitter');
      return;
    }

    // Listen to analysis requests
    this.eventEmitter.on('project.analysis.requested', async (event) => {
      this.logger.log(`Processing analysis request for project ${event.projectId}`);
      this.handleProjectAnalysisRequested(event);
    });

    // Register listeners for crawler events
    this.crawlerPlaywrightService.on('crawl-started', this.handleCrawlStarted.bind(this));
    this.crawlerPlaywrightService.on('page-crawled', this.handlePageCrawled.bind(this));
    this.crawlerPlaywrightService.on('crawl-progress', this.handleCrawlProgress.bind(this));
    this.crawlerPlaywrightService.on('crawl-error', this.handleCrawlError.bind(this));
    this.crawlerPlaywrightService.on('crawl-finished', this.handleCrawlFinished.bind(this));

    this.logger.log('Crawler event listeners registered successfully');
  }

  /**
   * Handle project analysis request (triggered by analyze button)
   */
  private async handleProjectAnalysisRequested(event: any): Promise<void> {
    try {
      this.logger.log(`Starting analysis for project ${event.projectName} (${event.rootUrl})`);
      
      // Construct CrawlJob DTO for the crawler service
      const crawlJobDto: CrawlJob = {
        id: event.crawlJobId,
        urls: [event.rootUrl],
        maxDepth: 6, // Increased depth for analysis requests
        maxPages: 200, // Increased page limit
        userAgent: 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
        respectRobotsTxt: true,
        crawlDelay: 1000,
        timeout: 30000,
        retries: 3,
        concurrency: 3,
        // Allow all domain variations
        allowedDomains: this.extractDomainVariations(event.rootUrl),
        // Minimal exclude patterns to allow maximum content discovery
        excludePatterns: [
          '*?add-to-cart=*',
          '*checkout*',
          '*wp-admin*', 
          '*login*',
          '*register*',
          '*my-account*',
          '*?wc-ajax*',
          '*.js', '*.css', '*.pdf', '*.zip'
        ],
      };

      // Start the crawl async
      this.startCrawlAsync(event.crawlJobId, crawlJobDto, event.projectName);
    } catch (error) {
      this.logger.error(`Failed to handle project analysis request for project ${event.projectId}:`, error);
      
      // Update crawl job to failed status
      try {
        await this.prisma.crawlJob.update({
          where: { id: event.crawlJobId },
          data: {
            status: 'FAILED',
            finishedAt: new Date(),
            error: error instanceof Error ? error.message : String(error),
          },
        });
      } catch (updateError) {
        this.logger.error(`Failed to update CrawlJob ${event.crawlJobId} with failure status:`, updateError);
      }
    }
  }

  @OnEvent('project.created')
  async handleProjectCreated(event: ProjectCreatedEvent): Promise<void> {
    this.logger.log(`Handling project.created event for project: ${event.projectId}`);

    try {
      // 1. Insert CrawlJob record with QUEUED status linked to the project
      const crawlJobRecord = await this.prisma.crawlJob.create({
        data: {
          projectId: event.projectId,
          status: 'QUEUED', // Using QUEUED as the initial status from schema enum
          maxPages: 200, // Increased default values
          maxDepth: 6, // Increased depth to discover more subroutes
          userAgent: 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
        },
      });

      this.logger.log(`Created CrawlJob record with ID: ${crawlJobRecord.id}`);

      // 2. Construct CrawlJob DTO for the crawler service
      const crawlJobDto: CrawlJob = {
        id: crawlJobRecord.id,
        urls: [event.rootUrl], // Use the rootUrl from the event
        maxDepth: crawlJobRecord.maxDepth || 6, // Increased depth to find more subroutes
        maxPages: crawlJobRecord.maxPages || 200, // Increased limit to crawl more pages
        userAgent: crawlJobRecord.userAgent || 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
        respectRobotsTxt: true,
        crawlDelay: 1000, // Reduced delay for faster crawling
        timeout: 30000, // 30 seconds timeout
        retries: 3,
        concurrency: 3, // Allow multiple concurrent requests
        // Allow all domain variations - more permissive
        allowedDomains: this.extractDomainVariations(event.rootUrl),
        // Minimal exclude patterns to allow maximum content discovery
        excludePatterns: [
          '*?add-to-cart=*',
          '*checkout*',
          '*wp-admin*', 
          '*login*',
          '*register*',
          '*my-account*',
          '*?wc-ajax*',
          '*.js', '*.css', '*.pdf', '*.zip'
        ],
      };

      this.logger.log(`Starting crawl for project ${event.projectName} (${event.rootUrl})`);

      // 3. Start the crawl (async - don't await to prevent blocking)
      // The crawl-started event will update the status to RUNNING
      this.startCrawlAsync(crawlJobRecord.id, crawlJobDto, event.projectName);

    } catch (error) {
      this.logger.error(`Failed to handle project.created event for project ${event.projectId}:`, error);
    }
  }

  private async startCrawlAsync(crawlJobId: string, crawlJobDto: CrawlJob, projectName: string): Promise<void> {
    try {
      this.logger.log(`Starting async crawl for project ${projectName}`);
      
      // Call the crawler service - event handlers will take care of persistence
      const crawlResult = await this.crawlerPlaywrightService.crawl(crawlJobDto);
      
      this.logger.log(`Crawl completed for project ${projectName}. Final result: ${crawlResult.pages.length} pages, ${crawlResult.errors.length} errors`);

    } catch (error) {
      this.logger.error(`Crawl failed for project ${projectName}:`, error);
      
      // If the crawl completely fails (not just individual page errors), update the job status
      try {
        await this.prisma.crawlJob.update({
          where: { id: crawlJobId },
          data: {
            status: 'FAILED',
            finishedAt: new Date(),
            error: error instanceof Error ? error.message : String(error),
          },
        });
      } catch (updateError) {
        this.logger.error(`Failed to update CrawlJob ${crawlJobId} with failure status:`, updateError);
      }
    }
  }

  private async storePages(crawlJobId: string, pages: any[]): Promise<void> {
    try {
      // Store pages in bulk to improve performance
      const pageData = pages.map(page => ({
        crawlJobId,
        url: page.url,
        httpStatus: page.statusCode,
        responseTime: page.loadTime,
        htmlSnapshot: '', // We'll store minimal data for now
        title: page.title || null,
        contentType: page.contentType || null,
        contentLength: page.size || null,
        crawledAt: page.timestamp,
      }));

      // Use createMany for bulk insert
      await this.prisma.page.createMany({
        data: pageData,
      });

      this.logger.log(`Stored ${pageData.length} pages in database for crawl job ${crawlJobId}`);
    } catch (error) {
      this.logger.error(`Failed to store pages for crawl job ${crawlJobId}:`, error);
      // Don't throw - we don't want to fail the entire crawl just because page storage failed
    }
  }

  // Event handlers for crawler events
  private async handleCrawlStarted(jobId: string): Promise<void> {
    try {
      this.logger.log(`Crawl started for job: ${jobId}`);
      
      // Update the CrawlJob status to RUNNING with startedAt timestamp
      const updatedCrawlJob = await this.prisma.crawlJob.update({
        where: { id: jobId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
        include: {
          project: true,
        },
      });
      
      // Update the associated project's crawl status
      await this.prisma.project.update({
        where: { id: updatedCrawlJob.projectId },
        data: {
         crawlStatus: 'RUNNING',
        },
      });
      
      this.logger.debug(`Updated CrawlJob ${jobId} and Project ${updatedCrawlJob.projectId} status to RUNNING`);
    } catch (error) {
      this.logger.error(`Failed to handle crawl-started event for job ${jobId}:`, error);
    }
  }

  private async handlePageCrawled(page: CrawledPage): Promise<void> {
    try {
      this.logger.debug(`Page crawled: ${page.url} (${page.statusCode})`);
      
      // Find the crawl job by looking for an active/running job that includes this URL
      // Since we don't have the jobId in the page event, we need to find it
      const activeCrawlJobs = await this.prisma.crawlJob.findMany({
        where: {
          status: 'RUNNING',
        },
        include: {
          project: true,
        },
      });

      // Find the relevant crawl job by checking if the page URL matches the project domain
      let relevantCrawlJob = null;
      for (const job of activeCrawlJobs) {
        try {
          const pageUrl = new URL(page.url);
          const projectUrl = new URL(job.project.url);
          
          // Check if the domains match (including subdomains)
          const pageDomain = pageUrl.hostname.replace(/^www\./, '');
          const projectDomain = job.project.domain.replace(/^www\./, '');
          
          if (pageDomain === projectDomain || 
              pageUrl.hostname === job.project.domain ||
              page.url.includes(job.project.domain) ||
              page.url.startsWith(job.project.url)) {
            relevantCrawlJob = job;
            this.logger.debug(`Matched page ${page.url} to crawl job ${job.id} for project ${job.project.name}`);
            break;
          }
        } catch (urlError) {
          // Fallback to simple string matching if URL parsing fails
          if (page.url.includes(job.project.domain) || page.url.startsWith(job.project.url)) {
            relevantCrawlJob = job;
            this.logger.debug(`Matched page ${page.url} to crawl job ${job.id} (fallback matching)`);
            break;
          }
        }
      }

      if (!relevantCrawlJob) {
this.logger.warn(`Could not find relevant CrawlJob for page: ${page.url}. Potential domains are: ${activeCrawlJobs.map(job => job.project.domain).join(', ')}`);
        return;
      }

      // Upsert the Page record first to get the ID
      const savedPage = await this.prisma.page.upsert({
        where: {
          crawlJobId_url: {
            crawlJobId: relevantCrawlJob.id,
            url: page.url,
          },
        },
        update: {
          httpStatus: page.statusCode,
          responseTime: page.loadTime,
          title: page.title || null,
          contentType: page.contentType || null,
          contentLength: page.size || null,
          htmlSnapshot: page.html || '', // Store HTML content for analysis
          crawledAt: page.timestamp,
          updatedAt: new Date(),
        },
        create: {
          crawlJobId: relevantCrawlJob.id,
          url: page.url,
          httpStatus: page.statusCode,
          responseTime: page.loadTime,
          title: page.title || null,
          contentType: page.contentType || null,
          contentLength: page.size || null,
          htmlSnapshot: page.html || '', // Store HTML content for analysis
          crawledAt: page.timestamp,
        },
      });

      // Perform SEO analysis if HTML content is available
      if (page.html && page.html.trim()) {
        try {
          // Analyze HTML content for SEO metrics
          const seoAuditData = this.seoAnalyzer.analyzeHtml(page.html, page.url);
          
          // Update performance score with actual load time data
          const updatedSeoAuditData = this.seoAnalyzer.updatePerformanceScore(seoAuditData, page.loadTime);
          
          // Calculate performance score explicitly to ensure it's properly set
          const performanceScore = this.seoAnalyzer.calculatePerformanceScore(
            page.size || updatedSeoAuditData.pageSize, 
            page.loadTime
          );
          
          const seoAuditRecord = { 
            pageId: savedPage.id,
            projectId: relevantCrawlJob.project.id, // Add project ID for direct querying
            ...updatedSeoAuditData,
            loadTime: page.loadTime,
            pageSize: page.size || updatedSeoAuditData.pageSize,
            performanceScore: performanceScore, // Explicitly set performance score
            auditedAt: new Date() 
          };
          
          await this.prisma.seoAudit.upsert({ 
            where: { pageId: savedPage.id }, 
            create: seoAuditRecord, 
            update: seoAuditRecord 
          });
          
          this.logger.debug(`Analyzed and stored SEO data for page: ${page.url} (Performance Score: ${performanceScore.toFixed(2)})`);
        } catch (seoError) {
          this.logger.error(`Failed to analyze SEO data for page ${page.url}:`, seoError);
        }
      }

      // Update CrawlJob processed count
      await this.prisma.crawlJob.update({
        where: { id: relevantCrawlJob.id },
        data: {
          processedUrls: {
            increment: 1,
          },
        },
      });

      this.logger.debug(`Stored page ${page.url} for CrawlJob ${relevantCrawlJob.id}`);
    } catch (error) {
this.logger.error(`Failed to handle page-crawled event for ${page.url}:`, error);
this.logger.debug(`Page info: status=${page.statusCode}, responseTime=${page.loadTime}, size=${page.size}, title=${page.title}`);
    }
  }

  private async handleCrawlProgress(progress: CrawlProgress): Promise<void> {
    try {
      this.logger.debug(`Crawl progress: ${progress.processedUrls}/${progress.totalUrls} processed`);
      
      // Find active crawl jobs to update their progress
      const activeCrawlJobs = await this.prisma.crawlJob.findMany({
        where: {
          status: 'RUNNING',
        },
      });

      // Update all active crawl jobs with progress info
      for (const job of activeCrawlJobs) {
        await this.prisma.crawlJob.update({
          where: { id: job.id },
          data: {
            totalUrls: progress.totalUrls,
            processedUrls: progress.processedUrls,
            // Note: errorCount will be updated by crawl-error events
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to handle crawl-progress event:', error);
    }
  }

  private async handleCrawlError(crawlError: CrawlError): Promise<void> {
    try {
      this.logger.warn(`Crawl error: ${crawlError.url} - ${crawlError.error}`);
      
      // Find the relevant crawl job
      const activeCrawlJobs = await this.prisma.crawlJob.findMany({
        where: {
          status: 'RUNNING',
        },
        include: {
          project: true,
        },
      });

      let relevantCrawlJob = null;
      for (const job of activeCrawlJobs) {
        if (crawlError.url.includes(job.project.domain) || job.project.url === crawlError.url || crawlError.url.startsWith(job.project.url)) {
          relevantCrawlJob = job;
          break;
        }
      }

      if (!relevantCrawlJob) {
        this.logger.warn(`Could not find relevant CrawlJob for error URL: ${crawlError.url}`);
        return;
      }

      // Update error count in CrawlJob
      await this.prisma.crawlJob.update({
        where: { id: relevantCrawlJob.id },
        data: {
          errorCount: {
            increment: 1,
          },
        },
      });

      this.logger.debug(`Incremented error count for CrawlJob ${relevantCrawlJob.id}`);
    } catch (error) {
      this.logger.error(`Failed to handle crawl-error event for ${crawlError.url}:`, error);
    }
  }

  private async handleCrawlFinished(result: CrawlResult): Promise<void> {
    try {
      this.logger.log(`Crawl finished for job ${result.jobId}: ${result.pages.length} pages, ${result.errors.length} errors`);
      
      // Determine final status based on result
      const finalStatus = result.completed && result.errors.length === 0 ? 'COMPLETED' : 
                         result.completed && result.errors.length > 0 ? 'COMPLETED' : 'FAILED';
      
      // Get the crawl job to access project information
      const crawlJob = await this.prisma.crawlJob.findUnique({
        where: { id: result.jobId },
        include: { project: true },
      });

      if (!crawlJob) {
        this.logger.error(`CrawlJob ${result.jobId} not found`);
        return;
      }
      
      // Update the CrawlJob with final status and completion data
      await this.prisma.crawlJob.update({
        where: { id: result.jobId },
        data: {
          status: finalStatus,
          finishedAt: result.endTime || new Date(),
          totalUrls: result.pages.length + result.errors.length,
          processedUrls: result.pages.length,
          errorCount: result.errors.length,
        },
      });

      // Store any remaining pages that weren't captured by individual page-crawled events
      if (result.pages.length > 0) {
        await this.storePagesFromResult(result.jobId, result.pages);
      }

      // Calculate and update project details
      await this.updateProjectDetailsAfterCrawl(crawlJob.projectId, finalStatus);

      this.logger.log(`CrawlJob ${result.jobId} marked as ${finalStatus}`);
    } catch (error) {
      this.logger.error(`Failed to handle crawl-finished event for job ${result.jobId}:`, error);
    }
  }

  private async storePagesFromResult(crawlJobId: string, pages: CrawledPage[]): Promise<void> {
    try {
      // Use upsert to handle pages that might have already been stored by page-crawled events
      for (const page of pages) {
        await this.prisma.page.upsert({
          where: {
            crawlJobId_url: {
              crawlJobId,
              url: page.url,
            },
          },
          update: {
            httpStatus: page.statusCode,
            responseTime: page.loadTime,
            title: page.title || null,
            contentType: page.contentType || null,
            contentLength: page.size || null,
            htmlSnapshot: '', // Store minimal data for now
            crawledAt: page.timestamp,
            updatedAt: new Date(),
          },
          create: {
            crawlJobId,
            url: page.url,
            httpStatus: page.statusCode,
            responseTime: page.loadTime,
            title: page.title || null,
            contentType: page.contentType || null,
            contentLength: page.size || null,
            htmlSnapshot: '', // Store minimal data for now
            crawledAt: page.timestamp,
          },
        });
      }

      this.logger.debug(`Stored/updated ${pages.length} pages for CrawlJob ${crawlJobId}`);
    } catch (error) {
      this.logger.error(`Failed to store pages from crawl result for job ${crawlJobId}:`, error);
    }
  }

  /**
   * Update project details after crawl completion
   */
  private async updateProjectDetailsAfterCrawl(projectId: string, finalStatus: string) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          seoAudits: true,
          crawlJobs: {
            where: { status: 'COMPLETED' },
            orderBy: { finishedAt: 'desc' },
          }
        },
      });

      if (!project) {
        this.logger.error(`Project ${projectId} not found for update after crawl`);
        return;
      }

      const seoScores = project.seoAudits.map(audit => audit.performanceScore || 0);
      const averageOnPageScore = seoScores.length > 0 ? seoScores.reduce((a, b) => a + b, 0) / seoScores.length : 0;

      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          lastCrawl: new Date(),
          crawlStatus: finalStatus as 'COMPLETED',
          onPageScore: averageOnPageScore,
          totalPages: project.crawlJobs[0]?.totalUrls || 0,
          totalIssues: project.seoAudits.length,
        }
      });

      this.logger.log(`Updated project ${projectId} details after crawl`);
    } catch (error) {
      this.logger.error(`Failed to update project details for ${projectId} after crawl:`, error);
    }
  }

  /**
   * Extract domain variations to allow crawling of all domain formats
   */
  private extractDomainVariations(rootUrl: string): string[] {
    try {
      const urlObj = new URL(rootUrl);
      const hostname = urlObj.hostname;
      
      const variations = [hostname];
      
      // Add www variation if not present
      if (!hostname.startsWith('www.')) {
        variations.push(`www.${hostname}`);
      }
      
      // Add variation without www if present
      if (hostname.startsWith('www.')) {
        variations.push(hostname.replace(/^www\./, ''));
      }
      
      // Add common subdomain variations that might be relevant
      const baseHostname = hostname.replace(/^www\./, '');
      const commonSubdomains = [
        'shop', 'store', 'blog', 'news', 'support', 'help', 'docs', 
        'api', 'app', 'mobile', 'm', 'cdn', 'media', 'static', 'assets',
        'staging', 'dev', 'test', 'beta', 'admin', 'portal'
      ];
      
      commonSubdomains.forEach(subdomain => {
        const subdomainUrl = `${subdomain}.${baseHostname}`;
        if (!variations.includes(subdomainUrl)) {
          variations.push(subdomainUrl);
        }
      });
      
      this.logger.debug(`Domain variations for ${rootUrl}: ${variations.join(', ')}`);
      return variations;
    } catch (error) {
      this.logger.warn(`Failed to extract domain variations for ${rootUrl}:`, error);
      return [rootUrl];
    }
  }
}
