import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const response = await axios.post(`${API_BASE_URL}/v1/auth/login`, {
      email,
      password,
    });

    const authData = response.data;

    // Create response with auth data
    const res = NextResponse.json({
      user: authData.user,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      accessTokenExp: authData.accessTokenExp,
      refreshTokenExp: authData.refreshTokenExp,
    });

    // Set httpOnly cookies for security
    res.cookies.set('accessToken', authData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    res.cookies.set('refreshToken', authData.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return res;
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
