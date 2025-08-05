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
var SubscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const subscription_types_1 = require("./subscription.types");
const client_1 = require("@prisma/client");
let SubscriptionService = SubscriptionService_1 = class SubscriptionService {
    prisma;
    logger = new common_1.Logger(SubscriptionService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return user;
    }
    // ========================
    // PLAN CRUD OPERATIONS (Admin Only)
    // ========================
    async createPlan(createPlanDto, adminUserId) {
        this.logger.log(`Creating new plan: ${createPlanDto.name}`);
        // Verify admin privileges (assuming you have a way to check admin status)
        await this.verifyAdminAccess(adminUserId);
        try {
            const plan = await this.prisma.subscriptionPlan.create({
                data: {
                    ...createPlanDto,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`Plan created successfully: ${plan.id}`);
            return plan;
        }
        catch (error) {
            this.logger.error('Error creating plan', error);
            throw new common_1.BadRequestException('Failed to create plan');
        }
    }
    async updatePlan(planId, updatePlanDto, adminUserId) {
        this.logger.log(`Updating plan: ${planId}`);
        await this.verifyAdminAccess(adminUserId);
        try {
            const existingPlan = await this.prisma.subscriptionPlan.findUnique({
                where: { id: planId },
            });
            if (!existingPlan) {
                throw new common_1.NotFoundException('Plan not found');
            }
            const updatedPlan = await this.prisma.subscriptionPlan.update({
                where: { id: planId },
                data: {
                    ...updatePlanDto,
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`Plan updated successfully: ${planId}`);
            return updatedPlan;
        }
        catch (error) {
            this.logger.error('Error updating plan', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update plan');
        }
    }
    async deletePlan(planId, adminUserId) {
        this.logger.log(`Deleting plan: ${planId}`);
        await this.verifyAdminAccess(adminUserId);
        try {
            // Check if plan has active subscriptions
            const activeSubscriptions = await this.prisma.subscription.count({
                where: {
                    planId: planId,
                    status: 'ACTIVE',
                },
            });
            if (activeSubscriptions > 0) {
                throw new common_1.BadRequestException('Cannot delete plan with active subscriptions');
            }
            await this.prisma.subscriptionPlan.delete({
                where: { id: planId },
            });
            this.logger.log(`Plan deleted successfully: ${planId}`);
            return { message: 'Plan deleted successfully' };
        }
        catch (error) {
            this.logger.error('Error deleting plan', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.NotFoundException('Plan not found');
        }
    }
    async getAllPlans() {
        return this.prisma.subscriptionPlan.findMany({
            orderBy: [
                { sortOrder: 'asc' },
                { priceMonthly: 'asc' },
            ],
        });
    }
    async getPlanById(planId) {
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plan not found');
        }
        return plan;
    }
    // ========================
    // SUBSCRIPTION MANAGEMENT
    // ========================
    async activateSubscription(userId, planId, transactionId, billingCycle) {
        this.logger.log(`Activating subscription for user: ${userId}, plan: ${planId}`);
        try {
            // Verify transaction is completed
            const transaction = await this.prisma.transaction.findUnique({
                where: { id: transactionId },
                include: { user: true },
            });
            if (!transaction || transaction.status !== 'COMPLETED') {
                throw new common_1.BadRequestException('Invalid or incomplete transaction');
            }
            if (transaction.userId !== userId) {
                throw new common_1.ForbiddenException('Transaction does not belong to user');
            }
            // Get plan details
            const plan = await this.getPlanById(planId);
            // Calculate subscription period
            const startDate = new Date();
            const endDate = new Date(startDate);
            if (billingCycle === 'YEARLY') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }
            else {
                endDate.setMonth(endDate.getMonth() + 1);
            }
            // Cancel any existing active subscription
            await this.cancelActiveSubscriptions(userId);
            // Create new subscription
            const subscription = await this.prisma.subscription.create({
                data: {
                    userId,
                    planId,
                    transactionId,
                    billingCycle,
                    status: 'ACTIVE',
                    startDate,
                    endDate,
                    autoRenew: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                include: {
                    plan: true,
                    user: true,
                },
            });
            this.logger.log(`Subscription activated successfully: ${subscription.id}`);
            return subscription;
        }
        catch (error) {
            this.logger.error('Error activating subscription', error);
            throw error;
        }
    }
    async cancelSubscription(userId, subscriptionId) {
        this.logger.log(`Cancelling subscription for user: ${userId}`);
        try {
            const whereClause = subscriptionId
                ? { id: subscriptionId, userId }
                : { userId, status: client_1.SubscriptionStatus.ACTIVE };
            const subscription = await this.prisma.subscription.findFirst({
                where: whereClause,
            });
            if (!subscription) {
                throw new common_1.NotFoundException('Active subscription not found');
            }
            const cancelledSubscription = await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`Subscription cancelled successfully: ${subscription.id}`);
            return cancelledSubscription;
        }
        catch (error) {
            this.logger.error('Error cancelling subscription', error);
            throw error;
        }
    }
    async cancelActiveSubscriptions(userId) {
        await this.prisma.subscription.updateMany({
            where: {
                userId,
                status: 'ACTIVE',
            },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    // ========================
    // USAGE TRACKING
    // ========================
    async recordUsage(userId, usageType, quantity = 1, resourceId, metadata) {
        this.logger.log(`Recording usage for user: ${userId}, type: ${usageType}, quantity: ${quantity}`);
        try {
            // Check if user has active subscription and if usage is within limits
            const canProceed = await this.checkUsageLimit(userId, usageType, quantity);
            if (!canProceed) {
                throw new common_1.ForbiddenException(`Usage limit exceeded for ${usageType}`);
            }
            // Record the usage
            const usage = await this.prisma.subscriptionUsage.create({
                data: {
                    userId,
                    usageType,
                    quantity,
                    resourceId,
                    metadata,
                    recordedAt: new Date(),
                    createdAt: new Date(),
                },
            });
            this.logger.log(`Usage recorded successfully: ${usage.id}`);
            return usage;
        }
        catch (error) {
            this.logger.error('Error recording usage', error);
            throw error;
        }
    }
    async checkUsageLimit(userId, usageType, additionalQuantity = 1) {
        try {
            // Get current subscription and plan
            const subscription = await this.prisma.subscription.findFirst({
                where: {
                    userId,
                    status: 'ACTIVE',
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() },
                },
                include: { plan: true },
            });
            if (!subscription) {
                // No active subscription - allow limited free usage
                // For testing purposes, allow basic operations
                switch (usageType) {
                    case subscription_types_1.UsageType.ANALYSIS_RUN:
                        return true; // Temporarily allow unlimited runs for testing
                    case subscription_types_1.UsageType.PROJECT_CREATED:
                    case subscription_types_1.UsageType.REPORT_GENERATED:
                        return true; // Allow free basic usage
                    default:
                        return false; // Restrict premium features
                }
            }
            // Get current period start (monthly renewal)
            const periodStart = new Date();
            periodStart.setDate(1); // Start of current month
            periodStart.setHours(0, 0, 0, 0);
            // Get usage for current period
            const currentUsage = await this.getUsageForPeriod(userId, periodStart, new Date());
            // Check limits based on usage type
            const plan = subscription.plan;
            switch (usageType) {
                case subscription_types_1.UsageType.PROJECT_CREATED:
                    return (currentUsage.projects + additionalQuantity) <= plan.maxProjects;
                case subscription_types_1.UsageType.ANALYSIS_RUN:
                    return (currentUsage.analyses + additionalQuantity) <= plan.maxAnalysesPerMonth;
                case subscription_types_1.UsageType.REPORT_GENERATED:
                    return (currentUsage.reports + additionalQuantity) <= plan.maxReportsPerMonth;
                case subscription_types_1.UsageType.KEYWORD_TRACKED:
                    return (currentUsage.keywords + additionalQuantity) <= plan.maxKeywords;
                case subscription_types_1.UsageType.COMPETITOR_ADDED:
                    return (currentUsage.competitors + additionalQuantity) <= plan.maxCompetitors;
                case subscription_types_1.UsageType.API_CALL:
                    return plan.hasAPIAccess || false;
                case subscription_types_1.UsageType.EXPORT_DATA:
                    return plan.hasDataExport || false;
                case subscription_types_1.UsageType.CUSTOM_ALERT:
                    return plan.hasCustomAlerts || false;
                default:
                    return true;
            }
        }
        catch (error) {
            this.logger.error('Error checking usage limit', error);
            return false;
        }
    }
    async getUsageForPeriod(userId, startDate, endDate) {
        const usageRecords = await this.prisma.subscriptionUsage.groupBy({
            by: ['usageType'],
            where: {
                userId,
                recordedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                quantity: true,
            },
        });
        // Transform to usage object
        const usage = {
            projects: 0,
            keywords: 0,
            analyses: 0,
            reports: 0,
            competitors: 0,
            apiCalls: 0,
            exports: 0,
            alerts: 0,
        };
        usageRecords.forEach(record => {
            const quantity = record._sum.quantity || 0;
            switch (record.usageType) {
                case subscription_types_1.UsageType.PROJECT_CREATED:
                    usage.projects = quantity;
                    break;
                case subscription_types_1.UsageType.KEYWORD_TRACKED:
                    usage.keywords = quantity;
                    break;
                case subscription_types_1.UsageType.ANALYSIS_RUN:
                    usage.analyses = quantity;
                    break;
                case subscription_types_1.UsageType.REPORT_GENERATED:
                    usage.reports = quantity;
                    break;
                case subscription_types_1.UsageType.COMPETITOR_ADDED:
                    usage.competitors = quantity;
                    break;
                case subscription_types_1.UsageType.API_CALL:
                    usage.apiCalls = quantity;
                    break;
                case subscription_types_1.UsageType.EXPORT_DATA:
                    usage.exports = quantity;
                    break;
                case subscription_types_1.UsageType.CUSTOM_ALERT:
                    usage.alerts = quantity;
                    break;
            }
        });
        return usage;
    }
    // ========================
    // PLAN DETAILS & QUOTA HELPERS
    // ========================
    async getCurrentPlanDetails(userId) {
        this.logger.log(`Getting current plan details for user: ${userId}`);
        try {
            // Get active subscription
            const subscription = await this.prisma.subscription.findFirst({
                where: {
                    userId,
                    status: 'ACTIVE',
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() },
                },
                include: {
                    plan: true,
                    user: true,
                },
            });
            if (!subscription) {
                return null;
            }
            // Get current period usage
            const periodStart = new Date();
            periodStart.setDate(1);
            periodStart.setHours(0, 0, 0, 0);
            const usageThisPeriod = await this.getUsageForPeriod(userId, periodStart, new Date());
            // Calculate remaining quota
            const plan = subscription.plan;
            const remainingQuota = {
                projects: Math.max(0, plan.maxProjects - usageThisPeriod.projects),
                keywords: Math.max(0, plan.maxKeywords - usageThisPeriod.keywords),
                analyses: Math.max(0, plan.maxAnalysesPerMonth - usageThisPeriod.analyses),
                reports: Math.max(0, plan.maxReportsPerMonth - usageThisPeriod.reports),
                competitors: Math.max(0, plan.maxCompetitors - usageThisPeriod.competitors),
            };
            return {
                plan: subscription.plan,
                subscription,
                remainingQuota,
                usageThisPeriod,
            };
        }
        catch (error) {
            this.logger.error('Error getting current plan details', error);
            throw new common_1.BadRequestException('Failed to get plan details');
        }
    }
    async getUserSubscriptions(userId) {
        return this.prisma.subscription.findMany({
            where: { userId },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getSubscriptionById(subscriptionId, userId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                id: subscriptionId,
                userId,
            },
            include: {
                plan: true,
                user: true,
            },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        return subscription;
    }
    // ========================
    // HELPER METHODS
    // ========================
    async verifyAdminAccess(userId) {
        // This is a placeholder - implement your admin verification logic
        // You might check user roles, permissions, etc.
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.isAdmin) {
            throw new common_1.ForbiddenException('Admin access required');
        }
    }
    async isFeatureAvailable(userId, feature) {
        try {
            const planDetails = await this.getCurrentPlanDetails(userId);
            if (!planDetails) {
                return false;
            }
            const plan = planDetails.plan;
            return plan[feature] === true;
        }
        catch (error) {
            this.logger.error('Error checking feature availability', error);
            return false;
        }
    }
    async getUsageHistory(userId, startDate, endDate) {
        const whereClause = { userId };
        if (startDate || endDate) {
            whereClause.recordedAt = {};
            if (startDate)
                whereClause.recordedAt.gte = startDate;
            if (endDate)
                whereClause.recordedAt.lte = endDate;
        }
        return this.prisma.subscriptionUsage.findMany({
            where: whereClause,
            orderBy: { recordedAt: 'desc' },
            take: 1000, // Limit to prevent large queries
        });
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = SubscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
