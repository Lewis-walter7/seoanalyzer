import { SiteAuditService } from './site-audit.service';
import type { AuthenticatedUser } from '../../auth/user.interface';
export declare class SiteAuditController {
    private readonly siteAuditService;
    constructor(siteAuditService: SiteAuditService);
    createSiteAudit(user: AuthenticatedUser, createDto: {
        projectId: string;
    }): Promise<{
        id: string;
        projectId: string;
        seoScore: number;
        auditedAt: Date;
        status: string;
    }>;
    getAllSiteAudits(user: AuthenticatedUser, projectId?: string): Promise<{
        id: string;
        projectId: string;
        seoScore: number;
        auditedAt: Date;
        status: string;
    }[]>;
    getSiteAudit(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        projectId: string;
        seoScore: number;
        auditedAt: Date;
        status: string;
    }>;
    deleteSiteAudit(user: AuthenticatedUser, id: string): Promise<void>;
}
