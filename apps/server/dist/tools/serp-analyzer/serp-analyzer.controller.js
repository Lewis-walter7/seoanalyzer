"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpAnalyzerController = void 0;
const common_1 = require("@nestjs/common");
const serp_analyzer_service_1 = require("./serp-analyzer.service");
const auth_guard_1 = require("../../auth/auth.guard");
const user_decorator_1 = require("../../auth/user.decorator");
const serp_analysis_dto_1 = require("./dto/serp-analysis.dto");
let SerpAnalyzerController = class SerpAnalyzerController {
    serpAnalyzerService;
    constructor(serpAnalyzerService) {
        this.serpAnalyzerService = serpAnalyzerService;
    }
    /**
     * Analyze SERP data
     * POST /api/tools/serp-analyzer
     */
    async analyzeSerpData(user, serpAnalysisDto) {
        return this.serpAnalyzerService.analyze(user.id, serpAnalysisDto);
    }
    /**
     * Get analysis history for a user
     * GET /api/tools/serp-analyzer/history
     */
    async getAnalysisHistory(user, limit, offset) {
        return this.serpAnalyzerService.getAnalysisHistory(user.id, limit || 10, offset || 0);
    }
};
exports.SerpAnalyzerController = SerpAnalyzerController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, serp_analysis_dto_1.SerpAnalysisDto]),
    __metadata("design:returntype", Promise)
], SerpAnalyzerController.prototype, "analyzeSerpData", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('history'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], SerpAnalyzerController.prototype, "getAnalysisHistory", null);
exports.SerpAnalyzerController = SerpAnalyzerController = __decorate([
    (0, common_1.Controller)('api/tools/serp-analyzer'),
    __metadata("design:paramtypes", [serp_analyzer_service_1.SerpAnalyzerService])
], SerpAnalyzerController);
