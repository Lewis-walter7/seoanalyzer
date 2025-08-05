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
  mockData,
  type ContentScore,
  type KeywordRank
} from '@/libs/mockData';

const AIPage = () => {
  const { content, keywords } = mockData;

  return (
    <SubFeatureLayout 
      title="AI-Powered SEO" 
      description="Leverage artificial intelligence to optimize your content and improve search rankings."
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average SEO Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(content.reduce((sum, item) => sum + item.seoScore, 0) / content.length)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Traffic Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.reduce((sum, item) => sum + (item.wordCount / 100), 0).toFixed(1)}k
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages with Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.filter(item => item.seoScore < 70).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.filter(page => page.seoScore < 70).map(page => (
          <Card key={page.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{page.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-md font-semibold mb-2">Suggested Fixes:</div>
              <ul className="list-disc list-inside text-sm space-y-1">
                {page.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </SubFeatureLayout>
  );
};

export default AIPage;
