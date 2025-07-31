import IntaSend = require('intasend-node');
export interface PaymentLinkPayload {
    amount: number;
    currency: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    redirect_url?: string;
    webhook_url?: string;
    api_ref?: string;
    comment?: string;
}
export interface PaymentLinkResponse {
    id: string;
    url: string;
    customer: {
        id: string;
        phone_number: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    created_at: string;
    updated_at: string;
}
export interface TransactionVerificationResponse {
    invoice: {
        id: string;
        state: string;
        provider: string;
        charges: string;
        net_amount: number;
        currency: string;
        value: string;
        account: string;
        api_ref: string;
        mpesa_reference: string;
        host: string;
        retry_count: number;
        failed_reason: string;
        failed_code: string;
        failed_code_link: string;
        created_at: string;
        updated_at: string;
    };
    customer?: {
        customer_id: string;
        phone_number: string;
        email: string;
        first_name: string;
        last_name: string;
        country: string;
        zipcode: string;
        provider: string;
        created_at: string;
        updated_at: string;
    };
}
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
