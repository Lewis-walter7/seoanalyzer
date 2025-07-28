# SEO Analyzer - CrawlerService

A powerful, configurable web crawler service built with NestJS and Playwright for SEO analysis and website auditing.

## Features

- 🎭 **Playwright Integration**: Uses headless Chromium for accurate page rendering
- 🔧 **Highly Configurable**: Depth control, rate limiting, user-agent customization
- 🤖 **Robots.txt Compliance**: Respects robots.txt rules and crawl delays
- 🚀 **Queue Management**: Breadth-first crawling with p-queue for concurrency control
- 📊 **Real-time Events**: Page crawled, progress updates, and error notifications
- 🎯 **Smart Filtering**: Include/exclude patterns, domain restrictions
- 📱 **Mobile Support**: Configurable viewport and device emulation
- 🔍 **Rich Data Extraction**: Meta tags, headings, links, and assets
- 💾 **Caching**: Robots.txt caching for improved performance

## Installation

The crawler service is already integrated into the NestJS application. Required dependencies:

```bash
bun add playwright p-queue robots-parser
```

## Quick Start

### Basic Usage

```typescript
import { CrawlerService } from './crawler/crawler.service';

// Inject the service
constructor(private readonly crawlerService: CrawlerService) {}

// Start a basic crawl
const jobId = await this.crawlerService.crawl({
  id: 'my-crawl-job',
  urls: ['https://example.com'],
  maxDepth: 2,
  maxPages: 100,
  respectRobotsTxt: true,
  crawlDelay: 1000
});
```

### Advanced Configuration

```typescript
const jobId = await this.crawlerService.crawl({
  id: 'advanced-crawl',
  urls: ['https://example.com'],
  maxDepth: 3,
  maxPages: 500,
  userAgent: 'SEO-Analyzer-Bot/1.0',
  disableJavaScript: false,
  respectRobotsTxt: true,
  crawlDelay: 2000,
  allowedDomains: ['example.com', 'blog.example.com'],
  excludePatterns: ['*/admin/*', '*.pdf'],
  includePatterns: ['*/blog/*', '*/docs/*'],
  customHeaders: { 'X-Custom': 'value' },
  viewport: { width: 1920, height: 1080 },
  timeout: 30000
});
```

## API Endpoints

### Start Crawl Job

```http
POST /api/crawler/jobs
Content-Type: application/json

{
  "urls": ["https://example.com"],
  "maxDepth": 2,
  "maxPages": 100,
  "respectRobotsTxt": true,
  "crawlDelay": 1000
}
```

### Get Crawl Status

```http
GET /api/crawler/jobs/{jobId}
```

### Cancel Crawl Job

```http
DELETE /api/crawler/jobs/{jobId}
```

### Get Active Jobs

```http
GET /api/crawler/jobs
```

### Get Crawler Stats

```http
GET /api/crawler/stats
```

## Configuration Options

### CrawlJob Interface

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | auto-generated | Unique identifier for the crawl job |
| `urls` | `string[]` | required | Starting URLs for the crawl |
| `maxDepth` | `number` | required | Maximum crawl depth from starting URLs |
| `maxPages` | `number` | required | Maximum number of pages to crawl |
| `userAgent` | `string?` | `'SEO-Analyzer-Bot/1.0'` | Custom user agent string |
| `disableJavaScript` | `boolean?` | `false` | Disable JavaScript execution |
| `respectRobotsTxt` | `boolean?` | `true` | Follow robots.txt rules |
| `crawlDelay` | `number?` | `1000` | Delay between requests (ms) |
| `allowedDomains` | `string[]?` | none | Restrict crawling to specific domains |
| `excludePatterns` | `string[]?` | none | URL patterns to exclude |
| `includePatterns` | `string[]?` | none | URL patterns to include |
| `customHeaders` | `Record<string, string>?` | none | Custom HTTP headers |
| `viewport` | `{width: number, height: number}?` | `{1920, 1080}` | Browser viewport size |
| `timeout` | `number?` | `30000` | Page load timeout (ms) |
| `retries` | `number?` | `3` | Number of retry attempts |

## Event System

The crawler service emits events that you can listen to:

```typescript
// Crawl started
crawlerService.on('crawl-started', (jobId: string) => {
  console.log(`Crawl started: ${jobId}`);
});

// Page successfully crawled
crawlerService.on('page-crawled', (page: CrawledPage) => {
  console.log(`Page crawled: ${page.url} (${page.statusCode})`);
});

// Crawl progress update
crawlerService.on('crawl-progress', (progress: CrawlProgress) => {
  console.log(`Progress: ${progress.processedUrls}/${progress.totalUrls}`);
});

// Error during crawling
crawlerService.on('crawl-error', (error: CrawlError) => {
  console.log(`Error: ${error.url} - ${error.error}`);
});

// Crawl completed
crawlerService.on('crawl-finished', (result: CrawlResult) => {
  console.log(`Finished: ${result.pages.length} pages, ${result.errors.length} errors`);
});
```

