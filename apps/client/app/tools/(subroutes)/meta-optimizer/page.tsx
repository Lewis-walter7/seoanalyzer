'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormCard } from '@/components/FormCard';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, AlertTriangle, Search, Settings } from 'lucide-react';

interface MetaAnalysis {
  serpPreview: {
    title: string;
    description: string;
    url: string;
  };
  title: {
    current: string;
    length: number;
    pixelWidth: number;
    recommendations: string[];
    status: 'good' | 'warning' | 'error';
  };
  description: {
    current: string;
    length: number;
    pixelWidth: number;
    recommendations: string[];
    status: 'good' | 'warning' | 'error';
  };
  score: number;
}

const Page = () => {
  const [url, setUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [analysis, setAnalysis] = useState<MetaAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [livePreview, setLivePreview] = useState<{
    title: string;
    description: string;
    url: string;
  } | null>(null);

  const fetchMeta = useCallback(async () => {
    if (!url.trim()) {
      setAnalysis(null);
      setLivePreview(null);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/tools/meta-optimizer?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch meta tags');
      }
      const data = await response.json();
      setAnalysis(data);
      setLivePreview(data.serpPreview);
    } catch (err: any) {
      setError(err.message);
      setAnalysis(null);
      setLivePreview(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const applyRecommendations = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/tools/meta-optimizer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          url, 
          customTitle: customTitle.trim() || undefined, 
          customDescription: customDescription.trim() || undefined 
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply recommendations');
      }
      const data = await response.json();
      setAnalysis(data);
      setLivePreview(data.serpPreview);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch for URL changes
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchMeta();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchMeta]);

  // Live preview updates when custom title/description changes
  useEffect(() => {
    if (analysis) {
      setLivePreview({
        title: customTitle.trim() || analysis.analysis.title.current || 'No title found',
        description: customDescription.trim() || analysis.analysis.description.current || 'No description found',
        url: url.replace(/^https?:\/\//, '').replace(/\/$/, '')
      });
    }
  }, [customTitle, customDescription, analysis, url]);

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPixelWidthColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage <= 80) return 'text-green-600';
    if (percentage <= 95) return 'text-yellow-600';
    return 'text-red-600';
  };
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
            Meta Tag Optimizer
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto'>
            Optimize your meta titles and descriptions for better click-through rates.
          </p>
        </div>

        <FormCard
          title="Meta Tag Optimizer"
          description="Enter URL and customize meta titles and descriptions for better CTR"
          className="max-w-4xl mx-auto"
          error={error}
          isLoading={loading}
        >
          <div className='space-y-6'>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL *
              </label>
              <input
                id="url"
                type='url'
                className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                placeholder='https://example.com'
                value={url}
                onChange={e => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="customTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Title (optional)
              </label>
              <input
                id="customTitle"
                type='text'
                className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                placeholder='Enter custom meta title'
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                disabled={loading}
                maxLength={60}
              />
            </div>
            <div>
              <label htmlFor="customDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Description (optional)
              </label>
              <textarea
                id="customDescription"
                className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none'
                placeholder='Enter custom meta description'
                value={customDescription}
                onChange={e => setCustomDescription(e.target.value)}
                disabled={loading}
                rows={3}
                maxLength={160}
              />
            </div>
            <Button 
              onClick={applyRecommendations} 
              disabled={loading || !url.trim()}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze & Optimize Meta Tags'}
            </Button>
          </div>
        </FormCard>

        {analysis && (
          <div className='mt-8'>
            <h2 className='text-2xl font-bold mb-4'>SERP Preview</h2>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md'>
              <p className='text-lg font-semibold'>{analysis.serpPreview.title}</p>
              <p className='text-gray-600'>{analysis.serpPreview.description}</p>
              <p className='text-blue-700'>{analysis.serpPreview.url}</p>
            </div>

            <div className='mt-4'>
              <h3 className='font-semibold'>Title Analysis</h3>
              <Progress value={analysis.title.pixelWidth} max={580} />
              {analysis.title.recommendations.map((rec, index) => (
                <p key={index} className={`text-sm ${analysis.title.status === 'error' ? 'text-red-600' : analysis.title.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>{rec}</p>
              ))}
            </div>

            <div className='mt-4'>
              <h3 className='font-semibold'>Description Analysis</h3>
              <Progress value={analysis.description.pixelWidth} max={920} />
              {analysis.description.recommendations.map((rec, index) => (
                <p key={index} className={`text-sm ${analysis.description.status === 'error' ? 'text-red-600' : analysis.description.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>{rec}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
