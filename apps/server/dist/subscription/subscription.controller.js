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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SubscriptionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("./subscription.service");
const payment_service_1 = require("./payment.service");
const subscription_dto_1 = require("./dto/subscription.dto");
const auth_guard_1 = require("../auth/auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
const public_decorator_1 = require("../auth/public.decorator");
const admin_decorator_1 = require("../auth/admin.decorator");
const user_decorator_1 = require("../auth/user.decorator");
// import { User } from '../../apps/server/src/modules/auth';
let SubscriptionController = SubscriptionController_1 = class SubscriptionController {
    subscriptionService;
    paymentService;
    logger = new common_1.Logger(SubscriptionController_1.name);
    constructor(subscriptionService, paymentService) {
        this.subscriptionService = subscriptionService;
        this.paymentService = paymentService;
    }
    // GET /plans - List all available subscription plans
    async getAllPlans() {
        try {
            const plans = await this.subscriptionService.getAllPlans();
            this.logger.log(`Retrieved ${plans.length} subscription plans`);
            return plans;
        }
        catch (error) {
            this.logger.error('Error fetching subscription plans', error);
            throw error;
        }
    }
    // POST /pay/initiate - Initiate payment for a subscription plan
    async initiatePayment(paymentInitiateDto, user) {
        try {
            const { planId, billingCycle } = paymentInitiateDto;
            this.logger.log(`Initiating payment for user ${user.id}, plan ${planId}, cycle ${billingCycle}`);
            const plan = await this.subscriptionService.getPlanById(planId);
            const fullUser = await this.subscriptionService.getUserById(user.id);
            if (!fullUser.email) {
                this.logger.error(`User ${user.id} does not have a valid email address`);
                throw new Error('A valid email address is required to initiate payment.');
            }
            const safeUser = {
                ...fullUser,
                email: fullUser.email,
                password: fullUser.password ?? undefined,
                name: fullUser.name ?? 'User',
            };
            const safePlan = {
                ...plan,
                priceYearly: plan.priceYearly ?? undefined,
            };
            const paymentUrl = await this.paymentService.initiatePayment(safeUser, safePlan, billingCycle);
            this.logger.log(`Payment initiation successful for user ${user.id}`);
            return { paymentUrl };
        }
        catch (error) {
            this.logger.error('Error initiating payment', error);
            throw error;
        }
    }
    // POST /intasend/webhook - Handle IntaSend webhook notifications
    async handleWebhook(webhookDto, req) {
        try {
            this.logger.log(`Received IntaSend webhook for invoice ${webhookDto.invoice_id}`);
            // Get signature from headers
            const signature = req.headers['x-intasend-signature'];
            await this.paymentService.handleWebhook({
                provider: 'intasend',
                rawBody: req.body || JSON.stringify(webhookDto),
                signature,
                ...webhookDto,
            });
            this.logger.log(`Webhook processed successfully for invoice ${webhookDto.invoice_id}`);
            return { status: 'success' };
        }
        catch (error) {
            this.logger.error('Error handling webhook', error);
            throw error;
        }
    }
    // GET /me - Get current user's subscription and usage details
    async getMySubscription(user) {
        try {
            this.logger.log(`Fetching subscription details for user ${user.id}`);
            const subscriptionDetails = await this.subscriptionService.getCurrentPlanDetails(user.id);
            return subscriptionDetails;
        }
        catch (error) {
            this.logger.error(`Error fetching subscription for user ${user.id}`, error);
            throw error;
        }
    }
    // POST /usage - Record a usage event (internal)
    async recordUsage(usageDto, user) {
        try {
            const { usageType, quantity = 1, resourceId, metadata } = usageDto;
            this.logger.log(`Recording usage for user ${user.id}: ${usageType} (${quantity})`);
            const usageRecord = await this.subscriptionService.recordUsage(user.id, usageType, quantity, resourceId, metadata);
            this.logger.log(`Usage recorded successfully: ${usageRecord.id}`);
            return { success: true, usageId: usageRecord.id };
        }
        catch (error) {
            this.logger.error(`Error recording usage for user ${user.id}`, error);
            throw error;
        }
    }
    // GET /admin/stats - Get subscription statistics (admin only)
    async getSubscriptionStats(user) {
        try {
            this.logger.log(`Admin ${user.id} requesting subscription statistics`);
            // This endpoint would return admin-level subscription statistics
            const stats = {
                totalSubscriptions: 0,
                activeSubscriptions: 0,
                revenue: 0,
                // Add more stats as needed
            };
            return stats;
        }
        catch (error) {
            this.logger.error(`Error fetching subscription stats for admin ${user.id}`, error);
            throw error;
        }
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getAllPlans", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('pay/initiate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscription_dto_1.PaymentInitiateDto, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "initiatePayment", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('intasend/webhook'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscription_dto_1.IntaSendWebhookDto, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getMySubscription", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('usage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscription_dto_1.SubscriptionUsageDto, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "recordUsage", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_guard_1.AdminGuard),
    (0, admin_decorator_1.RequireAdmin)(),
    (0, common_1.Get)('admin/stats'),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscriptionStats", null);
exports.SubscriptionController = SubscriptionController = SubscriptionController_1 = __decorate([
    (0, common_1.Controller)('v1/subscription'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        payment_service_1.PaymentService])
], SubscriptionController);
