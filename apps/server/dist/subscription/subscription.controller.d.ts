import type { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { PaymentService } from './payment.service';
import { PaymentInitiateDto, IntaSendWebhookDto, SubscriptionUsageDto } from './dto/subscription.dto';
import type { AuthenticatedUser } from '../auth/user.interface';
export declare class SubscriptionController {
    private readonly subscriptionService;
    private readonly paymentService;
    private readonly logger;
    constructor(subscriptionService: SubscriptionService, paymentService: PaymentService);
    getAllPlans(): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        intasendCustomerId: string | null;
        displayName: string;
        priceMonthly: number;
        priceYearly: number | null;
        intasendPaymentLink: string | null;
        maxProjects: number;
        maxKeywords: number;
        maxAnalysesPerMonth: number;
        maxReportsPerMonth: number;
        maxCompetitors: number;
        hasAdvancedReports: boolean;
        hasAPIAccess: boolean;
        hasWhiteLabel: boolean;
        hasCustomBranding: boolean;
        hasPrioritySupport: boolean;
        hasTeamCollaboration: boolean;
        hasCustomAlerts: boolean;
        hasDataExport: boolean;
        analysisFrequencies: string[];
        isActive: boolean;
        isPopular: boolean;
        sortOrder: number;
    }[]>;
    initiatePayment(paymentInitiateDto: PaymentInitiateDto, user: AuthenticatedUser): Promise<{
        paymentUrl: string;
    }>;
    handleWebhook(webhookDto: IntaSendWebhookDto, req: Request): Promise<{
        status: string;
    }>;
    getMySubscription(user: AuthenticatedUser): Promise<import("./subscription.service").CurrentPlanDetails | null>;
    recordUsage(usageDto: SubscriptionUsageDto, user: AuthenticatedUser): Promise<{
        success: boolean;
        usageId: string;
    }>;
    getSubscriptionStats(user: AuthenticatedUser): Promise<{
        totalSubscriptions: number;
        activeSubscriptions: number;
        revenue: number;
    }>;
}
