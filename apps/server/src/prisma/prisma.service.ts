import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Create adapter with connection string (Prisma 7 requirement)
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL
    });

    super({
      adapter,
      // Enable query logging in development
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    // Connect to the database when the module is initialized
    await this.$connect();
    if (process.env.NODE_ENV !== 'production') {
      console.log('📊 Connected to PostgreSQL via Prisma');
    }
  }

  async onModuleDestroy() {
    // Disconnect from the database when the module is destroyed
    await this.$disconnect();
    if (process.env.NODE_ENV !== 'production') {
      console.log('📊 Disconnected from PostgreSQL');
    }
  }

  // Helper method to check database connection
  async isHealthy(): Promise<boolean> {
    try {
      // PostgreSQL health check - try to connect and perform a basic operation
      await this.$connect();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Helper method to get database stats
  async getDatabaseStats() {
    const [projectCount, crawlJobCount, pageCount, seoAuditCount] = await Promise.all([
      this.project.count(),
      this.crawlJob.count(),
      this.page.count(),
      this.seoAudit.count(),
    ]);

    return {
      totalProjects: projectCount,
      totalCrawlJobs: crawlJobCount,
      totalPages: pageCount,
      totalSeoAudits: seoAuditCount,
    };
  }

  // Helper method to clean up old data
  async cleanupOldCrawls(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.crawlJob.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🧹 Cleaned up ${result.count} old crawl jobs`);
    }
    return result.count;
  }
}
