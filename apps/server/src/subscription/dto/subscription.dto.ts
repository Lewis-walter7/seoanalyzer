import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

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

export class IntaSendWebhookDto {
  @IsString()
  event!: string;

  @IsString()
  invoice_id!: string;

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
