import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { PaymentService } from './payment.service';
import {
  PaymentInitiateDto,
  IntaSendWebhookDto,
  SubscriptionUsageDto,
  UsageType,
} from './subscription.types';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { Public } from '../auth/public.decorator';
import { RequireAdmin } from '../auth/admin.decorator';
import { User } from '../auth/user.decorator';
import type { AuthenticatedUser } from '../auth/user.interface';
// import { User } from '../../apps/server/src/modules/auth';


@Controller('v1/subscription')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentService: PaymentService,
  ) {}

  // GET /plans - List all available subscription plans
  @Public()
  @Get('plans')
  async getAllPlans() {
    try {
      const plans = await this.subscriptionService.getAllPlans();
      this.logger.log(`Retrieved ${plans.length} subscription plans`);
      return plans;
    } catch (error) {
      this.logger.error('Error fetching subscription plans', error);
      throw error;
    }
  }

  // POST /pay/initiate - Initiate payment for a subscription plan
  @UseGuards(AuthGuard)
  @Post('pay/initiate')
  async initiatePayment(
    @Body() paymentInitiateDto: PaymentInitiateDto,
    @User() user: AuthenticatedUser,
  ) {
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
        email: fullUser.email!,
        password: fullUser.password ?? null, 
        name: fullUser.name ?? 'User',
      };

      // Handle nullable priceYearly field
      const safePlan = {
        ...plan,
        priceYearly: plan.priceYearly ?? undefined,
      };

      const paymentUrl = await this.paymentService.initiatePayment(
        safeUser,
        safePlan,
        billingCycle,
      );
      
      this.logger.log(`Payment initiation successful for user ${user.id}`);
      return { paymentUrl };
    } catch (error) {
      this.logger.error('Error initiating payment', error);
      throw error;
    }
  }

  // POST /pay/charge - Process direct card payment
  @UseGuards(AuthGuard)
  @Post('pay/charge')
  async chargeCard(
    @Body() chargeDto: any, // Use a proper DTO here
    @User() user: AuthenticatedUser,
  ) {
    try {
      const { planId, billingCycle, card } = chargeDto;
      this.logger.log(`Charging card for user ${user.id}, plan ${planId}`);
      
      const plan = await this.subscriptionService.getPlanById(planId);
      const fullUser = await this.subscriptionService.getUserById(user.id);
      
      const result = await this.paymentService.chargeCard(
        fullUser,
        plan,
        billingCycle,
        card,
      );
      
      this.logger.log(`Card charge successful for user ${user.id}`);
      return result;
    } catch (error) {
      this.logger.error('Error charging card', error);
      throw error;
    }
  }

  // POST /intasend/webhook - Handle IntaSend webhook notifications
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('intasend/webhook')
  async handleWebhook(@Body() webhookDto: IntaSendWebhookDto, @Req() req: Request) {
    // Return HTTP 200 quickly - webhook processing happens in background
    const responsePromise = Promise.resolve({ status: 'received' });

    // Process webhook asynchronously to ensure quick response
    setImmediate(async () => {
      try {
        this.logger.log(`Received IntaSend webhook for invoice ${webhookDto.invoice_id}`);
        
        // Get signature from headers - IntaSend uses x-intasend-signature
        const signature = req.headers['x-intasend-signature'] as string;
        
        if (!signature) {
          this.logger.warn(`Missing x-intasend-signature header for invoice ${webhookDto.invoice_id}`);
          return;
        }

        // Get raw body for signature verification
        const rawBody = (req as any).rawBody || JSON.stringify(webhookDto);
        
        await this.paymentService.handleWebhook({
          ...webhookDto,
          rawBody,
          signature,
        });
        
        this.logger.log(`Webhook processed successfully for invoice ${webhookDto.invoice_id}`);
      } catch (error) {
        this.logger.error(`Critical error processing webhook for invoice ${webhookDto.invoice_id}:`, error);
        // Error is logged but not thrown to prevent webhook retry loops
      }
    });

    return responsePromise;
  }

  // GET /me - Get current user's subscription and usage details
  @UseGuards(AuthGuard)
  @Get('me')
  async getMySubscription(@User() user: AuthenticatedUser) {
    try {
      this.logger.log(`Fetching subscription details for user ${user.id}`);
      const subscriptionDetails = await this.subscriptionService.getCurrentPlanDetails(user.id);
      return subscriptionDetails;
    } catch (error) {
      this.logger.error(`Error fetching subscription for user ${user.id}`, error);
      throw error;
    }
  }

  // POST /usage - Record a usage event (internal)
  @UseGuards(AuthGuard)
  @Post('usage')
  async recordUsage(@Body() usageDto: SubscriptionUsageDto, @User() user: AuthenticatedUser) {
    try {
      const { usageType, quantity = 1, resourceId, metadata } = usageDto;
      this.logger.log(`Recording usage for user ${user.id}: ${usageType} (${quantity})`);
      
      const usageRecord = await this.subscriptionService.recordUsage(
        user.id,
        usageType as UsageType,
        quantity,
        resourceId,
        metadata
      );
      
      this.logger.log(`Usage recorded successfully: ${usageRecord.id}`);
      return { success: true, usageId: usageRecord.id };
    } catch (error) {
      this.logger.error(`Error recording usage for user ${user.id}`, error);
      throw error;
    }
  }

  // GET /admin/stats - Get subscription statistics (admin only)
  @UseGuards(AuthGuard, AdminGuard)
  @RequireAdmin()
  @Get('admin/stats')
  async getSubscriptionStats(@User() user: AuthenticatedUser) {
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
    } catch (error) {
      this.logger.error(`Error fetching subscription stats for admin ${user.id}`, error);
      throw error;
    }
  }
}

