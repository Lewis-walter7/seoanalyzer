import { CompetitorAnalysisService } from './competitor-analysis.service';
import type { AuthenticatedUser } from '../../auth/user.interface';
export declare class CompetitorAnalysisController {
    private readonly competitorAnalysisService;
    constructor(competitorAnalysisService: CompetitorAnalysisService);
    createCompetitorAnalysis(user: AuthenticatedUser, createDto: {
        projectId: string;
    }): Promise<{
        id: string;
        projectId: string;
        competitors: {
            name: string;
            score: number;
        }[];
        trafficAnalysis: string;
        keywordGaps: string;
        contentAnalysis: string;
        backlinkComparison: string;
        createdAt: Date;
        status: string;
    }>;
    getTrafficAnalysis(user: AuthenticatedUser, projectId: string): Promise<{
        competitor: string;
        organicTraffic: number;
        paidTraffic: number;
        totalVisitors: number;
        bounceRate: number;
        avgSessionDuration: string;
        topTrafficSources: string[];
    }[]>;
    getKeywordGapAnalysis(user: AuthenticatedUser, projectId: string): Promise<{
        competitor: string;
        gaps: ({
            keyword: string;
            yourRank: null;
            competitorRank: number;
            searchVolume: number;
            difficulty: number;
            opportunity: string;
            cpc: number;
        } | {
            keyword: string;
            yourRank: number;
            competitorRank: number;
            searchVolume: number;
            difficulty: number;
            opportunity: string;
            cpc: number;
        })[];
    }[]>;
    getContentAnalysis(user: AuthenticatedUser, projectId: string): Promise<{
        competitor: string;
        totalPages: number;
        averageWordCount: number;
        averageLoadTime: number;
        mobileOptimized: number;
        contentScore: number;
        topPerformingContent: {
            title: string;
            url: string;
            shares: number;
            backlinks: number;
            organicTraffic: number;
        }[];
        contentTypes: {
            blog: number;
            product: number;
            landing: number;
            other: number;
        };
        topicClusters: string[];
    }[]>;
    getBacklinkComparison(user: AuthenticatedUser, projectId: string): Promise<{
        competitor: string;
        backlinks: {
            url: string;
            totalBacklinks: number;
            authorityScore: number;
            referringDomains: number;
            lostBacklinks: number;
            gainedBacklinks: number;
            competitorTrend: number[];
            topReferrers: string[];
        }[];
    }[]>;
    getAllCompetitorAnalyses(user: AuthenticatedUser, projectId?: string): Promise<{
        id: string;
        projectId: string;
        competitors: {
            name: string;
            score: number;
        }[];
        createdAt: Date;
        status: string;
    }[]>;
    getCompetitorAnalysis(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        projectId: string;
        competitors: {
            name: string;
            score: number;
        }[];
        createdAt: Date;
        status: string;
    }>;
    deleteCompetitorAnalysis(user: AuthenticatedUser, id: string): Promise<void>;
}
