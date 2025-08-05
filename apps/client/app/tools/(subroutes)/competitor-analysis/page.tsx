'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrafficAnalysisChart from './components/TrafficAnalysisChart';
import KeywordGapAnalysis from './components/KeywordGapAnalysis';
import ContentAnalysis from './components/ContentAnalysis';
import BacklinkComparison from './components/BacklinkComparison';
import { BacklinkData, ContentMetrics, KeywordGap, TrafficData } from './components';

const Page = () => {
 const [trafficData, setTrafficData] = useState<TrafficData[] | null>(null);
const [keywordGaps, setKeywordGaps] = useState<{ competitor: string; gaps: KeywordGap[] }[] | null>(null);
const [contentAnalysisData, setContentAnalysisData] = useState<ContentMetrics[] | null>(null);
const [backlinkComparisonData, setBacklinkComparisonData] = useState<{ competitor: string; backlinks: BacklinkData[] }[] | null>(null);
const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Mock data for demonstration - replace with actual API calls
        const mockTrafficData = [
          {
            competitor: 'Competitor A',
            organicTraffic: 150000,
            paidTraffic: 25000,
            totalVisitors: 175000,
            bounceRate: 45
          },
          {
            competitor: 'Competitor B',
            organicTraffic: 120000,
            paidTraffic: 40000,
            totalVisitors: 160000,
            bounceRate: 52
          }
        ];
        
        const mockKeywordGaps = [
          {
            competitor: 'Competitor A',
            gaps: [
              {
                keyword: 'seo tools',
                yourRank: null,
                competitorRank: 3,
                searchVolume: 12000,
                difficulty: 65,
                opportunity: 'high' as const
              },
              {
                keyword: 'keyword research',
                yourRank: 15,
                competitorRank: 2,
                searchVolume: 8500,
                difficulty: 58,
                opportunity: 'medium' as const
              }
            ]
          }
        ];
        
        const mockContentAnalysis = [
          {
            competitor: 'Competitor A',
            totalPages: 1250,
            averageWordCount: 1800,
            averageLoadTime: 2.3,
            mobileOptimized: 85,
            contentScore: 78,
            topPerformingContent: [
              {
                title: 'Complete SEO Guide 2024',
                url: 'https://competitor-a.com/seo-guide',
                shares: 1250,
                backlinks: 89
              }
            ],
            contentTypes: {
              blog: 45,
              product: 25,
              landing: 20,
              other: 10
            }
          }
        ];
        
        const mockBacklinkComparison = [
          {
            competitor: 'Competitor A',
            backlinks: [
              {
                url: 'https://competitor-a.com',
                totalBacklinks: 15420,
                authorityScore: 85,
                referringDomains: 2580,
                lostBacklinks: 45,
                gainedBacklinks: 120,
                competitorTrend: [1, 1, -1, 1, 1]
              }
            ]
          }
        ];
        
        setTrafficData(mockTrafficData);
        setKeywordGaps(mockKeywordGaps);
        setContentAnalysisData(mockContentAnalysis);
        setBacklinkComparisonData(mockBacklinkComparison);
        
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Competitor Analysis</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Gain insights into competitor strategies and uncover opportunities to improve your own SEO.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {trafficData && <TrafficAnalysisChart data={trafficData} />}
          {keywordGaps && <KeywordGapAnalysis data={keywordGaps} />}
          {contentAnalysisData && <ContentAnalysis data={contentAnalysisData} />}
          {backlinkComparisonData && <BacklinkComparison data={backlinkComparisonData} />}
        </div>
      </div>
    </div>
  );
};

export default Page;