## Data Structures

### CrawledPage

Each crawled page returns rich data:

```typescript
interface CrawledPage {
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
  timestamp: Date;
}
```

## Best Practices

### 1. Respectful Crawling

```typescript
// Good: Respect robots.txt and use appropriate delays
const job: CrawlJob = {
  urls: ['https://example.com'],
  maxDepth: 2,
  maxPages: 100,
  respectRobotsTxt: true,
  crawlDelay: 2000, // 2 seconds between requests
  userAgent: 'YourBot/1.0 (+https://yoursite.com/bot)'
};
```

### 2. Domain Restrictions

```typescript
// Restrict crawling to specific domains
const job: CrawlJob = {
  urls: ['https://example.com'],
  allowedDomains: ['example.com', 'blog.example.com'],
  excludePatterns: ['*/admin/*', '*/private/*']
};
```

### 3. Performance Optimization

```typescript
// For content-heavy sites, disable JS for faster crawling
const job: CrawlJob = {
  urls: ['https://news.example.com'],
  disableJavaScript: true,
  crawlDelay: 500,
  timeout: 15000
};
```

### 4. Error Handling

```typescript
crawlerService.on('crawl-error', (error) => {
  // Log errors for monitoring
  console.error(`Crawl error: ${error.url} - ${error.error}`);
  
  // Could implement retry logic or alerting here
});
```

## Monitoring and Management

### Check Crawl Status

```typescript
const status = crawlerService.getCrawlStatus(jobId);
if (status) {
  console.log(`Progress: ${status.progress.processedUrls}/${status.progress.totalUrls}`);
  console.log(`Errors: ${status.errors.length}`);
  console.log(`Completed: ${status.completed}`);
}
```

### Cancel Long-Running Crawls

```typescript
const cancelled = crawlerService.cancelCrawl(jobId);
if (cancelled) {
  console.log('Crawl cancelled successfully');
}
```

### Get System Statistics

```typescript
const stats = crawlerService.getStats();
console.log('Active crawls:', stats.activeCrawls);
console.log('Robots cache entries:', stats.robotsCacheStats.entries);
```

## Use Cases

### 1. SEO Audit

```typescript
const seoAuditJob: CrawlJob = {
  urls: ['https://yoursite.com'],
  maxDepth: 3,
  maxPages: 1000,
  respectRobotsTxt: true,
  crawlDelay: 1000,
  includePatterns: ['*/blog/*', '*/products/*', '*/pages/*']
};
```

### 2. Competitor Analysis

```typescript
const competitorJob: CrawlJob = {
  urls: ['https://competitor.com'],
  maxDepth: 2,
  maxPages: 500,
  respectRobotsTxt: true,
  crawlDelay: 3000, // Be extra respectful
  excludePatterns: ['*/checkout/*', '*/cart/*', '*/account/*']
};
```

### 3. Site Migration Validation

```typescript
const migrationJob: CrawlJob = {
  urls: ['https://newsite.com'],
  maxDepth: 5,
  maxPages: 5000,
  disableJavaScript: false,
  crawlDelay: 500,
  customHeaders: { 'X-Migration-Check': 'true' }
};
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Reduce `maxPages` or increase `crawlDelay`
2. **Blocked by Robots.txt**: Check robots.txt compliance or disable with `respectRobotsTxt: false`
3. **Timeouts**: Increase `timeout` value or disable JavaScript for faster loading
4. **Rate Limiting**: Increase `crawlDelay` or reduce `concurrency`

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// Set LOG_LEVEL=debug in environment variables
process.env.LOG_LEVEL = 'debug';
```

## Security Considerations

- Always respect robots.txt unless explicitly authorized
- Use appropriate crawl delays to avoid overwhelming servers
- Set meaningful user-agent strings with contact information
- Implement proper error handling and logging
- Consider IP rotation for large-scale crawling
- Be aware of legal implications when crawling third-party sites

## Performance Tips

1. **Disable JavaScript** for content-only sites to improve speed
2. **Use domain restrictions** to avoid crawling external sites
3. **Implement smart filtering** with include/exclude patterns
4. **Monitor memory usage** and adjust `maxPages` accordingly
5. **Use appropriate timeouts** based on site complexity
6. **Cache robots.txt** (handled automatically)

## Contributing

When contributing to the crawler service:

1. Follow existing TypeScript patterns
2. Add comprehensive error handling
3. Include JSDoc comments for public methods
4. Write tests for new features
5. Update documentation

## License

This crawler service is part of the SEO Analyzer project and follows the same licensing terms.
