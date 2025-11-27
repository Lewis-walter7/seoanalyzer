import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import type { AuthenticatedUser } from '../auth/user.interface';
import { UsageType } from '../subscription/subscription.types';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Controller('v1/projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) { }

  @UseGuards(AuthGuard)
  @Get()
  async getAllProjects(@User() user: AuthenticatedUser) {
    return this.projectService.getUserProjects(user.id);
  }

  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createProject(@User() user: AuthenticatedUser, @Body() createProjectDto: CreateProjectDto) {
    const project = await this.projectService.createProject(user.id, createProjectDto);
    await this.projectService.recordUsage(user.id, UsageType.PROJECT_CREATED);
    return project;
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getProject(@User() user: AuthenticatedUser, @Param('id') projectId: string) {
    return this.projectService.getProjectById(user.id, projectId);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProject(
    @User() user: AuthenticatedUser,
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(user.id, projectId, updateProjectDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(@User() user: AuthenticatedUser, @Param('id') projectId: string) {
    await this.projectService.deleteProject(user.id, projectId);
  }

  @UseGuards(AuthGuard)
  @Post(':id/analyze')
  async analyzeProject(@User() user: AuthenticatedUser, @Param('id') projectId: string) {
    return this.projectService.analyzeProject(user.id, projectId);
  }

  @UseGuards(AuthGuard)
  @Get(':id/audits')
  async getProjectAudits(@User() user: AuthenticatedUser, @Param('id') projectId: string) {
    return this.projectService.getProjectAudits(user.id, projectId);
  }
}

