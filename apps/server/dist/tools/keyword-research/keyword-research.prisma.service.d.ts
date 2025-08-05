import { Prisma } from '@prisma/client';
export declare class KeywordResearchPrismaService {
    createKeywordResearch(prisma: Prisma.TransactionClient, data: Prisma.KeywordResearchCreateInput): Promise<{
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
    getKeywordResearch(prisma: Prisma.TransactionClient, id: string): Promise<{
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
    updateKeywordResearch(prisma: Prisma.TransactionClient, id: string, data: Prisma.KeywordResearchUpdateInput): Promise<{
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
    deleteKeywordResearch(prisma: Prisma.TransactionClient, id: string): Promise<{
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
    getAllKeywordResearch(prisma: Prisma.TransactionClient, params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.KeywordResearchWhereUniqueInput;
        where?: Prisma.KeywordResearchWhereInput;
        orderBy?: Prisma.KeywordResearchOrderByWithRelationInput;
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
}
