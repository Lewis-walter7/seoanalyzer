# SEO Analyzer - Database Schema

This directory contains the Prisma schema for the SEO Analyzer application with MongoDB support.

## Database Models

### Project
- Represents a website/domain to be analyzed
- Contains basic project metadata (name, domain, description)
- Has many `CrawlJob`s

### CrawlJob
- Represents a single crawl session for a project
- Tracks crawl status, timing, and configuration
- Contains progress metrics (total/processed/failed pages)
- Has many `Page`s

### Page
- Represents a single crawled webpage
- Stores URL, HTTP status, response time, and raw HTML snapshot
- Belongs to a `CrawlJob`
- Has one `SeoAudit`

### SeoAudit
- Contains comprehensive SEO metrics for a page
- Includes title/meta description analysis
- Tracks heading structure (H1-H6)
- Analyzes canonical URLs, robots meta, and Schema.org data
- Monitors images (alt text, optimization)
- Counts internal/external/broken links
- Provides performance and accessibility scores

## Setup Instructions

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update the `DATABASE_URL` in `.env` with your MongoDB connection string.

3. **Generate Prisma client:**
   ```bash
   bun run prisma:generate
   ```

4. **Push schema to database:**
   ```bash
   bun run prisma:push
   ```

5. **Seed the database (optional):**
   ```bash
   bun run db:seed
   ```

## Available Scripts

- `bun run prisma:generate` - Generate Prisma client
- `bun run prisma:push` - Push schema changes to database
- `bun run prisma:studio` - Open Prisma Studio for database management
- `bun run prisma:reset` - Reset database (careful!)
- `bun run db:seed` - Seed database with sample data

## MongoDB Connection

### Local MongoDB
```
DATABASE_URL="mongodb://localhost:27017/seo_analyzer"
```

### MongoDB Atlas (Cloud)
```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/seo_analyzer?retryWrites=true&w=majority"
```

## Schema Features

- **MongoDB ObjectId** support for all primary keys
- **Cascading deletes** to maintain data integrity
- **Unique constraints** to prevent duplicate crawl data
- **Comprehensive SEO metrics** including Schema.org structured data analysis
- **Progress tracking** for crawl jobs
- **Rich metadata** for pages and audits

## Key Schema.org Features

The `SeoAudit` model includes specific fields for analyzing Schema.org structured data:

- `hasSchemaOrg`: Boolean flag for Schema.org presence
- `schemaOrgTypes`: Array of detected Schema.org types
- `jsonLdCount`: Count of JSON-LD structured data blocks
- `microdataCount`: Count of Microdata structured data
- `rdfaCount`: Count of RDFa structured data

This enables comprehensive analysis of structured data markup as recommended by major search engines.

## Usage with NestJS

1. Import PrismaClient in your NestJS services
2. Use dependency injection to access the database
3. Leverage Prisma's type-safe queries for robust data access

Example:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new project
const project = await prisma.project.create({
  data: {
    name: 'My Website',
    domain: 'mywebsite.com',
    description: 'Main company website'
  }
});
```
