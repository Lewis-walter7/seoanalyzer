'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormCard } from '@/components/FormCard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Download, 
  Image as ImageIcon, 
  Settings, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  FileImage,
  Loader2
} from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from '@/utils/recharts-dynamic';
import { formatFileSize } from '@/utils/metrics';

interface ImageFile {
  file: File;
  id: string;
  preview: string;
  size: string;
  format: string;
}

interface OptimizationResult {
  originalName: string;
  optimizedName?: string;
  originalSize?: number;
  optimizedSize?: number;
  sizeSaved?: number;
  percentageSaved?: number;
  originalFormat?: string;
  optimizedFormat?: string;
  width?: number;
  height?: number;
  optimizedData?: string;
  mimeType?: string;
  error?: string;
}

interface OptimizationSummary {
  totalImages: number;
  successfulOptimizations: number;
  totalOriginalSize: number;
  totalOptimizedSize: number;
  totalSizeSaved: number;
  totalPercentageSaved: number;
}

const Page = () => {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [compressionLevel, setCompressionLevel] = useState(80);
  const [convertToWebP, setConvertToWebP] = useState(true);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [summary, setSummary] = useState<OptimizationSummary | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const generateId = () => Math.random().toString(36).substr(2, 9);

  const processFiles = useCallback((files: FileList) => {
    const imageFiles: ImageFile[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const id = generateId();
        const preview = URL.createObjectURL(file);
        const size = formatFileSize(file.size);
        const format = file.type.split('/')[1].toUpperCase();
        
        imageFiles.push({ file, id, preview, size, format });
      }
    });
    
    setSelectedImages(prev => [...prev, ...imageFiles]);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same files again
    e.target.value = '';
  }, [processFiles]);

  const removeImage = (id: string) => {
    setSelectedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up object URLs
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const optimizeImages = async () => {
    if (selectedImages.length === 0) return;
    
    setIsOptimizing(true);
    setResults([]);
    setSummary(null);
    
    try {
      const formData = new FormData();
      selectedImages.forEach(img => {
        formData.append('images', img.file);
      });
      formData.append('compressionLevel', compressionLevel.toString());
      formData.append('convertToWebP', convertToWebP.toString());
      
      const response = await fetch('/api/tools/image-optimizer', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to optimize images');
      }
      
      const data = await response.json();
      setResults(data.results);
      setSummary(data.summary);
      
    } catch (error) {
      console.error('Optimization error:', error);
      // Show error state
    } finally {
      setIsOptimizing(false);
    }
  };

  const downloadImage = (result: OptimizationResult) => {
    if (!result.optimizedData || !result.optimizedName) return;
    
    const byteCharacters = atob(result.optimizedData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: result.mimeType });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.optimizedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllImages = () => {
    results.filter(r => !r.error).forEach(result => {
      setTimeout(() => downloadImage(result), 100);
    });
  };

  // Chart data for cumulative savings (Recharts format)
  const chartData = results.filter(r => !r.error).map(r => ({
    name: r.originalName,
    original: Math.round((r.originalSize || 0) / 1024),
    optimized: Math.round((r.optimizedSize || 0) / 1024),
  }));

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
            Image SEO Optimizer
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto'>
            Optimize your images for better search visibility and faster loading times.
          </p>
        </div>

        {/* Upload Section */}
        <FormCard
          title="Upload Images"
          description="Select or drag images to optimize for better SEO performance"
          className="mb-8"
        >
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <FileImage className='w-12 h-12 mx-auto mb-4 text-gray-400' />
              <p className='text-lg font-medium mb-2'>Drop images here or click to select</p>
              <p className='text-sm text-gray-500 mb-4'>Supports JPG, PNG, WebP, and GIF formats</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant='outline'
              >
                Select Images
              </Button>
              <input
                ref={fileInputRef}
                type='file'
                multiple
                accept='image/*'
                onChange={handleFileSelect}
                className='hidden'
              />
            </div>

            {/* Selected Images */}
            {selectedImages.length > 0 && (
              <div className='mt-6'>
                <h3 className='text-lg font-medium mb-4'>Selected Images ({selectedImages.length})</h3>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {selectedImages.map(img => (
                    <div key={img.id} className='relative group'>
                      <div className='aspect-square rounded-lg overflow-hidden bg-gray-100'>
                        <img
                          src={img.preview}
                          alt='Preview'
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <button
                        onClick={() => removeImage(img.id)}
                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <X className='w-4 h-4' />
                      </button>
                      <div className='mt-2 text-sm'>
                        <p className='font-medium truncate'>{img.file.name}</p>
                        <div className='flex justify-between text-gray-500'>
                          <span>{img.format}</span>
                          <span>{img.size}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </FormCard>

        {/* Settings Section */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='w-5 h-5' />
              Optimization Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Compression Level: {compressionLevel}%
                </label>
                <input
                  type='range'
                  min='10'
                  max='100'
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
                  className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
                />
                <div className='flex justify-between text-xs text-gray-500 mt-1'>
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>
              <div>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={convertToWebP}
                    onChange={(e) => setConvertToWebP(e.target.checked)}
                    className='rounded border-gray-300'
                  />
                  <span className='text-sm font-medium'>Convert to WebP format</span>
                </label>
                <p className='text-xs text-gray-500 mt-1'>
                  WebP provides better compression than JPEG/PNG while maintaining quality
                </p>
              </div>
            </div>
            <div className='mt-6 flex justify-end'>
              <Button
                onClick={optimizeImages}
                disabled={selectedImages.length === 0 || isOptimizing}
                className='flex items-center gap-2'
              >
                {isOptimizing ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <ImageIcon className='w-4 h-4' />
                )}
                {isOptimizing ? 'Optimizing...' : 'Optimize Images'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {(results.length > 0 || summary) && (
          <div className='space-y-8'>
            {/* Summary Statistics */}
            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <BarChart3 className='w-5 h-5' />
                    Optimization Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-blue-600'>{summary.totalImages}</div>
                      <div className='text-sm text-gray-500'>Total Images</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600'>{summary.successfulOptimizations}</div>
                      <div className='text-sm text-gray-500'>Optimized</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-purple-600'>{formatFileSize(summary.totalSizeSaved)}</div>
                      <div className='text-sm text-gray-500'>Size Saved</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-orange-600'>{summary.totalPercentageSaved}%</div>
                      <div className='text-sm text-gray-500'>Space Saved</div>
                    </div>
                  </div>
                  
                  {/* Cumulative Savings Chart */}
                  {results.filter(r => !r.error).length > 0 && (
                    <div className='mt-6'>
                      <h3 className='text-lg font-medium mb-4'>Size Comparison Chart</h3>
                      <div className='h-64'>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="original" fill="#ef4444" />
                            <Bar dataKey="optimized" fill="#22c55e" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  
                  <div className='flex justify-end mt-6'>
                    <Button onClick={downloadAllImages} className='flex items-center gap-2'>
                      <Download className='w-4 h-4' />
                      Download All Optimized
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Individual Results */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {results.map((result, index) => (
                    <div key={index} className='border rounded-lg p-4'>
                      {result.error ? (
                        <div className='flex items-center gap-2 text-red-600'>
                          <AlertCircle className='w-5 h-5' />
                          <span className='font-medium'>{result.originalName}</span>
                          <span className='text-sm'>- {result.error}</span>
                        </div>
                      ) : (
                        <div>
                          <div className='flex items-center justify-between mb-3'>
                            <div className='flex items-center gap-2'>
                              <CheckCircle className='w-5 h-5 text-green-600' />
                              <span className='font-medium'>{result.originalName}</span>
                              <Badge variant='outline'>
                                {result.originalFormat?.toUpperCase()} → {result.optimizedFormat?.toUpperCase()}
                              </Badge>
                            </div>
                            <Button
                              size='sm'
                              onClick={() => downloadImage(result)}
                              className='flex items-center gap-1'
                            >
                              <Download className='w-3 h-3' />
                              Download
                            </Button>
                          </div>
                          
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                            <div>
                              <span className='text-gray-500'>Original Size:</span>
                              <div className='font-medium'>{formatFileSize(result.originalSize || 0)}</div>
                            </div>
                            <div>
                              <span className='text-gray-500'>Optimized Size:</span>
                              <div className='font-medium'>{formatFileSize(result.optimizedSize || 0)}</div>
                            </div>
                            <div>
                              <span className='text-gray-500'>Size Saved:</span>
                              <div className='font-medium text-green-600'>{formatFileSize(result.sizeSaved || 0)}</div>
                            </div>
                            <div>
                              <span className='text-gray-500'>Percentage Saved:</span>
                              <div className='font-medium text-green-600'>{result.percentageSaved}%</div>
                            </div>
                          </div>
                          
                          {result.width && result.height && (
                            <div className='mt-2 text-sm text-gray-500'>
                              Dimensions: {result.width} × {result.height}px
                            </div>
                          )}
                          
                          <div className='mt-3'>
                            <Progress 
                              value={result.percentageSaved} 
                              max={100} 
                              className='h-2'
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
