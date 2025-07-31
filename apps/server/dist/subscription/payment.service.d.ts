import { IntaSendService } from './intasend.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../apps/src/auth';
import { Plan } from '../apps/src/auth/auth.service';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
interface IntaSendCollectionWebhook {
    invoice_id: string;
    state: string;
    provider: string;
    api_ref: string;
    challenge?: string;
    [key: string]: any;
}
export declare class PaymentService {
    private readonly intasendService;
    private readonly prisma;
    private readonly logger;
    constructor(intasendService: IntaSendService, prisma: PrismaService);
    initiatePayment(user: User, plan: Plan, billingCycle: BillingCycle): Promise<string>;
    handleWebhook(payload: IntaSendCollectionWebhook): Promise<void>;
    private mapIntaSendStatusToInternalStatus;
}
export {};
