"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerModule = void 0;
const common_1 = require("@nestjs/common");
const crawler_controller_1 = require("./crawler.controller");
const crawler_orchestrator_service_1 = require("./crawler-orchestrator.service");
const prisma_module_1 = require("../prisma/prisma.module");
const enhanced_crawler_service_1 = require("./enhanced-crawler.service");
let CrawlerModule = class CrawlerModule {
};
exports.CrawlerModule = CrawlerModule;
exports.CrawlerModule = CrawlerModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [crawler_controller_1.CrawlerController],
        providers: [
            enhanced_crawler_service_1.EnhancedCrawlerService, // Keep fallback service
            {
                provide: crawler_orchestrator_service_1.CRAWLER_SERVICE_TOKEN,
                useExisting: enhanced_crawler_service_1.EnhancedCrawlerService, // Use the Playwright service as the default
            },
            crawler_orchestrator_service_1.CrawlerOrchestratorService, // Add orchestrator service
        ],
        exports: [enhanced_crawler_service_1.EnhancedCrawlerService, crawler_orchestrator_service_1.CrawlerOrchestratorService],
    })
], CrawlerModule);
