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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordSuggestion = exports.KeywordMetric = exports.KeywordAnalysisDto = exports.UpdateKeywordResearchDto = exports.CreateKeywordResearchDto = exports.Device = exports.SearchEngine = void 0;
const class_validator_1 = require("class-validator");
var SearchEngine;
(function (SearchEngine) {
    SearchEngine["GOOGLE"] = "GOOGLE";
    SearchEngine["BING"] = "BING";
    SearchEngine["YAHOO"] = "YAHOO";
})(SearchEngine || (exports.SearchEngine = SearchEngine = {}));
var Device;
(function (Device) {
    Device["DESKTOP"] = "DESKTOP";
    Device["MOBILE"] = "MOBILE";
    Device["TABLET"] = "TABLET";
})(Device || (exports.Device = Device = {}));
class CreateKeywordResearchDto {
    name;
    description;
    projectId;
    seedKeywords;
    searchEngine = SearchEngine.GOOGLE;
    location = 'Global';
    language = 'en';
    device = Device.DESKTOP;
}
exports.CreateKeywordResearchDto = CreateKeywordResearchDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateKeywordResearchDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateKeywordResearchDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateKeywordResearchDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateKeywordResearchDto.prototype, "seedKeywords", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SearchEngine),
    __metadata("design:type", String)
], CreateKeywordResearchDto.prototype, "searchEngine", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateKeywordResearchDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateKeywordResearchDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Device),
    __metadata("design:type", String)
], CreateKeywordResearchDto.prototype, "device", void 0);
class UpdateKeywordResearchDto {
    name;
    description;
    seedKeywords;
    searchEngine;
    location;
    language;
    device;
}
exports.UpdateKeywordResearchDto = UpdateKeywordResearchDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateKeywordResearchDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateKeywordResearchDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateKeywordResearchDto.prototype, "seedKeywords", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SearchEngine),
    __metadata("design:type", String)
], UpdateKeywordResearchDto.prototype, "searchEngine", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateKeywordResearchDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateKeywordResearchDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Device),
    __metadata("design:type", String)
], UpdateKeywordResearchDto.prototype, "device", void 0);
class KeywordAnalysisDto {
    keywords;
    includeSearchVolume = true;
    includeCompetition = true;
    includeCpc = true;
    includeTrends = false;
}
exports.KeywordAnalysisDto = KeywordAnalysisDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], KeywordAnalysisDto.prototype, "keywords", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], KeywordAnalysisDto.prototype, "includeSearchVolume", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], KeywordAnalysisDto.prototype, "includeCompetition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], KeywordAnalysisDto.prototype, "includeCpc", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], KeywordAnalysisDto.prototype, "includeTrends", void 0);
class KeywordMetric {
    keyword;
    searchVolume;
    competition; // 0-1
    cpc;
    difficulty; // 0-100
    trends; // Monthly trend data
}
exports.KeywordMetric = KeywordMetric;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KeywordMetric.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], KeywordMetric.prototype, "searchVolume", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], KeywordMetric.prototype, "competition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], KeywordMetric.prototype, "cpc", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], KeywordMetric.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], KeywordMetric.prototype, "trends", void 0);
class KeywordSuggestion {
    keyword;
    relevanceScore; // 0-100
    searchVolume;
    category;
}
exports.KeywordSuggestion = KeywordSuggestion;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KeywordSuggestion.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], KeywordSuggestion.prototype, "relevanceScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], KeywordSuggestion.prototype, "searchVolume", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KeywordSuggestion.prototype, "category", void 0);
