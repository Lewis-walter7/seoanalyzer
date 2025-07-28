import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import  prisma  from '@/lib/prisma';
import { getAdminUser, sanitizeUser } from '@/lib/authUtils';
import { createUserSchema, userListQuerySchema } from '@/lib/schema/userSchema';
import { adminApiRateLimit } from '@/lib/rateLimit';

// GET /api/admin/users - List users with pagination and filtering
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = userListQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { page, limit, search, isAdmin, emailVerified, sortBy, sortOrder } = validationResult.data;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (isAdmin === 'true') {
      where.isAdmin = true;
    } else if (isAdmin === 'false') {
      where.isAdmin = false;
    }
    
    if (emailVerified === 'true') {
      where.emailVerified = { not: null };
    } else if (emailVerified === 'false') {
      where.emailVerified = null;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
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
          _count: {
            select: {
              projects: true,
              subscriptions: true,
              transactions: true,
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      users: users.map(sanitizeUser),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
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
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const userData = validationResult.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email address is already in use' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        isAdmin: userData.isAdmin || false,
        emailVerified: userData.emailVerified,
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
        message: 'User created successfully',
        user: sanitizeUser(newUser)
      },
      { 
        status: 201,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      }
    );

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
