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
exports.KeywordResearchController = void 0;
const common_1 = require("@nestjs/common");
const keyword_research_service_1 = require("./keyword-research.service");
const auth_guard_1 = require("../../auth/auth.guard");
const user_decorator_1 = require("../../auth/user.decorator");
const keyword_research_dto_1 = require("./dto/keyword-research.dto");
let KeywordResearchController = class KeywordResearchController {
    keywordResearchService;
    constructor(keywordResearchService) {
        this.keywordResearchService = keywordResearchService;
    }
    async createKeywordResearch(user, createDto) {
        return this.keywordResearchService.create(user.id, createDto);
    }
    async getAllKeywordResearch(user, projectId, limit, offset) {
        return this.keywordResearchService.findAll(user.id, {
            projectId,
            limit: limit || 10,
            offset: offset || 0,
        });
    }
    async getKeywordResearch(user, id) {
        return this.keywordResearchService.findOne(user.id, id);
    }
    async updateKeywordResearch(user, id, updateDto) {
        return this.keywordResearchService.update(user.id, id, updateDto);
    }
    async deleteKeywordResearch(user, id) {
        await this.keywordResearchService.remove(user.id, id);
    }
    async analyzeKeywords(user, id, analysisDto) {
        return this.keywordResearchService.analyzeKeywords(user.id, id, analysisDto);
    }
    async getKeywordSuggestions(user, id, seedKeyword, limit) {
        return this.keywordResearchService.getKeywordSuggestions(user.id, id, seedKeyword, limit || 50);
    }
    async getKeywordMetrics(user, id, keywords) {
        const keywordList = keywords.split(',').map(k => k.trim());
        return this.keywordResearchService.getKeywordMetrics(user.id, id, keywordList);
    }
};
exports.KeywordResearchController = KeywordResearchController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, keyword_research_dto_1.CreateKeywordResearchDto]),
    __metadata("design:returntype", Promise)
], KeywordResearchController.prototype, "createKeywordResearch", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], KeywordResearchController.prototype, "getAllKeywordResearch", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KeywordResearchController.prototype, "getKeywordResearch", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, keyword_research_dto_1.UpdateKeywordResearchDto]),
    __metadata("design:returntype", Promise)
], KeywordResearchController.prototype, "updateKeywordResearch", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KeywordResearchController.prototype, "deleteKeywordResearch", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(':id/analyze'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, keyword_research_dto_1.KeywordAnalysisDto]),
    __metadata("design:returntype", Promise)
], KeywordResearchController.prototype, "analyzeKeywords", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id/suggestions'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('seedKeyword')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number]),
    __metadata("design:returntype", Promise)
], KeywordResearchController.prototype, "getKeywordSuggestions", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id/metrics'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('keywords')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KeywordResearchController.prototype, "getKeywordMetrics", null);
exports.KeywordResearchController = KeywordResearchController = __decorate([
    (0, common_1.Controller)('api/tools/keyword-research'),
    __metadata("design:paramtypes", [keyword_research_service_1.KeywordResearchService])
], KeywordResearchController);
