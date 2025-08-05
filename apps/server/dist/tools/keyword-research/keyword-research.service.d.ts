import { PrismaService } from '../../prisma/prisma.service';
import { CreateKeywordResearchDto, UpdateKeywordResearchDto, KeywordAnalysisDto, KeywordMetric, KeywordSuggestion } from './dto/keyword-research.dto';
export declare class KeywordResearchService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDto: CreateKeywordResearchDto): Promise<{
        id: string;
        description: string | null;
        projectId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        seedKeywords: string[];
        searchEngine: import(".prisma/client").$Enums.SearchEngine;
        location: string;
        language: string;
        device: import(".prisma/client").$Enums.Device;
    }>;
    findAll(userId: string, filter: {
        projectId?: string;
        limit: number;
        offset: number;
    }): Promise<{
        id: string;
        description: string | null;
        projectId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        seedKeywords: string[];
        searchEngine: import(".prisma/client").$Enums.SearchEngine;
        location: string;
        language: string;
        device: import(".prisma/client").$Enums.Device;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        description: string | null;
        projectId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        seedKeywords: string[];
        searchEngine: import(".prisma/client").$Enums.SearchEngine;
        location: string;
        language: string;
        device: import(".prisma/client").$Enums.Device;
    } | null>;
    update(userId: string, id: string, updateDto: UpdateKeywordResearchDto): Promise<{
        id: string;
        description: string | null;
        projectId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        seedKeywords: string[];
        searchEngine: import(".prisma/client").$Enums.SearchEngine;
        location: string;
        language: string;
        device: import(".prisma/client").$Enums.Device;
    }>;
    remove(userId: string, id: string): Promise<void>;
    analyzeKeywords(userId: string, id: string, analysisDto: KeywordAnalysisDto): Promise<KeywordMetric[]>;
    getKeywordSuggestions(userId: string, id: string, seedKeyword: string, limit: number): Promise<KeywordSuggestion[]>;
    getKeywordMetrics(userId: string, id: string, keywords: string[]): Promise<KeywordMetric[]>;
}
