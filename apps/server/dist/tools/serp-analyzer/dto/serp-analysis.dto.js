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
exports.SerpAnalysisResult = exports.ContentDetail = exports.SerpFeature = exports.SerpResult = exports.SerpAnalysisDto = exports.Device = exports.SearchEngine = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var SearchEngine;
(function (SearchEngine) {
    SearchEngine["GOOGLE"] = "GOOGLE";
    SearchEngine["BING"] = "BING";
    SearchEngine["YAHOO"] = "YAHOO";
    SearchEngine["DUCKDUCKGO"] = "DUCKDUCKGO";
})(SearchEngine || (exports.SearchEngine = SearchEngine = {}));
var Device;
(function (Device) {
    Device["DESKTOP"] = "DESKTOP";
    Device["MOBILE"] = "MOBILE";
    Device["TABLET"] = "TABLET";
})(Device || (exports.Device = Device = {}));
class SerpAnalysisDto {
    keyword;
    serpData; // Raw SERP data to be analyzed
    searchEngine = SearchEngine.GOOGLE;
    location = 'Global';
    device = Device.DESKTOP;
    projectId;
}
exports.SerpAnalysisDto = SerpAnalysisDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpAnalysisDto.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SerpAnalysisDto.prototype, "serpData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SearchEngine),
    __metadata("design:type", String)
], SerpAnalysisDto.prototype, "searchEngine", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpAnalysisDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Device),
    __metadata("design:type", String)
], SerpAnalysisDto.prototype, "device", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpAnalysisDto.prototype, "projectId", void 0);
class SerpResult {
    position;
    title;
    url;
    description;
    displayUrl;
    type;
    features;
    metadata;
}
exports.SerpResult = SerpResult;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SerpResult.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpResult.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpResult.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpResult.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpResult.prototype, "displayUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpResult.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SerpResult.prototype, "features", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SerpResult.prototype, "metadata", void 0);
class SerpFeature {
    type;
    position;
    content;
}
exports.SerpFeature = SerpFeature;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpFeature.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SerpFeature.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SerpFeature.prototype, "content", void 0);
class ContentDetail {
    averageTitleLength;
    averageDescriptionLength;
    totalDomains;
    topDomains;
    hasRichSnippets;
    hasImages;
    hasVideos;
    competitionLevel;
}
exports.ContentDetail = ContentDetail;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ContentDetail.prototype, "averageTitleLength", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ContentDetail.prototype, "averageDescriptionLength", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ContentDetail.prototype, "totalDomains", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ContentDetail.prototype, "topDomains", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ContentDetail.prototype, "hasRichSnippets", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ContentDetail.prototype, "hasImages", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ContentDetail.prototype, "hasVideos", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContentDetail.prototype, "competitionLevel", void 0);
class SerpAnalysisResult {
    id;
    userId;
    keyword;
    searchEngine;
    location;
    device;
    timestamp;
    totalResults;
    organicResults;
    paidResults;
    features;
    contentAnalysis;
    results;
}
exports.SerpAnalysisResult = SerpAnalysisResult;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpAnalysisResult.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpAnalysisResult.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpAnalysisResult.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SearchEngine),
    __metadata("design:type", String)
], SerpAnalysisResult.prototype, "searchEngine", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SerpAnalysisResult.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Device),
    __metadata("design:type", String)
], SerpAnalysisResult.prototype, "device", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Date)
], SerpAnalysisResult.prototype, "timestamp", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SerpAnalysisResult.prototype, "totalResults", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SerpResult),
    __metadata("design:type", Array)
], SerpAnalysisResult.prototype, "organicResults", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SerpResult),
    __metadata("design:type", Array)
], SerpAnalysisResult.prototype, "paidResults", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SerpFeature),
    __metadata("design:type", Array)
], SerpAnalysisResult.prototype, "features", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ContentDetail),
    __metadata("design:type", ContentDetail)
], SerpAnalysisResult.prototype, "contentAnalysis", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SerpResult),
    __metadata("design:type", Array)
], SerpAnalysisResult.prototype, "results", void 0);
