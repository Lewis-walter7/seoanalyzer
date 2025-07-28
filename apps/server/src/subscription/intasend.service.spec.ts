// Mock IntaSend module first
const mockCollection = {
  create: jest.fn(),
  verify_signature: jest.fn(),
  status: jest.fn(),
};

const mockIntaSendInstance = {
  collection: jest.fn(() => mockCollection),
};

const MockIntaSend = jest.fn().mockImplementation(() => mockIntaSendInstance);

jest.mock('intasend-node', () => MockIntaSend);

import { Test, TestingModule } from '@nestjs/testing';
import { IntaSendService, PaymentLinkPayload, PaymentLinkResponse } from './intasend.service';

describe('IntaSendService', () => {
  let service: IntaSendService;
  let mockIntaSendInstance: any;
  let mockCollectionInstance: any;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntaSendService],
    }).compile();

    service = module.get<IntaSendService>(IntaSendService);
    mockIntaSendInstance = service.getClient();
    mockCollectionInstance = mockIntaSendInstance.collection();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyWebhookSignature', () => {
    it('should return true for valid signature', () => {
      const rawBody = '{"invoice_id": "test_invoice"}';
      const signature = 'valid_signature';
      
      mockCollection.verify_signature.mockReturnValue(true);

      const result = service.verifyWebhookSignature(rawBody, signature);
      
      expect(result).toBe(true);
      expect(mockCollection.verify_signature).toHaveBeenCalledWith(
        rawBody,
        signature,
        process.env.INTASEND_WEBHOOK_SECRET
      );
    });

    it('should return false for invalid signature', () => {
      const rawBody = '{"invoice_id": "test_invoice"}';
      const signature = 'invalid_signature';
      
      mockCollection.verify_signature.mockReturnValue(false);

      const result = service.verifyWebhookSignature(rawBody, signature);
      
      expect(result).toBe(false);
    });

    it('should return true if webhook secret is not configured', () => {
      const originalSecret = process.env.INTASEND_WEBHOOK_SECRET;
      delete process.env.INTASEND_WEBHOOK_SECRET;
      
      const rawBody = '{"invoice_id": "test_invoice"}';
      const signature = 'any_signature';

      const result = service.verifyWebhookSignature(rawBody, signature);
      
      expect(result).toBe(true);
      
      // Restore original value
      process.env.INTASEND_WEBHOOK_SECRET = originalSecret;
    });

    it('should handle Buffer input', () => {
      const rawBody = Buffer.from('{"invoice_id": "test_invoice"}');
      const signature = 'valid_signature';
      
      mockCollection.verify_signature.mockReturnValue(true);

      const result = service.verifyWebhookSignature(rawBody, signature);
      
      expect(result).toBe(true);
      expect(mockCollection.verify_signature).toHaveBeenCalledWith(
        '{"invoice_id": "test_invoice"}',
        signature,
        process.env.INTASEND_WEBHOOK_SECRET
      );
    });

    it('should return false on error', () => {
      const rawBody = '{"invoice_id": "test_invoice"}';
      const signature = 'valid_signature';
      
      mockCollection.verify_signature.mockImplementation(() => {
        throw new Error('Verification error');
      });

      const result = service.verifyWebhookSignature(rawBody, signature);
      
      expect(result).toBe(false);
    });
  });

  describe('createPaymentLink', () => {
    it('should create a valid payment link', async () => {
      const payload: PaymentLinkPayload = {
        amount: 1000,
        currency: 'USD',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        api_ref: 'test_ref_123',
        comment: 'Test payment',
        redirect_url: 'https://example.com/success',
        webhook_url: 'https://example.com/webhook',
      };

      const mockResponse: PaymentLinkResponse = {
        id: 'link_id_123',
        url: 'https://sandbox.intasend.com/pay/link_id_123',
        customer: {
          id: 'customer_id_123',
          phone_number: '+1234567890',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
        },
        created_at: '2023-12-01T10:00:00Z',
        updated_at: '2023-12-01T10:00:00Z',
      };

      mockCollection.create.mockResolvedValue(mockResponse);

      const result = await service.createPaymentLink(payload);
      
      expect(result).toEqual(mockResponse);
      expect(mockCollection.create).toHaveBeenCalledWith(payload);
    });

    it('should handle payment link creation errors', async () => {
      const payload: PaymentLinkPayload = {
        amount: 1000,
        currency: 'USD',
        email: 'test@example.com',
      };

      mockCollection.create.mockRejectedValue(new Error('Payment link creation failed'));

      await expect(service.createPaymentLink(payload)).rejects.toThrow(
        'Failed to create payment link: Payment link creation failed'
      );
    });
  });

  describe('verifyTransaction', () => {
    it('should verify transaction successfully', async () => {
      const txnId = 'txn_123';
      const mockResponse = {
        invoice: {
          id: 'invoice_123',
          state: 'COMPLETED',
          provider: 'MPESA',
          charges: '30',
          net_amount: 970,
          currency: 'KES',
          value: '1000',
          account: 'test_account',
          api_ref: 'test_ref_123',
          mpesa_reference: 'ABC123DEF',
          host: 'sandbox.intasend.com',
          retry_count: 0,
          failed_reason: '',
          failed_code: '',
          failed_code_link: '',
          created_at: '2023-12-01T10:00:00Z',
          updated_at: '2023-12-01T10:05:00Z',
        },
        customer: {
          customer_id: 'customer_123',
          phone_number: '+254712345678',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          country: 'KE',
          zipcode: '00100',
          provider: 'MPESA',
          created_at: '2023-12-01T09:00:00Z',
          updated_at: '2023-12-01T09:00:00Z',
        },
      };

      mockCollection.status.mockResolvedValue(mockResponse);

      const result = await service.verifyTransaction(txnId);
      
      expect(result).toEqual(mockResponse);
      expect(mockCollection.status).toHaveBeenCalledWith(txnId);
    });

    it('should handle transaction verification errors', async () => {
      const txnId = 'txn_123';
      
      mockCollection.status.mockRejectedValue(new Error('Transaction not found'));

      await expect(service.verifyTransaction(txnId)).rejects.toThrow(
        'Failed to verify transaction: Transaction not found'
      );
    });
  });

  describe('health check', () => {
    it('should return true for successful health check', async () => {
      mockCollection.create.mockRejectedValue(new Error('Expected test error'));

      const result = await service.healthCheck();
      
      expect(result).toBe(true);
      expect(mockCollection.create).toHaveBeenCalledWith({
        amount: 1,
        currency: 'KES',
        email: 'test@example.com',
        api_ref: expect.stringContaining('health-check-'),
      });
    });

    it('should return false for failed health check', async () => {
      mockCollection.create.mockImplementation(() => {
        throw new Error('Authentication failed');
      });

      const result = await service.healthCheck();
      
      expect(result).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should return correct test mode status', () => {
      expect(service.isInTestMode()).toBe(true);
    });

    it('should return IntaSend client instance', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
      expect(typeof client.collection).toBe('function');
    });
  });
});
