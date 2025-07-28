import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  
  const project = await prisma.project.upsert({
    where: { domain: 'example.com' },
    update: {},
    create: {
      name: 'Example Website',
      domain: 'example.com',
      description: 'Sample project for SEO analysis',
    },
  });

  // Create a sample crawl job
  const crawlJob = await prisma.crawlJob.create({
    data: {
      projectId: project.id,
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3600000), // 1 hour ago
      finishedAt: new Date(),
      totalPages: 1,
      processedPages: 1,
      failedPages: 0,
      maxPages: 100,
      maxDepth: 3,
    },
  });

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
}

main()
  .catch((e) => {
    
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
