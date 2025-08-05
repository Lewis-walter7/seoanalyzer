import IntaSend = require('intasend-node');
import { PaymentLinkPayload, CardChargePayload, PaymentLinkResponse, TransactionVerificationResponse } from './subscription.types';
export declare class IntaSendService {
    private readonly logger;
    private readonly intasend;
    private readonly isTestMode;
    constructor();
    /**
     * Creates a payment link for a subscription or one-time payment
     * @param payload Payment link configuration
     * @returns Promise<PaymentLinkResponse>
     */
    createPaymentLink(payload: PaymentLinkPayload): Promise<PaymentLinkResponse>;
    chargeCard(payload: CardChargePayload): Promise<any>;
    /**
     * Verifies webhook signature to ensure the request is from IntaSend
     * @param rawBody Raw request body as received from IntaSend
     * @param signature Signature header from IntaSend webhook
     * @returns boolean indicating if signature is valid
     */
    verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean;
    /**
     * Verifies a transaction by its ID to check payment status
     * @param txnId Transaction ID to verify
     * @returns Promise<TransactionVerificationResponse>
     */
    verifyTransaction(txnId: string): Promise<TransactionVerificationResponse>;
    /**
     * Gets the current IntaSend client instance (for advanced usage)
     * @returns IntaSend client instance
     */
    getClient(): IntaSend;
    /**
     * Checks if the service is running in test mode
     * @returns boolean indicating test mode status
     */
    isInTestMode(): boolean;
    /**
     * Health check method to verify IntaSend connectivity
     * @returns Promise<boolean>
     */
    healthCheck(): Promise<boolean>;
}
