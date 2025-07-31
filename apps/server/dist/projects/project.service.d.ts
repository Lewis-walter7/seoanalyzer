import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService, UsageType } from '../subscription/subscription.service';
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
export declare class ProjectService {
    private readonly prisma;
    private readonly subscriptionService;
    private readonly eventEmitter;
    constructor(prisma: PrismaService, subscriptionService: SubscriptionService, eventEmitter: EventEmitter2);
    /**
     * Get all projects for a user
     */
    getUserProjects(userId: string): Promise<ProjectResponse[]>;
    /**
     * Get a specific project by ID
     */
    getProjectById(userId: string, projectId: string): Promise<ProjectResponse>;
    /**
     * Create a new project
     */
    createProject(userId: string, createProjectDto: CreateProjectDto): Promise<ProjectResponse>;
    /**
     * Update a project
     */
    updateProject(userId: string, projectId: string, updateProjectDto: UpdateProjectDto): Promise<ProjectResponse>;
    /**
     * Delete a project
     */
    deleteProject(userId: string, projectId: string): Promise<void>;
    /**
     * Analyze a project by crawling and performing SEO analysis
     */
    analyzeProject(userId: string, projectId: string): Promise<{
        message: string;
        status: string;
        crawlJobId?: string;
    }>;
    /**
     * Record usage for project operations
     */
    recordUsage(userId: string, usageType: UsageType): Promise<void>;
    /**
     * Extract domain from URL
     */
    private extractDomainFromUrl;
    /**
     * Format project for API response
     */
    private formatProjectResponse;
}
