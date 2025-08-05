import { NextRequest, NextResponse } from 'next/server';
import { getBackendToken } from '@/lib/backend-token';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Fetch plans from backend API
    const response = await fetch(`${BACKEND_API_URL}/v1/subscription/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: response.status }
      );
    }

    const plans = await response.json();

    return NextResponse.json(plans);

  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
