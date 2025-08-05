import { NextRequest, NextResponse } from 'next/server';

interface RankTrackerRequest {
  domain: string;
  keywords: string[];
  searchEngine: 'google' | 'bing' | 'yahoo';
}

interface RankTrackerResult {
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  change: number;
  url?: string;
  searchEngine: string;
  lastChecked: string;
}

interface RankTrackerResponse {
  domain: string;
  searchEngine: string;
  results: RankTrackerResult[];
  totalKeywords: number;
  averagePosition: number;
  positionsImproved: number;
  positionsDeclined: number;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      keyword: string;
    }[];
  };
}

// Mock historical data generator
function generateHistoricalData(keyword: string, currentPosition: number): number[] {
  const dataPoints = 7; // Last 7 days
  const data: number[] = [];
  let position = currentPosition + Math.floor(Math.random() * 10) - 5; // Start with some variation
  
  for (let i = 0; i < dataPoints; i++) {
    // Add some random variation but trend towards current position
    const variation = Math.floor(Math.random() * 6) - 3; // -3 to +3
    position = Math.max(1, Math.min(100, position + variation));
    data.push(position);
  }
  
  // Ensure the last position matches the current position
  data[dataPoints - 1] = currentPosition;
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body: RankTrackerRequest = await request.json();
    
    // Validate request
    if (!body.domain || !body.keywords || !Array.isArray(body.keywords) || body.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Domain and keywords are required.' },
        { status: 400 }
      );
    }

    // Validate domain format
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlPattern.test(body.domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format. Please provide a valid URL.' },
        { status: 400 }
      );
    }

    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock results
    const results: RankTrackerResult[] = body.keywords.map(keyword => {
      const currentPosition = Math.floor(Math.random() * 100) + 1;
      const previousPosition = Math.floor(Math.random() * 100) + 1;
      const change = previousPosition - currentPosition; // Positive means improvement
      
      return {
        keyword: keyword.trim(),
        currentPosition,
        previousPosition,
        change,
        url: `${body.domain.replace(/\/$/, '')}/page-for-${keyword.toLowerCase().replace(/\s+/g, '-')}`,
        searchEngine: body.searchEngine,
        lastChecked: new Date().toISOString(),
      };
    });

    // Calculate summary statistics
    const totalKeywords = results.length;
    const averagePosition = Math.round(
      results.reduce((sum, result) => sum + result.currentPosition, 0) / totalKeywords
    );
    const positionsImproved = results.filter(r => r.change > 0).length;
    const positionsDeclined = results.filter(r => r.change < 0).length;

    // Generate chart data for position history
    const labels = ['7 days ago', '6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Today'];
    const chartData = {
      labels,
      datasets: results.slice(0, 5).map(result => ({ // Limit to first 5 keywords for chart
        label: result.keyword,
        data: generateHistoricalData(result.keyword, result.currentPosition),
        keyword: result.keyword,
      })),
    };

    const response: RankTrackerResponse = {
      domain: body.domain,
      searchEngine: body.searchEngine,
      results,
      totalKeywords,
      averagePosition,
      positionsImproved,
      positionsDeclined,
      chartData,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Rank tracker API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
