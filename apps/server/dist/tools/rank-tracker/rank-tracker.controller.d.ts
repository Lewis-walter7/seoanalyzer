import { RankTrackerService } from './rank-tracker.service';
import type { AuthenticatedUser } from '../../auth/user.interface';
export declare class RankTrackerController {
    private readonly rankTrackerService;
    constructor(rankTrackerService: RankTrackerService);
    createRankTracker(user: AuthenticatedUser, createDto: {
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
    getAllRankTrackers(user: AuthenticatedUser, projectId?: string): Promise<{
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
    getRankTracker(user: AuthenticatedUser, id: string): Promise<{
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
    deleteRankTracker(user: AuthenticatedUser, id: string): Promise<void>;
}
