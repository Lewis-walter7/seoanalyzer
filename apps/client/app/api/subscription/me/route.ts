import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions  from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import { getBackendToken } from '@/lib/backend-token';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(new authOptions());
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // Generate backend token using the shared utility
    const backendToken = await getBackendToken(request);
    if (!backendToken) {
      return NextResponse.json(
        { error: 'Failed to generate backend authentication token' },
        { status: 401 }
      );
    }

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
