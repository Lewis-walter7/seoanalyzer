"use client"

import React from 'react';
import { AuditResultsLayout, type ProjectInfo } from '@/app/components/audit/AuditResultsLayout';
import { type AuditResult, type SeoMetric } from '@/app/components/audit/AuditResultCard';
import { type SeoStatus } from '@/components/ui/seo-badge';

// Mock data for demonstration
const mockProject: ProjectInfo = {
  id: 'demo-project-1',
  name: 'E-commerce Website',
  latestCrawlDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  totalPages: 15
};

const mockResults: AuditResult[] = [
  {
    id: 'audit-1',
    url: 'https://example-store.com',
    performanceScore: 95,
    crawledAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    seoMetrics: [
      { label: 'Title Tag', value: 'Present', status: 'good' },
      { label: 'Meta Description', value: 'Present', status: 'good' },
      { label: 'H1 Tags', value: 1, status: 'good' },
      { label: 'Images Alt Text', value: '12/12', status: 'good' },
      { label: 'Internal Links', value: 8, status: 'good' },
      { label: 'Page Load Time', value: '1.2s', status: 'good' }
    ]
  },
  {
    id: 'audit-2',
    url: 'https://example-store.com/products',
    performanceScore: 78,
    crawledAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    seoMetrics: [
      { label: 'Title Tag', value: 'Present', status: 'good' },
      { label: 'Meta Description', value: 'Missing', status: 'issue' },
      { label: 'H1 Tags', value: 1, status: 'good' },
      { label: 'Images Alt Text', value: '8/15', status: 'warning' },
      { label: 'Internal Links', value: 5, status: 'good' },
      { label: 'Page Load Time', value: '2.8s', status: 'warning' }
    ]
  },
  {
    id: 'audit-3',
    url: 'https://example-store.com/about',
    performanceScore: 45,
    crawledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    seoMetrics: [
      { label: 'Title Tag', value: 'Missing', status: 'issue' },
      { label: 'Meta Description', value: 'Missing', status: 'issue' },
      { label: 'H1 Tags', value: 0, status: 'issue' },
      { label: 'Images Alt Text', value: '2/8', status: 'issue' },
      { label: 'Internal Links', value: 2, status: 'warning' },
      { label: 'Page Load Time', value: '4.5s', status: 'issue' }
    ]
  },
  {
    id: 'audit-4',
    url: 'https://example-store.com/contact',
    performanceScore: 82,
    crawledAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    seoMetrics: [
      { label: 'Title Tag', value: 'Present', status: 'good' },
      { label: 'Meta Description', value: 'Present', status: 'good' },
      { label: 'H1 Tags', value: 2, status: 'warning' },
      { label: 'Images Alt Text', value: '3/3', status: 'good' },
      { label: 'Internal Links', value: 6, status: 'good' },
      { label: 'Page Load Time', value: '2.1s', status: 'good' }
    ]
  },
  {
    id: 'audit-5',
    url: 'https://example-store.com/blog/seo-tips',
    performanceScore: 88,
    crawledAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    seoMetrics: [
      { label: 'Title Tag', value: 'Present', status: 'good' },
      { label: 'Meta Description', value: 'Present', status: 'good' },
      { label: 'H1 Tags', value: 1, status: 'good' },
      { label: 'Images Alt Text', value: '5/6', status: 'warning' },
      { label: 'Internal Links', value: 12, status: 'good' },
      { label: 'Page Load Time', value: '1.8s', status: 'good' }
    ]
  },
  {
    id: 'audit-6',
    url: 'https://example-store.com/products/category/electronics',
    performanceScore: 65,
    crawledAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    seoMetrics: [
      { label: 'Title Tag', value: 'Present', status: 'good' },
      { label: 'Meta Description', value: 'Too Short', status: 'warning' },
      { label: 'H1 Tags', value: 1, status: 'good' },
      { label: 'Images Alt Text', value: '18/25', status: 'warning' },
      { label: 'Internal Links', value: 3, status: 'warning' },
      { label: 'Page Load Time', value: '3.2s', status: 'issue' }
    ]
  }
];

export default function DemoAuditResults() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🎯 Demo: Audit Results Layout
        </h2>
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          This is a demonstration of the audit results page layout with mock data. 
          The layout includes responsive cards, filtering, sorting, and performance metrics.
        </p>
      </div>
      
      <AuditResultsLayout 
        project={mockProject}
        results={mockResults}
        isLoading={false}
      />
    </div>
  );
}
