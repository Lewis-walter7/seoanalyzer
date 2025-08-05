import { PrismaService } from '../../prisma/prisma.service';
export declare class BacklinkAnalyzerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDto: {
        projectId: string;
    }): Promise<{
        id: string;
        projectId: string;
        backlinks: string[];
        createdAt: Date;
        status: string;
    }>;
    findAll(userId: string, filter: {
        projectId?: string;
    }): Promise<{
        id: string;
        projectId: string;
        backlinks: string[];
        createdAt: Date;
        status: string;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        projectId: string;
        backlinks: string[];
        createdAt: Date;
        status: string;
    }>;
    remove(userId: string, id: string): Promise<void>;
}
