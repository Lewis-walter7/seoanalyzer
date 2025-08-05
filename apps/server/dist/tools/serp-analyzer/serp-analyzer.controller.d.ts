import { SerpAnalyzerService } from './serp-analyzer.service';
import type { AuthenticatedUser } from '../../auth/user.interface';
import { SerpAnalysisDto } from './dto/serp-analysis.dto';
export declare class SerpAnalyzerController {
    private readonly serpAnalyzerService;
    constructor(serpAnalyzerService: SerpAnalyzerService);
    /**
     * Analyze SERP data
     * POST /api/tools/serp-analyzer
     */
    analyzeSerpData(user: AuthenticatedUser, serpAnalysisDto: SerpAnalysisDto): Promise<{
        id: string;
        userId: string;
        keyword: string;
        searchEngine: string;
        location: string;
        device: string;
        timestamp: Date;
        totalResults: number;
        organicResults: import("./dto/serp-analysis.dto").SerpResult[];
        paidResults: import("./dto/serp-analysis.dto").SerpResult[];
        features: import("./dto/serp-analysis.dto").SerpFeature[];
        contentAnalysis: import("./dto/serp-analysis.dto").ContentDetail;
        results: import("./dto/serp-analysis.dto").SerpResult[];
    }>;
    /**
     * Get analysis history for a user
     * GET /api/tools/serp-analyzer/history
     */
    getAnalysisHistory(user: AuthenticatedUser, limit?: number, offset?: number): Promise<never[]>;
}
