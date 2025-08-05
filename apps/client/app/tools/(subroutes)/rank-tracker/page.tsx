'use client';

import React, { useState } from 'react';
import { FormCard } from '@/components/FormCard';
import { ChartComponent } from '@/components/ChartComponent';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Select } from '@/components/ui/select';

// export const metadata = {
//   title: 'Rank Tracker',
//   description: 'Monitor your keyword rankings across different search engines.'
// };

interface RankTrackerResult {
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  change: number;
  url?: string;
  searchEngine: string;
  lastChecked: string;
}

interface RankTrackerResponse {
  domain: string;
  searchEngine: string;
  results: RankTrackerResult[];
  totalKeywords: number;
  averagePosition: number;
  positionsImproved: number;
  positionsDeclined: number;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      keyword: string;
    }[];
  };
}

const Page = () => {
  const [domain, setDomain] = useState('');
  const [keywords, setKeywords] = useState('');
  const [searchEngine, setSearchEngine] = useState('google');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<RankTrackerResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!domain.trim()) {
      setError('Please enter a valid domain.');
      return;
    }
    
    if (!keywords.trim()) {
      setError('Please enter at least one keyword.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/tools/rank-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
          searchEngine,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }
      
      const result: RankTrackerResponse = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Rank Tracker Tool
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Monitor your keyword rankings across different search engines.
          </p>
        </div>

        {/* Form Section */}
        <div className="mb-8">
          <FormCard 
            title="Track Rankings" 
            description="Enter your domain and keywords to track their search engine positions"
            className="max-w-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domain URL *
                </label>
                <input
                  type="url"
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keywords * (comma-separated)
                </label>
                <textarea
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="seo tools, keyword research, rank tracker"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  rows={3}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="searchEngine" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Engine
                </label>
                <Select 
                  id="searchEngine" 
                  value={searchEngine} 
                  onChange={(e) => setSearchEngine(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-3"
                >
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                  <option value="yahoo">Yahoo</option>
                </Select>
              </div>
              
              {error && <ErrorAlert message={error} />}
              
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Tracking Rankings...' : 'Track Rankings'}
              </button>
            </form>
          </FormCard>
        </div>

        {/* Results Section */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tracking Rankings...</h2>
            <LoadingSkeleton count={5} className="h-8 mb-4" />
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalKeywords}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Keywords</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.averagePosition}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Position</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-2xl font-bold text-green-600">{data.positionsImproved}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Positions Improved</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-2xl font-bold text-red-600">{data.positionsDeclined}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Positions Declined</div>
              </div>
            </div>

            {/* Rankings Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Rankings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Keyword
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Current Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Previous Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        URL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.results.map((result) => (
                      <tr key={result.keyword} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {result.keyword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            #{result.currentPosition}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          #{result.previousPosition}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className={`flex items-center ${
                            result.change > 0 
                              ? 'text-green-600' 
                              : result.change < 0 
                              ? 'text-red-600' 
                              : 'text-gray-500'
                          }`}>
                            {result.change > 0 && (
                              <span className="text-green-500">↑ +{result.change}</span>
                            )}
                            {result.change < 0 && (
                              <span className="text-red-500">↓ {result.change}</span>
                            )}
                            {result.change === 0 && (
                              <span className="text-gray-500">→ {result.change}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {result.url && (
                            <a 
                              href={result.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View Page
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Position History Chart */}
            {data.chartData.datasets.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Position History</h2>
                <div className="h-96">
                  <ChartComponent 
                    type="line" 
                    data={data.chartData} 
                    options={{
                      scales: {
                        y: {
                          reverse: true, // Lower position numbers are better
                          beginAtZero: false,
                          title: {
                            display: true,
                            text: 'Position'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Time'
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context: any) {
                              return `${context.dataset.label}: Position #${context.parsed.y}`;
                            }
                          }
                        }
                      }
                    }}
                    className="h-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
