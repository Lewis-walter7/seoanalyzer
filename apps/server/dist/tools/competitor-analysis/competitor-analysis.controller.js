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
exports.CompetitorAnalysisController = void 0;
const common_1 = require("@nestjs/common");
const competitor_analysis_service_1 = require("./competitor-analysis.service");
const auth_guard_1 = require("../../auth/auth.guard");
const user_decorator_1 = require("../../auth/user.decorator");
let CompetitorAnalysisController = class CompetitorAnalysisController {
    competitorAnalysisService;
    constructor(competitorAnalysisService) {
        this.competitorAnalysisService = competitorAnalysisService;
    }
    async createCompetitorAnalysis(user, createDto) {
        return this.competitorAnalysisService.create(user.id, createDto);
    }
    async getTrafficAnalysis(user, projectId) {
        return this.competitorAnalysisService.performTrafficAnalysis(projectId);
    }
    async getKeywordGapAnalysis(user, projectId) {
        return this.competitorAnalysisService.performKeywordGapAnalysis(projectId);
    }
    async getContentAnalysis(user, projectId) {
        return this.competitorAnalysisService.performContentAnalysis(projectId);
    }
    async getBacklinkComparison(user, projectId) {
        return this.competitorAnalysisService.compareBacklinks(projectId);
    }
    async getAllCompetitorAnalyses(user, projectId) {
        return this.competitorAnalysisService.findAll(user.id, { projectId });
    }
    async getCompetitorAnalysis(user, id) {
        return this.competitorAnalysisService.findOne(user.id, id);
    }
    async deleteCompetitorAnalysis(user, id) {
        await this.competitorAnalysisService.remove(user.id, id);
    }
};
exports.CompetitorAnalysisController = CompetitorAnalysisController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CompetitorAnalysisController.prototype, "createCompetitorAnalysis", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('traffic-analysis/:projectId'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompetitorAnalysisController.prototype, "getTrafficAnalysis", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('keyword-gap-analysis/:projectId'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompetitorAnalysisController.prototype, "getKeywordGapAnalysis", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('content-analysis/:projectId'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompetitorAnalysisController.prototype, "getContentAnalysis", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('backlink-comparison/:projectId'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompetitorAnalysisController.prototype, "getBacklinkComparison", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompetitorAnalysisController.prototype, "getAllCompetitorAnalyses", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompetitorAnalysisController.prototype, "getCompetitorAnalysis", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompetitorAnalysisController.prototype, "deleteCompetitorAnalysis", null);
exports.CompetitorAnalysisController = CompetitorAnalysisController = __decorate([
    (0, common_1.Controller)('api/tools/competitor-analysis'),
    __metadata("design:paramtypes", [competitor_analysis_service_1.CompetitorAnalysisService])
], CompetitorAnalysisController);
