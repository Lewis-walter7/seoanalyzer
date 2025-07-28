import { EventEmitter } from 'events';

export interface CrawlJob {
  id: string;
  urls: string[];
  maxDepth: number;
  maxPages: number;
  userAgent?: string;
  disableJavaScript?: boolean;
  respectRobotsTxt?: boolean;
  crawlDelay?: number; // in milliseconds
  allowedDomains?: string[];
  excludePatterns?: string[];
  includePatterns?: string[];
  customHeaders?: Record<string, string>;
  viewport?: {
    width: number;
    height: number;
  };
  timeout?: number; // in milliseconds
  retries?: number;
}

export interface CrawledPage {
  url: string;
  title?: string;
  statusCode: number;
  contentType?: string;
  size: number;
  loadTime: number;
  depth: number;
  parentUrl?: string;
  links: string[];
  assets: {
    images: string[];
    scripts: string[];
    stylesheets: string[];
  };
  meta: {
    description?: string;
    keywords?: string;
    robots?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  errors?: string[];
  timestamp: Date;
}

export interface CrawlError {
  url: string;
  error: string;
  statusCode?: number;
  timestamp: Date;
  depth: number;
  parentUrl?: string;
}

export interface CrawlProgress {
  totalUrls: number;
  processedUrls: number;
  pendingUrls: number;
  errorUrls: number;
  currentDepth: number;
  startTime: Date;
  estimatedTimeRemaining?: number;
}

export interface CrawlStats {
  avgLoadTime: number;
  successRate: number;
  crawlDuration: number;
}

export interface CrawlResult {
  jobId: string;
  pages: CrawledPage[];
  errors: CrawlError[];
  progress: CrawlProgress;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  stats?: CrawlStats;
}

export interface RobotsTxtRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
  sitemap?: string[];
}

export interface CrawlerOptions {
  concurrency?: number;
  defaultUserAgent?: string;
  defaultTimeout?: number;
  defaultRetries?: number;
  respectRobotsTxt?: boolean;
  defaultCrawlDelay?: number;
}

export interface CrawlerEvents {
  'page-crawled': (page: CrawledPage) => void;
  'crawl-error': (error: CrawlError) => void;
  'crawl-progress': (progress: CrawlProgress) => void;
  'crawl-finished': (result: CrawlResult) => void;
  'crawl-started': (jobId: string) => void;
}
