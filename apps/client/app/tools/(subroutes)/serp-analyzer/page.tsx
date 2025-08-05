'use client';

import React, { useState } from 'react';
import { FormCard } from '@/components/FormCard';
import { ChartComponent } from '@/components/ChartComponent';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Eye, Search, TrendingUp } from 'lucide-react';

// export const metadata = {
//   title: 'SERP Analyzer',
//   description: 'Analyze search engine results pages to understand ranking factors.'
// };

interface SerpResult {
  keyword: string;
  url: string;
  position: number;
  features: string[];
  snippets: string[];
}

interface SerpResponse {
  keyword: string;
  results: SerpResult[];
  searchEngine: string;
  totalResults: number;
  resultCountByPosition: number[];
  organicTop3Results: number;
}

const Page = () => {
  const [keyword, setKeyword] = useState('');
  const [searchEngine, setSearchEngine] = useState('google');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<SerpResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!keyword.trim()) {
      setError('Please enter a valid keyword.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/tools/serp-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, searchEngine }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }

      const result: SerpResponse = await response.json();
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            SERP Analyzer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Analyze search engine results pages to understand ranking factors.
          </p>
        </div>

        {/* Form Section */}
        <div className="mb-8">
          <FormCard 
            title="SERP Analysis Configuration" 
            description="Enter a keyword to analyze top results and their SERP features"
            className="max-w-2xl"
            error={error}
            isLoading={isLoading}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keyword *
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter keyword"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="searchEngine" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Engine
                </label>
                <select
                  id="searchEngine"
                  value={searchEngine}
                  onChange={(e) => setSearchEngine(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                  <option value="yahoo">Yahoo</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !keyword.trim()}
              >
                {isLoading ? 'Analyzing SERP...' : 'Analyze SERP'}
              </Button>
            </form>
          </FormCard>
        </div>

        {/* Results Section */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Analyzing SERP...</h2>
            <LoadingSkeleton count={5} className="h-8 mb-4" />
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  SERP Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {data.totalResults}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Results</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.organicTop3Results}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Organic Top 3</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.resultCountByPosition[0] || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Top Position</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.resultCountByPosition.filter(pos => pos <= 3).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Top 3 Spots</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Top 10 Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          URL
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Features
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {data.results.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            #{result.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <a 
                              href={result.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View Page
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {result.features.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
