"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntaSendWebhookDto = exports.PaymentInitiateDto = exports.SubscriptionUsageDto = exports.InitiatePaymentDto = exports.CreateSubscriptionPlanDto = void 0;
const class_validator_1 = require("class-validator");
class CreateSubscriptionPlanDto {
    name;
    displayName;
    description;
    priceMonthly;
    priceYearly;
    intasendPaymentLink;
    intasendCustomerId;
    maxProjects;
    maxKeywords;
    maxAnalysesPerMonth;
    maxReportsPerMonth;
    maxCompetitors;
    hasAdvancedReports;
    hasAPIAccess;
    hasWhiteLabel;
    hasCustomBranding;
    hasPrioritySupport;
    hasTeamCollaboration;
    hasCustomAlerts;
    hasDataExport;
    analysisFrequencies;
    isPopular;
    sortOrder;
}
exports.CreateSubscriptionPlanDto = CreateSubscriptionPlanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionPlanDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionPlanDto.prototype, "displayName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionPlanDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSubscriptionPlanDto.prototype, "priceMonthly", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSubscriptionPlanDto.prototype, "priceYearly", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionPlanDto.prototype, "intasendPaymentLink", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionPlanDto.prototype, "intasendCustomerId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSubscriptionPlanDto.prototype, "maxProjects", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSubscriptionPlanDto.prototype, "maxKeywords", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSubscriptionPlanDto.prototype, "maxAnalysesPerMonth", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSubscriptionPlanDto.prototype, "maxReportsPerMonth", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSubscriptionPlanDto.prototype, "maxCompetitors", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionPlanDto.prototype, "hasAdvancedReports", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionPlanDto.prototype, "hasAPIAccess", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionPlanDto.prototype, "hasWhiteLabel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionPlanDto.prototype, "hasCustomBranding", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionPlanDto.prototype, "hasPrioritySupport", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionPlanDto.prototype, "hasTeamCollaboration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionPlanDto.prototype, "hasCustomAlerts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionPlanDto.prototype, "hasDataExport", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateSubscriptionPlanDto.prototype, "analysisFrequencies", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionPlanDto.prototype, "isPopular", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSubscriptionPlanDto.prototype, "sortOrder", void 0);
class InitiatePaymentDto {
    planId;
    amount;
    currency;
    billingCycle;
}
exports.InitiatePaymentDto = InitiatePaymentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitiatePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['MONTHLY', 'YEARLY']),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "billingCycle", void 0);
class SubscriptionUsageDto {
    usageType;
    resourceId;
    quantity;
    metadata;
}
exports.SubscriptionUsageDto = SubscriptionUsageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['PROJECT_CREATED', 'ANALYSIS_RUN', 'REPORT_GENERATED', 'KEYWORD_TRACKED', 'API_CALL', 'COMPETITOR_ADDED', 'EXPORT_DATA', 'CUSTOM_ALERT']),
    __metadata("design:type", String)
], SubscriptionUsageDto.prototype, "usageType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubscriptionUsageDto.prototype, "resourceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubscriptionUsageDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SubscriptionUsageDto.prototype, "metadata", void 0);
class PaymentInitiateDto {
    planId;
    billingCycle;
}
exports.PaymentInitiateDto = PaymentInitiateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentInitiateDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['MONTHLY', 'YEARLY']),
    __metadata("design:type", String)
], PaymentInitiateDto.prototype, "billingCycle", void 0);
class IntaSendWebhookDto {
    event;
    invoice_id;
    state;
    value;
    account;
    api_ref;
    mpesa_reference;
    customer;
}
exports.IntaSendWebhookDto = IntaSendWebhookDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntaSendWebhookDto.prototype, "event", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntaSendWebhookDto.prototype, "invoice_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntaSendWebhookDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IntaSendWebhookDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntaSendWebhookDto.prototype, "account", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntaSendWebhookDto.prototype, "api_ref", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntaSendWebhookDto.prototype, "mpesa_reference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], IntaSendWebhookDto.prototype, "customer", void 0);
