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
import { PageSpeedTestService } from './page-speed-test.service';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from '../../auth/user.decorator';
import type { AuthenticatedUser } from '../../auth/user.interface';

@Controller('api/tools/page-speed-test')
export class PageSpeedTestController {
  constructor(private readonly pageSpeedTestService: PageSpeedTestService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createPageSpeedTest(
    @User() user: AuthenticatedUser,
    @Body() createDto: { projectId: string },
  ) {
    return this.pageSpeedTestService.create(user.id, createDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllPageSpeedTests(
    @User() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
  ) {
    return this.pageSpeedTestService.findAll(user.id, { projectId });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getPageSpeedTest(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.pageSpeedTestService.findOne(user.id, id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePageSpeedTest(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.pageSpeedTestService.remove(user.id, id);
  }
}
