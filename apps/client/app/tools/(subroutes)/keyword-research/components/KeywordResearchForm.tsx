'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface KeywordResearchFormProps {
  onSubmit: (keywords: string[]) => void;
  isLoading?: boolean;
}

const KeywordResearchForm: React.FC<KeywordResearchFormProps> = ({ onSubmit, isLoading = false }) => {
  const [keywords, setKeywords] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.trim()) {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      onSubmit(keywordList);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Enter Keywords (comma-separated)
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <textarea
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="seo tools, keyword research, backlink analysis..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !keywords.trim()}
        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing Keywords...
          </>
        ) : (
          <>
            <Search className="w-5 h-5 mr-2" />
            Research Keywords
          </>
        )}
      </button>
    </form>
  );
};

export default KeywordResearchForm;
