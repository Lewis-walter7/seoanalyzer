import { NextRequest, NextResponse } from 'next/server';

interface PageSpeedRequest {
  url: string;
  device: 'mobile' | 'desktop';
}

interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

interface PerformanceMetrics {
  loadTime: number;
  pageSize: number;
  requests: number;
  coreWebVitals: CoreWebVitals;
  mobileScore: number;
  desktopScore: number;
}

interface OptimizationRecommendation {
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings: string;
}

interface PageSpeedResponse {
  url: string;
  timestamp: string;
  metrics: PerformanceMetrics;
  recommendations: OptimizationRecommendation[];
  overallScore: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  historicalData?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
}

// Mock recommendations database
const OPTIMIZATION_RECOMMENDATIONS: OptimizationRecommendation[] = [
  {
    category: 'Images',
    title: 'Optimize Images',
    description: 'Serve images in next-gen formats like WebP and compress them properly.',
    impact: 'high',
    savings: '0.5-2.0s'
  },
  {
    category: 'JavaScript',
    title: 'Remove Unused JavaScript',
    description: 'Eliminate dead code and unused JavaScript to reduce bundle size.',
    impact: 'medium',
    savings: '0.3-1.0s'
  },
  {
    category: 'CSS',
    title: 'Minify CSS',
    description: 'Remove unnecessary characters from CSS files to reduce file size.',
    impact: 'low',
    savings: '0.1-0.3s'
  },
  {
    category: 'Caching',
    title: 'Leverage Browser Caching',
    description: 'Set proper cache headers for static resources to improve repeat visits.',
    impact: 'high',
    savings: '1.0-3.0s'
  },
  {
    category: 'Server',
    title: 'Improve Server Response Time',
    description: 'Optimize server-side processing and database queries.',
    impact: 'medium',
    savings: '0.2-0.8s'
  },
  {
    category: 'Fonts',
    title: 'Preload Key Fonts',
    description: 'Use font-display: swap and preload critical font files.',
    impact: 'low',
    savings: '0.1-0.4s'
  },
  {
    category: 'Critical Path',
    title: 'Eliminate Render-Blocking Resources',
    description: 'Inline critical CSS and defer non-critical resources.',
    impact: 'high',
    savings: '0.4-1.5s'
  }
];

function generateMockMetrics(device: 'mobile' | 'desktop'): PerformanceMetrics {
  // Generate realistic metrics based on device type
  const isMobile = device === 'mobile';
  
  return {
    loadTime: parseFloat((Math.random() * 3 + 1.5 + (isMobile ? 1 : 0)).toFixed(2)),
    pageSize: Math.floor(Math.random() * 2000000 + 500000), // 0.5-2.5MB
    requests: Math.floor(Math.random() * 50 + 20), // 20-70 requests
    coreWebVitals: {
      lcp: parseFloat((Math.random() * 3 + 1.0 + (isMobile ? 0.5 : 0)).toFixed(2)),
      fid: Math.floor(Math.random() * 200 + 50 + (isMobile ? 50 : 0)), // 50-250ms (mobile worse)
      cls: parseFloat((Math.random() * 0.3).toFixed(3)),
      fcp: parseFloat((Math.random() * 2 + 0.8 + (isMobile ? 0.3 : 0)).toFixed(2)),
      ttfb: parseFloat((Math.random() * 1.2 + 0.2 + (isMobile ? 0.2 : 0)).toFixed(2))
    },
    mobileScore: Math.floor(Math.random() * 40 + 45), // 45-85 (mobile typically lower)
    desktopScore: Math.floor(Math.random() * 35 + 60) // 60-95 (desktop typically higher)
  };
}

function calculateOverallScore(metrics: PerformanceMetrics, device: 'mobile' | 'desktop'): number {
  return device === 'mobile' ? metrics.mobileScore : metrics.desktopScore;
}

function getStatusFromScore(score: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'needs-improvement';
  return 'poor';
}

function generateRecommendations(metrics: PerformanceMetrics): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];
  
  // Add recommendations based on metrics
  if (metrics.pageSize > 1500000) { // > 1.5MB
    recommendations.push(OPTIMIZATION_RECOMMENDATIONS[0]); // Optimize Images
  }
  
  if (metrics.loadTime > 3) {
    recommendations.push(OPTIMIZATION_RECOMMENDATIONS[1]); // Remove Unused JavaScript
    recommendations.push(OPTIMIZATION_RECOMMENDATIONS[6]); // Eliminate Render-Blocking Resources
  }
  
  if (metrics.coreWebVitals.ttfb > 1.0) {
    recommendations.push(OPTIMIZATION_RECOMMENDATIONS[4]); // Improve Server Response Time
  }
  
  recommendations.push(OPTIMIZATION_RECOMMENDATIONS[3]); // Leverage Browser Caching (always good)
  recommendations.push(OPTIMIZATION_RECOMMENDATIONS[2]); // Minify CSS
  
  if (Math.random() > 0.5) {
    recommendations.push(OPTIMIZATION_RECOMMENDATIONS[5]); // Preload Key Fonts
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

function generateHistoricalData(): { labels: string[]; datasets: { label: string; data: number[] }[] } {
  const days = 7;
  const labels: string[] = [];
  const desktopData: number[] = [];
  const mobileData: number[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(i === 0 ? 'Today' : `${i} day${i > 1 ? 's' : ''} ago`);
    
    // Generate trending data with some randomness
    const baseDesktop = 75 + Math.random() * 20;
    const baseMobile = baseDesktop - 15 + Math.random() * 10;
    
    desktopData.push(Math.floor(baseDesktop));
    mobileData.push(Math.floor(baseMobile));
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Desktop Score',
        data: desktopData
      },
      {
        label: 'Mobile Score',
        data: mobileData
      }
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PageSpeedRequest = await request.json();
    
    // Validate request
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required.' },
        { status: 400 }
      );
    }
    
    if (!body.device || !['mobile', 'desktop'].includes(body.device)) {
      return NextResponse.json(
        { error: 'Invalid device type. Must be "mobile" or "desktop".' },
        { status: 400 }
      );
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlPattern.test(body.url)) {
      return NextResponse.json(
        { error: 'Invalid URL format. Please provide a valid URL.' },
        { status: 400 }
      );
    }

    // Simulate API processing delay (real PageSpeed insights takes time)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock performance data
    const metrics = generateMockMetrics(body.device);
    const overallScore = calculateOverallScore(metrics, body.device);
    const status = getStatusFromScore(overallScore);
    const recommendations = generateRecommendations(metrics);
    const historicalData = generateHistoricalData();

    const response: PageSpeedResponse = {
      url: body.url,
      timestamp: new Date().toISOString(),
      metrics,
      recommendations,
      overallScore,
      status,
      historicalData
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Page speed test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
