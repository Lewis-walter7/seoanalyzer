import { PrismaService } from '../../prisma/prisma.service';
export declare class CompetitorAnalysisService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDto: {
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
    performTrafficAnalysis(projectId: string): Promise<{
        competitor: string;
        organicTraffic: number;
        paidTraffic: number;
        totalVisitors: number;
        bounceRate: number;
        avgSessionDuration: string;
        topTrafficSources: string[];
    }[]>;
    performKeywordGapAnalysis(projectId: string): Promise<{
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
    performContentAnalysis(projectId: string): Promise<{
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
    compareBacklinks(projectId: string): Promise<{
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
    findAll(userId: string, filter: {
        projectId?: string;
    }): Promise<{
        id: string;
        projectId: string;
        competitors: {
            name: string;
            score: number;
        }[];
        createdAt: Date;
        status: string;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        projectId: string;
        competitors: {
            name: string;
            score: number;
        }[];
        createdAt: Date;
        status: string;
    }>;
    remove(userId: string, id: string): Promise<void>;
}
