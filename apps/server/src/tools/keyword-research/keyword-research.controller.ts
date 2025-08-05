import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { KeywordResearchService } from './keyword-research.service';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from '../../auth/user.decorator';
import type { AuthenticatedUser } from '../../auth/user.interface';
import { CreateKeywordResearchDto, UpdateKeywordResearchDto, KeywordAnalysisDto } from './dto/keyword-research.dto';

@Controller('api/tools/keyword-research')
export class KeywordResearchController {
  constructor(private readonly keywordResearchService: KeywordResearchService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createKeywordResearch(
    @User() user: AuthenticatedUser,
    @Body() createDto: CreateKeywordResearchDto,
  ) {
    return this.keywordResearchService.create(user.id, createDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllKeywordResearch(
    @User() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.keywordResearchService.findAll(user.id, {
      projectId,
      limit: limit || 10,
      offset: offset || 0,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getKeywordResearch(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.keywordResearchService.findOne(user.id, id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateKeywordResearch(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateDto: UpdateKeywordResearchDto,
  ) {
    return this.keywordResearchService.update(user.id, id, updateDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteKeywordResearch(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.keywordResearchService.remove(user.id, id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/analyze')
  @UsePipes(new ValidationPipe({ transform: true }))
  async analyzeKeywords(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() analysisDto: KeywordAnalysisDto,
  ) {
    return this.keywordResearchService.analyzeKeywords(user.id, id, analysisDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id/suggestions')
  async getKeywordSuggestions(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('seedKeyword') seedKeyword: string,
    @Query('limit') limit?: number,
  ) {
    return this.keywordResearchService.getKeywordSuggestions(user.id, id, seedKeyword, limit || 50);
  }

  @UseGuards(AuthGuard)
  @Get(':id/metrics')
  async getKeywordMetrics(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('keywords') keywords: string,
  ) {
    const keywordList = keywords.split(',').map(k => k.trim());
    return this.keywordResearchService.getKeywordMetrics(user.id, id, keywordList);
  }
}
