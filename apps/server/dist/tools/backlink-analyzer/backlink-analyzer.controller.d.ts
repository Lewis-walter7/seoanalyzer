import { BacklinkAnalyzerService } from './backlink-analyzer.service';
import type { AuthenticatedUser } from '../../auth/user.interface';
export declare class BacklinkAnalyzerController {
    private readonly backlinkAnalyzerService;
    constructor(backlinkAnalyzerService: BacklinkAnalyzerService);
    createBacklinkAnalysis(user: AuthenticatedUser, createDto: {
        projectId: string;
    }): Promise<{
        id: string;
        projectId: string;
        backlinks: string[];
        createdAt: Date;
        status: string;
    }>;
    getAllBacklinkAnalyses(user: AuthenticatedUser, projectId?: string): Promise<{
        id: string;
        projectId: string;
        backlinks: string[];
        createdAt: Date;
        status: string;
    }[]>;
    getBacklinkAnalysis(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        projectId: string;
        backlinks: string[];
        createdAt: Date;
        status: string;
    }>;
    deleteBacklinkAnalysis(user: AuthenticatedUser, id: string): Promise<void>;
}
