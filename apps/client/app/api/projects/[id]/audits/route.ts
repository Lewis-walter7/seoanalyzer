import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getJWTToken } from '@/lib/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// GET /api/projects/[id]/audits - Get audits for a specific project
export async function GET(request: NextRequest, context: any) {
  const { id } = context.params;
  
  try {
    const token = getJWTToken(request);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await axios.get(`${API_BASE_URL}/v1/projects/${id}/audits`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json({ audits: response.data });
  } catch (error: any) {
    console.error('Error fetching project audits:', error);
    
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects/[id]/audits - Create a new audit for the project
export async function POST(request: NextRequest, context: any) {
  const { id } = context.params;
  
  try {
    const token = getJWTToken(request);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await axios.post(`${API_BASE_URL}/v1/projects/${id}/audits`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({ audit: response.data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project audit:', error);
    
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.response?.status === 400) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        message: error.response.data.message 
      }, { status: 400 });
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
