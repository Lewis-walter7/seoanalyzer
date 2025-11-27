import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnhancedCrawlerService } from '../../crawler/enhanced-crawler.service';
import { CrawlJob, CrawledPage } from '../../crawler/interfaces/crawler.interfaces';

export interface ContentMetrics {
  competitor: string;
  totalPages: number;
  averageWordCount: number;
  averageLoadTime: number;
  mobileOptimized: number;
  contentScore: number;
  topPerformingContent: any[];
  contentTypes: any;
  topicClusters?: string[];
}

@Injectable()
export class CompetitorAnalysisService {
  private readonly logger = new Logger(CompetitorAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crawlerService: EnhancedCrawlerService,
  ) { }

  async create(userId: string, createDto: { projectId: string }) {
    return {
      id: 'competitor-' + Date.now(),
      projectId: createDto.projectId,
      competitors: [
        { name: 'Competitor1', score: 90 },
        { name: 'Competitor2', score: 85 }
      ],
      trafficAnalysis: 'Data for Traffic Analysis',
      keywordGaps: 'Data for Keyword Gaps',
      contentAnalysis: 'Data for Content Analysis',
      backlinkComparison: 'Data for Backlink Comparison',
      createdAt: new Date(),
      status: 'COMPLETED'
    };
  }

  async analyzeCompetitor(targetUrl: string, competitorUrl: string): Promise<ContentMetrics[]> {
    this.logger.log(`Analyzing competitor: ${competitorUrl} vs ${targetUrl}`);

    // Crawl target and competitor concurrently
    const [targetResult, competitorResult] = await Promise.all([
      this.crawlSinglePage(targetUrl),
      this.crawlSinglePage(competitorUrl),
    ]);

    if (!targetResult || !competitorResult) {
      throw new Error('Failed to crawl URLs');
    }

    const targetMetrics = this.calculateMetrics(targetResult, targetUrl);
    const competitorMetrics = this.calculateMetrics(competitorResult, competitorUrl);

    return [targetMetrics, competitorMetrics];
  }

  private async crawlSinglePage(url: string): Promise<CrawledPage | null> {
    try {
      const job: CrawlJob = {
        id: `competitor-analysis-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        urls: [url],
        maxPages: 1,
        maxDepth: 0,
        respectRobotsTxt: true,
      };

      const result = await this.crawlerService.crawl(job);
      return result.pages[0] || null;
    } catch (error) {
      this.logger.error(`Failed to crawl ${url}:`, error);
      return null;
    }
  }

  private calculateMetrics(page: CrawledPage, url: string): ContentMetrics {
    // Basic word count estimation
    const textContent = page.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(' ').length;

    // Simple content score based on meta tags and content length
    let score = 60; // Base score
    if (page.meta?.description) score += 10;
    if (page.title) score += 10;
    if (wordCount > 500) score += 10;
    if (wordCount > 1000) score += 10;
    if (page.loadTime < 1000) score += 10; // Fast load time bonus

    return {
      competitor: new URL(url).hostname,
      totalPages: 1, // Single page analysis for now
      averageWordCount: wordCount,
      averageLoadTime: page.loadTime / 1000, // Convert to seconds
      mobileOptimized: page.meta?.viewport ? 100 : 0, // Simple check
      contentScore: Math.min(100, score),
      topPerformingContent: [
        {
          title: page.title || 'Untitled',
          url: page.url,
          shares: 0, // Cannot get without external API
          backlinks: 0, // Cannot get without external API
          organicTraffic: 0 // Cannot get without external API
        }
      ],
      contentTypes: {
        blog: url.includes('blog') ? 100 : 0,
        product: url.includes('product') ? 100 : 0,
        landing: 0,
        other: 0
      }
    };
  }

  async performTrafficAnalysis(projectId: string) {
    // Simulate real traffic analysis data
    return [
      {
        competitor: 'example.com',
        organicTraffic: 150000,
        paidTraffic: 25000,
        totalVisitors: 175000,
        bounceRate: 45,
        avgSessionDuration: '2:30',
        topTrafficSources: ['google', 'direct', 'social']
      },
      {
        competitor: 'competitor2.com',
        organicTraffic: 120000,
        paidTraffic: 40000,
        totalVisitors: 160000,
        bounceRate: 52,
        avgSessionDuration: '1:45',
        topTrafficSources: ['google', 'referral', 'social']
      }
    ];
  }

  async performKeywordGapAnalysis(projectId: string) {
    // Simulate keyword gap analysis
    return [
      {
        competitor: 'example.com',
        gaps: [
          {
            keyword: 'seo analysis tools',
            yourRank: null,
            competitorRank: 3,
            searchVolume: 12000,
            difficulty: 65,
            opportunity: 'high',
            cpc: 2.50
          },
          {
            keyword: 'website audit tool',
            yourRank: 15,
            competitorRank: 2,
            searchVolume: 8500,
            difficulty: 58,
            opportunity: 'medium',
            cpc: 3.20
          },
          {
            keyword: 'competitor analysis software',
            yourRank: null,
            competitorRank: 5,
            searchVolume: 5200,
            difficulty: 72,
            opportunity: 'high',
            cpc: 4.10
          }
        ]
      }
    ];
  }

  async performContentAnalysis(projectId: string) {
    // Legacy method - keeping for compatibility but could be updated to use real data if project has URL
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (project) {
      // Could potentially trigger real analysis here if we had competitor URLs stored
    }

    // Return mock data for now to match existing frontend expectations if called directly
    return [
      {
        competitor: 'example.com',
        totalPages: 1250,
        averageWordCount: 1800,
        averageLoadTime: 2.3,
        mobileOptimized: 85,
        contentScore: 78,
        topPerformingContent: [
          {
            title: 'Complete SEO Guide for 2024',
            url: 'https://example.com/seo-guide-2024',
            shares: 1250,
            backlinks: 89,
            organicTraffic: 15000
          }
        ],
        contentTypes: {
          blog: 45,
          product: 25,
          landing: 20,
          other: 10
        },
        topicClusters: ['SEO Tools', 'Digital Marketing', 'Website Optimization']
      }
    ];
  }

  async compareBacklinks(projectId: string) {
    // Simulate backlink comparison data
    return [
      {
        competitor: 'example.com',
        backlinks: [
          {
            url: 'https://example.com',
            totalBacklinks: 15420,
            authorityScore: 85,
            referringDomains: 2580,
            lostBacklinks: 45,
            gainedBacklinks: 120,
            competitorTrend: [1, 1, -1, 1, 1],
            topReferrers: ['techcrunch.com', 'forbes.com', 'entrepreneur.com']
          }
        ]
      }
    ];
  }

  async findAll(userId: string, filter: { projectId?: string }) {
    return [
      {
        id: 'competitor-1',
        projectId: filter.projectId || 'project-1',
        competitors: [{ name: 'Competitor1', score: 90 }],
        createdAt: new Date(),
        status: 'COMPLETED'
      }
    ];
  }

  async findOne(userId: string, id: string) {
    return {
      id,
      projectId: 'project-1',
      competitors: [{ name: 'Competitor1', score: 90 }],
      createdAt: new Date(),
      status: 'COMPLETED'
    };
  }

  async remove(userId: string, id: string) {
    // Mock implementation
  }
}
