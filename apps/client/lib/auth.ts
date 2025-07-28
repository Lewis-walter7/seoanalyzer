import axios from 'axios';
import { setJWTToken, setRefreshToken, clearAuthTokens, getJWTToken, getRefreshToken } from './jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExp: Date;
  refreshTokenExp: Date;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

// Create axios instance with interceptors
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  timeout: 10000,
});

// Request interceptor to add auth token
authApi.interceptors.request.use(
  (config) => {
    const token = getJWTToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          setJWTToken(accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearAuthTokens();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/login', credentials);
      const authData: AuthResponse = response.data;
      
      // Store tokens
      setJWTToken(authData.accessToken);
      setRefreshToken(authData.refreshToken);
      
      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(authData.user));
      }
      
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }
  
  /**
   * Register new user
   */
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/register', credentials);
      const authData: AuthResponse = response.data;
      
      // Store tokens
      setJWTToken(authData.accessToken);
      setRefreshToken(authData.refreshToken);
      
      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(authData.user));
      }
      
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }
  
  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      const accessToken = getJWTToken();
      const refreshToken = getRefreshToken();
      
      if (accessToken || refreshToken) {
        await authApi.post('/logout', {
          accessToken,
          refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthTokens();
    }
  }
  
  /**
   * Get current user from storage
   */
  static getCurrentUser(): User | null {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = getJWTToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }
  
  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return null;
      }
      
      const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
        refreshToken,
      });
      
      const { accessToken } = response.data;
      setJWTToken(accessToken);
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthTokens();
      return null;
    }
  }
}

// Export default instance
export default AuthService;
