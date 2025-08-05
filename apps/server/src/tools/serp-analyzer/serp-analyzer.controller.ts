import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SerpAnalyzerService } from './serp-analyzer.service';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from '../../auth/user.decorator';
import type { AuthenticatedUser } from '../../auth/user.interface';
import { SerpAnalysisDto } from './dto/serp-analysis.dto';

@Controller('api/tools/serp-analyzer')
export class SerpAnalyzerController {
  constructor(private readonly serpAnalyzerService: SerpAnalyzerService) {}

  /**
   * Analyze SERP data
   * POST /api/tools/serp-analyzer
   */
  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async analyzeSerpData(
    @User() user: AuthenticatedUser,
    @Body() serpAnalysisDto: SerpAnalysisDto,
  ) {
    return this.serpAnalyzerService.analyze(user.id, serpAnalysisDto);
  }

  /**
   * Get analysis history for a user
   * GET /api/tools/serp-analyzer/history
   */
  @UseGuards(AuthGuard)
  @Get('history')
  async getAnalysisHistory(
    @User() user: AuthenticatedUser,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.serpAnalyzerService.getAnalysisHistory(
      user.id,
      limit || 10,
      offset || 0,
    );
  }
}
