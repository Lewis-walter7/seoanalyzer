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
exports.SerpAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SerpAnalyzerService = class SerpAnalyzerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async analyze(userId, serpAnalysisDto) {
        const { keyword, serpData, searchEngine = 'GOOGLE', location = 'Global', device = 'DESKTOP' } = serpAnalysisDto;
        try {
            // Parse the SERP data
            const parsedResults = this.parseSerpData(serpData);
            // Extract features and ranking positions
            const features = this.extractSerpFeatures(serpData);
            // Analyze content details
            const contentAnalysis = this.analyzeContentDetails(parsedResults);
            // Create the analysis result
            const analysisResult = {
                id: this.generateAnalysisId(),
                userId,
                keyword,
                searchEngine,
                location,
                device,
                timestamp: new Date(),
                totalResults: parsedResults.length,
                organicResults: parsedResults.filter(r => r.type === 'organic'),
                paidResults: parsedResults.filter(r => r.type === 'paid'),
                features,
                contentAnalysis,
                results: parsedResults,
            };
            // Store the analysis result (if needed for persistence)
            await this.storeAnalysisResult(analysisResult);
            return analysisResult;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`SERP analysis failed: ${errorMessage}`);
        }
    }
    parseSerpData(serpData) {
        if (!serpData || !Array.isArray(serpData.results)) {
            return [];
        }
        return serpData.results.map((result, index) => ({
            position: index + 1,
            title: result.title || '',
            url: result.url || result.link || '',
            description: result.description || result.snippet || '',
            displayUrl: this.extractDisplayUrl(result.url || result.link || ''),
            type: this.determineResultType(result),
            features: this.extractResultFeatures(result),
            metadata: {
                hasImages: Boolean(result.images || result.thumbnail),
                hasVideo: Boolean(result.video),
                hasRichSnippet: Boolean(result.richSnippet || result.structuredData),
                datePublished: result.date || null,
                author: result.author || null,
                rating: result.rating || null,
                price: result.price || null,
            },
        }));
    }
    extractSerpFeatures(serpData) {
        const features = [];
        // Check for common SERP features
        if (serpData.knowledgeGraph) {
            features.push({
                type: 'knowledge_graph',
                position: 1,
                content: serpData.knowledgeGraph,
            });
        }
        if (serpData.featuredSnippet) {
            features.push({
                type: 'featured_snippet',
                position: 0, // Featured snippets are typically at position 0
                content: serpData.featuredSnippet,
            });
        }
        if (serpData.localPack) {
            features.push({
                type: 'local_pack',
                position: serpData.localPack.position || 1,
                content: serpData.localPack,
            });
        }
        if (serpData.peopleAlsoAsk) {
            features.push({
                type: 'people_also_ask',
                position: serpData.peopleAlsoAsk.position || 2,
                content: serpData.peopleAlsoAsk,
            });
        }
        if (serpData.relatedSearches) {
            features.push({
                type: 'related_searches',
                position: 999, // Usually at the bottom
                content: serpData.relatedSearches,
            });
        }
        if (serpData.shopping) {
            features.push({
                type: 'shopping_results',
                position: serpData.shopping.position || 1,
                content: serpData.shopping,
            });
        }
        return features.sort((a, b) => a.position - b.position);
    }
    analyzeContentDetails(results) {
        const titleLengths = results.map(r => r.title.length).filter(l => l > 0);
        const descriptionLengths = results.map(r => r.description.length).filter(l => l > 0);
        const domains = results.map(r => this.extractDomain(r.url)).filter(Boolean);
        const uniqueDomains = [...new Set(domains)];
        const topDomains = this.getTopDomains(domains);
        return {
            averageTitleLength: titleLengths.length > 0 ? Math.round(titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length) : 0,
            averageDescriptionLength: descriptionLengths.length > 0 ? Math.round(descriptionLengths.reduce((a, b) => a + b, 0) / descriptionLengths.length) : 0,
            totalDomains: uniqueDomains.length,
            topDomains,
            hasRichSnippets: results.some(r => r.metadata.hasRichSnippet),
            hasImages: results.some(r => r.metadata.hasImages),
            hasVideos: results.some(r => r.metadata.hasVideo),
            competitionLevel: this.calculateCompetitionLevel(uniqueDomains, results),
        };
    }
    determineResultType(result) {
        if (result.isAd || result.ad)
            return 'paid';
        if (result.local || result.localBusiness)
            return 'local';
        if (result.shopping || result.price)
            return 'shopping';
        if (result.news || result.newsSource)
            return 'news';
        if (result.image || result.thumbnail)
            return 'image';
        if (result.video || result.videoUrl)
            return 'video';
        return 'organic';
    }
    extractResultFeatures(result) {
        const features = [];
        if (result.richSnippet)
            features.push('rich_snippet');
        if (result.sitelinks)
            features.push('sitelinks');
        if (result.images)
            features.push('images');
        if (result.video)
            features.push('video');
        if (result.rating)
            features.push('rating');
        if (result.price)
            features.push('price');
        if (result.date)
            features.push('date');
        if (result.author)
            features.push('author');
        return features;
    }
    extractDisplayUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        }
        catch {
            return url;
        }
    }
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        }
        catch {
            return '';
        }
    }
    getTopDomains(domains) {
        const domainCount = domains.reduce((acc, domain) => {
            acc[domain] = (acc[domain] || 0) + 1;
            return acc;
        }, {});
        const total = domains.length;
        return Object.entries(domainCount)
            .map(([domain, count]) => ({
            domain,
            count,
            percentage: Math.round((count / total) * 100),
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 domains
    }
    calculateCompetitionLevel(uniqueDomains, results) {
        const domainDiversity = uniqueDomains.length / results.length;
        const hasRichFeatures = results.some(r => r.features.length > 0);
        const hasPaidResults = results.some(r => r.type === 'paid');
        if (domainDiversity > 0.8 && hasRichFeatures && hasPaidResults)
            return 'high';
        if (domainDiversity > 0.6 || hasRichFeatures || hasPaidResults)
            return 'medium';
        return 'low';
    }
    generateAnalysisId() {
        return `serp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async storeAnalysisResult(result) {
        // Store the analysis result in the database if needed
        // This could be implemented based on your Prisma schema
        try {
            // Example: await this.prisma.serpAnalysis.create({ data: result });
            console.log('SERP analysis result stored for user:', result.userId);
        }
        catch (error) {
            console.error('Failed to store SERP analysis result:', error);
        }
    }
    async getAnalysisHistory(userId, limit = 10, offset = 0) {
        // Retrieve analysis history for a user
        // This would be implemented based on your Prisma schema
        try {
            // Example implementation:
            // return await this.prisma.serpAnalysis.findMany({
            //   where: { userId },
            //   take: limit,
            //   skip: offset,
            //   orderBy: { timestamp: 'desc' }
            // });
            return [];
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to retrieve analysis history: ${errorMessage}`);
        }
    }
};
exports.SerpAnalyzerService = SerpAnalyzerService;
exports.SerpAnalyzerService = SerpAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SerpAnalyzerService);
