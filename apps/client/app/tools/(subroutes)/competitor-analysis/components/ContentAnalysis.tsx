'use client';

import React from 'react';

interface ContentMetrics {
  competitor: string;
  totalPages: number;
  averageWordCount: number;
  averageLoadTime: number;
  mobileOptimized: number; // percentage
  contentScore: number; // 0-100
  topPerformingContent: {
    title: string;
    url: string;
    shares: number;
    backlinks: number;
  }[];
  contentTypes: {
    blog: number;
    product: number;
    landing: number;
    other: number;
  };
}

interface ContentAnalysisProps {
  data: ContentMetrics[];
}

const ContentAnalysis: React.FC<ContentAnalysisProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Content Analysis</h3>
        <p className="text-gray-500 dark:text-gray-400">No content analysis data available</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLoadTimeColor = (time: number) => {
    if (time <= 2) return 'text-green-600';
    if (time <= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">      <h3 className="text-lg font-semibold mb-6">Content Analysis</h3>
      
      <div className="space-y-8">
        {data.map((competitor, index) => (
          <div key={index} className="border rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4 text-blue-600">
              {competitor.competitor}
            </h4>
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-white dark:bg-gray-300 rounded">
                <div className="text-2xl font-bold">{competitor.totalPages.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Pages</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-300 rounded">
                <div className="text-2xl font-bold">{competitor.averageWordCount}</div>
                <div className="text-sm text-gray-600">Avg Words</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-300 rounded">
                <div className={`text-2xl font-bold ${getLoadTimeColor(competitor.averageLoadTime)}`}>
                  {competitor.averageLoadTime}s
                </div>
                <div className="text-sm text-gray-600">Load Time</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-300 rounded">
                <div className="text-2xl font-bold">{competitor.mobileOptimized}%</div>
                <div className="text-sm text-gray-600">Mobile Ready</div>
              </div>
            </div>
            
            {/* Content Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Content Quality Score</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(competitor.contentScore)}`}>
                  {competitor.contentScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${competitor.contentScore}%` }}
                ></div>
              </div>
            </div>
            
            {/* Content Types Distribution */}
            <div className="mb-6">
              <h5 className="font-medium mb-3">Content Distribution</h5>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-white dark:bg-gray-300 rounded">
                  <div className="text-lg font-bold text-blue-600">{competitor.contentTypes.blog}%</div>
                  <div className="text-xs text-gray-600">Blog</div>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-300 rounded">
                  <div className="text-lg font-bold text-green-600">{competitor.contentTypes.product}%</div>
                  <div className="text-xs text-gray-600">Product</div>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-300 rounded">
                  <div className="text-lg font-bold text-purple-600">{competitor.contentTypes.landing}%</div>
                  <div className="text-xs text-gray-600">Landing</div>
                </div>
                <div className="text-center p-2 bg-white dark:bbg-white dark:bg-gray-300 rounded">
                  <div className="text-lg font-bold text-gray-600">{competitor.contentTypes.other}%</div>
                  <div className="text-xs text-gray-600">Other</div>
                </div>
              </div>
            </div>
            
            {/* Top Performing Content */}
            <div>
              <h5 className="font-medium mb-3">Top Performing Content</h5>
              <div className="space-y-3">
                {competitor.topPerformingContent.slice(0, 3).map((content, contentIndex) => (
                  <div key={contentIndex} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <h6 className="font-medium text-sm mb-1">{content.title}</h6>
                      <a href={content.url} className="text-xs text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        {content.url.length > 50 ? content.url.substring(0, 50) + '...' : content.url}
                      </a>
                    </div>
                    <div className="text-right text-xs text-gray-600 ml-4">
                      <div>{content.shares} shares</div>
                      <div>{content.backlinks} backlinks</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Insights */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h5 className="font-medium text-green-900 mb-2">Content Strategy Insights</h5>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Analyze top-performing content formats and topics</li>
          <li>• Consider optimal word count based on competitor averages</li>
          <li>• Focus on mobile optimization and page speed improvements</li>
          <li>• Identify content gaps in underserved categories</li>
        </ul>
      </div>
    </div>
  );
};

export default ContentAnalysis;
