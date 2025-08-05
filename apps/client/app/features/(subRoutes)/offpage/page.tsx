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
import { Badge } from '@/components/ui/badge';
import { 
  mockData,
  type Backlink,
  type CompetitorData
} from '@/libs/mockData';

// Helper functions
const averageDomainAuthority = (backlinks: Backlink[]) => {
  if (backlinks.length === 0) return '0';
  const total = backlinks.reduce((sum, bl) => sum + bl.domainAuthority, 0);
  return Math.round(total / backlinks.length).toString();
};

const topCompetitor = (competitors: CompetitorData[]) => {
  return competitors.reduce((top, competitor) =>
    competitor.organicTraffic > top.organicTraffic ? competitor : top
  );
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'new': return 'secondary';
    case 'lost': return 'destructive';
    default: return 'outline';
  }
};

const aggregateBacklinksByDate = (backlinks: Backlink[]) => {
  const dateMap = new Map<string, number>();
  backlinks.forEach(bl => {
    const date = bl.dateFound;
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  return Array.from(dateMap.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, count]) => ({ date, count }));
};

const OffPage = () => {
  const { backlinks, competitors } = mockData;
  const backlinksByDate = aggregateBacklinksByDate(backlinks);
  const maxCount = Math.max(...backlinksByDate.map(d => d.count), 1);

  return (
    <SubFeatureLayout
      title="Off-Page SEO"
      description="Explore strategies for boosting your off-page SEO, including backlink analysis and competitor insights."
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Backlinks</CardTitle>
          </CardHeader>
          <CardContent>{backlinks.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New vs Lost Backlinks</CardTitle>
          </CardHeader>
          <CardContent>
            New: {backlinks.filter((bl) => bl.status === 'new').length} /{' '}
            Lost: {backlinks.filter((bl) => bl.status === 'lost').length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Domain Authority</CardTitle>
          </CardHeader>
          <CardContent>{averageDomainAuthority(backlinks)}</CardContent>
        </Card>
      </div>

      {/* Backlink Chart Placeholder */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Backlink Acquisition Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backlinksByDate.map(({ date, count }) => (
              <div key={date} className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 w-20">{date}</div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full" 
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-medium w-8">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backlinks Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Backlinks Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                <th className="border px-4 py-2">Source Domain</th>
                <th className="border px-4 py-2">Anchor Text</th>
                <th className="border px-4 py-2">DA</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Date Found</th>
              </tr>
            </thead>
            <tbody>
              {backlinks.slice(0, 10).map((backlink) => (
                <tr
                  key={backlink.id}
                  className="even:bg-gray-50 dark:even:bg-gray-800"
                >
                  <td className="border px-4 py-2">{backlink.sourceDomain}</td>
                  <td className="border px-4 py-2">{backlink.anchorText}</td>
                  <td className="border px-4 py-2">{backlink.domainAuthority}</td>
                  <td className="border px-4 py-2">
                    <Badge variant={getStatusBadgeVariant(backlink.status)}>
                      {backlink.status}
                    </Badge>
                  </td>
                  <td className="border px-4 py-2">{backlink.dateFound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Competitor Table */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                <th className="border px-4 py-2">Domain</th>
                <th className="border px-4 py-2">Organic Traffic</th>
                <th className="border px-4 py-2">Backlinks</th>
                <th className="border px-4 py-2">Domain Authority</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((competitor) => (
                <tr
                  key={competitor.id}
                  className={
                    competitor === topCompetitor(competitors)
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'even:bg-gray-50 dark:even:bg-gray-800'
                  }
                >
                  <td className="border px-4 py-2">{competitor.domain}</td>
                  <td className="border px-4 py-2">{competitor.organicTraffic.toLocaleString()}</td>
                  <td className="border px-4 py-2">{competitor.backlinks.toLocaleString()}</td>
                  <td className="border px-4 py-2">{competitor.domainAuthority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </SubFeatureLayout>
  );
};

export default OffPage;
