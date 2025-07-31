export declare class CreateSubscriptionPlanDto {
    name: string;
    displayName: string;
    description?: string;
    priceMonthly: number;
    priceYearly?: number;
    intasendPaymentLink?: string;
    intasendCustomerId?: string;
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
    analysisFrequencies?: string[];
    isPopular?: boolean;
    sortOrder?: number;
}
export declare class InitiatePaymentDto {
    planId: string;
    amount: number;
    currency?: string;
    billingCycle?: 'MONTHLY' | 'YEARLY';
}
export declare class SubscriptionUsageDto {
    usageType: string;
    resourceId?: string;
    quantity?: number;
    metadata?: any;
}
export declare class PaymentInitiateDto {
    planId: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
}
export declare class IntaSendWebhookDto {
    event: string;
    invoice_id: string;
    state: string;
    value: number;
    account: string;
    api_ref: string;
    mpesa_reference?: string;
    customer?: {
        customer_id: string;
        phone_number: string;
        email: string;
        first_name: string;
        last_name: string;
    };
}
