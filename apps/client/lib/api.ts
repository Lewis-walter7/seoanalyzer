import { tokenStorage, authApi } from './auth-client';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Enhanced fetch wrapper with authentication and error handling
export class ApiClient {
  private baseURL: string;
  private useTokenAuth: boolean;

  constructor(baseURL: string = API_BASE_URL, useTokenAuth: boolean = false) {
    this.baseURL = baseURL;
    this.useTokenAuth = useTokenAuth;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.useTokenAuth) {
      // Use token-based authentication for backend calls
      const accessToken = tokenStorage.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnUnauthorized: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();

    const config: RequestInit = {
      credentials: 'include',
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized for token-based auth
      if (response.status === 401 && this.useTokenAuth && retryOnUnauthorized) {
        try {
          // Try to refresh the token
          await authApi.refreshToken();
          // Retry the request with the new token
          return this.request<T>(endpoint, options, false);
        } catch (refreshError) {
          // If refresh fails, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired. Please log in again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Default instances
export const externalApi = new ApiClient(API_BASE_URL, true); // For NestJS backend with token auth
export const internalApi = new ApiClient(API_BASE_URL, true); // For Next.js API routes without token auth

// Convenience functions for common operations
export const api = {
  // External API (NestJS backend)
  external: externalApi,
  
  // Internal API (Next.js API routes)
  internal: internalApi,

  // Quick methods that automatically choose the right client
  async getSubscription() {
    return internalApi.get('/subscription/me');
  },

  async getProjects() {
    try {
      const result = await externalApi.get('/v1/projects');
      return result;
    } catch (error) {
      throw error;
    }
  },

  async createProject(data: { name: string; url: string; description?: string, targetKeywords?: string[], competitors?: string[] }) {
    return externalApi.post('/v1/projects', data);
  },

  async deleteProject(id: string) {
    return internalApi.delete(`/projects/${id}`);
  },

  // Backend API methods (NestJS backend)
  // Projects
  async getBackendProjects() {
    return externalApi.get('/v1/projects');
  },

  async createBackendProject(data: { name: string; url: string; description?: string, targetKeywords?: string[], competitors?: string[] }) {
    return externalApi.post('/v1/projects', data);
  },

  async getBackendProject(id: string) {
    return externalApi.get(`/v1/projects/${id}`);
  },

  async updateBackendProject(id: string, data: any) {
    return externalApi.put(`/projects/${id}`, data);
  },

  async deleteBackendProject(id: string) {
    return externalApi.delete(`/projects/${id}`);
  },

  // Subscriptions
  async getBackendSubscription() {
    return externalApi.get('/subscription/me');
  },

  async getSubscriptionPlans() {
    return externalApi.get('/subscription/plans');
  },

  async createSubscription(planId: string) {
    return externalApi.post('/subscription', { planId });
  },

  async cancelSubscription() {
    return externalApi.delete('/subscription/me');
  },

  // General external API methods
  async getExternalData(endpoint: string) {
    return externalApi.get(endpoint);
  },

  async postExternalData(endpoint: string, data: any) {
    return externalApi.post(endpoint, data);
  },
};

// Enhanced fetch helper for backward compatibility
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  user?: { id?: string; email?: string }
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (user) {
    const token = user.id || user.email;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });
};

// Type definitions for common API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  domain?: string;
  onPageScore?: string;
  problems?: string;
  backlinks?: string;
  crawlStatus?: string;
  lastCrawl?: string;
  pages?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  plan?: {
    id: string;
    name: string;
    maxProjects: number;
    price: number;
  };
}

export default api;
