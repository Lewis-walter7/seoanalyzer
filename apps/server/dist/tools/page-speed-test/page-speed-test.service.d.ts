import { PrismaService } from '../../prisma/prisma.service';
export declare class PageSpeedTestService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDto: {
        projectId: string;
    }): Promise<{
        id: string;
        projectId: string;
        loadTime: number;
        coreWebVitals: {
            lcp: number;
            fid: number;
            cls: number;
        };
        createdAt: Date;
        status: string;
    }>;
    findAll(userId: string, filter: {
        projectId?: string;
    }): Promise<{
        id: string;
        projectId: string;
        loadTime: number;
        coreWebVitals: {
            lcp: number;
            fid: number;
            cls: number;
        };
        createdAt: Date;
        status: string;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        projectId: string;
        loadTime: number;
        coreWebVitals: {
            lcp: number;
            fid: number;
            cls: number;
        };
        createdAt: Date;
        status: string;
    }>;
    remove(userId: string, id: string): Promise<void>;
}
