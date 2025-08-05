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
import { SiteAuditService } from './site-audit.service';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from '../../auth/user.decorator';
import type { AuthenticatedUser } from '../../auth/user.interface';

@Controller('api/tools/site-audit')
export class SiteAuditController {
  constructor(private readonly siteAuditService: SiteAuditService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createSiteAudit(
    @User() user: AuthenticatedUser,
    @Body() createDto: { projectId: string },
  ) {
    return this.siteAuditService.create(user.id, createDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllSiteAudits(
    @User() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
  ) {
    return this.siteAuditService.findAll(user.id, { projectId });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getSiteAudit(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.siteAuditService.findOne(user.id, id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSiteAudit(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.siteAuditService.remove(user.id, id);
  }
}
