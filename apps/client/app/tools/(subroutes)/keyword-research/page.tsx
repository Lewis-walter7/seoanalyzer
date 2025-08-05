'use client';

import React, { useState } from 'react';
import { FormCard } from '@/components/FormCard';
import KeywordResearchForm from './components/KeywordResearchForm';
import KeywordResults from './components/KeywordResults';

// export const metadata = {
//   title: 'Keyword Research',
//   description: 'Discover high-volume, low-competition keywords to boost your search rankings.'
// };

interface KeywordMetric {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
  difficulty: number;
  trend?: 'up' | 'down' | 'neutral';
}

const Page = () => {
  const [results, setResults] = useState<KeywordMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleKeywordSubmit = async (keywords: string[]) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults: KeywordMetric[] = keywords.map(keyword => ({
        keyword,
        searchVolume: Math.floor(Math.random() * 10000) + 100,
        competition: Math.random(),
        cpc: Math.random() * 5 + 0.5,
        difficulty: Math.floor(Math.random() * 100),
        trend: ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'neutral'
      }));
      
      setResults(mockResults);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Keyword Research Tool
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover high-volume, low-competition keywords to boost your search rankings.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <FormCard 
              title="Enter Keywords"
              description="Enter keywords to discover high-volume, low-competition options"
            >
              <KeywordResearchForm onSubmit={handleKeywordSubmit} isLoading={isLoading} />
            </FormCard>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <KeywordResults results={results} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
