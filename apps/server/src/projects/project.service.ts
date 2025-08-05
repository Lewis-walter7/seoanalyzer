import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { UsageType } from '../subscription/subscription.types';
import { ProjectCreatedEvent } from './events/project-created.event';
import { CrawlerService } from '../crawler/crawler.service';
import { SeoAnalyzer } from '../crawler/utils/seo-analyzer.util';

export interface CreateProjectDto {
  name: string;
  url: string;
  description?: string;
  targetKeywords?: string[];
  competitors?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  url?: string;
  description?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  url: string;
  domain: string;
  description?: string;
  onPageScore?: string;
  problems?: string;
  backlinks?: string;
  crawlStatus: string;
  lastCrawl?: string;
  pages?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeoAuditPage {
  id: string;
  url: string;
  title: string | null;
  titleTag: string | null;
  metaDescription: string | null;
  h1Count: number;
  imgMissingAlt: number;
  totalLinks: number;
  performanceScore: number | null;
  seoScore?: number | null;
  accessibilityScore?: number | null;
  internalLinksCount: number;
  externalLinksCount: number;
  brokenLinksCount: number;
  loadTime?: number | null;
  pageSize?: number | null;
  hasCanonical: boolean;
  isIndexable: boolean;
  crawledAt: Date;
}

export interface AuditResponse {
  id: string;
  createdAt: Date;
  pages: SeoAuditPage[];
}

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string): Promise<ProjectResponse[]> {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            crawlJobs: true,
          },
        },
      },
    });

    return projects.map(project => this.formatProjectResponse(project));
  }

  /**
   * Get a specific project by ID
   */
  async getProjectById(userId: string, projectId: string): Promise<ProjectResponse> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        _count: {
          select: {
            crawlJobs: true,
          },
        },
        crawlJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.formatProjectResponse(project);
  }

  /**
   * Create a new project
   */
  async createProject(userId: string, createProjectDto: CreateProjectDto): Promise<ProjectResponse> {
    const { name, url, description } = createProjectDto;

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL format');
    }

    // Check subscription limits
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    });


    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentProjectCount = await this.prisma.project.count({
      where: { userId },
    });

    const activeSubscription = user.subscriptions?.[0];
    const plan = activeSubscription?.plan;

    const maxProjects = plan?.maxProjects ?? 1;

    // Check if user has reached project limit
    if (maxProjects !== 0 && currentProjectCount >= maxProjects) {
      const planName = plan?.name || 'Free';
      throw new ForbiddenException(
        `Project limit reached. You have reached the maximum number of projects (${maxProjects}) for your ${planName} plan. Please upgrade to create more projects.`
      );
    }

    // Extract domain from URL
    const domain = this.extractDomainFromUrl(url);

    // Create the project
    const project = await this.prisma.project.create({
      data: {
        name,
        url,
        domain,
        description,
        userId,
      },
      include: {
        _count: {
          select: {
            crawlJobs: true,
          },
        },
      },
    });

    // Emit project.created domain event
    const projectCreatedEvent = new ProjectCreatedEvent(
      project.id,
      project.url,
      userId,
      project.name,
    );
    this.eventEmitter.emit('project.created', projectCreatedEvent);

    return this.formatProjectResponse(project);
  }

  /**
   * Update a project
   */
  async updateProject(
    userId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponse> {
    const { name, url, description } = updateProjectDto;

    // Check if project exists and belongs to user
    const existingProject = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    // Validate URL format if provided
    let domain = existingProject.domain;
    if (url) {
      try {
        new URL(url);
        domain = this.extractDomainFromUrl(url);
      } catch {
        throw new BadRequestException('Invalid URL format');
      }
    }

    // Update the project
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(url && { url, domain }),
        ...(description !== undefined && { description }),
      },
      include: {
        _count: {
          select: {
            crawlJobs: true,
          },
        },
      },
    });

    return this.formatProjectResponse(project);
  }

  /**
   * Delete a project
   */
  async deleteProject(userId: string, projectId: string): Promise<void> {
    // Check if project exists and belongs to user
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Delete the project (cascade will handle related records)
    await this.prisma.project.delete({
      where: { id: projectId },
    });
  }

  /**
   * Analyze a project by crawling and performing SEO analysis
   */
  async analyzeProject(userId: string, projectId: string): Promise<{ message: string; status: string; crawlJobId?: string }> {
    // Check if project exists and belongs to user
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check for existing running crawl jobs
    const existingCrawlJob = await this.prisma.crawlJob.findFirst({
      where: {
        projectId,
        status: { in: ['QUEUED', 'RUNNING'] },
      },
    });

    if (existingCrawlJob) {
      return {
        message: 'Analysis is already in progress for this project',
        status: 'already_running',
        crawlJobId: existingCrawlJob.id,
      };
    }

    // Record usage for analysis
    await this.recordUsage(userId, UsageType.ANALYSIS_RUN);

    // Create a new crawl job
    const crawlJob = await this.prisma.crawlJob.create({
      data: {
        projectId,
        status: 'QUEUED',
        maxPages: 100,
        maxDepth: 3,
        userAgent: 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
      },
    });

    // Trigger the analysis by emitting a project analysis event
    const analysisEvent = {
      projectId: project.id,
      rootUrl: project.url,
      userId,
      projectName: project.name,
      crawlJobId: crawlJob.id,
    };
    
    this.eventEmitter.emit('project.analysis.requested', analysisEvent);

    return {
      message: 'Analysis started successfully',
      status: 'started',
      crawlJobId: crawlJob.id,
    };
  }

  /**
   * Get audits for a specific project
   */
  async getProjectAudits(userId: string, projectId: string): Promise<{ audits: AuditResponse[] }> {
    try {
      // 1. Verify JWT → user → project ownership (return 401/403 as needed)
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          userId,
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // 2. Query DB: SeoAudit.findMany({ where: { projectId }, include: { pages: true } })
      // Since SeoAudit is linked to pages, we need to get audits through the project relationship
      const seoAudits = await this.prisma.seoAudit.findMany({
        where: { projectId },
        include: {
          page: {
            select: {
              id: true,
              url: true,
              title: true,
              crawledAt: true,
              crawlJobId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Group the audits by crawl job (audit sessions)
      const auditMap = new Map<string, { id: string; createdAt: Date; pages: SeoAuditPage[] }>();

      for (const audit of seoAudits) {
        const crawlJobId = audit.page.crawlJobId;
        const auditId = crawlJobId; // Use crawlJobId as the audit session ID
        
        // For each Page, select SEO metrics: titleTag, metaDescription, h1Count, imgMissingAlt, totalLinks, performanceScore, etc.
        const seoAuditPage: SeoAuditPage = {
          id: audit.page.id,
          url: audit.page.url,
          title: audit.page.title,
          titleTag: audit.titleTag,
          metaDescription: audit.metaDescription,
          h1Count: audit.h1Count,
          imgMissingAlt: audit.imagesWithoutAlt,
          totalLinks: audit.internalLinksCount + audit.externalLinksCount,
          performanceScore: audit.performanceScore,
          seoScore: audit.seoScore,
          accessibilityScore: audit.accessibilityScore,
          internalLinksCount: audit.internalLinksCount,
          externalLinksCount: audit.externalLinksCount,
          brokenLinksCount: audit.brokenLinksCount,
          loadTime: audit.loadTime,
          pageSize: audit.pageSize,
          hasCanonical: audit.hasCanonical,
          isIndexable: audit.isIndexable,
          crawledAt: audit.page.crawledAt,
        };

        if (!auditMap.has(crawlJobId)) {
          auditMap.set(crawlJobId, {
            id: auditId,
            createdAt: audit.createdAt,
            pages: [],
          });
        }

        auditMap.get(crawlJobId)!.pages.push(seoAuditPage);
      }

      // Convert map to array and sort by creation date
      const audits: AuditResponse[] = Array.from(auditMap.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      
      return { audits };

    } catch (error) {
      // 4. Mirror error handling style of existing /v1/projects proxy route (catch block with status 401/403/500)
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error fetching project audits:', error);
      throw new BadRequestException('Failed to fetch project audits');
    }
  }

  /**
   * Record usage for project operations
   */
  async recordUsage(userId: string, usageType: UsageType): Promise<void> {
    await this.subscriptionService.recordUsage(userId, usageType);
  }

  /**
   * Extract domain from URL
   */
  private extractDomainFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return '';
    }
  }

  /**
   * Format project for API response
   */
  private formatProjectResponse(project: any): ProjectResponse {
    const lastCrawlJob = project.crawlJobs?.[0];
    const crawlCount = project._count?.crawlJobs || 0;

    return {
      id: project.id,
      name: project.name,
      url: project.url || `https://${project.domain}`,
      domain: project.domain,
      description: project.description,
      onPageScore: lastCrawlJob?.onPageScore ? `${lastCrawlJob.onPageScore}%` : '0%',
      problems: lastCrawlJob?.problemsCount?.toString() || '0',
      backlinks: lastCrawlJob?.backlinksCount?.toString() || '0',
      crawlStatus: lastCrawlJob ? 'Analyzed' : 'Not analyzed',
      lastCrawl: lastCrawlJob 
        ? new Date(lastCrawlJob.createdAt).toLocaleDateString() 
        : 'Never',
      pages: crawlCount.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
