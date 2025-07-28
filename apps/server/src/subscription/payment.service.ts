import { Injectable, Logger } from '@nestjs/common';
import { IntaSendService } from './intasend.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentLinkPayload, PaymentLinkResponse } from './intasend.service';

// Import TransactionStatus from generated Prisma client
type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly intasendService: IntaSendService,
    private readonly prisma: PrismaService
  ) {}

  async initiatePayment(user, plan, billingCycle): Promise<string> {
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
      
      await this.prisma.transaction.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amount,
          currency: payload.currency,
          status: 'PENDING',
          providerRef: paymentLink.id,
        },
      });
      
      this.logger.log('Payment initiated successfully.');
      return paymentLink.url;
    } catch (error) {
      this.logger.error('Error initiating payment', error);
      throw new Error('Payment initiation failed');
    }
  }

  async handleWebhook(payload) {
    this.logger.log('Handling webhook...');
    try {
      const isValid = this.intasendService.verifyWebhookSignature(payload.rawBody, payload.signature);
      if (!isValid) {
        this.logger.warn('Invalid webhook signature');
        throw new Error('Invalid signature');
      }

      const transaction = await this.prisma.transaction.findFirst({
        where: { providerRef: payload.invoice_id },
      });

      if (!transaction) {
        this.logger.warn('Transaction not found');
        throw new Error('Transaction not found');
      }

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: this.mapIntaSendStatusToInternalStatus(payload.state),
        },
      });

      this.logger.log('Webhook handled successfully.');
    } catch (error) {
      this.logger.error('Error handling webhook', error);
    }
  }

  private mapIntaSendStatusToInternalStatus(status: string): TransactionStatus {
    switch (status) {
      case 'COMPLETED':
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

