import { PageSpeedTestService } from './page-speed-test.service';
import type { AuthenticatedUser } from '../../auth/user.interface';
export declare class PageSpeedTestController {
    private readonly pageSpeedTestService;
    constructor(pageSpeedTestService: PageSpeedTestService);
    createPageSpeedTest(user: AuthenticatedUser, createDto: {
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
    getAllPageSpeedTests(user: AuthenticatedUser, projectId?: string): Promise<{
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
    getPageSpeedTest(user: AuthenticatedUser, id: string): Promise<{
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
    deletePageSpeedTest(user: AuthenticatedUser, id: string): Promise<void>;
}
