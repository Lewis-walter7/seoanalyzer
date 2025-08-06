import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';
import { AuditResponse } from '@/app/project/[id]/auditresults/page';
import { tokenStorage, authApi } from './auth-client';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Error mapping interface
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

// Transform axios error to standardized format
const transformError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    const code = error.code;
    
    return {
      message,
      status,
      code,
      details: error.response?.data
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    details: error
  };
};

// Enhanced API client with axios
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private useTokenAuth: boolean;

  constructor(baseURL: string = API_BASE_URL, useTokenAuth: boolean = false, config?: CreateAxiosDefaults) {
    this.useTokenAuth = useTokenAuth;
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth token injection
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        if (this.useTokenAuth) {
          const accessToken = tokenStorage.getAccessToken();
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(transformError(error))
    );

    // Response interceptor for token refresh and error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 unauthorized with token refresh
        if (
          error.response?.status === 401 &&
          this.useTokenAuth &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          
          try {
            await authApi.refreshToken();
            const newToken = tokenStorage.getAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Redirect to login if refresh fails
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(transformError(new Error('Session expired. Please log in again.')));
          }
        }
        
        return Promise.reject(transformError(error));
      }
    );
  }

  // HTTP GET helper
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw error; // Error is already transformed by interceptor
    }
  }

  // HTTP POST helper
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // HTTP PUT helper
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // HTTP PATCH helper
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // HTTP DELETE helper
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get the underlying axios instance for advanced usage
  getInstance(): AxiosInstance {
    return this.axiosInstance;
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

  async getAuditData(projectId: string): Promise<AuditResponse> {
    return externalApi.get(`/v1/projects/${projectId}/audits`);
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
    return externalApi.get('/v1/subscription/me');
  },


  async createSubscription(planId: string) {
    return externalApi.post('/subscription', { planId });
  },

  async cancelSubscription() {
    return externalApi.delete('/subscription/me');
  },

  // Competitor Analysis methods
  async getTrafficAnalysis(projectId: string) {
    return externalApi.get(`/api/tools/competitor-analysis/traffic-analysis/${projectId}`);
  },

  async getKeywordGapAnalysis(projectId: string) {
    return externalApi.get(`/api/tools/competitor-analysis/keyword-gap-analysis/${projectId}`);
  },

  async getContentAnalysis(projectId: string) {
    return externalApi.get(`/api/tools/competitor-analysis/content-analysis/${projectId}`);
  },

  async getBacklinkComparison(projectId: string) {
    return externalApi.get(`/api/tools/competitor-analysis/backlink-comparison/${projectId}`);
  },

  async createCompetitorAnalysis(projectId: string) {
    return externalApi.post('/api/tools/competitor-analysis', { projectId });
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
