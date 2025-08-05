import type { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { PaymentService } from './payment.service';
import { PaymentInitiateDto, IntaSendWebhookDto, SubscriptionUsageDto } from './subscription.types';
import type { AuthenticatedUser } from '../auth/user.interface';
export declare class SubscriptionController {
    private readonly subscriptionService;
    private readonly paymentService;
    private readonly logger;
    constructor(subscriptionService: SubscriptionService, paymentService: PaymentService);
    getAllPlans(): Promise<{
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        priceMonthly: number;
        priceYearly: number | null;
        intasendPaymentLink: string | null;
        intasendCustomerId: string | null;
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
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    initiatePayment(paymentInitiateDto: PaymentInitiateDto, user: AuthenticatedUser): Promise<{
        paymentUrl: string;
    }>;
    chargeCard(chargeDto: any, // Use a proper DTO here
    user: AuthenticatedUser): Promise<any>;
    handleWebhook(webhookDto: IntaSendWebhookDto, req: Request): Promise<{
        status: string;
    }>;
    getMySubscription(user: AuthenticatedUser): Promise<import("./subscription.types").CurrentPlanDetails | null>;
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
