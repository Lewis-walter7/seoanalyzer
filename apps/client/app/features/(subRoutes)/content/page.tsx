'use client';

import React, { useState, useMemo } from 'react';
import SubFeatureLayout from '../SubFeatureLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { 
  mockData,
  type ContentScore,
  type TechnicalIssue
} from '@/libs/mockData';

type SortField = 'title' | 'seoScore' | 'readabilityScore' | 'wordCount' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'needs-improvement' | 'good' | 'excellent';

const ContentPage = () => {
  const { content, technicalIssues } = mockData;
  const [sortField, setSortField] = useState<SortField>('seoScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filter, setFilter] = useState<FilterType>('all');
  
  return (
    <SubFeatureLayout 
      title="Content Optimization" 
      description="Analyze and optimize your content for better search engine visibility and user engagement."
    >
      <div className="flex flex-col space-y-4">
        {/* Sortable Table */}
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">SEO Score</th>
              <th className="px-4 py-2">Readability</th>
              <th className="px-4 py-2">Word Count</th>
              <th className="px-4 py-2">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {content.map((page: ContentScore) => (
              <tr key={page.id}>
                <td className="border px-4 py-2">{page.title}</td>
                <td className="border px-4 py-2">
                  {page.seoScore}
                  <Progress value={page.seoScore} max={100} color={
                    page.seoScore < 70 ? 'red' : page.seoScore < 85 ? 'yellow' : 'green'
                  } />
                </td>
                <td className="border px-4 py-2">{page.readabilityScore}</td>
                <td className="border px-4 py-2">{page.wordCount}</td>
                <td className="border px-4 py-2">{page.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Aggregate Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Aggregate Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Total Words Audited: {content.reduce((sum, page) => sum + page.wordCount, 0)}</div>
            <div>Average Readability: {(
              content.reduce((sum, page) => sum + page.readabilityScore, 0) / content.length
            ).toFixed(2)}</div>
            <div>
              Pages Passing SEO Score: {(
                (content.filter(page => page.seoScore >= 85).length / content.length) * 100
              ).toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        {/* Badge Filters */}
        <div className="flex space-x-4">
          <button className="bg-red-500 text-white px-4 py-2 rounded">Needs Improvement</button>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded">Good</button>
          <button className="bg-green-500 text-white px-4 py-2 rounded">Excellent</button>
        </div>
      </div>
    </SubFeatureLayout>
  );
};

export default ContentPage;
