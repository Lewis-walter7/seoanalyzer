import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CrawlerService } from './src/crawler/crawler.service';

async function testCrawler() {
  console.log('🧪 Testing CrawlerService...');
  
  try {
    // Create NestJS application
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get CrawlerService instance
    const crawlerService = app.get<CrawlerService>(CrawlerService);
    
    console.log('✅ CrawlerService initialized successfully');
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
      }
      
      // Close the app
      setTimeout(() => {
        app.close();
        process.exit(0);
      }, 1000);
    });
    
    // Start a test crawl (using a simple, lightweight site)
    console.log('🔄 Starting test crawl...');
    const jobId = await crawlerService.crawl({
      id: 'test-crawl',
      urls: ['https://httpbin.org/html'], // Simple test page
      maxDepth: 1,
      maxPages: 5,
      respectRobotsTxt: false, // For testing
      crawlDelay: 500,
      timeout: 10000,
    });
    
    console.log(`📝 Test job ID: ${jobId}`);
    
    // Set timeout to prevent hanging
    setTimeout(() => {
      console.log('⏰ Test timeout reached');
      app.close();
      process.exit(1);
    }, 60000); // 1 minute timeout
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCrawler();
