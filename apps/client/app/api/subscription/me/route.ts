import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // Get the NextAuth JWT token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token not found' },
        { status: 401 }
      );
    }

    // Create a simple JWT-like token with user info for the backend
    // In production, you'd want to sign this properly
    const backendToken = Buffer.from(JSON.stringify({
      sub: token.sub || token.id,
      email: token.email,
      name: token.name,
      isAdmin: token.isAdmin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    })).toString('base64');

    // Fetch user subscription from backend API
    const response = await fetch(`${BACKEND_API_URL}/v1/subscription/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
    });

    if (response.status === 404) {
      // User has no subscription
      return NextResponse.json({ subscription: null });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch subscription details' },
        { status: response.status }
      );
    }

    const subscriptionDetails = await response.json();

    return NextResponse.json(subscriptionDetails);

  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
