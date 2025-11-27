'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import TrafficAnalysisChart from './components/TrafficAnalysisChart';
import KeywordGapAnalysis from './components/KeywordGapAnalysis';
import ContentAnalysis from './components/ContentAnalysis';
import BacklinkComparison from './components/BacklinkComparison';
import { BacklinkData, ContentMetrics, KeywordGap, TrafficData } from './components';
import { FormCard } from '@/components/FormCard';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const Page = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [trafficData, setTrafficData] = useState<TrafficData[] | null>(null);
  const [keywordGaps, setKeywordGaps] = useState<{ competitor: string; gaps: KeywordGap[] }[] | null>(null);
  const [contentAnalysisData, setContentAnalysisData] = useState<ContentMetrics[] | null>(null);
  const [backlinkComparisonData, setBacklinkComparisonData] = useState<{ competitor: string; backlinks: BacklinkData[] }[] | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetUrl || !competitorUrl) {
      toast.error('Please enter both Target URL and Competitor URL');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Analyzing competitors...', { id: 'analyze' });

      // Call the real API for content analysis
      const contentData = await api.analyzeCompetitor(targetUrl, competitorUrl);
      setContentAnalysisData(contentData);

      // Clear other data as we don't have real sources for them yet
      // In a real app, we would call other endpoints or show "Upgrade to Pro"
      setTrafficData(null);
      setKeywordGaps(null);
      setBacklinkComparisonData(null);

      toast.success('Analysis complete!', { id: 'analyze' });
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast.error(error.message || 'Failed to analyze competitors', { id: 'analyze' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Competitor Analysis</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Compare your website against competitors to find content gaps and opportunities.</p>
        </div>

        {/* Input Form */}
        <div className="mb-12 max-w-3xl mx-auto">
          <FormCard
            title="Start Comparison"
            description="Enter your URL and a competitor's URL to compare content metrics."
            isLoading={loading}
          >
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your URL
                  </label>
                  <input
                    type="url"
                    id="targetUrl"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="competitorUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Competitor URL
                  </label>
                  <input
                    type="url"
                    id="competitorUrl"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    placeholder="https://competitor.com"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Analyzing...' : 'Compare Websites'}
              </Button>
            </form>
          </FormCard>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 gap-8">
          {contentAnalysisData && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ContentAnalysis data={contentAnalysisData} />
            </div>
          )}

          {/* Placeholders for other metrics if needed */}
          {!contentAnalysisData && !loading && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              Enter URLs above to see the comparison results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
