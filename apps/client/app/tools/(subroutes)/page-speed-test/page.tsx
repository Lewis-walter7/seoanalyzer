'use client';

import React, { useState } from 'react';
import { FormCard } from '@/components/FormCard';
import { ChartComponent } from '@/components/ChartComponent';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Clock, 
  Smartphone, 
  Monitor, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  Activity,
  Globe
} from 'lucide-react';

// export const metadata = {
//   title: 'Page Speed Test',
//   description: 'Test your website\'s loading speed and get optimization recommendations.'
// };

interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
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

const Page = () => {
  const [url, setUrl] = useState('');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<PageSpeedResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!url.trim()) {
      setError('Please enter a valid URL.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/tools/page-speed-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, device }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }
      
      const result: PageSpeedResponse = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 50) return 'good';
    return 'poor';
  };

  const getCoreWebVitalStatus = (metric: string, value: number) => {
    const thresholds: { [key: string]: { good: number; needsImprovement: number } } = {
      lcp: { good: 2.5, needsImprovement: 4.0 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      fcp: { good: 1.8, needsImprovement: 3.0 },
      ttfb: { good: 0.8, needsImprovement: 1.8 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Page Speed Test
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Test your website&apos;s loading speed and get optimization recommendations.
          </p>
        </div>

        {/* Form Section */}
        <div className="mb-8">
          <FormCard 
            title="Speed Test Configuration" 
            description="Enter your website URL to analyze performance metrics and Core Web Vitals"
            className="max-w-2xl"
            error={error}
            isLoading={isLoading}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website URL *
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Device Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="device"
                      value="desktop"
                      checked={device === 'desktop'}
                      onChange={(e) => setDevice(e.target.value as 'desktop')}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    <Monitor className="w-4 h-4 mr-1" />
                    Desktop
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="device"
                      value="mobile"
                      checked={device === 'mobile'}
                      onChange={(e) => setDevice(e.target.value as 'mobile')}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    <Smartphone className="w-4 h-4 mr-1" />
                    Mobile
                  </label>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !url.trim()}
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Performance...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Test Page Speed
                  </>
                )}
              </Button>
            </form>
          </FormCard>
        </div>

        {/* Results Section */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Analyzing Performance...</h2>
            <LoadingSkeleton count={5} className="h-8 mb-4" />
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-8">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(data.overallScore)}`}>
                      {data.overallScore}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
                    <Badge variant={getScoreStatus(data.overallScore) === 'excellent' ? 'default' : 'secondary'}>
                      {data.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.metrics.loadTime}s
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Load Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(data.metrics.pageSize / 1024 / 1024).toFixed(2)}MB
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Page Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.metrics.requests}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Requests</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">LCP</span>
                      {getCoreWebVitalStatus('lcp', data.metrics.coreWebVitals.lcp) === 'good' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xl font-bold">{data.metrics.coreWebVitals.lcp}s</div>
                    <div className="text-xs text-gray-500">Largest Contentful Paint</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">FID</span>
                      {getCoreWebVitalStatus('fid', data.metrics.coreWebVitals.fid) === 'good' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xl font-bold">{data.metrics.coreWebVitals.fid}ms</div>
                    <div className="text-xs text-gray-500">First Input Delay</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">CLS</span>
                      {getCoreWebVitalStatus('cls', data.metrics.coreWebVitals.cls) === 'good' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xl font-bold">{data.metrics.coreWebVitals.cls}</div>
                    <div className="text-xs text-gray-500">Cumulative Layout Shift</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">FCP</span>
                      {getCoreWebVitalStatus('fcp', data.metrics.coreWebVitals.fcp) === 'good' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xl font-bold">{data.metrics.coreWebVitals.fcp}s</div>
                    <div className="text-xs text-gray-500">First Contentful Paint</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">TTFB</span>
                      {getCoreWebVitalStatus('ttfb', data.metrics.coreWebVitals.ttfb) === 'good' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xl font-bold">{data.metrics.coreWebVitals.ttfb}s</div>
                    <div className="text-xs text-gray-500">Time to First Byte</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance History Chart */}
            {data.historicalData && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ChartComponent 
                      type="line" 
                      data={data.historicalData}
                      options={{
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Score'
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Time'
                            }
                          }
                        }
                      }}
                      className="h-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                            <Badge 
                              variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'secondary' : 'outline'}
                            >
                              {rec.impact.toUpperCase()} IMPACT
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.description}</p>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Category:</span> {rec.category} • 
                            <span className="font-medium">Potential Savings:</span> {rec.savings}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
