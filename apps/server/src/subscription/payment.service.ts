import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiceUnavailableException } from '../common/exceptions/service-unavailable.exception';
import { IntaSendService } from './intasend.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaymentLinkPayload,
  PaymentLinkResponse,
  CardChargePayload,
  Plan,
  IntaSendWebhookState,
  IntaSendProvider,
  IntaSendCollectionWebhook,
} from './subscription.types';
import { SubscriptionService } from './subscription.service';
import { TransactionStatus, BillingCycle, User, Prisma } from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly intasendService: IntaSendService,
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async initiatePayment(user: User, plan:Plan, billingCycle: BillingCycle): Promise<string> {
    this.logger.log('Initiating payment...');
    try {
      // Determine price based on billing cycle
      const amount = billingCycle === 'YEARLY' ? plan.priceYearly || plan.priceMonthly * 12 : plan.priceMonthly;
      
      const payload: PaymentLinkPayload = {
        amount,
        currency: 'USD', // Assuming USD; adjust as necessary
        email: user.email,
        first_name: user.name?.split(' ')[0],
        last_name: user.name?.split(' ').slice(1).join(' '),
        api_ref: `sub_${plan.id}_${user.id}_${Date.now()}`,
        comment: `Subscription to ${plan.displayName} (${billingCycle})`,
        webhook_url: `${process.env.WEBHOOK_BASE_URL}/v1/subscription/intasend/webhook`,
      };
      
      const paymentLink: PaymentLinkResponse = await this.intasendService.createPaymentLink(payload);
      
      // Create transaction with invoice_id mapping for webhook processing
      const transaction = await this.prisma.transaction.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amount,
          currency: payload.currency,
          status: 'PENDING',
          providerRef: paymentLink.id, // This is the invoice_id that will come from webhook
          billingCycle,
        },
      });
      
      this.logger.log(`Payment initiated successfully. Transaction: ${transaction.id}, Invoice ID: ${paymentLink.id}`);
      return paymentLink.url;
    } catch (error) {
this.logger.error('[PaymentInitiate]', (error as Error).message, (error as Error).stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new ServiceUnavailableException('Payment initiation failed');
    }
  };

  async chargeCard(user: User, plan: Plan, billingCycle: BillingCycle, cardDetails: any): Promise<any> {
    this.logger.log('Processing direct card charge...');
    try {
      const amount = billingCycle === 'YEARLY' ? plan.priceYearly || plan.priceMonthly * 12 : plan.priceMonthly;
      
      const payload: CardChargePayload = {
        amount,
        currency: 'USD',
        email: user.email,
        first_name: user.name?.split(' ')[0],
        last_name: user.name?.split(' ').slice(1).join(' '),
        api_ref: `sub_${plan.id}_${user.id}_${Date.now()}`,
        comment: `Subscription to ${plan.displayName} (${billingCycle})`,
        card_number: cardDetails.number,
        cvv: cardDetails.cvc,
        expiry_month: parseInt(cardDetails.expiry.split('/')[0]),
        expiry_year: parseInt(cardDetails.expiry.split('/')[1]) + 2000,
      };
      
      const chargeResult = await this.intasendService.chargeCard(payload);
      
      // Create transaction record
      const transaction = await this.prisma.transaction.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amount,
          currency: payload.currency,
          status: 'COMPLETED', // Direct charge is immediately completed or failed
          providerRef: chargeResult.transaction_id,
          billingCycle,
        },
      });
      
      // Activate subscription immediately for successful charge
      await this.subscriptionService.activateSubscription(
        user.id,
        plan.id,
        transaction.id,
        billingCycle,
      );
      
      this.logger.log(`Direct card charge successful. Transaction: ${transaction.id}`);
      return { success: true, transactionId: transaction.id };
    } catch (error) {
      this.logger.error('[CardCharge]', (error as Error).message, (error as Error).stack);
      throw new ServiceUnavailableException('Card charge failed');
    }
  }

  async handleWebhook(payload: IntaSendCollectionWebhook): Promise<void> {
    this.logger.log(`Handling IntaSend webhook for invoice: ${payload.invoice_id}`);

    // 1. Persist webhook for audit trail
    const webhookEvent = await this.prisma.intaSendWebhookEvent.create({
      data: {
        invoiceId: payload.invoice_id,
        signature: payload.signature || '',
        payload: payload as any, // Store the raw payload as JSON
      },
    });

    try {
      // 2. Verify webhook signature
      const isValid = this.intasendService.verifyWebhookSignature(payload.rawBody!, payload.signature!);
      if (!isValid) {
        this.logger.warn(`[Webhook ${webhookEvent.id}] Invalid webhook signature for invoice: ${payload.invoice_id}`);
        throw new BadRequestException('Invalid signature');
      }

      if (payload.provider !== IntaSendProvider.CARD) {
        this.logger.warn(`[Webhook ${webhookEvent.id}] Unsupported provider: ${payload.provider}`);
        throw new BadRequestException('Unsupported provider');
      }

      // 3. Fetch the matching transaction
      const transaction = await this.prisma.transaction.findFirst({
        where: { providerRef: payload.invoice_id },
      });

      if (!transaction) {
        this.logger.warn(`[Webhook ${webhookEvent.id}] Transaction not found for invoice: ${payload.invoice_id}`);
        throw new NotFoundException('Transaction not found');
      }

      // 4. Update transaction status
      const internalStatus = this.mapIntaSendStatusToInternalStatus(payload.state);
      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: internalStatus,
        },
      });

      this.logger.log(`[Webhook ${webhookEvent.id}] Transaction ${transaction.id} status updated to: ${internalStatus}`);

      // 5. Activate subscription on confirmed payment (COMPLETED or PAID)
      if (internalStatus === 'COMPLETED') {
        await this.subscriptionService.activateSubscription(
          transaction.userId,
          transaction.planId,
          transaction.id,
          transaction.billingCycle,
        );
        this.logger.log(`[Webhook ${webhookEvent.id}] Subscription activation initiated for user: ${transaction.userId}`);
      }

      // 6. Mark webhook as processed
      await this.prisma.intaSendWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processedAt: new Date() },
      });

      this.logger.log(`[Webhook ${webhookEvent.id}] Webhook processed successfully for invoice: ${payload.invoice_id}`);

    } catch (error) {
this.logger.error(`[Webhook ${webhookEvent.id}] Error handling webhook for invoice ${payload.invoice_id}:`, (error as Error).message, (error as Error).stack);
    }
  }

  private mapIntaSendStatusToInternalStatus(status: string): TransactionStatus {
    switch (status) {
      case 'COMPLETED':
      case 'PAID': // IntaSend might use PAID instead of COMPLETED
        return 'COMPLETED';
      case 'FAILED':
        return 'FAILED';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  }
}

