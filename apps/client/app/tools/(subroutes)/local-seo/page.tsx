'use client';

import React, { useState } from 'react';
import { FormCard } from '@/components/FormCard';
import LocalSeoForm from './components/LocalSeoForm';
import LocalSeoResults from './components/LocalSeoResults';


const Page = () => {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSeoSubmit = async () => {
    setIsLoading(true);
    // API call will go here
    setTimeout(() => {
      // Mock results
      //setResults({ /* Mock data */ });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Local SEO Checker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Optimize your business for local search results and Google My Business.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <FormCard
              title="Enter Business Details"
              description="Enter your business information to analyze local SEO performance"
            >
              <LocalSeoForm onSubmit={handleSeoSubmit} isLoading={isLoading} />
            </FormCard>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <LocalSeoResults results={results} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page