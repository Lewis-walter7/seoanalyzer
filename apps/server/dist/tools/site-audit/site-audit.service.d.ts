import { PrismaService } from '../../prisma/prisma.service';
export declare class SiteAuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDto: {
        projectId: string;
    }): Promise<{
        id: string;
        projectId: string;
        seoScore: number;
        auditedAt: Date;
        status: string;
    }>;
    findAll(userId: string, filter: {
        projectId?: string;
    }): Promise<{
        id: string;
        projectId: string;
        seoScore: number;
        auditedAt: Date;
        status: string;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        projectId: string;
        seoScore: number;
        auditedAt: Date;
        status: string;
    }>;
    remove(userId: string, id: string): Promise<void>;
}
