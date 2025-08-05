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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const service_unavailable_exception_1 = require("../common/exceptions/service-unavailable.exception");
const intasend_service_1 = require("./intasend.service");
const prisma_service_1 = require("../prisma/prisma.service");
const subscription_types_1 = require("./subscription.types");
const subscription_service_1 = require("./subscription.service");
let PaymentService = PaymentService_1 = class PaymentService {
    intasendService;
    prisma;
    subscriptionService;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(intasendService, prisma, subscriptionService) {
        this.intasendService = intasendService;
        this.prisma = prisma;
        this.subscriptionService = subscriptionService;
    }
    async initiatePayment(user, plan, billingCycle) {
        this.logger.log('Initiating payment...');
        try {
            // Determine price based on billing cycle
            const amount = billingCycle === 'YEARLY' ? plan.priceYearly || plan.priceMonthly * 12 : plan.priceMonthly;
            const payload = {
                amount,
                currency: 'USD', // Assuming USD; adjust as necessary
                email: user.email,
                first_name: user.name?.split(' ')[0],
                last_name: user.name?.split(' ').slice(1).join(' '),
                api_ref: `sub_${plan.id}_${user.id}_${Date.now()}`,
                comment: `Subscription to ${plan.displayName} (${billingCycle})`,
                webhook_url: `${process.env.WEBHOOK_BASE_URL}/v1/subscription/intasend/webhook`,
            };
            const paymentLink = await this.intasendService.createPaymentLink(payload);
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
        }
        catch (error) {
            this.logger.error('[PaymentInitiate]', error.message, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new service_unavailable_exception_1.ServiceUnavailableException('Payment initiation failed');
        }
    }
    ;
    async chargeCard(user, plan, billingCycle, cardDetails) {
        this.logger.log('Processing direct card charge...');
        try {
            const amount = billingCycle === 'YEARLY' ? plan.priceYearly || plan.priceMonthly * 12 : plan.priceMonthly;
            const payload = {
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
            await this.subscriptionService.activateSubscription(user.id, plan.id, transaction.id, billingCycle);
            this.logger.log(`Direct card charge successful. Transaction: ${transaction.id}`);
            return { success: true, transactionId: transaction.id };
        }
        catch (error) {
            this.logger.error('[CardCharge]', error.message, error.stack);
            throw new service_unavailable_exception_1.ServiceUnavailableException('Card charge failed');
        }
    }
    async handleWebhook(payload) {
        this.logger.log(`Handling IntaSend webhook for invoice: ${payload.invoice_id}`);
        // 1. Persist webhook for audit trail
        const webhookEvent = await this.prisma.intaSendWebhookEvent.create({
            data: {
                invoiceId: payload.invoice_id,
                signature: payload.signature || '',
                payload: payload, // Store the raw payload as JSON
            },
        });
        try {
            // 2. Verify webhook signature
            const isValid = this.intasendService.verifyWebhookSignature(payload.rawBody, payload.signature);
            if (!isValid) {
                this.logger.warn(`[Webhook ${webhookEvent.id}] Invalid webhook signature for invoice: ${payload.invoice_id}`);
                throw new common_1.BadRequestException('Invalid signature');
            }
            if (payload.provider !== subscription_types_1.IntaSendProvider.CARD) {
                this.logger.warn(`[Webhook ${webhookEvent.id}] Unsupported provider: ${payload.provider}`);
                throw new common_1.BadRequestException('Unsupported provider');
            }
            // 3. Fetch the matching transaction
            const transaction = await this.prisma.transaction.findFirst({
                where: { providerRef: payload.invoice_id },
            });
            if (!transaction) {
                this.logger.warn(`[Webhook ${webhookEvent.id}] Transaction not found for invoice: ${payload.invoice_id}`);
                throw new common_1.NotFoundException('Transaction not found');
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
                await this.subscriptionService.activateSubscription(transaction.userId, transaction.planId, transaction.id, transaction.billingCycle);
                this.logger.log(`[Webhook ${webhookEvent.id}] Subscription activation initiated for user: ${transaction.userId}`);
            }
            // 6. Mark webhook as processed
            await this.prisma.intaSendWebhookEvent.update({
                where: { id: webhookEvent.id },
                data: { processedAt: new Date() },
            });
            this.logger.log(`[Webhook ${webhookEvent.id}] Webhook processed successfully for invoice: ${payload.invoice_id}`);
        }
        catch (error) {
            this.logger.error(`[Webhook ${webhookEvent.id}] Error handling webhook for invoice ${payload.invoice_id}:`, error.message, error.stack);
        }
    }
    mapIntaSendStatusToInternalStatus(status) {
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
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [intasend_service_1.IntaSendService,
        prisma_service_1.PrismaService,
        subscription_service_1.SubscriptionService])
], PaymentService);
