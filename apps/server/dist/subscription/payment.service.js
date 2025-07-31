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
const intasend_service_1 = require("./intasend.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentService = PaymentService_1 = class PaymentService {
    intasendService;
    prisma;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(intasendService, prisma) {
        this.intasendService = intasendService;
        this.prisma = prisma;
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
        }
        catch (error) {
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
        }
        catch (error) {
            this.logger.error('Error handling webhook', error);
        }
    }
    mapIntaSendStatusToInternalStatus(status) {
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
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [intasend_service_1.IntaSendService,
        prisma_service_1.PrismaService])
], PaymentService);
