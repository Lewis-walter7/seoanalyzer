import { ProjectService } from './project.service';
import type { AuthenticatedUser } from '../auth/user.interface';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
export declare class ProjectsController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    getAllProjects(user: AuthenticatedUser): Promise<import("./project.service").ProjectResponse[]>;
    createProject(user: AuthenticatedUser, createProjectDto: CreateProjectDto): Promise<import("./project.service").ProjectResponse>;
    getProject(user: AuthenticatedUser, projectId: string): Promise<import("./project.service").ProjectResponse>;
    updateProject(user: AuthenticatedUser, projectId: string, updateProjectDto: UpdateProjectDto): Promise<import("./project.service").ProjectResponse>;
    deleteProject(user: AuthenticatedUser, projectId: string): Promise<void>;
    analyzeProject(user: AuthenticatedUser, projectId: string): Promise<{
        message: string;
        status: string;
        crawlJobId?: string;
    }>;
}
