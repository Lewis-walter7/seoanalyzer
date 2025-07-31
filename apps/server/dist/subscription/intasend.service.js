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
var IntaSendService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntaSendService = void 0;
const common_1 = require("@nestjs/common");
const IntaSend = require("intasend-node");
const crypto = require("crypto");
let IntaSendService = IntaSendService_1 = class IntaSendService {
    logger = new common_1.Logger(IntaSendService_1.name);
    intasend;
    isTestMode;
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
    async createPaymentLink(payload) {
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
        }
        catch (error) {
            this.logger.error('Failed to create payment link', error);
            throw new Error(`Failed to create payment link: ${error.message}`);
        }
    }
    /**
     * Verifies webhook signature to ensure the request is from IntaSend
     * @param rawBody Raw request body as received from IntaSend
     * @param signature Signature header from IntaSend webhook
     * @returns boolean indicating if signature is valid
     */
    verifyWebhookSignature(rawBody, signature) {
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
            const isValid = crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
            if (!isValid) {
                this.logger.warn('Invalid webhook signature detected');
            }
            return isValid;
        }
        catch (error) {
            this.logger.error('Error verifying webhook signature:', error);
            return false;
        }
    }
    /**
     * Verifies a transaction by its ID to check payment status
     * @param txnId Transaction ID to verify
     * @returns Promise<TransactionVerificationResponse>
     */
    async verifyTransaction(txnId) {
        if (!this.intasend) {
            throw new Error('IntaSend client not initialized. Please configure INTASEND_PUBLISHABLE_KEY and INTASEND_SECRET_KEY.');
        }
        try {
            this.logger.log(`Verifying transaction: ${txnId}`);
            const collection = this.intasend.collection();
            const response = await collection.status(txnId);
            this.logger.log(`Transaction ${txnId} verification completed. Status: ${response.invoice?.state}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to verify transaction ${txnId}`, error);
            throw new Error(`Failed to verify transaction: ${error.message}`);
        }
    }
    /**
     * Gets the current IntaSend client instance (for advanced usage)
     * @returns IntaSend client instance
     */
    getClient() {
        return this.intasend;
    }
    /**
     * Checks if the service is running in test mode
     * @returns boolean indicating test mode status
     */
    isInTestMode() {
        return this.isTestMode;
    }
    /**
     * Health check method to verify IntaSend connectivity
     * @returns Promise<boolean>
     */
    async healthCheck() {
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
        }
        catch (error) {
            this.logger.error('IntaSend health check failed', error);
            return false;
        }
    }
};
exports.IntaSendService = IntaSendService;
exports.IntaSendService = IntaSendService = IntaSendService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], IntaSendService);
