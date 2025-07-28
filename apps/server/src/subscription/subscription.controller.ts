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
import { SubscriptionService, UsageType } from './subscription.service';
import { PaymentService } from './payment.service';
import {
  PaymentInitiateDto,
  IntaSendWebhookDto,
  SubscriptionUsageDto,
} from './dto/subscription.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { Public } from '../auth/public.decorator';
import { RequireAdmin } from '../auth/admin.decorator';
import { User } from '../auth/user.decorator';
import type { AuthenticatedUser } from '../auth/user.interface';

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
      const paymentUrl = await this.paymentService.initiatePayment(
        user,
        plan,
        billingCycle,
      );
      
      this.logger.log(`Payment initiation successful for user ${user.id}`);
      return { paymentUrl };
    } catch (error) {
      this.logger.error('Error initiating payment', error);
      throw error;
    }
  }

  // POST /intasend/webhook - Handle IntaSend webhook notifications
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('intasend/webhook')
  async handleWebhook(@Body() webhookDto: IntaSendWebhookDto, @Req() req: Request) {
    try {
      this.logger.log(`Received IntaSend webhook for invoice ${webhookDto.invoice_id}`);
      
      // Get signature from headers
      const signature = req.headers['x-intasend-signature'] as string;
      
      await this.paymentService.handleWebhook({
        rawBody: req.body || JSON.stringify(webhookDto),
        signature,
        ...webhookDto,
      });
      
      this.logger.log(`Webhook processed successfully for invoice ${webhookDto.invoice_id}`);
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error handling webhook', error);
      throw error;
    }
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

