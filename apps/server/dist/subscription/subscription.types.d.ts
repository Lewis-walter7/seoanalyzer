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
export declare class CardDetailsDto {
    number: string;
    expiry: string;
    cvc: string;
    holder: string;
}
export declare class CardChargeDto {
    planId: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
    card: CardDetailsDto;
}
export declare class IntaSendWebhookDto {
    event: string;
    invoice_id: string;
    provider: string;
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
export interface Plan {
    id: string;
    name: string;
    displayName: string;
    priceMonthly: number;
    priceYearly?: number | null;
}
export declare enum IntaSendWebhookState {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    PROCESSING = "PROCESSING"
}
export declare enum IntaSendProvider {
    CARD = "CARD"
}
export interface IntaSendCollectionWebhook {
    invoice_id: string;
    state: IntaSendWebhookState | string;
    provider: IntaSendProvider | string;
    api_ref: string;
    challenge?: string;
    rawBody?: string | Buffer;
    signature?: string;
    value: number;
    account: string;
    charges?: string;
    net_amount?: number;
    currency?: string;
    failed_reason?: string;
    failed_code?: string;
    created_at?: string;
    updated_at?: string;
}
export interface PaymentLinkPayload {
    amount: number;
    currency: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    redirect_url?: string;
    webhook_url?: string;
    api_ref?: string;
    comment?: string;
}
export interface CardChargePayload {
    email: string;
    amount: number;
    currency: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    api_ref?: string;
    comment?: string;
    card_number: string;
    cvv: string;
    expiry_month: number;
    expiry_year: number;
}
export interface PaymentLinkResponse {
    id: string;
    url: string;
    customer: {
        id: string;
        phone_number: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    created_at: string;
    updated_at: string;
}
export interface TransactionVerificationResponse {
    invoice: {
        id: string;
        state: string;
        provider: string;
        charges: string;
        net_amount: number;
        currency: string;
        value: string;
        account: string;
        api_ref: string;
        mpesa_reference: string;
        host: string;
        retry_count: number;
        failed_reason: string;
        failed_code: string;
        failed_code_link: string;
        created_at: string;
        updated_at: string;
    };
    customer?: {
        customer_id: string;
        phone_number: string;
        email: string;
        first_name: string;
        last_name: string;
        country: string;
        zipcode: string;
        provider: string;
        created_at: string;
        updated_at: string;
    };
}
