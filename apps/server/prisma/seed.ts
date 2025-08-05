import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ===========================
  // SUBSCRIPTION PLANS SEEDING
  // ===========================
  console.log('📦 Seeding subscription plans...');

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'free',
      displayName: 'Free',
      description: 'Perfect for getting started',
      priceMonthly: 0,
      priceYearly: 0,
      maxProjects: 1,
      maxKeywords: 10,
      maxAnalysesPerMonth: 5,
      maxReportsPerMonth: 2,
      maxCompetitors: 1,
      hasAdvancedReports: false,
      hasAPIAccess: false,
      hasWhiteLabel: false,
      hasCustomBranding: false,
      hasPrioritySupport: false,
      hasTeamCollaboration: false,
      hasCustomAlerts: false,
      hasDataExport: false,
      analysisFrequencies: ['MONTHLY'],
      isActive: true,
      isPopular: false,
      sortOrder: 1,
    },
    {
      id: 'starter',
      name: 'starter',
      displayName: 'Starter',
      description: 'For small businesses and freelancers',
      priceMonthly: 1700, // $17.00 in cents
      priceYearly: 16300, // $163.00 in cents (20% discount)
      maxProjects: 5,
      maxKeywords: 100,
      maxAnalysesPerMonth: 50,
      maxReportsPerMonth: 10,
      maxCompetitors: 5,
      hasAdvancedReports: true,
      hasAPIAccess: false,
      hasWhiteLabel: false,
      hasCustomBranding: false,
      hasPrioritySupport: false,
      hasTeamCollaboration: false,
      hasCustomAlerts: true,
      hasDataExport: true,
      analysisFrequencies: ['WEEKLY', 'MONTHLY'],
      isActive: true,
      isPopular: true,
      sortOrder: 2,
    },
    {
      id: 'professional',
      name: 'professional',
      displayName: 'Professional',
      description: 'For growing agencies and teams',
      priceMonthly: 5900, // $59.00 in cents
      priceYearly: 56600, // $566.00 in cents (20% discount)
      maxProjects: 25,
      maxKeywords: 500,
      maxAnalysesPerMonth: 200,
      maxReportsPerMonth: 50,
      maxCompetitors: 25,
      hasAdvancedReports: true,
      hasAPIAccess: true,
      hasWhiteLabel: true,
      hasCustomBranding: true,
      hasPrioritySupport: true,
      hasTeamCollaboration: true,
      hasCustomAlerts: true,
      hasDataExport: true,
      analysisFrequencies: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'],
      isActive: true,
      isPopular: false,
      sortOrder: 3,
    },
    {
      id: 'enterprise',
      name: 'enterprise',
      displayName: 'Enterprise',
      description: 'For large organizations',
      priceMonthly: 16900, // $169.00 in cents
      priceYearly: 162200, // $1622.00 in cents (20% discount)
      maxProjects: 0, // 0 = unlimited
      maxKeywords: 0, // 0 = unlimited
      maxAnalysesPerMonth: 1000,
      maxReportsPerMonth: 200,
      maxCompetitors: 100,
      hasAdvancedReports: true,
      hasAPIAccess: true,
      hasWhiteLabel: true,
      hasCustomBranding: true,
      hasPrioritySupport: true,
      hasTeamCollaboration: true,
      hasCustomAlerts: true,
      hasDataExport: true,
      analysisFrequencies: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'],
      isActive: true,
      isPopular: false,
      sortOrder: 4,
    },
  ];

  for (const planData of subscriptionPlans) {
    const { id, ...createData } = planData;
    try {
      // Try to find existing plan by name
      const existingPlan = await prisma.subscriptionPlan.findFirst({
        where: { name: planData.name }
      });
      
      if (existingPlan) {
        // Update existing plan
        await prisma.subscriptionPlan.update({
          where: { id: existingPlan.id },
          data: createData,
        });
        console.log(`🔄 Updated existing plan: ${planData.displayName}`);
      } else {
        // Create new plan
        await prisma.subscriptionPlan.create({
          data: createData,
        });
        console.log(`✅ Created new plan: ${planData.displayName}`);
      }
    } catch (error) {
      console.error(`❌ Error processing plan ${planData.displayName}:`, error);
    }
  }

  // ===========================
  // SAMPLE PROJECT SEEDING
  // ===========================
  console.log('🏗️  Seeding sample project...');
  
  // Try to find existing project first
  let project = await prisma.project.findFirst({
    where: { domain: 'example.com' }
  });
  
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Example Website',
        url: 'https://example.com',
        domain: 'example.com',
        description: 'Sample project for SEO analysis',
      },
    });
    console.log('✅ Created sample project');
  } else {
    console.log('🔄 Sample project already exists');
  }

  // Create a sample crawl job (only if not exists)
  const existingCrawlJob = await prisma.crawlJob.findFirst({
    where: { projectId: project.id }
  });
  
  let crawlJob;
  if (!existingCrawlJob) {
    crawlJob = await prisma.crawlJob.create({
      data: {
        projectId: project.id,
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 3600000), // 1 hour ago
        finishedAt: new Date(),
        totalUrls: 1,
        processedUrls: 1,
        errorCount: 0,
        maxPages: 100,
        maxDepth: 3,
      },
    });
    console.log('✅ Created sample crawl job');
  } else {
    crawlJob = existingCrawlJob;
    console.log('🔄 Sample crawl job already exists');
  }

  // Create a sample page
  const page = await prisma.page.create({
    data: {
      crawlJobId: crawlJob.id,
      url: 'https://example.com',
      httpStatus: 200,
      responseTime: 250,
      htmlSnapshot: '<!DOCTYPE html><html><head><title>Example Domain</title></head><body><h1>Example Domain</h1><p>This domain is for use in illustrative examples.</p></body></html>',
      title: 'Example Domain',
      contentType: 'text/html',
      contentLength: 1256,
    },
  });


  // Create a sample SEO audit
  const seoAudit = await prisma.seoAudit.create({
    data: {
      pageId: page.id,
      titleTag: 'Example Domain',
      titleLength: 14,
      titleExists: true,
      titleTooLong: false,
      titleTooShort: false,
      metaDescription: null,
      metaDescriptionExists: false,
      h1Count: 1,
      h1Tags: ['Example Domain'],
      h2Count: 0,
      h3Count: 0,
      hasMultipleH1: false,
      missingH1: false,
      hasCanonical: false,
      hasRobotsMeta: false,
      isIndexable: true,
      isFollowable: true,
      hasSchemaOrg: false,
      schemaOrgTypes: [],
      totalImages: 0,
      imagesWithoutAlt: 0,
      imagesWithAlt: 0,
      internalLinksCount: 0,
      externalLinksCount: 1,
      brokenLinksCount: 0,
      internalLinks: [],
      externalLinks: ['https://www.iana.org/domains/example'],
      brokenLinks: [],
      wordCount: 12,
      hasValidLang: false,
      hasOpenGraph: false,
      hasTwitterCard: false,
      hasViewport: false,
      hasCharset: false,
      isHttps: true,
      seoScore: 65.5,
      performanceScore: 85.0,
      accessibilityScore: 72.0,
    },
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - ${subscriptionPlans.length} subscription plans created/updated`);
  console.log(`   - 1 sample project created`);
  console.log(`   - 1 sample crawl job created`);
  console.log(`   - 1 sample page created`);
  console.log(`   - 1 sample SEO audit created`);
}

main()
  .catch((e) => {
    
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
