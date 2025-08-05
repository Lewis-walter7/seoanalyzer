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
import { RankTrackerService } from './rank-tracker.service';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from '../../auth/user.decorator';
import type { AuthenticatedUser } from '../../auth/user.interface';

@Controller('api/tools/rank-tracker')
export class RankTrackerController {
  constructor(private readonly rankTrackerService: RankTrackerService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createRankTracker(
    @User() user: AuthenticatedUser,
    @Body() createDto: { projectId: string; keyword: string },
  ) {
    return this.rankTrackerService.create(user.id, createDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllRankTrackers(
    @User() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
  ) {
    return this.rankTrackerService.findAll(user.id, { projectId });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getRankTracker(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.rankTrackerService.findOne(user.id, id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRankTracker(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.rankTrackerService.remove(user.id, id);
  }
}
