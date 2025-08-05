import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/authUtils';
import { generalApiRateLimit } from '@/lib/rateLimit';
import { getBackendToken } from '@/lib/backend-token';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Request payload schema
const paymentInitiateSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY'], {
    message: 'Billing cycle must be MONTHLY or YEARLY'
  })
});

// TypeScript interface for the request payload
export interface PaymentInitiateRequest {
  planId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
}

// TypeScript interface for the response
export interface PaymentInitiateResponse {
  paymentUrl: string;
}

// POST /api/subscription/pay/initiate - Initiate payment for subscription plan
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

    const validationResult = paymentInitiateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { planId, billingCycle } = validationResult.data;

    // Generate backend token using the shared utility
    const backendToken = await getBackendToken(request);
    if (!backendToken) {
      return NextResponse.json(
        { error: 'Failed to generate backend authentication token' },
        { status: 401 }
      );
    }

    // Forward request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/v1/subscription/pay/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
      body: JSON.stringify({
        planId,
        billingCycle
      })
    });

    // Handle backend response
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Payment initiation failed' },
        { status: backendResponse.status }
      );
    }

    const responseData = await backendResponse.json();
    
    // Validate backend response structure
    if (!responseData.paymentUrl || typeof responseData.paymentUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid response from payment service' },
        { status: 502 }
      );
    }

    // Return successful response with payment URL
    return NextResponse.json(
      {
        paymentUrl: responseData.paymentUrl
      } as PaymentInitiateResponse,
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      }
    );

  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Re-export TypeScript types for use in other parts of the application
// export type { PaymentInitiateRequest, PaymentInitiateResponse };
