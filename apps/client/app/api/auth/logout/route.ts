import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getJWTToken, getRefreshToken } from '@/lib/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const accessToken = getJWTToken(request);
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Call backend logout if we have tokens
    if (accessToken || refreshToken) {
      try {
        await axios.post(`${API_BASE_URL}/v1/auth/logout`, {
          accessToken,
          refreshToken,
        });
      } catch (error) {
        // Continue with logout even if backend call fails
        console.error('Backend logout error:', error);
      }
    }

    // Create response
    const res = NextResponse.json({ message: 'Logged out successfully' });

    // Clear cookies
    res.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    res.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return res;
  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Even if there's an error, we should clear the cookies
    const res = NextResponse.json({ message: 'Logged out successfully' });
    
    res.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    res.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return res;
  }
}
