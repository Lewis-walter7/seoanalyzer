import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import  prisma  from '@/lib/prisma';
import { getAdminUser, sanitizeUser } from '@/lib/authUtils';
import { updateUserSchema } from '@/lib/schema/userSchema';
import { adminApiRateLimit } from '@/lib/rateLimit';

// GET /api/admin/users/[id] - Get specific user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimitResult = adminApiRateLimit(request);
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

    // Check admin authorization
    const authResult = await getAdminUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error?.includes('Forbidden') ? 403 : 401 }
      );
    }

    const { id } = params;

    // Get user with detailed information
    const user = await prisma.user.findUnique({
      where: { id },
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
        intasendCustomerId: true,
        subscriptions: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                displayName: true,
                priceMonthly: true,
                priceYearly: true,
              }
            }
          },
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
        transactions: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            projects: true,
            subscriptions: true,
            transactions: true,
            sessions: true,
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
      stats: user._count,
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update specific user
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimitResult = adminApiRateLimit(request);
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

    // Check admin authorization
    const authResult = await getAdminUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error?.includes('Forbidden') ? 403 : 401 }
      );
    }

    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateUserSchema.safeParse(body);
    
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
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: updateData.email }
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const dataToUpdate: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Hash password if provided
    if (updateData.password) {
      dataToUpdate.password = await bcrypt.hash(updateData.password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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
        message: 'User updated successfully',
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
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete specific user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimitResult = adminApiRateLimit(request);
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

    // Check admin authorization
    const authResult = await getAdminUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error?.includes('Forbidden') ? 403 : 401 }
      );
    }

    const { id } = params;

    // Prevent admin from deleting themselves
    if (id === authResult.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        name: true, 
        email: true,
        _count: {
          select: {
            projects: true,
            subscriptions: true,
            transactions: true,
          }
        }
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for active subscriptions or transactions
    if (existingUser._count.subscriptions > 0 || existingUser._count.transactions > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete user with active subscriptions or transactions',
          details: {
            subscriptions: existingUser._count.subscriptions,
            transactions: existingUser._count.transactions,
            projects: existingUser._count.projects,
          }
        },
        { status: 400 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json(
      { 
        message: 'User deleted successfully',
        deletedUser: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        }
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
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
