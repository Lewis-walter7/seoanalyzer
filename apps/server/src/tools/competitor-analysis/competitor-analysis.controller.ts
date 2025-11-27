import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompetitorAnalysisService } from './competitor-analysis.service';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from '../../auth/user.decorator';
import type { AuthenticatedUser } from '../../auth/user.interface';

@Controller('api/tools/competitor-analysis')
export class CompetitorAnalysisController {
  constructor(private readonly competitorAnalysisService: CompetitorAnalysisService) { }

  @UseGuards(AuthGuard)
  @Post()
  async createCompetitorAnalysis(
    @User() user: AuthenticatedUser,
    @Body() createDto: { projectId: string },
  ) {
    return this.competitorAnalysisService.create(user.id, createDto);
  }

  @UseGuards(AuthGuard)
  @Post('analyze')
  async analyzeCompetitor(
    @User() user: AuthenticatedUser,
    @Body() body: { targetUrl: string; competitorUrl: string },
  ) {
    return this.competitorAnalysisService.analyzeCompetitor(body.targetUrl, body.competitorUrl);
  }

  @UseGuards(AuthGuard)
  @Get('traffic-analysis/:projectId')
  async getTrafficAnalysis(
    @User() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
  ) {
    return this.competitorAnalysisService.performTrafficAnalysis(projectId);
  }

  @UseGuards(AuthGuard)
  @Get('keyword-gap-analysis/:projectId')
  async getKeywordGapAnalysis(
    @User() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
  ) {
    return this.competitorAnalysisService.performKeywordGapAnalysis(projectId);
  }

  @UseGuards(AuthGuard)
  @Get('content-analysis/:projectId')
  async getContentAnalysis(
    @User() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
  ) {
    return this.competitorAnalysisService.performContentAnalysis(projectId);
  }

  @UseGuards(AuthGuard)
  @Get('backlink-comparison/:projectId')
  async getBacklinkComparison(
    @User() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
  ) {
    return this.competitorAnalysisService.compareBacklinks(projectId);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllCompetitorAnalyses(
    @User() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
  ) {
    return this.competitorAnalysisService.findAll(user.id, { projectId });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getCompetitorAnalysis(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.competitorAnalysisService.findOne(user.id, id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCompetitorAnalysis(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.competitorAnalysisService.remove(user.id, id);
  }
}
