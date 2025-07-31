import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerOrchestratorService, CRAWLER_SERVICE_TOKEN } from './crawler-orchestrator.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectCreatedEvent } from '../projects/events/project-created.event';

// Mock the CrawlerPlaywrightService to avoid importing playwright dependencies
class MockCrawlerPlaywrightService {
  async crawl() {
    return {
      pages: [],
      errors: [],
      jobId: 'test-job',
      startTime: new Date(),
      completed: true,
    };
  }
}

describe('CrawlerOrchestratorService', () => {
  let service: CrawlerOrchestratorService;
  let prismaService: jest.Mocked<PrismaService>;
  let crawlerService: jest.Mocked<MockCrawlerPlaywrightService>;

  beforeEach(async () => {
    const mockPrismaService = {
      crawlJob: {
        create: jest.fn(),
        update: jest.fn(),
      },
      page: {
        createMany: jest.fn(),
      },
    };

    const mockCrawlerService = {
      crawl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrawlerOrchestratorService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CRAWLER_SERVICE_TOKEN, useValue: mockCrawlerService },
      ],
    }).compile();

    service = module.get<CrawlerOrchestratorService>(CrawlerOrchestratorService);
    prismaService = module.get(PrismaService);
    crawlerService = module.get(CRAWLER_SERVICE_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle project.created event', async () => {
    // Arrange
    const event = new ProjectCreatedEvent(
      'project-123',
      'https://example.com',
      'user-123',
      'Test Project'
    );

    const mockCrawlJob = {
      id: 'crawl-job-123',
      projectId: 'project-123',
      status: 'QUEUED',
      maxPages: 100,
      maxDepth: 3,
      userAgent: 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
    };

    prismaService.crawlJob.create.mockResolvedValue(mockCrawlJob as any);
    prismaService.crawlJob.update.mockResolvedValue(mockCrawlJob as any);

    // Act
    await service.handleProjectCreated(event);

    // Assert
    expect(prismaService.crawlJob.create).toHaveBeenCalledWith({
      data: {
        projectId: 'project-123',
        status: 'QUEUED',
        maxPages: 100,
        maxDepth: 3,
        userAgent: 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
      },
    });

    expect(prismaService.crawlJob.update).toHaveBeenCalledWith({
      where: { id: 'crawl-job-123' },
      data: {
        status: 'RUNNING',
        startedAt: expect.any(Date),
      },
    });
  });

  it('should handle crawler service errors gracefully', async () => {
    // Arrange
    const event = new ProjectCreatedEvent(
      'project-123',
      'https://example.com',
      'user-123',
      'Test Project'
    );

    const mockCrawlJob = {
      id: 'crawl-job-123',
      projectId: 'project-123',
      status: 'QUEUED',
      maxPages: 100,
      maxDepth: 3,
      userAgent: 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
    };

    prismaService.crawlJob.create.mockResolvedValue(mockCrawlJob as any);
    prismaService.crawlJob.update.mockResolvedValue(mockCrawlJob as any);
    crawlerService.crawl.mockRejectedValue(new Error('Crawl failed'));

    // Act & Assert - should not throw, should handle error gracefully
    await expect(service.handleProjectCreated(event)).resolves.not.toThrow();
  });
});
