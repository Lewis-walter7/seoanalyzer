import { externalApi } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}


// Token storage utilities
export const tokenStorage = {
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },
  
  getRefreshToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  },
  
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser: (user: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Auth API functions
export const authApi = {
  // Register new user
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await externalApi.post<AuthResponse>('/auth/register', userData);
      
      // Store tokens and user data
      if (response.accessToken && response.refreshToken) {
        tokenStorage.setTokens(response.accessToken, response.refreshToken);
        tokenStorage.setUser(response.user);
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await externalApi.post<AuthResponse>('/auth/login', credentials);
      
      // Store tokens and user data
      if (response.accessToken && response.refreshToken) {
        tokenStorage.setTokens(response.accessToken, response.refreshToken);
        tokenStorage.setUser(response.user);
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await externalApi.post<AuthResponse>('/auth/refresh', { refreshToken });
      
      // Update stored tokens
      if (response.accessToken) {
        tokenStorage.setTokens(response.accessToken, response.refreshToken || refreshToken);
        tokenStorage.setUser(response.user);
      }
      
      return response;
    } catch (error: any) {
      // If refresh fails, clear tokens
      tokenStorage.clearTokens();
      throw new Error(error.message || 'Token refresh failed');
    }
  },

  // Logout
  logout: async () => {
    const accessToken = tokenStorage.getAccessToken();
    
    try {
      if (accessToken) {
        await externalApi.post('/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      }
    } catch (error) {
      // Log error but still clear tokens
      console.error('Logout API call failed:', error);
    } finally {
      tokenStorage.clearTokens();
    }
  },

  // Get current user
  getCurrentUser: () => {
    return tokenStorage.getUser();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const accessToken = tokenStorage.getAccessToken();
    const user = tokenStorage.getUser();
    return !!(accessToken && user);
  }
};

// Backward compatibility
export const registerUser = authApi.register;
