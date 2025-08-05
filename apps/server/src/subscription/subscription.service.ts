import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSubscriptionPlanDto,
  SubscriptionUsageDto,
  PlanLimits,
  CurrentPlanDetails,
  UsageType,
} from './subscription.types';
import { SubscriptionStatus, User } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

   async getUserById(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }
  // ========================
  // PLAN CRUD OPERATIONS (Admin Only)
  // ========================

  async createPlan(createPlanDto: CreateSubscriptionPlanDto, adminUserId: string) {
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
    } catch (error) {
      this.logger.error('Error creating plan', error);
      throw new BadRequestException('Failed to create plan');
    }
  }

  async updatePlan(planId: string, updatePlanDto: Partial<CreateSubscriptionPlanDto>, adminUserId: string) {
    this.logger.log(`Updating plan: ${planId}`);
    
    await this.verifyAdminAccess(adminUserId);

    try {
      const existingPlan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!existingPlan) {
        throw new NotFoundException('Plan not found');
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
    } catch (error) {
      this.logger.error('Error updating plan', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update plan');
    }
  }

  async deletePlan(planId: string, adminUserId: string) {
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
        throw new BadRequestException('Cannot delete plan with active subscriptions');
      }

      await this.prisma.subscriptionPlan.delete({
        where: { id: planId },
      });

      this.logger.log(`Plan deleted successfully: ${planId}`);
      return { message: 'Plan deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting plan', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new NotFoundException('Plan not found');
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

  async getPlanById(planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  // ========================
  // SUBSCRIPTION MANAGEMENT
  // ========================

  async activateSubscription(userId: string, planId: string, transactionId: string, billingCycle: 'MONTHLY' | 'YEARLY') {
    this.logger.log(`Activating subscription for user: ${userId}, plan: ${planId}`);

    try {
      // Verify transaction is completed
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true },
      });

      if (!transaction || transaction.status !== 'COMPLETED') {
        throw new BadRequestException('Invalid or incomplete transaction');
      }

      if (transaction.userId !== userId) {
        throw new ForbiddenException('Transaction does not belong to user');
      }

      // Get plan details
      const plan = await this.getPlanById(planId);

      // Calculate subscription period
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (billingCycle === 'YEARLY') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
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
    } catch (error) {
      this.logger.error('Error activating subscription', error);
      throw error;
    }
  }

  async cancelSubscription(userId: string, subscriptionId?: string) {
    this.logger.log(`Cancelling subscription for user: ${userId}`);

    try {
      const whereClause = subscriptionId 
        ? { id: subscriptionId, userId }
        : { userId, status: SubscriptionStatus.ACTIVE };

      const subscription = await this.prisma.subscription.findFirst({
        where: whereClause,
      });

      if (!subscription) {
        throw new NotFoundException('Active subscription not found');
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
    } catch (error) {
      this.logger.error('Error cancelling subscription', error);
      throw error;
    }
  }

  private async cancelActiveSubscriptions(userId: string) {
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

  async recordUsage(userId: string, usageType: UsageType, quantity: number = 1, resourceId?: string, metadata?: any) {
    this.logger.log(`Recording usage for user: ${userId}, type: ${usageType}, quantity: ${quantity}`);

    try {
      // Check if user has active subscription and if usage is within limits
      const canProceed = await this.checkUsageLimit(userId, usageType, quantity);
      
      if (!canProceed) {
        throw new ForbiddenException(`Usage limit exceeded for ${usageType}`);
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
    } catch (error) {
      this.logger.error('Error recording usage', error);
      throw error;
    }
  }

  async checkUsageLimit(userId: string, usageType: UsageType, additionalQuantity: number = 1): Promise<boolean> {
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
case UsageType.ANALYSIS_RUN:
          return true; // Temporarily allow unlimited runs for testing
          case UsageType.PROJECT_CREATED:
          case UsageType.REPORT_GENERATED:
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
        case UsageType.PROJECT_CREATED:
          return (currentUsage.projects + additionalQuantity) <= plan.maxProjects;
        case UsageType.ANALYSIS_RUN:
          return (currentUsage.analyses + additionalQuantity) <= plan.maxAnalysesPerMonth;
        case UsageType.REPORT_GENERATED:
          return (currentUsage.reports + additionalQuantity) <= plan.maxReportsPerMonth;
        case UsageType.KEYWORD_TRACKED:
          return (currentUsage.keywords + additionalQuantity) <= plan.maxKeywords;
        case UsageType.COMPETITOR_ADDED:
          return (currentUsage.competitors + additionalQuantity) <= plan.maxCompetitors;
        case UsageType.API_CALL:
          return plan.hasAPIAccess || false;
        case UsageType.EXPORT_DATA:
          return plan.hasDataExport || false;
        case UsageType.CUSTOM_ALERT:
          return plan.hasCustomAlerts || false;
        default:
          return true;
      }
    } catch (error) {
      this.logger.error('Error checking usage limit', error);
      return false;
    }
  }

  private async getUsageForPeriod(userId: string, startDate: Date, endDate: Date) {
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
        case UsageType.PROJECT_CREATED:
          usage.projects = quantity;
          break;
        case UsageType.KEYWORD_TRACKED:
          usage.keywords = quantity;
          break;
        case UsageType.ANALYSIS_RUN:
          usage.analyses = quantity;
          break;
        case UsageType.REPORT_GENERATED:
          usage.reports = quantity;
          break;
        case UsageType.COMPETITOR_ADDED:
          usage.competitors = quantity;
          break;
        case UsageType.API_CALL:
          usage.apiCalls = quantity;
          break;
        case UsageType.EXPORT_DATA:
          usage.exports = quantity;
          break;
        case UsageType.CUSTOM_ALERT:
          usage.alerts = quantity;
          break;
      }
    });

    return usage;
  }

  // ========================
  // PLAN DETAILS & QUOTA HELPERS
  // ========================

  async getCurrentPlanDetails(userId: string): Promise<CurrentPlanDetails | null> {
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
    } catch (error) {
      this.logger.error('Error getting current plan details', error);
      throw new BadRequestException('Failed to get plan details');
    }
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSubscriptionById(subscriptionId: string, userId: string) {
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
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  // ========================
  // HELPER METHODS
  // ========================

  private async verifyAdminAccess(userId: string) {
    // This is a placeholder - implement your admin verification logic
    // You might check user roles, permissions, etc.
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
  }

  async isFeatureAvailable(userId: string, feature: keyof PlanLimits): Promise<boolean> {
    try {
      const planDetails = await this.getCurrentPlanDetails(userId);
      
      if (!planDetails) {
        return false;
      }

      const plan = planDetails.plan;
      return plan[feature] === true;
    } catch (error) {
      this.logger.error('Error checking feature availability', error);
      return false;
    }
  }

  async getUsageHistory(userId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.recordedAt = {};
      if (startDate) whereClause.recordedAt.gte = startDate;
      if (endDate) whereClause.recordedAt.lte = endDate;
    }

    return this.prisma.subscriptionUsage.findMany({
      where: whereClause,
      orderBy: { recordedAt: 'desc' },
      take: 1000, // Limit to prevent large queries
    });
  }
}
