'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Eye, Code, Search } from 'lucide-react';

interface SchemaValidationError {
  type: 'error' | 'warning';
  message: string;
  line?: number;
  property?: string;
  value?: any;
}

interface ParsedSchema {
  type: string;
  data: any;
  format: string;
  errors: SchemaValidationError[];
  warnings: SchemaValidationError[];
}

interface RichSnippetPreview {
  type: string;
  title?: string;
  description?: string;
  image?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  author?: string;
  publishDate?: string;
  breadcrumbs?: string[];
}

interface SchemaValidationResult {
  url: string;
  schemas: ParsedSchema[];
  richSnippets: RichSnippetPreview[];
  summary: {
    totalSchemas: number;
    validSchemas: number;
    errorCount: number;
    warningCount: number;
    schemaTypes: string[];
  };
  recommendations: string[];
  validatedAt: Date;
}

const SchemaValidator = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<SchemaValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'schemas' | 'preview' | 'recommendations'>('overview');

  const handleValidate = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/tools/schema-validator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        throw new Error('Validation failed');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError('Failed to validate schema. Please check the URL and try again.');
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSchemaCard = (schema: ParsedSchema, index: number) => (
    <Card key={index} className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          <h3 className="font-medium">{schema.type}</h3>
          <Badge variant="outline">{schema.format}</Badge>
        </div>
        <div className="flex gap-2">
          {schema.errors.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {schema.errors.length} errors
            </Badge>
          )}
          {schema.warnings.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {schema.warnings.length} warnings
            </Badge>
          )}
          {schema.errors.length === 0 && schema.warnings.length === 0 && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Valid
            </Badge>
          )}
        </div>
      </div>
      
      {/* Display errors and warnings */}
      {[...schema.errors, ...schema.warnings].map((issue, i) => (
        <div key={i} className={`p-3 rounded mb-2 ${issue.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-4 h-4 ${issue.type === 'error' ? 'text-red-500' : 'text-yellow-500'}`} />
            <span className="text-sm font-medium">{issue.type === 'error' ? 'Error' : 'Warning'}</span>
          </div>
          <p className="text-sm mt-1">{issue.message}</p>
          {issue.property && (
            <p className="text-xs text-gray-600 mt-1">Property: {issue.property}</p>
          )}
        </div>
      ))}
      
      {/* Schema data preview */}
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
          View Schema Data
        </summary>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-2 overflow-x-auto">
          {JSON.stringify(schema.data, null, 2)}
        </pre>
      </details>
    </Card>
  );

  const renderRichSnippetPreview = (snippet: RichSnippetPreview, index: number) => (
    <Card key={index} className="p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4" />
        <h3 className="font-medium">Rich Snippet Preview: {snippet.type}</h3>
      </div>
      
      {/* Mock Google search result preview */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="text-blue-600 text-lg hover:underline cursor-pointer">
          {snippet.title || 'Page Title'}
        </div>
        <div className="text-green-600 text-sm mt-1">
          example.com › page
        </div>
        <div className="text-gray-700 text-sm mt-2">
          {snippet.description || 'Page description will appear here...'}
        </div>
        
        {/* Additional rich snippet elements */}
        {snippet.rating && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.floor(snippet.rating))}
            </div>
            <span className="text-sm text-gray-600">
              {snippet.rating}/5 ({snippet.reviewCount} reviews)
            </span>
          </div>
        )}
        
        {snippet.price && (
          <div className="text-lg font-bold text-green-600 mt-2">
            {snippet.price}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Schema Markup Validator</h1>
        <p className="text-gray-600">Validate and optimize your structured data for rich snippets and better search visibility.</p>
      </div>

      {/* Input Form */}
      <Card className="mb-8 p-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={handleValidate}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Validating...' : 'Validate Schema'}
          </Button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {result && (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-600">{result.summary.totalSchemas}</div>
              <div className="text-sm text-gray-600">Total Schemas</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">{result.summary.validSchemas}</div>
              <div className="text-sm text-gray-600">Valid Schemas</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-red-600">{result.summary.errorCount}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{result.summary.warningCount}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'schemas', label: 'Schema Details' },
                  { key: 'preview', label: 'Rich Snippet Preview' },
                  { key: 'recommendations', label: 'Recommendations' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Validation Overview</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Detected Schema Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.summary.schemaTypes.map(type => (
                        <Badge key={type} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Validation Summary</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Found {result.summary.totalSchemas} schema markup(s)</li>
                      <li>• {result.summary.validSchemas} schema(s) are valid</li>
                      <li>• {result.summary.errorCount} error(s) detected</li>
                      <li>• {result.summary.warningCount} warning(s) found</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'schemas' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Schema Details</h2>
                {result.schemas.length > 0 ? (
                  result.schemas.map(renderSchemaCard)
                ) : (
                  <Card className="p-6 text-center">
                    <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Schema Markup Found</h3>
                    <p className="text-gray-600">This page doesn't contain any detectable structured data markup.</p>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Rich Snippet Preview</h2>
                {result.richSnippets.length > 0 ? (
                  result.richSnippets.map(renderRichSnippetPreview)
                ) : (
                  <Card className="p-6 text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Rich Snippets Available</h3>
                    <p className="text-gray-600">Add structured data to enable rich snippet previews for this page.</p>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'recommendations' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Implementation Recommendations</h2>
                {result.recommendations.length > 0 ? (
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Great Job!</h3>
                    <p className="text-gray-600">Your schema markup is properly configured. No recommendations at this time.</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaValidator;
