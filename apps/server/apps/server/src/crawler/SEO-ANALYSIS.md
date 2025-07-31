# SEO Analysis Pipeline

## Overview

This document describes the inline SEO analysis pipeline that has been integrated into the crawler system. After each page is crawled and stored, the system automatically performs a comprehensive SEO audit and stores the results in the `SeoAudit` table.

## Implementation

### 1. SeoAnalyzer Utility (`utils/seo-analyzer.util.ts`)

The `SeoAnalyzer` class performs comprehensive HTML analysis including:

#### Title Metrics
- Title tag extraction and length validation
- Detection of missing, too long, or too short titles

#### Meta Description Analysis
- Meta description extraction and length validation
- Detection of missing or improperly sized descriptions

#### Heading Structure Analysis
- Count of H1-H6 tags
- Detection of multiple H1 tags (SEO issue)
- Extraction of heading text content

#### Image Optimization Checks
- Count of total images
- Detection of images without alt attributes
- Detection of images without title attributes

#### Link Analysis
- Internal vs. external link categorization
- Detection of nofollow links
- Link inventory for further analysis

#### Technical SEO Checks
- Viewport meta tag detection
- Charset detection
- HTTPS protocol validation
- Canonical URL extraction
- Robots meta tag analysis

#### Structured Data Analysis
- JSON-LD schema detection
- Microdata detection
- RDFa detection
- Schema.org type extraction

#### Social Media Meta Tags
- Open Graph protocol detection
- Twitter Card detection

#### Content Quality Metrics
- Word count calculation
- Content-to-HTML ratio calculation
- Language attribute validation

### 2. Integration with Crawler

The SEO analysis is integrated into the `CrawlerOrchestratorService` in the `handlePageCrawled` method:

1. **Page Storage**: Each crawled page is first stored in the `Page` table with its HTML content
2. **SEO Analysis**: The HTML content is analyzed using the `SeoAnalyzer` utility
3. **Audit Storage**: Results are stored in the `SeoAudit` table, linked to the page via `pageId`
4. **Performance Data**: Load time and other performance metrics from the crawler are included

### 3. Database Schema

The `SeoAudit` table stores comprehensive SEO metrics with relationships to the `Page` table:

```prisma
model SeoAudit {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  pageId String @unique @db.ObjectId

  // Title, meta, headings, images, links, technical SEO, etc.
  // ... (see schema.prisma for full details)

  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)
}
```

## Synchronous Processing

The SEO analysis is performed synchronously during the page crawling process to:

- Ensure immediate availability of SEO data
- Prevent memory leaks from queued processing
- Maintain data consistency between pages and audits

## Performance Considerations

- **HTML Content Storage**: Full HTML content is stored in the `htmlSnapshot` field for analysis
- **Regex-based Parsing**: Uses efficient regex patterns for HTML analysis
- **Upsert Operations**: Uses database upserts to handle duplicate page crawls
- **Error Handling**: Comprehensive error handling prevents crawl failures due to analysis issues

## Future Enhancements

If performance becomes an issue with synchronous processing, the system can be enhanced to:

1. **Bull Queue Integration**: Move heavy analysis to background jobs
2. **Selective Analysis**: Only analyze pages that have changed
3. **Caching**: Cache analysis results for identical HTML content
4. **Parallel Processing**: Analyze multiple pages concurrently

## Testing

A test file is available at `test/seo-analyzer.test.ts` that demonstrates the analyzer functionality with sample HTML content.

## Usage

The SEO analysis runs automatically as part of the crawling process. No additional configuration is required. Results can be accessed via the `SeoAudit` table, which is linked to each crawled page.
