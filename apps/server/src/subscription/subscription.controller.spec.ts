import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PaymentService } from './payment.service';
import { IntaSendWebhookDto } from './dto/subscription.dto';
import { Logger } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

// Mock services
const mockSubscriptionService = {
  getAllPlans: jest.fn(),
  getPlanById: jest.fn(),
  getUserById: jest.fn(),
  getCurrentPlanDetails: jest.fn(),
  recordUsage: jest.fn(),
  activateSubscription: jest.fn(),
};

const mockPaymentService = {
  initiatePayment: jest.fn(),
  handleWebhook: jest.fn(),
};

// Helper function to create a mocked IntaSend signature
function createMockedSignature(payload: any, secret = 'test-webhook-secret'): string {
  const bodyString = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(bodyString)
    .digest('base64');
}

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let paymentService: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: mockSubscriptionService,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    paymentService = module.get<PaymentService>(PaymentService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    const mockWebhookDto: IntaSendWebhookDto = {
      event: 'collection.payment.complete',
      invoice_id: 'inv-test-123',
      provider: 'CARD',
      state: 'COMPLETED',
      value: 2999,
      account: 'test-account',
      api_ref: 'sub_plan_user_123',
    };

    it('should handle webhook with valid signature and return HTTP 200 immediately', async () => {
      // Arrange
      const mockSignature = createMockedSignature(mockWebhookDto);
      const mockRequest = {
        headers: {
          'x-intasend-signature': mockSignature,
        },
        body: mockWebhookDto,
        rawBody: JSON.stringify(mockWebhookDto),
      } as unknown as Request;

      mockPaymentService.handleWebhook.mockResolvedValue(undefined);

      // Act
      const result = await controller.handleWebhook(mockWebhookDto, mockRequest);

      // Assert
      expect(result).toEqual({ status: 'received' });
      
      // Give async processing time to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockPaymentService.handleWebhook).toHaveBeenCalledWith({
        ...mockWebhookDto,
        rawBody: JSON.stringify(mockWebhookDto),
        signature: mockSignature,
      });
    });

    it('should handle webhook with missing signature gracefully', async () => {
      // Arrange
      const mockRequest = {
        headers: {},
        body: mockWebhookDto,
        rawBody: JSON.stringify(mockWebhookDto),
      } as unknown as Request;

      // Act
      const result = await controller.handleWebhook(mockWebhookDto, mockRequest);

      // Assert
      expect(result).toEqual({ status: 'received' });
      
      // Give async processing time to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Webhook handler should not be called due to missing signature
      expect(mockPaymentService.handleWebhook).not.toHaveBeenCalled();
    });

    it('should return HTTP 200 even when webhook processing fails', async () => {
      // Arrange
      const mockSignature = createMockedSignature(mockWebhookDto);
      const mockRequest = {
        headers: {
          'x-intasend-signature': mockSignature,
        },
        body: mockWebhookDto,
        rawBody: JSON.stringify(mockWebhookDto),
      } as unknown as Request;

      mockPaymentService.handleWebhook.mockRejectedValue(new Error('Processing failed'));

      // Act
      const result = await controller.handleWebhook(mockWebhookDto, mockRequest);

      // Assert
      expect(result).toEqual({ status: 'received' });
      
      // Give async processing time to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockPaymentService.handleWebhook).toHaveBeenCalled();
    });

    it('should handle PAID status webhook', async () => {
      // Arrange
      const paidWebhookDto = {
        ...mockWebhookDto,
        state: 'PAID', // Some providers might use PAID instead of COMPLETED
      };
      
      const mockSignature = createMockedSignature(paidWebhookDto);
      const mockRequest = {
        headers: {
          'x-intasend-signature': mockSignature,
        },
        body: paidWebhookDto,
        rawBody: JSON.stringify(paidWebhookDto),
      } as unknown as Request;

      mockPaymentService.handleWebhook.mockResolvedValue(undefined);

      // Act
      const result = await controller.handleWebhook(paidWebhookDto, mockRequest);

      // Assert
      expect(result).toEqual({ status: 'received' });
      
      // Give async processing time to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockPaymentService.handleWebhook).toHaveBeenCalledWith({
        ...paidWebhookDto,
        rawBody: JSON.stringify(paidWebhookDto),
        signature: mockSignature,
      });
    });

    it('should handle webhook with complex payload structure', async () => {
      // Arrange
      const complexWebhookDto = {
        ...mockWebhookDto,
        customer: {
          customer_id: 'cust-123',
          phone_number: '+254700000000',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
        },
        charges: '30.00',
        net_amount: 2969,
        currency: 'USD',
        failed_reason: null,
        failed_code: null,
        created_at: '2023-12-07T10:30:00Z',
        updated_at: '2023-12-07T10:35:00Z',
      };
      
      const mockSignature = createMockedSignature(complexWebhookDto);
      const mockRequest = {
        headers: {
          'x-intasend-signature': mockSignature,
        },
        body: complexWebhookDto,
        rawBody: JSON.stringify(complexWebhookDto),
      } as unknown as Request;

      mockPaymentService.handleWebhook.mockResolvedValue(undefined);

      // Act
      const result = await controller.handleWebhook(complexWebhookDto, mockRequest);

      // Assert
      expect(result).toEqual({ status: 'received' });
      
      // Give async processing time to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockPaymentService.handleWebhook).toHaveBeenCalledWith({
        ...complexWebhookDto,
        rawBody: JSON.stringify(complexWebhookDto),
        signature: mockSignature,
      });
    });

    it('should process webhook asynchronously without blocking response', async () => {
      // Arrange
      const mockSignature = createMockedSignature(mockWebhookDto);
      const mockRequest = {
        headers: {
          'x-intasend-signature': mockSignature,
        },
        body: mockWebhookDto,
        rawBody: JSON.stringify(mockWebhookDto),
      } as unknown as Request;

      // Mock a slow webhook processing
      mockPaymentService.handleWebhook.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      // Act
      const startTime = Date.now();
      const result = await controller.handleWebhook(mockWebhookDto, mockRequest);
      const responseTime = Date.now() - startTime;

      // Assert
      expect(result).toEqual({ status: 'received' });
      // Response should be immediate (less than 50ms)
      expect(responseTime).toBeLessThan(50);
      
      // But webhook processing should still happen
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockPaymentService.handleWebhook).toHaveBeenCalled();
    });
  });
});
