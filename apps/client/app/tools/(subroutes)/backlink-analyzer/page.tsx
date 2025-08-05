'use client';

import React, { useState } from 'react';
import { Link, Search } from 'lucide-react';
import { FormCard } from '@/components/FormCard';
import BacklinkAnalysisResults from './components/BacklinkAnalysisResults';

// export const metadata = {
//   title: 'Backlink Analyzer',
//   description: 'Analyze your backlink profile and discover new link building opportunities.'
// };

interface BacklinkResult {
  url: string;
  quality: string;
  date: string;
}

const Page = () => {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<BacklinkResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults: BacklinkResult[] = [
        { url: 'https://example.com/blog/seo-tips', quality: 'High', date: '2024-01-15' },
        { url: 'https://another-site.com/resources', quality: 'Medium', date: '2024-01-10' },
        { url: 'https://third-site.com/links', quality: 'Low', date: '2024-01-05' }
      ];
      
      setResults(mockResults);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Link className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Backlink Analyzer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Analyze your backlink profile and discover new link building opportunities.
          </p>
        </div>

        {/* Analysis Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <FormCard
            title="Analyze Backlinks"
            description="Enter your domain to analyze backlink profile and discover opportunities"
            className="max-w-2xl"
          >
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter Domain to Analyze
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="domain"
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !domain.trim()}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing Backlinks...
                  </>
                ) : (
                  <>
                    <Link className="w-5 h-5 mr-2" />
                    Analyze Backlinks
                  </>
                )}
              </button>
            </form>
          </FormCard>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <BacklinkAnalysisResults results={results} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
