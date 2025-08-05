import { KeywordResearchService } from './keyword-research.service';
import type { AuthenticatedUser } from '../../auth/user.interface';
import { CreateKeywordResearchDto, UpdateKeywordResearchDto, KeywordAnalysisDto } from './dto/keyword-research.dto';
export declare class KeywordResearchController {
    private readonly keywordResearchService;
    constructor(keywordResearchService: KeywordResearchService);
    createKeywordResearch(user: AuthenticatedUser, createDto: CreateKeywordResearchDto): Promise<{
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
    getAllKeywordResearch(user: AuthenticatedUser, projectId?: string, limit?: number, offset?: number): Promise<{
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
    getKeywordResearch(user: AuthenticatedUser, id: string): Promise<{
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
    updateKeywordResearch(user: AuthenticatedUser, id: string, updateDto: UpdateKeywordResearchDto): Promise<{
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
    deleteKeywordResearch(user: AuthenticatedUser, id: string): Promise<void>;
    analyzeKeywords(user: AuthenticatedUser, id: string, analysisDto: KeywordAnalysisDto): Promise<import("./dto/keyword-research.dto").KeywordMetric[]>;
    getKeywordSuggestions(user: AuthenticatedUser, id: string, seedKeyword: string, limit?: number): Promise<import("./dto/keyword-research.dto").KeywordSuggestion[]>;
    getKeywordMetrics(user: AuthenticatedUser, id: string, keywords: string): Promise<import("./dto/keyword-research.dto").KeywordMetric[]>;
}
