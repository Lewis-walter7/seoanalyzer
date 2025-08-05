'use client';

import React from 'react';
import SubFeatureLayout from '../SubFeatureLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRight,
  Eye,
  BarChart3,
  MousePointer,
  Globe
} from 'lucide-react';
import { mockData } from '@/libs/mockData';

// Use shared dynamic Recharts imports to prevent SSR issues
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from '@/utils/recharts-dynamic';

const AnalyticsPage = () => {
  const { traffic, keywords, searchConsole } = mockData;
  
  // Calculate KPIs
  const totalVisits = traffic.reduce((sum, day) => sum + day.visits, 0);
  const avgRank = Math.round(keywords.reduce((acc, kw) => acc + kw.position, 0) / keywords.length);
  const avgCTR = searchConsole.reduce((sum, day) => sum + day.ctr, 0) / searchConsole.length;
  const pagesCrawled = keywords.length;
  
  // SEO Health Score (based on various factors)
  const seoHealthScore = Math.round(
    (avgCTR * 10 + (100 - avgRank) + (pagesCrawled / 2)) / 3
  );

  return (
    <SubFeatureLayout 
      title="Analytics Overview" 
      description="Comprehensive SEO analytics and performance insights for your website."
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rank</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRank}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                +3 positions improved
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCTR.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +0.8% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Crawled</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagesCrawled}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600 flex items-center">
                <ArrowRight className="h-3 w-3 mr-1" />
                All pages indexed
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Traffic Trend - Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={traffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [value.toLocaleString(), 'Visits']}
                />
                <Area 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Keywords Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keywords.slice(0, 10).map((keyword) => (
                <div key={keyword.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{keyword.keyword}</p>
                    <p className="text-xs text-muted-foreground">Vol: {keyword.searchVolume.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">#{keyword.position}</span>
                    <div className={`flex items-center ${
                      keyword.changeDirection === 'up' ? 'text-green-600' : 
                      keyword.changeDirection === 'down' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {keyword.changeDirection === 'up' && <ArrowUpRight className="h-4 w-4" />}
                      {keyword.changeDirection === 'down' && <ArrowDownRight className="h-4 w-4" />}
                      {keyword.changeDirection === 'stable' && <ArrowRight className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Health Gauge */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{seoHealthScore}%</div>
                <p className="text-sm text-muted-foreground">Overall SEO Performance</p>
              </div>
              <Progress value={seoHealthScore} max={100} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="font-medium text-green-600">{avgCTR.toFixed(1)}%</p>
                  <p className="text-muted-foreground">CTR</p>
                </div>
                <div>
                  <p className="font-medium text-blue-600">#{avgRank}</p>
                  <p className="text-muted-foreground">Avg Rank</p>
                </div>
                <div>
                  <p className="font-medium text-purple-600">{pagesCrawled}</p>
                  <p className="text-muted-foreground">Pages</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SubFeatureLayout>
  );
};

export default AnalyticsPage;
