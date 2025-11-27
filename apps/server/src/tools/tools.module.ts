import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CrawlerModule } from '../crawler/crawler.module';
import { KeywordResearchController } from './keyword-research/keyword-research.controller';
import { KeywordResearchService } from './keyword-research/keyword-research.service';
import { SiteAuditController } from './site-audit/site-audit.controller';
import { SiteAuditService } from './site-audit/site-audit.service';
import { BacklinkAnalyzerController } from './backlink-analyzer/backlink-analyzer.controller';
import { BacklinkAnalyzerService } from './backlink-analyzer/backlink-analyzer.service';
import { PageSpeedTestController } from './page-speed-test/page-speed-test.controller';
import { PageSpeedTestService } from './page-speed-test/page-speed-test.service';
import { RankTrackerController } from './rank-tracker/rank-tracker.controller';
import { RankTrackerService } from './rank-tracker/rank-tracker.service';
import { CompetitorAnalysisController } from './competitor-analysis/competitor-analysis.controller';
import { CompetitorAnalysisService } from './competitor-analysis/competitor-analysis.service';
import { LocalSeoController } from './local-seo/local-seo.controller';
import { LocalSeoService } from './local-seo/local-seo.service';
import { SerpAnalyzerController } from './serp-analyzer/serp-analyzer.controller';
import { SerpAnalyzerService } from './serp-analyzer/serp-analyzer.service';
import { SchemaValidatorController } from './schema-validator/schema-validator.controller';
import { SchemaValidatorService } from './schema-validator/schema-validator.service';

@Module({
  imports: [PrismaModule, CrawlerModule],
  controllers: [
    KeywordResearchController,
    SiteAuditController,
    BacklinkAnalyzerController,
    PageSpeedTestController,
    RankTrackerController,
    CompetitorAnalysisController,
    LocalSeoController,
    SerpAnalyzerController,
    SchemaValidatorController,
  ],
  providers: [
    KeywordResearchService,
    SiteAuditService,
    BacklinkAnalyzerService,
    PageSpeedTestService,
    RankTrackerService,
    CompetitorAnalysisService,
    LocalSeoService,
    SerpAnalyzerService,
    SchemaValidatorService,
  ],
  exports: [
    KeywordResearchService,
    SiteAuditService,
    BacklinkAnalyzerService,
    PageSpeedTestService,
    RankTrackerService,
    CompetitorAnalysisService,
    LocalSeoService,
    SerpAnalyzerService,
    SchemaValidatorService,
  ],
})
export class ToolsModule { }
