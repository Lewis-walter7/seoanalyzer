import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    isHealthy(): Promise<boolean>;
    getDatabaseStats(): Promise<{
        totalProjects: number;
        totalCrawlJobs: number;
        totalPages: number;
        totalSeoAudits: number;
    }>;
    cleanupOldCrawls(daysOld?: number): Promise<number>;
}
