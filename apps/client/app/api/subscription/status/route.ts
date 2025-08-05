import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authUtils';
import { generalApiRateLimit } from '@/lib/rateLimit';
import { getBackendToken } from '@/lib/backend-token';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// GET /api/subscription/status?invoice_id=... - Get subscription status by invoice ID
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

    // Get invoice_id from query parameters
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoice_id');

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
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

    // Forward request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/v1/subscription/status?invoice_id=${encodeURIComponent(invoiceId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
    });

    // Handle backend response
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Failed to fetch subscription status' },
        { status: backendResponse.status }
      );
    }

    const responseData = await backendResponse.json();

    // Return successful response
    return NextResponse.json(
      responseData,
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      }
    );

  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
