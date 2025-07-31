import { NextRequest } from 'next/server';
import { getJWTToken } from '@/lib/jwt';
import prisma from './prisma';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export interface AdminAuthResult extends AuthResult {
  isAdmin?: boolean;
}

// Get authenticated user from JWT token
export async function getAuthenticatedUser(req?: NextRequest): Promise<AuthResult> {
  try {
    const token = getJWTToken(req);
    
    if (!token) {
      return {
        success: false,
        error: 'Unauthorized - No token found'
      };
    }

    // You would typically verify the JWT token here and decode the user info
    // For now, we'll return a simplified version
    // In a real implementation, you'd verify the JWT and extract user data
    
    return {
      success: true,
      user: {
        // This would come from JWT payload after verification
        authenticated: true
      }
    };
  } catch (error) {
    console.debug('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

// Check if user is admin
export async function getAdminUser(req?: NextRequest): Promise<AdminAuthResult> {
  const authResult = await getAuthenticatedUser(req);
  
  if (!authResult.success) {
    return authResult;
  }

  if (!authResult.user?.isAdmin) {
    return {
      success: false,
      error: 'Forbidden - Admin access required',
      isAdmin: false
    };
  }

  return {
    success: true,
    user: authResult.user,
    isAdmin: true
  };
}

// Generate verification token
export async function generateVerificationToken(email: string, type: 'email_verification' | 'password_reset' = 'email_verification'): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  // Store verification token
  await prisma.verification.create({
    data: {
      identifier: `${type}:${email}`,
      value: token,
      expiresAt
    }
  });
  
  return token;
}

// Verify token
export async function verifyToken(token: string, email: string, type: 'email_verification' | 'password_reset' = 'email_verification'): Promise<boolean> {
  try {
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: `${type}:${email}`,
        value: token,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!verification) {
      return false;
    }

    // Delete the used token
    await prisma.verification.delete({
      where: {
        id: verification.id
      }
    });

    return true;
  } catch (error) {
    console.debug('Token verification error:', error);
    return false;
  }
}

// Clean expired verification tokens
export async function cleanExpiredTokens(): Promise<void> {
  try {
    await prisma.verification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning expired tokens:', error);
  }
}

// Transform user for API response (remove sensitive data)
export function sanitizeUser(user: any) {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}
