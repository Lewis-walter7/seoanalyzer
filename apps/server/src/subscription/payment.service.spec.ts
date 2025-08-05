import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { IntaSendWebhookState, IntaSendProvider } from './subscription.types';
import { IntaSendService } from './intasend.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService } from './subscription.service';
import { Logger } from '@nestjs/common';
import { User, BillingCycle } from '@prisma/client';

// Create Mock Prisma Service
class MockPrismaService {
  transaction = {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  user = {
    findUnique: jest.fn(),
  };
  intaSendWebhookEvent = {
    create: jest.fn(),
    update: jest.fn(),
  };
}

// Create Mock IntaSend Service
class MockIntaSendService {
  createPaymentLink = jest.fn();
  verifyWebhookSignature = jest.fn();
}

// Create Mock Subscription Service
class MockSubscriptionService {
  getUserById = jest.fn();
  activateSubscription = jest.fn();
}

// The main testing suite
describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: MockPrismaService;
  let intasend: MockIntaSendService;
  let subscriptionService: MockSubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: IntaSendService, useClass: MockIntaSendService },
        { provide: PrismaService, useClass: MockPrismaService },
        { provide: SubscriptionService, useClass: MockSubscriptionService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<MockPrismaService>(PrismaService);
    intasend = module.get<MockIntaSendService>(IntaSendService);
    subscriptionService = module.get<MockSubscriptionService>(SubscriptionService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiatePayment', () => {
    it('should successfully initiate a payment', async () => {
      const mockUser: Partial<User> = { id: 'user-123', email: 'test@example.com', name: 'John Doe' };
      const mockPlan = { id: 'plan-abc', name: 'Pro', displayName: 'Pro Plan', priceMonthly: 25, priceYearly: 250 };

      intasend.createPaymentLink.mockResolvedValue({ id: 'link-xyz', url: 'https://payment.url' });
      prisma.transaction.create.mockResolvedValue({ id: 'txn-xyz', status: 'PENDING' });

      const result = await service.initiatePayment(mockUser as User, mockPlan, BillingCycle.YEARLY);

      expect(intasend.createPaymentLink).toHaveBeenCalledWith(expect.objectContaining({ amount: 250 }));
      expect(prisma.transaction.create).toHaveBeenCalled();
      expect(result).toBe('https://payment.url');
    });

    it('should throw an error if payment link creation fails', async () => {
      const mockUser: Partial<User> = { id: 'user-123', email: 'test@example.com', name: 'John Doe' };
      const mockPlan = { id: 'plan-abc', name: 'Basic', displayName: 'Basic Plan', priceMonthly: 10 };

      intasend.createPaymentLink.mockRejectedValue(new Error('API error'));

      await expect(service.initiatePayment(mockUser as User, mockPlan, BillingCycle.MONTHLY)).rejects.toThrow('Payment initiation failed');
    });
  });

  describe('handleWebhook', () => {
    const mockWebhookEvent = {
      id: 'event-123',
      invoiceId: 'inv-123',
      signature: 'valid-sig',
      payload: {},
      processedAt: null,
      createdAt: new Date(),
    };

    const mockTransaction = {
      id: 'txn-123',
      userId: 'user-123',
      planId: 'plan-abc',
      status: 'PENDING',
      billingCycle: BillingCycle.MONTHLY,
    };

    beforeEach(() => {
      // Mock the initial creation of the webhook event
      prisma.intaSendWebhookEvent.create.mockResolvedValue(mockWebhookEvent);
    });

    it('should process a completed payment webhook, update transaction, and activate subscription', async () => {
      const mockPayload = {
        invoice_id: 'inv-123',
        state: IntaSendWebhookState.COMPLETED,
        provider: IntaSendProvider.CARD,
        rawBody: '{}',
        signature: 'valid-sig',
      };

      intasend.verifyWebhookSignature.mockReturnValue(true);
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      prisma.transaction.update.mockResolvedValue({ ...mockTransaction, status: 'COMPLETED' });
      subscriptionService.activateSubscription.mockResolvedValue({});

      await service.handleWebhook(mockPayload as any);

      expect(prisma.intaSendWebhookEvent.create).toHaveBeenCalled();
      expect(intasend.verifyWebhookSignature).toHaveBeenCalledWith('{}', 'valid-sig');
      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({ where: { providerRef: 'inv-123' } });
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-123' },
        data: { status: 'COMPLETED' },
      });
      expect(subscriptionService.activateSubscription).toHaveBeenCalledWith(
        'user-123',
        'plan-abc',
        'txn-123',
        BillingCycle.MONTHLY,
      );
      expect(prisma.intaSendWebhookEvent.update).toHaveBeenCalledWith({
        where: { id: 'event-123' },
        data: { processedAt: expect.any(Date) },
      });
    });

    it('should not throw error for invalid signature but log warning', async () => {
      const mockPayload = { 
        invoice_id: 'inv-invalid', 
        signature: 'invalid-sig',
        rawBody: '{}',
      };
      
      intasend.verifyWebhookSignature.mockReturnValue(false);

      // This should not throw in the new implementation
      await expect(service.handleWebhook(mockPayload as any)).resolves.not.toThrow();
      
      expect(prisma.intaSendWebhookEvent.create).toHaveBeenCalled();
      expect(subscriptionService.activateSubscription).not.toHaveBeenCalled();
    });

    it('should handle PAID status and activate subscription', async () => {
      const mockPayload = {
        invoice_id: 'inv-123',
        state: 'PAID', // IntaSend might use PAID instead of COMPLETED
        provider: IntaSendProvider.CARD,
        rawBody: '{}',
        signature: 'valid-sig',
      };

      intasend.verifyWebhookSignature.mockReturnValue(true);
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      prisma.transaction.update.mockResolvedValue({ ...mockTransaction, status: 'COMPLETED' });
      subscriptionService.activateSubscription.mockResolvedValue({});

      await service.handleWebhook(mockPayload as any);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-123' },
        data: { status: 'COMPLETED' },
      });
      expect(subscriptionService.activateSubscription).toHaveBeenCalled();
    });

    it('should handle failed payment webhook without activating subscription', async () => {
      const mockPayload = {
        invoice_id: 'inv-123',
        state: IntaSendWebhookState.FAILED,
        provider: IntaSendProvider.CARD,
        rawBody: '{}',
        signature: 'valid-sig',
      };

      intasend.verifyWebhookSignature.mockReturnValue(true);
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      prisma.transaction.update.mockResolvedValue({ ...mockTransaction, status: 'FAILED' });

      await service.handleWebhook(mockPayload as any);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-123' },
        data: { status: 'FAILED' },
      });
      expect(subscriptionService.activateSubscription).not.toHaveBeenCalled();
    });

    it('should persist webhook event for audit regardless of processing result', async () => {
      const mockPayload = {
        invoice_id: 'inv-audit-test',
        state: 'COMPLETED',
        signature: 'test-sig',
        rawBody: '{"test": "data"}',
      };

      intasend.verifyWebhookSignature.mockReturnValue(true);
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      prisma.transaction.update.mockResolvedValue({ ...mockTransaction, status: 'COMPLETED' });
      subscriptionService.activateSubscription.mockResolvedValue({});

      await service.handleWebhook(mockPayload as any);

      expect(prisma.intaSendWebhookEvent.create).toHaveBeenCalledWith({
        data: {
          invoiceId: 'inv-audit-test',
          signature: 'test-sig',
          payload: mockPayload,
        },
      });
      expect(prisma.intaSendWebhookEvent.update).toHaveBeenCalledWith({
        where: { id: 'event-123' },
        data: { processedAt: expect.any(Date) },
      });
    });

    it('should not throw error for invalid webhook signature but log warning', async () => {
      const mockPayload = { 
        invoice_id: 'inv-invalid', 
        signature: 'invalid-sig',
        rawBody: '{}',
      };
      
      intasend.verifyWebhookSignature.mockReturnValue(false);

      // This should not throw in the new implementation
      await expect(service.handleWebhook(mockPayload as any)).resolves.not.toThrow();
      
      expect(prisma.intaSendWebhookEvent.create).toHaveBeenCalled();
      expect(subscriptionService.activateSubscription).not.toHaveBeenCalled();
    });

    it('should not throw error if transaction is not found but log warning', async () => {
      const mockPayload = { 
        invoice_id: 'inv-404', 
        signature: 'valid-sig',
        rawBody: '{}',
      };
      
      intasend.verifyWebhookSignature.mockReturnValue(true);
      prisma.transaction.findFirst.mockResolvedValue(null);

      // This should not throw in the new implementation
      await expect(service.handleWebhook(mockPayload as any)).resolves.not.toThrow();
      
      expect(prisma.intaSendWebhookEvent.create).toHaveBeenCalled();
      expect(subscriptionService.activateSubscription).not.toHaveBeenCalled();
    });
  });
});

