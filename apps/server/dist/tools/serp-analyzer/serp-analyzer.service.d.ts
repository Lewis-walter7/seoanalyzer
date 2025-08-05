import { PrismaService } from '../../prisma/prisma.service';
import { SerpAnalysisDto, SerpResult, SerpFeature, ContentDetail } from './dto/serp-analysis.dto';
export declare class SerpAnalyzerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    analyze(userId: string, serpAnalysisDto: SerpAnalysisDto): Promise<{
        id: string;
        userId: string;
        keyword: string;
        searchEngine: string;
        location: string;
        device: string;
        timestamp: Date;
        totalResults: number;
        organicResults: SerpResult[];
        paidResults: SerpResult[];
        features: SerpFeature[];
        contentAnalysis: ContentDetail;
        results: SerpResult[];
    }>;
    private parseSerpData;
    private extractSerpFeatures;
    private analyzeContentDetails;
    private determineResultType;
    private extractResultFeatures;
    private extractDisplayUrl;
    private extractDomain;
    private getTopDomains;
    private calculateCompetitionLevel;
    private generateAnalysisId;
    private storeAnalysisResult;
    getAnalysisHistory(userId: string, limit?: number, offset?: number): Promise<never[]>;
}
