import { NextRequest, NextResponse } from 'next/server';

interface LocalSeoRequest {
  name: string;
  address: string;
  phone: string;
  website: string;
}

interface CitationSource {
  source: string;
  name: string;
  address: string;
  phone: string;
  website?: string;
  consistency: number;
  status: 'consistent' | 'inconsistent' | 'missing';
}

interface LocalSeoResponse {
  businessInfo: {
    name: string;
    address: string;
    phone: string;
    website: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  citations: CitationSource[];
  overallConsistency: number;
  radarData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }>;
  };
  mapData: {
    center: { lat: number; lng: number };
    markers: Array<{
      position: { lat: number; lng: number };
      title: string;
      type: 'business' | 'citation';
    }>;
  };
}

// Mock geocoding function - in production, use Google Maps Geocoding API
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // In production, replace with actual Google Maps API call:
  // const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
  
  // Mock coordinates for demo purposes
  const mockCoordinates = {
    lat: 40.7128 + (Math.random() - 0.5) * 0.1,
    lng: -74.0060 + (Math.random() - 0.5) * 0.1,
  };
  
  return mockCoordinates;
}

// Validate NAP (Name, Address, Phone) fields
function validateNAP(data: LocalSeoRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Business name must be at least 2 characters long');
  }
  
  if (!data.address || data.address.trim().length < 10) {
    errors.push('Address must be complete and at least 10 characters long');
  }
  
  // Basic phone validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = data.phone.replace(/\D/g, '');
  if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
    errors.push('Phone number must be a valid format with at least 10 digits');
  }
  
  // Basic website validation
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  if (!urlRegex.test(data.website)) {
    errors.push('Website must be a valid URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Generate mock citation data
function generateMockCitations(businessInfo: LocalSeoRequest): CitationSource[] {
  const sources = [
    'Google My Business',
    'Yelp',
    'Facebook',
    'Yellow Pages',
    'Foursquare',
    'Bing Places',
    'Apple Maps',
    'TripAdvisor'
  ];
  
  return sources.map(source => {
    const consistency = Math.random();
    let status: 'consistent' | 'inconsistent' | 'missing';
    
    if (consistency > 0.8) {
      status = 'consistent';
    } else if (consistency > 0.4) {
      status = 'inconsistent';
    } else {
      status = 'missing';
    }
    
    // Generate slight variations for inconsistent data
    const nameVariation = status === 'inconsistent' ? businessInfo.name + ' LLC' : businessInfo.name;
    const phoneVariation = status === 'inconsistent' ? 
      businessInfo.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : 
      businessInfo.phone;
    
    return {
      source,
      name: status === 'missing' ? '' : nameVariation,
      address: status === 'missing' ? '' : businessInfo.address,
      phone: status === 'missing' ? '' : phoneVariation,
      website: status === 'missing' ? '' : businessInfo.website,
      consistency: Math.round(consistency * 100),
      status
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: LocalSeoRequest = await request.json();
    
    // Validate NAP fields
    const validation = validateNAP(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Geocode the address
    const coordinates = await geocodeAddress(body.address);
    
    // Generate mock citations
    const citations = generateMockCitations(body);
    
    // Calculate overall consistency
    const consistentCitations = citations.filter(c => c.status === 'consistent').length;
    const overallConsistency = Math.round((consistentCitations / citations.length) * 100);
    
    // Generate radar chart data
    const radarData = {
      labels: ['Online Reviews', 'Citation Consistency', 'Google Visibility', 'Local Rankings', 'Website Optimization'],
      datasets: [
        {
          label: 'Your Business',
          data: [
            Math.floor(Math.random() * 40) + 60, // Reviews: 60-100
            overallConsistency, // Citation consistency
            Math.floor(Math.random() * 30) + 70, // Google visibility: 70-100
            Math.floor(Math.random() * 40) + 50, // Local rankings: 50-90
            Math.floor(Math.random() * 35) + 65, // Website optimization: 65-100
          ],
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
        },
        {
          label: 'Industry Average',
          data: [55, 65, 60, 55, 70],
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          borderColor: 'rgba(156, 163, 175, 1)',
          borderWidth: 2,
        }
      ]
    };
    
    // Generate map data
    const mapData = {
      center: coordinates || { lat: 40.7128, lng: -74.0060 },
      markers: [
        {
          position: coordinates || { lat: 40.7128, lng: -74.0060 },
          title: `${body.name} (Your Business)`,
          type: 'business' as const
        },
        // Add some mock citation locations nearby
        ...citations.slice(0, 3).map((citation, index) => ({
          position: {
            lat: (coordinates?.lat || 40.7128) + (Math.random() - 0.5) * 0.01,
            lng: (coordinates?.lng || -74.0060) + (Math.random() - 0.5) * 0.01,
          },
          title: `${citation.source} Citation`,
          type: 'citation' as const
        }))
      ]
    };
    
    const response: LocalSeoResponse = {
      businessInfo: {
        ...body,
        coordinates
      },
      citations,
      overallConsistency,
      radarData,
      mapData
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Local SEO API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
