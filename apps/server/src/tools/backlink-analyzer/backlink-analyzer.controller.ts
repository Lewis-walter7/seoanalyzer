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
import { BacklinkAnalyzerService } from './backlink-analyzer.service';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from '../../auth/user.decorator';
import type { AuthenticatedUser } from '../../auth/user.interface';

@Controller('api/tools/backlink-analyzer')
export class BacklinkAnalyzerController {
  constructor(private readonly backlinkAnalyzerService: BacklinkAnalyzerService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createBacklinkAnalysis(
    @User() user: AuthenticatedUser,
    @Body() createDto: { projectId: string },
  ) {
    return this.backlinkAnalyzerService.create(user.id, createDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllBacklinkAnalyses(
    @User() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
  ) {
    return this.backlinkAnalyzerService.findAll(user.id, { projectId });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getBacklinkAnalysis(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.backlinkAnalyzerService.findOne(user.id, id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBacklinkAnalysis(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.backlinkAnalyzerService.remove(user.id, id);
  }
}
