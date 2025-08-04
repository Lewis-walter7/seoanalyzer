import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { CrawlerPlaywrightService } from './crawler.playwright.service';
import { CrawlerOrchestratorService, CRAWLER_SERVICE_TOKEN } from './crawler-orchestrator.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EnhancedCrawlerService } from './enhanced-crawler.service';

@Module({
  imports: [PrismaModule],
  controllers: [CrawlerController],
  providers: [
    EnhancedCrawlerService, // Keep fallback service
    {
      provide: CRAWLER_SERVICE_TOKEN,
      useExisting: EnhancedCrawlerService, // Use the Playwright service as the default
    },
    CrawlerOrchestratorService, // Add orchestrator service
  ],
  exports: [EnhancedCrawlerService,  CrawlerOrchestratorService],
})
export class CrawlerModule {}
