const { PrismaClient } = require('@prisma/client');
const { EventEmitter2 } = require('@nestjs/event-emitter');

const prisma = new PrismaClient();

async function createTestUserAndProject() {
  try {
    console.log('🚀 Creating test user and project for camerasafrica.com...');

    // Create or get test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@camerasafrica.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test@camerasafrica.com',
        password: 'test123', // In production, this should be hashed
        isAdmin: false,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        trialUsed: false,
      },
    });

    console.log(`✅ Created/found test user: ${testUser.email} (ID: ${testUser.id})`);

    // Extract domain from URL
    const url = 'https://camerasafrica.com';
    const domain = new URL(url).hostname;

    // Check if project already exists
    let project = await prisma.project.findFirst({
      where: {
        userId: testUser.id,
        domain: domain
      }
    });

    if (project) {
      // Update existing project
      project = await prisma.project.update({
        where: { id: project.id },
        data: {
          name: 'Cameras Africa SEO Analysis',
          url: url,
          description: 'SEO analysis for Cameras Africa website',
          crawlStatus: 'QUEUED',
        }
      });
      console.log(`✅ Updated existing project: ${project.name} (ID: ${project.id})`);
    } else {
      // Create new project
      project = await prisma.project.create({
        data: {
          name: 'Cameras Africa SEO Analysis',
          url: url,
          domain: domain,
          description: 'SEO analysis for Cameras Africa website',
          userId: testUser.id,
          crawlStatus: 'QUEUED',
          totalPages: 0,
          totalIssues: 0,
        }
      });
      console.log(`✅ Created new project: ${project.name} (ID: ${project.id})`);
    }

    console.log(`✅ Created/updated project: ${project.name} (ID: ${project.id})`);
    console.log(`   URL: ${project.url}`);
    console.log(`   Domain: ${project.domain}`);

    // Check if there's already a running crawl job
    const existingCrawlJob = await prisma.crawlJob.findFirst({
      where: {
        projectId: project.id,
        status: {
          in: ['QUEUED', 'RUNNING']
        }
      }
    });

    if (existingCrawlJob) {
      console.log(`⚠️  Found existing crawl job (${existingCrawlJob.id}) with status: ${existingCrawlJob.status}`);
      console.log('   You can monitor this job or wait for it to complete.');
      return {
        user: testUser,
        project: project,
        crawlJob: existingCrawlJob
      };
    }

    // Create a new crawl job
    const crawlJob = await prisma.crawlJob.create({
      data: {
        projectId: project.id,
        status: 'QUEUED',
        maxPages: 200, // Increased limit
        maxDepth: 6,   // Increased depth
        userAgent: 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
        totalUrls: 0,
        processedUrls: 0,
        errorCount: 0,
      },
    });

    console.log(`✅ Created crawl job: ${crawlJob.id}`);
    console.log(`   Status: ${crawlJob.status}`);
    console.log(`   Max Pages: ${crawlJob.maxPages}`);
    console.log(`   Max Depth: ${crawlJob.maxDepth}`);

    return {
      user: testUser,
      project: project,
      crawlJob: crawlJob
    };

  } catch (error) {
    console.error('❌ Error creating test user and project:', error);
    throw error;
  }
}

async function triggerAnalysis(project, crawlJob) {
  try {
    console.log('\n🔍 Triggering analysis...');
    
    // Import the required services (this would need to be done properly in a real NestJS context)
    // For now, we'll just create the database records and let the system pick them up
    
    console.log('✅ Analysis has been queued. The system should automatically:');
    console.log('   1. Detect the new crawl job');
    console.log('   2. Start crawling camerasafrica.com');
    console.log('   3. Analyze up to 200 pages with depth 6');
    console.log('   4. Generate SEO audit data');
    
    console.log(`\n📊 Monitor progress by checking:`);
    console.log(`   - Project ID: ${project.id}`);
    console.log(`   - Crawl Job ID: ${crawlJob.id}`);
    console.log(`   - Database: crawl_jobs, pages, seo_audits collections`);

  } catch (error) {
    console.error('❌ Error triggering analysis:', error);
    throw error;
  }
}

async function monitorProgress(crawlJobId) {
  console.log(`\n👀 Monitoring crawl job: ${crawlJobId}`);
  
  const maxChecks = 30; // Check for up to 15 minutes (30 * 30s)
  let checks = 0;
  
  while (checks < maxChecks) {
    try {
      const crawlJob = await prisma.crawlJob.findUnique({
        where: { id: crawlJobId },
        include: {
          pages: {
            take: 5, // Get first 5 pages as examples
          }
        }
      });

      if (!crawlJob) {
        console.log('❌ Crawl job not found');
        break;
      }

      console.log(`\n📈 Status Update (${new Date().toLocaleTimeString()}):`);
      console.log(`   Status: ${crawlJob.status}`);
      console.log(`   Processed URLs: ${crawlJob.processedUrls}`);
      console.log(`   Total URLs: ${crawlJob.totalUrls}`);
      console.log(`   Error Count: ${crawlJob.errorCount}`);
      console.log(`   Pages Found: ${crawlJob.pages.length}`);

      if (crawlJob.pages.length > 0) {
        console.log('   Sample Pages:');
        crawlJob.pages.forEach((page, index) => {
          console.log(`     ${index + 1}. ${page.url} (${page.httpStatus})`);
        });
      }

      if (crawlJob.status === 'COMPLETED' || crawlJob.status === 'FAILED') {
        console.log(`\n🎉 Crawl job ${crawlJob.status.toLowerCase()}!`);
        
        if (crawlJob.status === 'COMPLETED') {
          // Get SEO audit summary
          const seoAudits = await prisma.seoAudit.count({
            where: {
              projectId: crawlJob.projectId
            }
          });
          
          console.log(`   📊 SEO Audits Created: ${seoAudits}`);
        }
        
        break;
      }

      checks++;
      if (checks < maxChecks) {
        console.log('   ⏳ Waiting 30 seconds for next update...');
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      }

    } catch (error) {
      console.error('❌ Error monitoring progress:', error);
      break;
    }
  }

  if (checks >= maxChecks) {
    console.log('\n⚠️  Monitoring timeout reached. Check the application logs for more details.');
  }
}

async function main() {
  try {
    console.log('🎯 Setting up test environment for Cameras Africa analysis...\n');

    // Step 1: Create test user and project
    const { user, project, crawlJob } = await createTestUserAndProject();

    // Step 2: Trigger analysis
    await triggerAnalysis(project, crawlJob);

    // Step 3: Monitor progress
    await monitorProgress(crawlJob.id);

    console.log('\n✨ Test setup complete!');
    console.log('\n📋 Summary:');
    console.log(`   User Email: ${user.email}`);
    console.log(`   Project: ${project.name}`);
    console.log(`   URL: ${project.url}`);
    console.log(`   Crawl Job ID: ${crawlJob.id}`);

  } catch (error) {
    console.error('💥 Main execution failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the script
main();
