import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import  prisma  from '@/lib/prisma';
import { getAuthenticatedUser, sanitizeUser } from '@/lib/authUtils';
import { updateUserProfileSchema } from '@/lib/schema/userSchema';
import { generalApiRateLimit } from '@/lib/rateLimit';

// GET /api/users/me - Get current user profile
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = generalApiRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          }
        }
      );
    }

    // Authenticate user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Get user with additional details
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        trialEndsAt: true,
        trialUsed: true,
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                displayName: true,
                maxProjects: true,
                maxKeywords: true,
                maxAnalysesPerMonth: true,
                maxReportsPerMonth: true,
                hasAdvancedReports: true,
                hasAPIAccess: true,
              }
            }
          },
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            domain: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            projects: true,
            transactions: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const response = {
      user: sanitizeUser(user),
      subscription: user.subscriptions[0] || null,
      stats: {
        projectCount: user._count.projects,
        transactionCount: user._count.transactions,
      }
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/me - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = generalApiRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          }
        }
      );
    }

    // Authenticate user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateUserProfileSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== authResult.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 409 }
        );
      }

      // If email is being changed, mark as unverified
      // In a real application, you would also send a verification email
      updateData.emailVerified = null as any;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: authResult.user.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        trialEndsAt: true,
        trialUsed: true,
      }
    });

    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        user: sanitizeUser(updatedUser)
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      }
    );

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
