"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRAWLER_USAGE_EXAMPLES = exports.CrawlerExample = void 0;
/**
 * Example usage of the CrawlerService
 * This demonstrates how to use the crawler service with various configurations
 */
class CrawlerExample {
    crawlerService;
    constructor(crawlerService) {
        this.crawlerService = crawlerService;
    }
    /**
     * Basic website crawl example
     */
    async basicCrawlExample() {
        const crawlJob = {
            id: 'example-basic-crawl',
            urls: ['https://ontime.co.ke'],
            maxDepth: 2,
            maxPages: 50,
            respectRobotsTxt: true,
            crawlDelay: 1000, // 1 second delay between requests
        };
        // Set up event listeners
        this.crawlerService.on('crawl-started', (jobId) => {
            console.log(`🚀 Crawl started: ${jobId}`);
        });
        this.crawlerService.on('page-crawled', (page) => {
            console.log(`📄 Page crawled: ${page.url} (${page.statusCode}) - ${page.title}`);
        });
        this.crawlerService.on('crawl-progress', (progress) => {
            console.log(`📊 Progress: ${progress.processedUrls}/${progress.totalUrls} pages processed`);
        });
        this.crawlerService.on('crawl-error', (error) => {
            console.log(`❌ Error crawling ${error.url}: ${error.error}`);
        });
        this.crawlerService.on('crawl-finished', (result) => {
            console.log(`✅ Crawl finished: ${result.pages.length} pages, ${result.errors.length} errors`);
            console.log(`Duration: ${result.totalDuration}ms`);
        });
        return await this.crawlerService.crawl(crawlJob);
    }
    /**
     * Advanced crawl with custom configuration
     */
    async advancedCrawlExample() {
        const crawlJob = {
            id: 'example-advanced-crawl',
            urls: ['https://docs.example.com'],
            maxDepth: 3,
            maxPages: 100,
            userAgent: 'SEO-Analyzer-Bot/1.0 (Advanced Crawler)',
            disableJavaScript: false,
            respectRobotsTxt: true,
            crawlDelay: 2000,
            allowedDomains: ['docs.example.com', 'help.example.com'],
            excludePatterns: [
                '*/admin/*',
                '*/private/*',
                '*.pdf',
                '*.zip'
            ],
            includePatterns: [
                '*/docs/*',
                '*/help/*',
                '*/guides/*'
            ],
            customHeaders: {
                'X-Crawler': 'SEO-Analyzer',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            viewport: {
                width: 1920,
                height: 1080
            },
            timeout: 30000,
            retries: 3
        };
        return await this.crawlerService.crawl(crawlJob);
    }
    /**
     * E-commerce site crawl example (respecting robots.txt and rate limits)
     */
    async ecommerceCrawlExample() {
        const crawlJob = {
            id: 'example-ecommerce-crawl',
            urls: ['https://shop.example.com'],
            maxDepth: 4,
            maxPages: 500,
            userAgent: 'SEO-Analyzer-Bot/1.0 (E-commerce Crawler)',
            respectRobotsTxt: true,
            crawlDelay: 3000, // Slower crawling for e-commerce
            allowedDomains: ['shop.example.com'],
            excludePatterns: [
                '*/cart/*',
                '*/checkout/*',
                '*/account/*',
                '*/admin/*',
                '*/api/*'
            ],
            includePatterns: [
                '*/products/*',
                '*/categories/*',
                '*/collections/*'
            ],
            viewport: {
                width: 1366,
                height: 768
            },
            timeout: 45000 // Longer timeout for product pages
        };
        return await this.crawlerService.crawl(crawlJob);
    }
    /**
     * News site crawl example (JavaScript disabled for faster crawling)
     */
    async newsSiteCrawlExample() {
        const crawlJob = {
            id: 'example-news-crawl',
            urls: ['https://news.example.com'],
            maxDepth: 2,
            maxPages: 200,
            userAgent: 'SEO-Analyzer-Bot/1.0 (News Crawler)',
            disableJavaScript: true, // Faster crawling for content sites
            respectRobotsTxt: true,
            crawlDelay: 500, // Faster crawling since JS is disabled
            allowedDomains: ['news.example.com'],
            excludePatterns: [
                '*/comments/*',
                '*/user/*',
                '*/auth/*'
            ],
            includePatterns: [
                '*/articles/*',
                '*/news/*',
                '*/sports/*',
                '*/tech/*'
            ],
            timeout: 15000 // Shorter timeout since JS is disabled
        };
        return await this.crawlerService.crawl(crawlJob);
    }
    /**
     * Monitor crawl progress and get real-time updates
     */
    async monitorCrawlProgress(jobId) {
        const checkProgress = () => {
            const status = this.crawlerService.getCrawlStatus(jobId);
            if (status) {
                console.log(`Job ${jobId} Progress:`, {
                    processed: status.progress.processedUrls,
                    pending: status.progress.pendingUrls,
                    errors: status.progress.errorUrls,
                    depth: status.progress.currentDepth,
                    completed: status.completed
                });
                if (!status.completed) {
                    setTimeout(checkProgress, 5000); // Check every 5 seconds
                }
            }
            else {
                console.log(`Job ${jobId} not found or completed`);
            }
        };
        checkProgress();
    }
    /**
     * Demonstrate crawler statistics and management
     */
    async demonstrateCrawlerManagement() {
        // Get crawler statistics
        const stats = this.crawlerService.getStats();
        console.log('Crawler Stats:', stats);
        // Get active crawls
        const activeCrawls = this.crawlerService.getActiveCrawls();
        console.log('Active Crawls:', activeCrawls);
        // Update crawler options
        this.crawlerService.updateOptions({
            concurrency: 3,
            defaultCrawlDelay: 2000,
            respectRobotsTxt: true
        });
        console.log('Updated crawler options');
    }
    /**
     * Example of crawling multiple sites simultaneously
     */
    async multipleSitesCrawlExample() {
        const sites = [
            'https://example1.com',
            'https://example2.com',
            'https://example3.com'
        ];
        const crawlPromises = sites.map(async (url, index) => {
            const crawlJob = {
                id: `multi-site-crawl-${index + 1}`,
                urls: [url],
                maxDepth: 2,
                maxPages: 50,
                crawlDelay: 1000 + (index * 500), // Stagger the delays
                respectRobotsTxt: true
            };
            return await this.crawlerService.crawl(crawlJob);
        });
        return await Promise.all(crawlPromises);
    }
}
exports.CrawlerExample = CrawlerExample;
/**
 * Usage examples
 */
exports.CRAWLER_USAGE_EXAMPLES = {
    basic: `
// Basic crawl
const jobId = await crawlerService.crawl({
  id: 'my-crawl-job',
  urls: ['https://example.com'],
  maxDepth: 2,
  maxPages: 100,
  respectRobotsTxt: true,
  crawlDelay: 1000
});
`,
    advanced: `
// Advanced crawl with custom settings
const jobId = await crawlerService.crawl({
  id: 'advanced-crawl',
  urls: ['https://example.com'],
  maxDepth: 3,
  maxPages: 500,
  userAgent: 'My-Custom-Bot/1.0',
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
`,
    monitoring: `
// Monitor crawl progress
crawlerService.on('page-crawled', (page) => {
  console.log(\`Crawled: \${page.url} (\${page.statusCode})\`);
});

crawlerService.on('crawl-finished', (result) => {
  console.log(\`Finished: \${result.pages.length} pages crawled\`);
});

// Check status
const status = crawlerService.getCrawlStatus(jobId);
console.log('Current status:', status);
`,
    cancellation: `
// Cancel a running crawl
const cancelled = crawlerService.cancelCrawl(jobId);
if (cancelled) {
  console.log('Crawl cancelled successfully');
}
`
};
