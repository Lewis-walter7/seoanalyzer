'use client';

import React from 'react';

interface BacklinkData {
  url: string;
  totalBacklinks: number;
  authorityScore: number; // 0-100
  referringDomains: number;
  lostBacklinks: number;
  gainedBacklinks: number;
  competitorTrend: number[];
}

interface BacklinkComparisonProps {
  data: {
    competitor: string;
    backlinks: BacklinkData[];
  }[];
}

const BacklinkComparison: React.FC<BacklinkComparisonProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Backlink Comparison</h3>
        <p className="text-gray-500">No backlink data available</p>
      </div>
    );
  }

  const getAuthorityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">      <h3 className="text-lg font-semibold mb-6">Backlink Comparison</h3>
      <div className="space-y-8">
        {data.map((competitorData, index) => (
          <div key={index} className="border rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4 text-blue-600">
              {competitorData.competitor}
            </h4>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">URL</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Total Backlinks</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Authority</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Referring Domains</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorData.backlinks.slice(0, 5).map((backlink, backlinkIndex) => (
                    <tr key={backlinkIndex} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 text-sm font-medium">
                        <a href={backlink.url} className="text-blue-600 hover:underline">{backlink.url.length > 30 ? backlink.url.substring(0, 30) + '...' : backlink.url}</a>
                      </td>
                      <td className="py-3 px-3 text-sm">{backlink.totalBacklinks.toLocaleString()}</td>
                      <td className="py-3 px-3 text-sm">
                        <span className={`font-medium ${getAuthorityColor(backlink.authorityScore)}`}>{backlink.authorityScore}</span>
                      </td>
                      <td className="py-3 px-3 text-sm">{backlink.referringDomains}</td>
                      <td className="py-3 px-3 text-sm">
                        <div className="flex space-x-1 items-center">
                          {backlink.competitorTrend.map((val, i) => (
                            <div key={i} className={val > 0 ? 'w-2 h-2 rounded-full bg-green-500' : 'w-2 h-2 rounded-full bg-red-500'}></div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Showing top 5 of {competitorData.backlinks.length} backlink records
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h5 className="font-medium text-yellow-900 mb-2">Backlink Strategy Insights</h5>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Focus on acquiring high-authority backlinks</li>
          <li>• Monitor backlink trends for potential breakthroughs or challenges</li>
          <li>• Increase diverse referring domains to enhance site authority</li>
          <li>• Address lost backlinks with targeted outreach</li>
        </ul>
      </div>
    </div>
  );
};

export default BacklinkComparison;

