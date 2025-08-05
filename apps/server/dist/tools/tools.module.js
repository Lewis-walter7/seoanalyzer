"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const keyword_research_controller_1 = require("./keyword-research/keyword-research.controller");
const keyword_research_service_1 = require("./keyword-research/keyword-research.service");
const site_audit_controller_1 = require("./site-audit/site-audit.controller");
const site_audit_service_1 = require("./site-audit/site-audit.service");
const backlink_analyzer_controller_1 = require("./backlink-analyzer/backlink-analyzer.controller");
const backlink_analyzer_service_1 = require("./backlink-analyzer/backlink-analyzer.service");
const page_speed_test_controller_1 = require("./page-speed-test/page-speed-test.controller");
const page_speed_test_service_1 = require("./page-speed-test/page-speed-test.service");
const rank_tracker_controller_1 = require("./rank-tracker/rank-tracker.controller");
const rank_tracker_service_1 = require("./rank-tracker/rank-tracker.service");
const competitor_analysis_controller_1 = require("./competitor-analysis/competitor-analysis.controller");
const competitor_analysis_service_1 = require("./competitor-analysis/competitor-analysis.service");
const local_seo_controller_1 = require("./local-seo/local-seo.controller");
const local_seo_service_1 = require("./local-seo/local-seo.service");
const serp_analyzer_controller_1 = require("./serp-analyzer/serp-analyzer.controller");
const serp_analyzer_service_1 = require("./serp-analyzer/serp-analyzer.service");
const schema_validator_controller_1 = require("./schema-validator/schema-validator.controller");
const schema_validator_service_1 = require("./schema-validator/schema-validator.service");
let ToolsModule = class ToolsModule {
};
exports.ToolsModule = ToolsModule;
exports.ToolsModule = ToolsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            keyword_research_controller_1.KeywordResearchController,
            site_audit_controller_1.SiteAuditController,
            backlink_analyzer_controller_1.BacklinkAnalyzerController,
            page_speed_test_controller_1.PageSpeedTestController,
            rank_tracker_controller_1.RankTrackerController,
            competitor_analysis_controller_1.CompetitorAnalysisController,
            local_seo_controller_1.LocalSeoController,
            serp_analyzer_controller_1.SerpAnalyzerController,
            schema_validator_controller_1.SchemaValidatorController,
        ],
        providers: [
            keyword_research_service_1.KeywordResearchService,
            site_audit_service_1.SiteAuditService,
            backlink_analyzer_service_1.BacklinkAnalyzerService,
            page_speed_test_service_1.PageSpeedTestService,
            rank_tracker_service_1.RankTrackerService,
            competitor_analysis_service_1.CompetitorAnalysisService,
            local_seo_service_1.LocalSeoService,
            serp_analyzer_service_1.SerpAnalyzerService,
            schema_validator_service_1.SchemaValidatorService,
        ],
        exports: [
            keyword_research_service_1.KeywordResearchService,
            site_audit_service_1.SiteAuditService,
            backlink_analyzer_service_1.BacklinkAnalyzerService,
            page_speed_test_service_1.PageSpeedTestService,
            rank_tracker_service_1.RankTrackerService,
            competitor_analysis_service_1.CompetitorAnalysisService,
            local_seo_service_1.LocalSeoService,
            serp_analyzer_service_1.SerpAnalyzerService,
            schema_validator_service_1.SchemaValidatorService,
        ],
    })
], ToolsModule);
