'use client';

import { useState } from 'react';
import { useTheme } from '../components/theme-provider';
import {
  Search,
  BarChart3,
  Globe,
  Zap,
  Target,
  TrendingUp,
  Link,
  FileText,
  Image,
  Smartphone,
  Clock,
  Shield,
  Eye,
  ChevronRight,
  Star,
  Users,
  Activity
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  features: string[];
  isPopular?: boolean;
  isNew?: boolean;
}

const seoTools: Tool[] = [
  {
    id: 'keyword-research',
    name: 'Keyword Research',
    description: 'Discover high-volume, low-competition keywords to boost your search rankings.',
    icon: <Search className="w-6 h-6" />,
    category: 'Research',
    features: ['Search Volume Analysis', 'Competition Analysis', 'Keyword Suggestions', 'Long-tail Keywords'],
    isPopular: true
  },
  {
    id: 'site-audit',
    name: 'SEO Site Audit',
    description: 'Comprehensive analysis of your website\'s SEO health and performance.',
    icon: <BarChart3 className="w-6 h-6" />,
    category: 'Analysis',
    features: ['Technical SEO Issues', 'On-page Analysis', 'Performance Metrics', 'Actionable Recommendations'],
    isPopular: true
  },
  {
    id: 'backlink-analyzer',
    name: 'Backlink Analyzer',
    description: 'Analyze your backlink profile and discover new link building opportunities.',
    icon: <Link className="w-6 h-6" />,
    category: 'Analysis',
    features: ['Backlink Quality Check', 'Competitor Analysis', 'Toxic Link Detection', 'Link Building Opportunities']
  },
  {
    id: 'page-speed',
    name: 'Page Speed Test',
    description: 'Test your website\'s loading speed and get optimization recommendations.',
    icon: <Zap className="w-6 h-6" />,
    category: 'Performance',
    features: ['Core Web Vitals', 'Mobile Performance', 'Optimization Tips', 'Historical Data'],
    isNew: true
  },
  {
    id: 'rank-tracker',
    name: 'Rank Tracker',
    description: 'Monitor your keyword rankings across different search engines.',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'Monitoring',
    features: ['Daily Rank Updates', 'SERP Features Tracking', 'Competitor Monitoring', 'Ranking Reports']
  },
  {
    id: 'meta-optimizer',
    name: 'Meta Tag Optimizer',
    description: 'Optimize your meta titles and descriptions for better click-through rates.',
    icon: <FileText className="w-6 h-6" />,
    category: 'Optimization',
    features: ['Title Length Check', 'Description Preview', 'SERP Simulator', 'A/B Testing']
  },
  {
    id: 'local-seo',
    name: 'Local SEO Checker',
    description: 'Optimize your business for local search results and Google My Business.',
    icon: <Globe className="w-6 h-6" />,
    category: 'Local',
    features: ['NAP Consistency', 'Local Citations', 'Review Management', 'Local Rank Tracking']
  },
  {
    id: 'image-optimizer',
    name: 'Image SEO Optimizer',
    description: 'Optimize your images for better search visibility and faster loading.',
    icon: <Image className="w-6 h-6"/>,
    category: 'Optimization',
    features: ['Alt Text Analysis', 'Image Compression', 'File Size Optimization', 'Format Recommendations']
  },
  {
    id: 'mobile-seo',
    name: 'Mobile SEO Tester',
    description: 'Test your website\'s mobile-friendliness and mobile SEO performance.',
    icon: <Smartphone className="w-6 h-6" />,
    category: 'Performance',
    features: ['Mobile Usability', 'Touch Elements', 'Viewport Configuration', 'Mobile Speed Test']
  },
  {
    id: 'schema-validator',
    name: 'Schema Markup Validator',
    description: 'Validate and optimize your structured data for rich snippets.',
    icon: <Shield className="w-6 h-6" />,
    category: 'Technical',
    features: ['Schema Validation', 'Rich Snippet Preview', 'Error Detection', 'Implementation Guide'],
    isNew: true
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    description: 'Analyze your competitors\' SEO strategies and find opportunities.',
    icon: <Target className="w-6 h-6" />,
    category: 'Research',
    features: ['Traffic Analysis', 'Keyword Gaps', 'Content Analysis', 'Backlink Comparison']
  },
  {
    id: 'serp-analyzer',
    name: 'SERP Analyzer',
    description: 'Analyze search engine results pages to understand ranking factors.',
    icon: <Eye className="w-6 h-6" />,
    category: 'Research',
    features: ['SERP Features', 'Content Analysis', 'Ranking Factors', 'Opportunity Identification']
  }
];

const categories = ['All', 'Research', 'Analysis', 'Optimization', 'Performance', 'Monitoring', 'Local', 'Technical'];

export default function ToolsPage() {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = seoTools.filter(tool => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToolClick = (toolId: string) => {
    // TODO: Navigate to specific tool page or open tool modal
    // Router navigation will be implemented when tool pages are ready
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              SEO Tools Suite
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive collection of SEO tools to analyze, optimize, and monitor your website&apos;s search performance.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{seoTools.length}</p>
                <p className="text-gray-600 dark:text-gray-400">Total Tools</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {seoTools.filter(tool => tool.isPopular).length}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Popular Tools</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {seoTools.filter(tool => tool.isNew).length}
                </p>
                <p className="text-gray-600 dark:text-gray-400">New Tools</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length - 1}</p>
                <p className="text-gray-600 dark:text-gray-400">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer group"
            >
              {/* Tool Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <div className="text-blue-600 dark:text-blue-400">
                      {tool.icon}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      {tool.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {tool.isPopular && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </span>
                  )}
                  {tool.isNew && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                      <Zap className="w-3 h-3 mr-1" />
                      New
                    </span>
                  )}
                </div>
              </div>

              {/* Tool Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {tool.description}
              </p>

              {/* Tool Features */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Key Features:</h4>
                <ul className="space-y-1">
                  {tool.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                  {tool.features.length > 3 && (
                    <li className="text-sm text-blue-600 dark:text-blue-400">
                      +{tool.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Button */}
              <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors group-hover:bg-blue-700">
                Launch Tool
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tools found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need a Custom SEO Solution?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our team can help you create custom SEO strategies and tools tailored to your specific business needs.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Contact Our SEO Experts
          </button>
        </div>
      </div>
    </div>
  );
}
