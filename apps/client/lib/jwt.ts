import { NextRequest } from "next/server";

/**
 * Get JWT token from cookies
 */
export function getJWTToken(req?: NextRequest): string | null {
  try {
    if (typeof window !== 'undefined') {
      // Client-side: get from localStorage or cookies
      return localStorage.getItem('accessToken') || null;
    } else if (req) {
      // Server-side: get from request cookies
      const token = req.cookies.get('accessToken');
      return token ? token.value : null;
    }
    return null;
  } catch (error) {
    console.error('Error getting JWT token:', error);
    return null;
  }
}

/**
 * Set JWT token in storage
 */
export function setJWTToken(token: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      // Also set in cookie for server-side access
      document.cookie = `accessToken=${token}; path=/; max-age=${15 * 60}`; // 15 minutes
    }
  } catch (error) {
    console.error('Error setting JWT token:', error);
  }
}

/**
 * Set refresh token in storage
 */
export function setRefreshToken(token: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
      // Set refresh token in httpOnly cookie via API call
      document.cookie = `refreshToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    }
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}

/**
 * Clear all auth tokens
 */
export function clearAuthTokens(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Clear cookies
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    }
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
}
