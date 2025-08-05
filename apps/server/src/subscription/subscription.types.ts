
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus, User } from '@prisma/client';


export class CreateSubscriptionPlanDto {
  @IsString()
  name!: string;

  @IsString()
  displayName!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  priceMonthly!: number;

  @IsOptional()
  @IsNumber()
  priceYearly?: number;

  @IsOptional()
  @IsString()
  intasendPaymentLink?: string;

  @IsOptional()
  @IsString()
  intasendCustomerId?: string;

  @IsNumber()
  maxProjects!: number;

  @IsNumber()
  maxKeywords!: number;

  @IsNumber()
  maxAnalysesPerMonth!: number;

  @IsNumber()
  maxReportsPerMonth!: number;

  @IsNumber()
  maxCompetitors!: number;

  @IsOptional()
  @IsBoolean()
  hasAdvancedReports?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAPIAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  hasWhiteLabel?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCustomBranding?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPrioritySupport?: boolean;

  @IsOptional()
  @IsBoolean()
  hasTeamCollaboration?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCustomAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  hasDataExport?: boolean;

  @IsOptional()
  @IsArray()
  analysisFrequencies?: string[];

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class InitiatePaymentDto {
  @IsString()
  planId!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(['MONTHLY', 'YEARLY'])
  billingCycle?: 'MONTHLY' | 'YEARLY';
}


export class SubscriptionUsageDto {
  @IsString()
  @IsEnum(['PROJECT_CREATED', 'ANALYSIS_RUN', 'REPORT_GENERATED', 'KEYWORD_TRACKED', 'API_CALL', 'COMPETITOR_ADDED', 'EXPORT_DATA', 'CUSTOM_ALERT'])
  usageType!: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  metadata?: any;
}

export class PaymentInitiateDto {
  @IsString()
  planId!: string;

  @IsEnum(['MONTHLY', 'YEARLY'])
  billingCycle!: 'MONTHLY' | 'YEARLY';
}

export class CardDetailsDto {
  @IsString()
  number!: string;

  @IsString()
  expiry!: string;

  @IsString()
  cvc!: string;

  @IsString()
  holder!: string;
}

export class CardChargeDto {
  @IsString()
  planId!: string;

  @IsEnum(['MONTHLY', 'YEARLY'])
  billingCycle!: 'MONTHLY' | 'YEARLY';

  @ValidateNested()
  @Type(() => CardDetailsDto)
  card!: CardDetailsDto;
}

export class IntaSendWebhookDto {
  @IsString()
  event!: string;

  @IsString()
  invoice_id!: string;
  
  @IsString()
  provider!: string;

  @IsString()
  state!: string;

  @IsNumber()
  value!: number;

  @IsString()
  account!: string;

  @IsString()
  api_ref!: string;

  @IsOptional()
  @IsString()
  mpesa_reference?: string;

  @IsOptional()
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

export enum UsageType {
  PROJECT_CREATED = 'PROJECT_CREATED',
  ANALYSIS_RUN = 'ANALYSIS_RUN',
  REPORT_GENERATED = 'REPORT_GENERATED',
  KEYWORD_TRACKED = 'KEYWORD_TRACKED',
  API_CALL = 'API_CALL',
  COMPETITOR_ADDED = 'COMPETITOR_ADDED',
  EXPORT_DATA = 'EXPORT_DATA',
  CUSTOM_ALERT = 'CUSTOM_ALERT'
}

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  priceMonthly: number;
  priceYearly?: number | null;
}

// Define specific webhook states as enum
export enum IntaSendWebhookState {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PROCESSING = 'PROCESSING'
}

// Define webhook providers as enum
export enum IntaSendProvider {
  CARD = 'CARD'
}

export interface IntaSendCollectionWebhook {
  invoice_id: string;
  state: IntaSendWebhookState | string; // Allow string for unknown states
  provider: IntaSendProvider | string;
  api_ref: string;
  challenge?: string;
  rawBody?: string | Buffer;
  signature?: string;
  value: number;
  account: string;
  // Additional optional webhook fields
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


