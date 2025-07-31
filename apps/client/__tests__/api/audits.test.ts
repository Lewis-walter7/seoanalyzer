import { createMocks } from 'node-mocks-http';
import handler from '../../app/api/projects/[id]/audits/route';

// Mock axios to control API responses
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock JWT token utility
jest.mock('../../lib/jwt', () => ({
  getJWTToken: jest.fn()
}));

import axios from 'axios';
import { getJWTToken } from '../../lib/jwt';

describe('API Route /api/projects/[id]/audits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when no token is provided', async () => {
      (getJWTToken as jest.Mock).mockReturnValue(null);

      const { req, res } = createMocks({
        method: 'GET',
      });

      // Mock the context parameter
      const context = { params: { id: '1' } };
      
      await handler.GET(req, context);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Unauthorized');
    });

    it('should return audits when authenticated successfully', async () => {
      const mockToken = 'valid-jwt-token';
      const mockAudits = [
        {
          id: 'audit-1',
          createdAt: '2024-01-01T00:00:00Z',
          pages: [
            {
              id: 'page-1',
              url: 'https://example.com',
              titleTag: 'Example Title',
              metaDescription: 'Example description',
              h1Count: 1,
              imgMissingAlt: 0,
              totalLinks: 10,
              performanceScore: 85,
              seoScore: 90,
              accessibilityScore: 80,
              internalLinksCount: 5,
              externalLinksCount: 5,
              brokenLinksCount: 0,
              loadTime: 2.5,
              pageSize: 1024,
              hasCanonical: true,
              isIndexable: true,
              crawledAt: '2024-01-01T00:00:00Z'
            }
          ]
        }
      ];

      (getJWTToken as jest.Mock).mockReturnValue(mockToken);
      mockedAxios.get.mockResolvedValue({
        data: { audits: mockAudits }
      });

      const { req } = createMocks({
        method: 'GET',
      });

      const context = { params: { id: '1' } };
      const response = await handler.GET(req, context);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3001/v1/projects/1/audits',
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );

      const responseData = await response.json();
      expect(responseData.audits).toEqual({ audits: mockAudits });
    });

    it('should return 404 when project is not found', async () => {
      const mockToken = 'valid-jwt-token';
      
      (getJWTToken as jest.Mock).mockReturnValue(mockToken);
      mockedAxios.get.mockRejectedValue({
        response: { status: 404 }
      });

      const { req } = createMocks({
        method: 'GET',
      });

      const context = { params: { id: 'non-existent' } };
      const response = await handler.GET(req, context);

      expect(response.status).toBe(404);
      const responseData = await response.json();
      expect(responseData.error).toBe('Project not found');
    });

    it('should return 401 when backend returns unauthorized', async () => {
      const mockToken = 'invalid-jwt-token';
      
      (getJWTToken as jest.Mock).mockReturnValue(mockToken);
      mockedAxios.get.mockRejectedValue({
        response: { status: 401 }
      });

      const { req } = createMocks({
        method: 'GET',
      });

      const context = { params: { id: '1' } };
      const response = await handler.GET(req, context);

      expect(response.status).toBe(401);
      const responseData = await response.json();
      expect(responseData.error).toBe('Unauthorized');
    });

    it('should return 500 for other errors', async () => {
      const mockToken = 'valid-jwt-token';
      
      (getJWTToken as jest.Mock).mockReturnValue(mockToken);
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const { req } = createMocks({
        method: 'GET',
      });

      const context = { params: { id: '1' } };
      const response = await handler.GET(req, context);

      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData.error).toBe('Internal server error');
    });
  });

  describe('POST', () => {
    it('should create audit when authenticated', async () => {
      const mockToken = 'valid-jwt-token';
      const mockAuditData = { maxPages: 10, maxDepth: 2 };
      const mockCreatedAudit = {
        id: 'new-audit-1',
        status: 'QUEUED',
        createdAt: '2024-01-01T00:00:00Z'
      };

      (getJWTToken as jest.Mock).mockReturnValue(mockToken);
      mockedAxios.post.mockResolvedValue({
        data: mockCreatedAudit
      });

      const { req } = createMocks({
        method: 'POST',
        body: mockAuditData,
      });

      const context = { params: { id: '1' } };
      const response = await handler.POST(req, context);

      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData.audit).toEqual(mockCreatedAudit);
    });

    it('should return 400 for validation errors', async () => {
      const mockToken = 'valid-jwt-token';
      
      (getJWTToken as jest.Mock).mockReturnValue(mockToken);
      mockedAxios.post.mockRejectedValue({
        response: { 
          status: 400,
          data: { message: 'Invalid request data' }
        }
      });

      const { req } = createMocks({
        method: 'POST',
        body: { invalidField: 'value' },
      });

      const context = { params: { id: '1' } };
      const response = await handler.POST(req, context);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Validation failed');
      expect(responseData.message).toBe('Invalid request data');
    });
  });
});
