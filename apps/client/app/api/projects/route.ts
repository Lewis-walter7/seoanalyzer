import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getJWTToken } from '@/lib/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = getJWTToken(request);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await axios.get(`${API_BASE_URL}/v1/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json({ projects: response.data });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getJWTToken(request);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await axios.post(`${API_BASE_URL}/v1/projects`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({ project: response.data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.response?.status === 400) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        message: error.response.data.message 
      }, { status: 400 });
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json({ 
        error: 'Project limit reached', 
        message: error.response.data.message 
      }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
