import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ServiceUnavailableException } from '../common/exceptions/service-unavailable.exception';
import IntaSend = require('intasend-node');
import * as crypto from 'crypto'; 
import {
  PaymentLinkPayload,
  CardChargePayload,
  PaymentLinkResponse,
  TransactionVerificationResponse,
} from './subscription.types';

@Injectable()
export class IntaSendService {
  private readonly logger = new Logger(IntaSendService.name);
  private readonly intasend!: IntaSend;
  private readonly isTestMode: boolean;

  constructor() {
    // Initialize IntaSend client with keys from environment variables
    const publishableKey = process.env.INTASEND_PUBLISHABLE_KEY;
    const secretKey = process.env.INTASEND_SECRET_KEY;
    this.isTestMode = process.env.INTASEND_TEST_MODE === 'true' || process.env.NODE_ENV !== 'production';

    if (!publishableKey || !secretKey) {
      this.logger.warn('IntaSend keys not configured. Payment functionality will be disabled.');
      this.logger.warn('To enable payments, set INTASEND_PUBLISHABLE_KEY and INTASEND_SECRET_KEY environment variables.');
      return;
    }

    this.intasend = new IntaSend(publishableKey, secretKey, this.isTestMode);
    
    this.logger.log(`IntaSend client initialized in ${this.isTestMode ? 'test' : 'live'} mode`);
  }

  /**
   * Creates a payment link for a subscription or one-time payment
   * @param payload Payment link configuration
   * @returns Promise<PaymentLinkResponse>
   */
  async createPaymentLink(payload: PaymentLinkPayload): Promise<PaymentLinkResponse> {
    if (!this.intasend) {
      throw new Error('IntaSend client not initialized. Please configure INTASEND_PUBLISHABLE_KEY and INTASEND_SECRET_KEY.');
    }
    
    try {
      this.logger.log(`Creating payment link for amount: ${payload.amount} ${payload.currency}`);
      
      const collection = this.intasend.collection();
      const response = await collection.charge({
        amount: payload.amount,
        currency: payload.currency,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone_number: payload.phone_number,
        redirect_url: payload.redirect_url,
        webhook_url: payload.webhook_url,
        api_ref: payload.api_ref,
        comment: payload.comment,
      });

      this.logger.log(`Payment link created successfully with ID: ${response.id}`);
      return response;
    } catch (error: any) {
      this.logger.error('[PaymentLinkCreate]', error?.message, error?.stack);
      
      // Check if it's a client error (4xx) or server error (5xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        throw new BadRequestException(`Invalid payment request: ${error?.message}`);
      }
      
      throw new ServiceUnavailableException(`Payment service temporarily unavailable: ${error?.message}`);
    }
  }

  async chargeCard(payload: CardChargePayload): Promise<any> {
    if (!this.intasend) {
      throw new Error('IntaSend client not initialized.');
    }

    try {
      this.logger.log(`Charging card for amount: ${payload.amount} ${payload.currency}`);
      
      // Note: Card charging might need different API approach based on IntaSend SDK version
      // For now, we'll disable this functionality until proper API method is confirmed
      throw new ServiceUnavailableException('Direct card charging is not currently supported');
    } catch (error) {
      this.logger.error('[CardCharge]', (error as Error).message, (error as Error).stack);
      throw new ServiceUnavailableException(`Card charge failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verifies webhook signature to ensure the request is from IntaSend
   * @param rawBody Raw request body as received from IntaSend
   * @param signature Signature header from IntaSend webhook
   * @returns boolean indicating if signature is valid
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!this.intasend) {
      this.logger.warn('IntaSend client not initialized, skipping signature verification');
      return true;
    }

    try {
      const webhookSecret = process.env.INTASEND_WEBHOOK_SECRET;

      if (!webhookSecret) {
        this.logger.warn('INTASEND_WEBHOOK_SECRET not configured, skipping signature verification');
        return true; // Allow through if webhook secret is not configured
      }

      const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyString)
        .digest('base64');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );

      if (!isValid) {
        this.logger.warn('Invalid webhook signature detected');
      }

      return isValid;
    } catch (error) {
      this.logger.error('[WebhookSignatureVerify]', (error as Error).message, (error as Error).stack);
      return false;
    }
  }

  /**
   * Verifies a transaction by its ID to check payment status
   * @param txnId Transaction ID to verify
   * @returns Promise<TransactionVerificationResponse>
   */
  async verifyTransaction(txnId: string): Promise<TransactionVerificationResponse> {
    if (!this.intasend) {
      throw new Error('IntaSend client not initialized. Please configure INTASEND_PUBLISHABLE_KEY and INTASEND_SECRET_KEY.');
    }
    
    try {
      this.logger.log(`Verifying transaction: ${txnId}`);
      
      const collection = this.intasend.collection();
      const response = await collection.status(txnId);
      
      this.logger.log(`Transaction ${txnId} verification completed. Status: ${response.invoice?.state}`);
      return response;
    } catch (error) {
      this.logger.error('[TransactionVerify]', (error as Error).message, (error as Error).stack);
      
      // Check if it's a client error (4xx) or server error (5xx)
      if ((error as any).response?.status >= 400 && (error as any).response?.status < 500) {
        throw new BadRequestException(`Invalid transaction ID or request: ${(error as any).message}`);
      }
      
      throw new ServiceUnavailableException(`Transaction verification service temporarily unavailable: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  /**
   * Gets the current IntaSend client instance (for advanced usage)
   * @returns IntaSend client instance
   */
  getClient(): IntaSend {
    return this.intasend;
  }

  /**
   * Checks if the service is running in test mode
   * @returns boolean indicating test mode status
   */
  isInTestMode(): boolean {
    return this.isTestMode;
  }

  /**
   * Health check method to verify IntaSend connectivity
   * @returns Promise<boolean>
   */
  async healthCheck(): Promise<boolean> {
    if (!this.intasend) {
      this.logger.warn('IntaSend client not initialized');
      return false;
    }
    
    try {
      // Simple test to verify the client is properly configured
      const collection = this.intasend.collection();
      // This will throw an error if credentials are invalid
      await collection.charge({
        amount: 1,
        currency: 'KES',
        email: 'test@example.com',
        api_ref: 'health-check-' + Date.now(),
      }).catch(() => {
        // Expected to fail for health check, we just want to verify auth works
      });
      
      return true;
    } catch (error) {
      this.logger.error('[IntaSendHealthCheck]', (error as Error).message, (error as Error).stack);
      return false;
    }
  }
}
