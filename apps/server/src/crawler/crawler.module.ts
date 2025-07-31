import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { CrawlerPlaywrightService } from './crawler.playwright.service';
import { CrawlerOrchestratorService, CRAWLER_SERVICE_TOKEN } from './crawler-orchestrator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CrawlerController],
  providers: [
    CrawlerPlaywrightService, // Add the actual service
    CrawlerService, // Keep fallback service
    {
      provide: CRAWLER_SERVICE_TOKEN,
      useExisting: CrawlerService, // Use the Playwright service as the default
    },
    CrawlerOrchestratorService, // Add orchestrator service
  ],
  exports: [CrawlerService, CrawlerPlaywrightService, CrawlerOrchestratorService],
})
export class CrawlerModule {}
