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
        id: string;
        description: string | null;
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
        isPopular: boolean;
        sortOrder: number;
        isActive: boolean;
    }>;
    updatePlan(planId: string, updatePlanDto: Partial<CreateSubscriptionPlanDto>, adminUserId: string): Promise<{
        id: string;
        description: string | null;
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
        isPopular: boolean;
        sortOrder: number;
        isActive: boolean;
    }>;
    deletePlan(planId: string, adminUserId: string): Promise<{
        message: string;
    }>;
    getAllPlans(): Promise<{
        id: string;
        description: string | null;
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
        isPopular: boolean;
        sortOrder: number;
        isActive: boolean;
    }[]>;
    getPlanById(planId: string): Promise<{
        id: string;
        description: string | null;
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
        isPopular: boolean;
        sortOrder: number;
        isActive: boolean;
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
            id: string;
            description: string | null;
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
            isPopular: boolean;
            sortOrder: number;
            isActive: boolean;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        startDate: Date;
        endDate: Date;
        cancelledAt: Date | null;
        autoRenew: boolean;
        transactionId: string | null;
    }>;
    cancelSubscription(userId: string, subscriptionId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        startDate: Date;
        endDate: Date;
        cancelledAt: Date | null;
        autoRenew: boolean;
        transactionId: string | null;
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
            id: string;
            description: string | null;
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
            isPopular: boolean;
            sortOrder: number;
            isActive: boolean;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        startDate: Date;
        endDate: Date;
        cancelledAt: Date | null;
        autoRenew: boolean;
        transactionId: string | null;
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
            id: string;
            description: string | null;
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
            isPopular: boolean;
            sortOrder: number;
            isActive: boolean;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        planId: string;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        startDate: Date;
        endDate: Date;
        cancelledAt: Date | null;
        autoRenew: boolean;
        transactionId: string | null;
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
