import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService, UsageType } from '../subscription/subscription.service';

export interface CreateProjectDto {
  name: string;
  url: string;
  description?: string;
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

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
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
    const lastCrawlResult = project.crawlResults?.[0];
    const crawlCount = project._count?.crawlResults || 0;

    return {
      id: project.id,
      name: project.name,
      url: project.url,
      domain: project.domain,
      description: project.description,
      onPageScore: lastCrawlResult?.onPageScore ? `${lastCrawlResult.onPageScore}%` : '0%',
      problems: lastCrawlResult?.problemsCount?.toString() || '0',
      backlinks: lastCrawlResult?.backlinksCount?.toString() || '0',
      crawlStatus: lastCrawlResult ? 'Analyzed' : 'Not analyzed',
      lastCrawl: lastCrawlResult 
        ? new Date(lastCrawlResult.createdAt).toLocaleDateString() 
        : 'Never',
      pages: crawlCount.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
