'use client';

import React from 'react';

interface KeywordGap {
  keyword: string;
  yourRank: number | null;
  competitorRank: number;
  searchVolume: number;
  difficulty: number;
  opportunity: 'high' | 'medium' | 'low';
}

interface KeywordGapAnalysisProps {
  data: {
    competitor: string;
    gaps: KeywordGap[];
  }[];
}

const KeywordGapAnalysis: React.FC<KeywordGapAnalysisProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Keyword Gap Analysis</h3>
        <p className="text-gray-500 dark:text-gray-400">No keyword gap data available</p>
      </div>
    );
  }

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 80) return 'text-red-600';
    if (difficulty >= 60) return 'text-yellow-600';
    if (difficulty >= 40) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">      <h3 className="text-lg font-semibold mb-4">Keyword Gap Analysis</h3>
      {data.map((competitorData, index) => (
        <div key={index} className="mb-8">
          <h4 className="text-md font-semibold mb-4 text-blue-600">
            vs {competitorData.competitor}
          </h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Keyword</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Your Rank</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Their Rank</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Volume</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Difficulty</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {competitorData.gaps.slice(0, 10).map((gap, gapIndex) => (
                  <tr key={gapIndex} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 text-sm font-medium">{gap.keyword}</td>
                    <td className="py-3 px-3 text-sm">
                      {gap.yourRank ? (
                        <span className="text-gray-600">#{gap.yourRank}</span>
                      ) : (
                        <span className="text-red-500">Not ranking</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm text-blue-600">#{gap.competitorRank}</td>
                    <td className="py-3 px-3 text-sm">{gap.searchVolume.toLocaleString()}</td>
                    <td className="py-3 px-3 text-sm">
                      <span className={getDifficultyColor(gap.difficulty)}>
                        {gap.difficulty}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getOpportunityColor(gap.opportunity)}`}>
                        {gap.opportunity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {competitorData.gaps.length > 10 && (
            <p className="text-sm text-gray-500 mt-3">
              Showing top 10 of {competitorData.gaps.length} keyword opportunities
            </p>
          )}
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Key Insights</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Focus on high-opportunity keywords with medium difficulty</li>
          <li>• Target keywords where competitors rank but you don't</li>
          <li>• Consider search volume vs. competition balance</li>
        </ul>
      </div>
    </div>
  );
};

export default KeywordGapAnalysis;
