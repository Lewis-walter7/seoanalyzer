import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionPlanDto } from './dto/subscription.dto';
import { User } from '@prisma/client';
export interface PlanLimits {
    maxProjects: number;
    maxKeywords: number;
    maxAnalysesPerMonth: number;
    maxReportsPerMonth: number;
    maxCompetitors: number;
    hasAdvancedReports?: boolean;
    hasAPIAccess?: boolean;
    hasWhiteLabel?: boolean;
    hasCustomBranding?: boolean;
    hasPrioritySupport?: boolean;
    hasTeamCollaboration?: boolean;
    hasCustomAlerts?: boolean;
    hasDataExport?: boolean;
}
export interface CurrentPlanDetails {
    plan: any;
    subscription: any;
    remainingQuota: {
        projects: number;
        keywords: number;
        analyses: number;
        reports: number;
        competitors: number;
    };
    usageThisPeriod: {
        projects: number;
        keywords: number;
        analyses: number;
        reports: number;
        competitors: number;
        apiCalls: number;
        exports: number;
        alerts: number;
    };
}
export declare enum UsageType {
    PROJECT_CREATED = "PROJECT_CREATED",
    ANALYSIS_RUN = "ANALYSIS_RUN",
    REPORT_GENERATED = "REPORT_GENERATED",
    KEYWORD_TRACKED = "KEYWORD_TRACKED",
    API_CALL = "API_CALL",
    COMPETITOR_ADDED = "COMPETITOR_ADDED",
    EXPORT_DATA = "EXPORT_DATA",
    CUSTOM_ALERT = "CUSTOM_ALERT"
}
export declare class SubscriptionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getUserById(userId: string): Promise<User>;
    createPlan(createPlanDto: CreateSubscriptionPlanDto, adminUserId: string): Promise<{
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
    }>;
    updatePlan(planId: string, updatePlanDto: Partial<CreateSubscriptionPlanDto>, adminUserId: string): Promise<{
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
    }>;
    deletePlan(planId: string, adminUserId: string): Promise<{
        message: string;
    }>;
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
    getPlanById(planId: string): Promise<{
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
    }>;
    activateSubscription(userId: string, planId: string, transactionId: string, billingCycle: 'MONTHLY' | 'YEARLY'): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            password: string | null;
            emailVerified: Date | null;
            image: string | null;
            isAdmin: boolean;
            subscriptionId: string | null;
            intasendCustomerId: string | null;
            trialEndsAt: Date | null;
            trialUsed: boolean;
        };
        plan: {
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
        };
    } & {
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        transactionId: string | null;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        startDate: Date;
        endDate: Date;
        cancelledAt: Date | null;
        autoRenew: boolean;
    }>;
    cancelSubscription(userId: string, subscriptionId?: string): Promise<{
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        transactionId: string | null;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        startDate: Date;
        endDate: Date;
        cancelledAt: Date | null;
        autoRenew: boolean;
    }>;
    private cancelActiveSubscriptions;
    recordUsage(userId: string, usageType: UsageType, quantity?: number, resourceId?: string, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        usageType: import(".prisma/client").$Enums.UsageType;
        resourceId: string | null;
        quantity: number;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        recordedAt: Date;
    }>;
    checkUsageLimit(userId: string, usageType: UsageType, additionalQuantity?: number): Promise<boolean>;
    private getUsageForPeriod;
    getCurrentPlanDetails(userId: string): Promise<CurrentPlanDetails | null>;
    getUserSubscriptions(userId: string): Promise<({
        plan: {
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
        };
    } & {
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        transactionId: string | null;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        startDate: Date;
        endDate: Date;
        cancelledAt: Date | null;
        autoRenew: boolean;
    })[]>;
    getSubscriptionById(subscriptionId: string, userId: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            email: string;
            password: string | null;
            emailVerified: Date | null;
            image: string | null;
            isAdmin: boolean;
            subscriptionId: string | null;
            intasendCustomerId: string | null;
            trialEndsAt: Date | null;
            trialUsed: boolean;
        };
        plan: {
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
        };
    } & {
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        transactionId: string | null;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        startDate: Date;
        endDate: Date;
        cancelledAt: Date | null;
        autoRenew: boolean;
    }>;
    private verifyAdminAccess;
    isFeatureAvailable(userId: string, feature: keyof PlanLimits): Promise<boolean>;
    getUsageHistory(userId: string, startDate?: Date, endDate?: Date): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        usageType: import(".prisma/client").$Enums.UsageType;
        resourceId: string | null;
        quantity: number;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        recordedAt: Date;
    }[]>;
}
