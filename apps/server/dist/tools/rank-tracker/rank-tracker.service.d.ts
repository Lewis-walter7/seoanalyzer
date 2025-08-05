import { PrismaService } from '../../prisma/prisma.service';
export declare class RankTrackerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDto: {
        projectId: string;
        keyword: string;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        projectId: string;
        url: string | null;
        recordedAt: Date;
        searchEngine: import(".prisma/client").$Enums.SearchEngine;
        location: string;
        language: string;
        device: import(".prisma/client").$Enums.Device;
        keyword: string;
        position: number;
        previousPosition: number | null;
    }>;
    findAll(userId: string, filter: {
        projectId?: string;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        projectId: string;
        url: string | null;
        recordedAt: Date;
        searchEngine: import(".prisma/client").$Enums.SearchEngine;
        location: string;
        language: string;
        device: import(".prisma/client").$Enums.Device;
        keyword: string;
        position: number;
        previousPosition: number | null;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        projectId: string;
        url: string | null;
        recordedAt: Date;
        searchEngine: import(".prisma/client").$Enums.SearchEngine;
        location: string;
        language: string;
        device: import(".prisma/client").$Enums.Device;
        keyword: string;
        position: number;
        previousPosition: number | null;
    } | null>;
    remove(userId: string, id: string): Promise<void>;
}
