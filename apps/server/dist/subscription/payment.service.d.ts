import { IntaSendService } from './intasend.service';
import { PrismaService } from '../prisma/prisma.service';
import { Plan, IntaSendCollectionWebhook } from './subscription.types';
import { SubscriptionService } from './subscription.service';
import { BillingCycle, User } from '@prisma/client';
export declare class PaymentService {
    private readonly intasendService;
    private readonly prisma;
    private readonly subscriptionService;
    private readonly logger;
    constructor(intasendService: IntaSendService, prisma: PrismaService, subscriptionService: SubscriptionService);
    initiatePayment(user: User, plan: Plan, billingCycle: BillingCycle): Promise<string>;
    chargeCard(user: User, plan: Plan, billingCycle: BillingCycle, cardDetails: any): Promise<any>;
    handleWebhook(payload: IntaSendCollectionWebhook): Promise<void>;
    private mapIntaSendStatusToInternalStatus;
}
