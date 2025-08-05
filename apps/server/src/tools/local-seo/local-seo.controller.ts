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
import { LocalSeoService } from './local-seo.service';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from '../../auth/user.decorator';
import type { AuthenticatedUser } from '../../auth/user.interface';

@Controller('api/tools/local-seo')
export class LocalSeoController {
  constructor(private readonly localSeoService: LocalSeoService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createLocalSeo(
    @User() user: AuthenticatedUser,
    @Body() createDto: { projectId: string; businessName: string; address: string; city: string; zipCode: string; country: string },
  ) {
    return this.localSeoService.create(user.id, createDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllLocalSeo(
    @User() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
  ) {
    return this.localSeoService.findAll(user.id, { projectId });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getLocalSeo(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.localSeoService.findOne(user.id, id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLocalSeo(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.localSeoService.remove(user.id, id);
  }
}
