import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface MetaOptimizerRequest {
  url: string;
  customTitle?: string;
  customDescription?: string;
}

interface MetaAnalysis {
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
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

interface MetaOptimizerResponse {
  url: string;
  analysis: MetaAnalysis;
  serpPreview: {
    title: string;
    description: string;
    url: string;
  };
  score: number;
}

// Approximate pixel width calculation for Google SERP display
function calculatePixelWidth(text: string): number {
  // Average character widths in pixels for Google's display font
  const charWidths: { [key: string]: number } = {
    'i': 4, 'l': 4, '1': 4, 'I': 4, 'j': 4, 't': 5, 'f': 5, 'r': 6,
    ' ': 6, '!': 6, '|': 6, ':': 6, '.': 6, ',': 6, ';': 6, "'": 6,
    'a': 7, 'c': 7, 'e': 7, 'g': 7, 'n': 7, 'o': 7, 's': 7, 'u': 7,
    'v': 7, 'x': 7, 'z': 7, 'J': 7, 'T': 7, 'Y': 7, 'Z': 7, '(': 7,
    ')': 7, '[': 7, ']': 7, '{': 7, '}': 7, '-': 7, '_': 7, '=': 7,
    '+': 7, '*': 7, '^': 7, '~': 7, '`': 7, '"': 7, 'b': 8, 'd': 8,
    'h': 8, 'k': 8, 'p': 8, 'q': 8, 'y': 8, 'A': 8, 'B': 8, 'C': 8,
    'D': 8, 'E': 8, 'F': 8, 'G': 8, 'H': 8, 'K': 8, 'L': 8, 'N': 8,
    'O': 8, 'P': 8, 'Q': 8, 'R': 8, 'S': 8, 'U': 8, 'V': 8, 'X': 8,
    '0': 8, '2': 8, '3': 8, '4': 8, '5': 8, '6': 8, '7': 8, '8': 8,
    '9': 8, '?': 8, '&': 8, '%': 8, '$': 8, '#': 8, '@': 8, 'w': 9,
    'W': 9, 'm': 9, 'M': 9
  };

  let totalWidth = 0;
  for (const char of text) {
    totalWidth += charWidths[char] || 8; // Default to 8px for unknown characters
  }
  return totalWidth;
}

function analyzeTitle(title: string): MetaAnalysis['title'] {
  const length = title.length;
  const pixelWidth = calculatePixelWidth(title);
  const recommendations: string[] = [];
  let status: 'good' | 'warning' | 'error' = 'good';

  if (length === 0) {
    recommendations.push('Title tag is missing');
    status = 'error';
  } else if (length < 30) {
    recommendations.push('Title is too short (under 30 characters)');
    status = 'warning';
  } else if (length > 60) {
    recommendations.push('Title is too long (over 60 characters)');
    status = 'warning';
  }

  if (pixelWidth > 580) {
    recommendations.push('Title may be truncated in search results (over 580px)');
    status = status === 'error' ? 'error' : 'warning';
  }

  if (recommendations.length === 0) {
    recommendations.push('Title length is optimal');
  }

  return {
    current: title,
    length,
    pixelWidth,
    recommendations,
    status
  };
}

function analyzeDescription(description: string): MetaAnalysis['description'] {
  const length = description.length;
  const pixelWidth = calculatePixelWidth(description);
  const recommendations: string[] = [];
  let status: 'good' | 'warning' | 'error' = 'good';

  if (length === 0) {
    recommendations.push('Meta description is missing');
    status = 'error';
  } else if (length < 120) {
    recommendations.push('Description is too short (under 120 characters)');
    status = 'warning';
  } else if (length > 160) {
    recommendations.push('Description is too long (over 160 characters)');
    status = 'warning';
  }

  if (pixelWidth > 920) {
    recommendations.push('Description may be truncated in search results (over 920px)');
    status = status === 'error' ? 'error' : 'warning';
  }

  if (recommendations.length === 0) {
    recommendations.push('Description length is optimal');
  }

  return {
    current: description,
    length,
    pixelWidth,
    recommendations,
    status
  };
}

function calculateScore(analysis: MetaAnalysis): number {
  let score = 100;
  
  // Title scoring
  if (analysis.title.status === 'error') {
    score -= 30;
  } else if (analysis.title.status === 'warning') {
    score -= 15;
  }
  
  // Description scoring
  if (analysis.description.status === 'error') {
    score -= 30;
  } else if (analysis.description.status === 'warning') {
    score -= 15;
  }
  
  return Math.max(score, 0);
}

async function fetchMetaTags(url: string): Promise<{ title: string; description: string; ogTitle?: string; ogDescription?: string; ogImage?: string; twitterTitle?: string; twitterDescription?: string; twitterImage?: string }> {
  try {
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      title: $('title').text() || '',
      description: $('meta[name="description"]').attr('content') || '',
      ogTitle: $('meta[property="og:title"]').attr('content'),
      ogDescription: $('meta[property="og:description"]').attr('content'),
      ogImage: $('meta[property="og:image"]').attr('content'),
      twitterTitle: $('meta[name="twitter:title"]').attr('content'),
      twitterDescription: $('meta[name="twitter:description"]').attr('content'),
      twitterImage: $('meta[name="twitter:image"]').attr('content')
    };
  } catch (error) {
    // Return default values if fetching fails
    return {
      title: 'Unable to fetch title',
      description: 'Unable to fetch description'
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlPattern.test(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const metaTags = await fetchMetaTags(url);
    
    const analysis: MetaAnalysis = {
      title: analyzeTitle(metaTags.title),
      description: analyzeDescription(metaTags.description),
      ogTitle: metaTags.ogTitle,
      ogDescription: metaTags.ogDescription,
      ogImage: metaTags.ogImage,
      twitterTitle: metaTags.twitterTitle,
      twitterDescription: metaTags.twitterDescription,
      twitterImage: metaTags.twitterImage
    };

    const score = calculateScore(analysis);

    const response: MetaOptimizerResponse = {
      url,
      analysis,
      serpPreview: {
        title: metaTags.title || 'No title found',
        description: metaTags.description || 'No description found',
        url: url.replace(/^https?:\/\//, '').replace(/\/$/, '')
      },
      score
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Meta optimizer API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MetaOptimizerRequest = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlPattern.test(body.url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const metaTags = await fetchMetaTags(body.url);
    
    // Use custom values if provided, otherwise use fetched values
    const titleToAnalyze = body.customTitle || metaTags.title;
    const descriptionToAnalyze = body.customDescription || metaTags.description;

    const analysis: MetaAnalysis = {
      title: analyzeTitle(titleToAnalyze),
      description: analyzeDescription(descriptionToAnalyze),
      ogTitle: metaTags.ogTitle,
      ogDescription: metaTags.ogDescription,
      ogImage: metaTags.ogImage,
      twitterTitle: metaTags.twitterTitle,
      twitterDescription: metaTags.twitterDescription,
      twitterImage: metaTags.twitterImage
    };

    const score = calculateScore(analysis);

    const response: MetaOptimizerResponse = {
      url: body.url,
      analysis,
      serpPreview: {
        title: titleToAnalyze || 'No title found',
        description: descriptionToAnalyze || 'No description found',
        url: body.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
      },
      score
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Meta optimizer POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
