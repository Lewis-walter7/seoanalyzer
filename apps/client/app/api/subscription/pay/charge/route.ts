import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/authUtils';
import { generalApiRateLimit } from '@/lib/rateLimit';
import { getBackendToken } from '@/lib/backend-token';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Request payload schema
const cardChargeSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY'], {
    message: 'Billing cycle must be MONTHLY or YEARLY'
  }),
  card: z.object({
    number: z.string().min(13, 'Card number is required'),
    expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry must be in MM/YY format'),
    cvc: z.string().min(3, 'CVC is required'),
    holder: z.string().min(1, 'Cardholder name is required'),
  })
});

// TypeScript interface for the request payload
export interface CardChargeRequest {
  planId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  card: {
    number: string;
    expiry: string;
    cvc: string;
    holder: string;
  };
}

// TypeScript interface for the response
export interface CardChargeResponse {
  success: boolean;
  transactionId: string;
}

// POST /api/subscription/pay/charge - Process direct card charge
export async function POST(request: NextRequest) {
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
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const validationResult = cardChargeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { planId, billingCycle, card } = validationResult.data;

    // Generate backend token using the shared utility
    const backendToken = await getBackendToken(request);
    if (!backendToken) {
      return NextResponse.json(
        { error: 'Failed to generate backend authentication token' },
        { status: 401 }
      );
    }

    // Forward request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/v1/subscription/pay/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
      body: JSON.stringify({
        planId,
        billingCycle,
        card
      })
    });

    // Handle backend response
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Card charge failed' },
        { status: backendResponse.status }
      );
    }

    const responseData = await backendResponse.json();
    
    // Validate backend response structure
    if (!responseData.success || !responseData.transactionId) {
      return NextResponse.json(
        { error: 'Invalid response from payment service' },
        { status: 502 }
      );
    }

    // Return successful response
    return NextResponse.json(
      {
        success: responseData.success,
        transactionId: responseData.transactionId
      } as CardChargeResponse,
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      }
    );

  } catch (error) {
    console.error('Error processing card charge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
