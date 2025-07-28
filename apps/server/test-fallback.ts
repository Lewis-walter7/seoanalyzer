import 'reflect-metadata';
import { FallbackCrawlerService } from './src/crawler/crawler.service';

async function testFallbackCrawler() {
  console.log('🧪 Testing Fallback CrawlerService...');
  
  try {
    // Create FallbackCrawlerService instance directly
    const crawlerService = new FallbackCrawlerService();
    
    console.log('✅ FallbackCrawlerService created');
    
    // Initialize the service
    await crawlerService.onModuleInit();
    
    console.log('✅ FallbackCrawlerService initialized successfully');
    console.log('📊 Initial stats:', crawlerService.getStats());
    
    // Set up event listeners for testing
    crawlerService.on('crawl-started', (jobId) => {
      console.log(`🚀 Test crawl started: ${jobId}`);
    });
    
    crawlerService.on('page-crawled', (page) => {
      console.log(`📄 Page crawled: ${page.url} (${page.statusCode}) - ${page.title || 'No title'}`);
    });
    
    crawlerService.on('crawl-progress', (progress) => {
      console.log(`📊 Progress: ${progress.processedUrls}/${progress.totalUrls} pages processed`);
    });
    
    crawlerService.on('crawl-error', (error) => {
      console.log(`❌ Error: ${error.url} - ${error.error}`);
    });
    
    crawlerService.on('crawl-finished', (result) => {
      console.log(`✅ Crawl finished!`);
      console.log(`   Pages: ${result.pages.length}`);
      console.log(`   Errors: ${result.errors.length}`);
      console.log(`   Duration: ${result.totalDuration}ms`);
      
      // Show sample page data
      if (result.pages.length > 0) {
        const samplePage = result.pages[0];
        console.log(`\n📝 Sample page data:`);
        console.log(`   URL: ${samplePage.url}`);
        console.log(`   Title: ${samplePage.title}`);
        console.log(`   Status: ${samplePage.statusCode}`);
        console.log(`   Size: ${samplePage.size} bytes`);
        console.log(`   Load time: ${samplePage.loadTime}ms`);
        console.log(`   Links found: ${samplePage.links.length}`);
        console.log(`   H1 tags: ${samplePage.headings.h1.length}`);
        console.log(`   Meta description: ${samplePage.meta.description || 'None'}`);
        
        // Show first few links
        if (samplePage.links.length > 0) {
          console.log(`   First 3 links:`, samplePage.links.slice(0, 3));
        }
        
        // Show headings
        if (samplePage.headings.h1.length > 0) {
          console.log(`   H1 headings:`, samplePage.headings.h1);
        }
      }
      
      // Clean up
      setTimeout(async () => {
        await crawlerService.onModuleDestroy();
        process.exit(0);
      }, 1000);
    });
    
    // Start a test crawl
    console.log('🔄 Starting test crawl...');
    const jobId = await crawlerService.crawl({
      id: 'test-fallback-crawl',
      urls: ['https://httpbin.org/html'], // Simple test page
      maxDepth: 1,
      maxPages: 5,
      respectRobotsTxt: false, // For testing
      crawlDelay: 500,
      timeout: 10000,
    });
    
    console.log(`📝 Test job ID: ${jobId}`);
    
    // Test status checking
    setTimeout(() => {
      const status = crawlerService.getCrawlStatus(jobId);
      if (status) {
        console.log('📈 Current status:', {
          processed: status.progress.processedUrls,
          pending: status.progress.pendingUrls,
          errors: status.progress.errorUrls,
          completed: status.completed
        });
      }
    }, 2000);
    
    // Set timeout to prevent hanging
    setTimeout(async () => {
      console.log('⏰ Test timeout reached');
      await crawlerService.onModuleDestroy();
      process.exit(1);
    }, 30000); // 30 second timeout
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testFallbackCrawler();
