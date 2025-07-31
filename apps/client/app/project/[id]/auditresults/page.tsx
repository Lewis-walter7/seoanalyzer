"use client"

import React from 'react';
import useSWR from 'swr';
import { AuditResultsLayout, type ProjectInfo } from '@/app/components/audit/AuditResultsLayout';
import { type AuditResult, type SeoMetric } from '@/app/components/audit/AuditResultCard';
import { type SeoStatus } from '@/components/ui/seo-badge';
import { api } from '@/lib/api';

// API Response Types based on backend structure
interface ApiAuditPage {
  id: string;
  url: string;
  title?: string;
  titleTag?: string;
  metaDescription?: string;
  h1Count: number;
  imgMissingAlt: number;
  totalLinks: number;
  performanceScore?: number;
  seoScore?: number;
  accessibilityScore?: number;
  internalLinksCount: number;
  externalLinksCount: number;
  brokenLinksCount: number;
  loadTime?: number;
  pageSize?: number;
  hasCanonical: boolean;
  isIndexable: boolean;
  crawledAt: string;
}

interface ApiAuditResponse {
  id: string;
  createdAt: string;
  pages: ApiAuditPage[];
}

interface ApiProjectResponse {
  id: string;
  name: string;
  url: string;
  domain: string;
  description?: string;
  onPageScore?: string;
  problems?: string;
  backlinks?: string;
  crawlStatus: string;
  lastCrawl?: string;
  pages?: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditResponse = {
  audits: ApiAuditResponse[];
}
// Data transformer for real API data
const transformAuditData = (
  projectData: ApiProjectResponse,
  auditsData: { audits: ApiAuditResponse[] }
): { project: ProjectInfo; results: AuditResult[] } => {
  // Transform project info
  const project: ProjectInfo = {
    id: projectData.id,
    name: projectData.name,
    latestCrawlDate: auditsData.audits[0]?.createdAt || new Date().toISOString(),
    totalPages: auditsData.audits.reduce((total, audit) => total + audit.pages.length, 0)
  };

  // Transform audit results - flatten all pages from all audits
  const results: AuditResult[] = [];
  
  auditsData.audits.forEach((audit) => {
    audit.pages.forEach((page) => {
      // Calculate SEO status based on various metrics
      const getSeoStatus = (value: any, condition: (val: any) => boolean): SeoStatus => {
        if (condition(value)) return 'good';
        if (value === null || value === undefined || value === '' || value === 0) return 'issue';
        return 'warning';
      };

      // Transform to our SEO metrics format
      const seoMetrics: SeoMetric[] = [
        {
          label: 'Title Tag',
          value: page.titleTag ? 'Present' : 'Missing',
          status: getSeoStatus(page.titleTag, (val) => !!val && val.length > 0)
        },
        {
          label: 'Meta Description',
          value: page.metaDescription ? 'Present' : 'Missing',
          status: getSeoStatus(page.metaDescription, (val) => !!val && val.length > 0)
        },
        {
          label: 'H1 Tags',
          value: page.h1Count,
          status: getSeoStatus(page.h1Count, (val) => val === 1)
        },
        {
          label: 'Images Alt Text',
          value: `${Math.max(0, page.totalLinks - page.imgMissingAlt)}/${page.totalLinks || 0}`,
          status: getSeoStatus(page.imgMissingAlt, (val) => val === 0)
        },
        {
          label: 'Internal Links',
          value: page.internalLinksCount,
          status: getSeoStatus(page.internalLinksCount, (val) => val >= 3)
        },
        {
          label: 'Page Load Time',
          value: page.loadTime ? `${page.loadTime.toFixed(1)}s` : 'N/A',
          status: getSeoStatus(page.loadTime, (val) => val && val < 3)
        }
      ];

      // Add additional metrics if available
      if (page.brokenLinksCount !== undefined) {
        seoMetrics.push({
          label: 'Broken Links',
          value: page.brokenLinksCount,
          status: getSeoStatus(page.brokenLinksCount, (val) => val === 0)
        });
      }

      if (page.hasCanonical !== undefined) {
        seoMetrics.push({
          label: 'Canonical Tag',
          value: page.hasCanonical ? 'Present' : 'Missing',
          status: getSeoStatus(page.hasCanonical, (val) => val === true)
        });
      }

      if (page.isIndexable !== undefined) {
        seoMetrics.push({
          label: 'Indexable',
          value: page.isIndexable ? 'Yes' : 'No',
          status: getSeoStatus(page.isIndexable, (val) => val === true)
        });
      }

      results.push({
        id: `${audit.id}-${page.id}`,
        url: page.url,
        performanceScore: page.performanceScore || page.seoScore || 0,
        seoMetrics,
        crawledAt: page.crawledAt
      });
    });
  });

  return { project, results };
};

async function fetchAuditData(projectId: string) {
  try {
    // Fetch project data from the backend
    const projectData = await api.getBackendProject(projectId);
    
    // Fetch audit data from the Next.js API route
    const auditsResponse = await api.getAuditData(projectId);
    console.log('Audits Response:', auditsResponse);
    
    if (!auditsResponse.audits) {
      throw new Error('Failed to load audit results');
    }
    
    const auditsData = auditsResponse.audits;
    
    return { 
      project: projectData, 
      audits: auditsData
    };
  } catch (error) {
    console.error('Error fetching audit data:', error);
    throw new Error('Failed to load audit data');
  }
}

// Custom hook for fetching audit results
function useAuditResults(projectId: string) {
  const { data, error, isLoading } = useSWR(
    projectId ? `audit-data-${projectId}` : null,
    () => fetchAuditData(projectId)
  );

  return {
    data,
    error,
    isLoading
  };
}

interface AuditResultsProps {
  params: {
    id: string;
  };
}

function AuditResults({ params }: AuditResultsProps) {
  const { data: apiData, error, isLoading } = useAuditResults(params.id);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading audit results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Audit Results</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty data state
  if (!apiData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Audit Results Found</h3>
          <p className="text-muted-foreground mb-4">No audit results found for this project. Start a new audit to see results here.</p>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={() => window.location.href = '/new-audit'}
          >
            Start New Audit
          </button>
        </div>
      </div>
    );
  }

  // Transform the API data to our component format
  const { project, results } = transformAuditData(apiData.project, { audits: apiData.audits });
  
  return (
    <div className="container mx-auto px-4 py-6">
      {project ? (
        <AuditResultsLayout 
          project={project}
          results={results}
          isLoading={isLoading}
        />
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

export default AuditResults;
