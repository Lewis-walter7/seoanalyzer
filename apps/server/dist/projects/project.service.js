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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../prisma/prisma.service");
const subscription_service_1 = require("../subscription/subscription.service");
const project_created_event_1 = require("./events/project-created.event");
let ProjectService = class ProjectService {
    prisma;
    subscriptionService;
    eventEmitter;
    constructor(prisma, subscriptionService, eventEmitter) {
        this.prisma = prisma;
        this.subscriptionService = subscriptionService;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Get all projects for a user
     */
    async getUserProjects(userId) {
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
    async getProjectById(userId, projectId) {
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
            throw new common_1.NotFoundException('Project not found');
        }
        return this.formatProjectResponse(project);
    }
    /**
     * Create a new project
     */
    async createProject(userId, createProjectDto) {
        const { name, url, description } = createProjectDto;
        // Validate URL format
        try {
            new URL(url);
        }
        catch {
            throw new common_1.BadRequestException('Invalid URL format');
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
            throw new common_1.NotFoundException('User not found');
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
            throw new common_1.ForbiddenException(`Project limit reached. You have reached the maximum number of projects (${maxProjects}) for your ${planName} plan. Please upgrade to create more projects.`);
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
        const projectCreatedEvent = new project_created_event_1.ProjectCreatedEvent(project.id, project.url, userId, project.name);
        this.eventEmitter.emit('project.created', projectCreatedEvent);
        return this.formatProjectResponse(project);
    }
    /**
     * Update a project
     */
    async updateProject(userId, projectId, updateProjectDto) {
        const { name, url, description } = updateProjectDto;
        // Check if project exists and belongs to user
        const existingProject = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
            },
        });
        if (!existingProject) {
            throw new common_1.NotFoundException('Project not found');
        }
        // Validate URL format if provided
        let domain = existingProject.domain;
        if (url) {
            try {
                new URL(url);
                domain = this.extractDomainFromUrl(url);
            }
            catch {
                throw new common_1.BadRequestException('Invalid URL format');
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
    async deleteProject(userId, projectId) {
        // Check if project exists and belongs to user
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        // Delete the project (cascade will handle related records)
        await this.prisma.project.delete({
            where: { id: projectId },
        });
    }
    /**
     * Analyze a project by crawling and performing SEO analysis
     */
    async analyzeProject(userId, projectId) {
        // Check if project exists and belongs to user
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
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
        await this.recordUsage(userId, subscription_service_1.UsageType.ANALYSIS_RUN);
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
     * Record usage for project operations
     */
    async recordUsage(userId, usageType) {
        await this.subscriptionService.recordUsage(userId, usageType);
    }
    /**
     * Extract domain from URL
     */
    extractDomainFromUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.hostname;
        }
        catch {
            return '';
        }
    }
    /**
     * Format project for API response
     */
    formatProjectResponse(project) {
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
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscription_service_1.SubscriptionService,
        event_emitter_1.EventEmitter2])
], ProjectService);
