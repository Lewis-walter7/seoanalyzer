// Optional Axios configuration - install axios first: npm install axios
// This file provides an axios instance alternative to the fetch-based ApiClient

import { getSession } from 'next-auth/react';

// Note: Uncomment the following lines after installing axios
/*
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session?.user) {
        const token = session.user.id || session.user.email;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error getting session for axios request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe redirect to login
      console.error('Unauthorized request:', error);
      // window.location.href = '/login';
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Axios-based API client
export class AxiosApiClient {
  private client: AxiosInstance;

  constructor(client: AxiosInstance = axiosInstance) {
    this.client = client;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export configured instances
export const axiosApi = new AxiosApiClient(axiosInstance);
export default axiosInstance;
*/

// For now, export a placeholder until axios is installed
export const axiosApi = {
  get: () => Promise.reject(new Error('Axios not installed. Please run: npm install axios')),
  post: () => Promise.reject(new Error('Axios not installed. Please run: npm install axios')),
  put: () => Promise.reject(new Error('Axios not installed. Please run: npm install axios')),
  patch: () => Promise.reject(new Error('Axios not installed. Please run: npm install axios')),
  delete: () => Promise.reject(new Error('Axios not installed. Please run: npm install axios')),
};

export default null;
