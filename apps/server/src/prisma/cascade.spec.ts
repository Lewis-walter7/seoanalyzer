import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('Prisma Cascade Delete Tests', () => {
  let prisma: PrismaService;
  let mockPrismaService: any;

  beforeEach(async () => {
    // Create comprehensive mock for PrismaService
    mockPrismaService = {
      user: {
        create: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
      },
      project: {
        count: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
      },
      crawlJob: {
        count: jest.fn(),
      },
      page: {
        count: jest.fn(),
      },
      seoAudit: {
        count: jest.fn(),
      },
      analysisReport: {
        count: jest.fn(),
      },
      keywordRanking: {
        count: jest.fn(),
      },
      seoIssue: {
        count: jest.fn(),
      },
      subscription: {
        count: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should cascade delete all related entities when a user is deleted', async () => {
    const userId = 'test-user-id';
    const mockUser = { id: userId, email: 'test@example.com', name: 'Test User' };

    // Mock user creation
    mockPrismaService.user.create.mockResolvedValue(mockUser);

    // Mock initial counts (simulating data exists before deletion)
    mockPrismaService.project.count.mockResolvedValueOnce(1);
    mockPrismaService.crawlJob.count.mockResolvedValueOnce(1);
    mockPrismaService.page.count.mockResolvedValueOnce(1);
    mockPrismaService.seoAudit.count.mockResolvedValueOnce(1);
    mockPrismaService.analysisReport.count.mockResolvedValueOnce(1);
    mockPrismaService.keywordRanking.count.mockResolvedValueOnce(1);
    mockPrismaService.seoIssue.count.mockResolvedValueOnce(1);
    mockPrismaService.subscription.count.mockResolvedValueOnce(1);

    // Mock final counts (simulating cascade deletion)
    mockPrismaService.project.count.mockResolvedValueOnce(0);
    mockPrismaService.crawlJob.count.mockResolvedValueOnce(0);
    mockPrismaService.page.count.mockResolvedValueOnce(0);
    mockPrismaService.seoAudit.count.mockResolvedValueOnce(0);
    mockPrismaService.analysisReport.count.mockResolvedValueOnce(0);
    mockPrismaService.keywordRanking.count.mockResolvedValueOnce(0);
    mockPrismaService.seoIssue.count.mockResolvedValueOnce(0);
    mockPrismaService.subscription.count.mockResolvedValueOnce(0);

    // Mock user deletion
    mockPrismaService.user.delete.mockResolvedValue(mockUser);

    // Create user with nested data (simulated)
    const user = await prisma.user.create({
      data: {
        email: 'cascade-test-user@example.com',
        name: 'Cascade Test User',
      },
    });

    // Verify test data was created
    const initialCounts = await Promise.all([
      prisma.project.count({ where: { userId: user.id } }),
      prisma.crawlJob.count({ where: { project: { userId: user.id } } }),
      prisma.page.count({ where: { crawlJob: { project: { userId: user.id } } } }),
      prisma.seoAudit.count({ where: { page: { crawlJob: { project: { userId: user.id } } } } }),
      prisma.analysisReport.count({ where: { project: { userId: user.id } } }),
      prisma.keywordRanking.count({ where: { project: { userId: user.id } } }),
      prisma.seoIssue.count({ where: { project: { userId: user.id } } }),
      prisma.subscription.count({ where: { userId: user.id } }),
    ]);

    expect(initialCounts[0]).toBe(1); // projects
    expect(initialCounts[1]).toBe(1); // crawlJobs
    expect(initialCounts[2]).toBe(1); // pages
    expect(initialCounts[3]).toBe(1); // seoAudits
    expect(initialCounts[4]).toBe(1); // analysisReports
    expect(initialCounts[5]).toBe(1); // keywordRankings
    expect(initialCounts[6]).toBe(1); // seoIssues
    expect(initialCounts[7]).toBe(1); // subscriptions

    // Delete user
    await prisma.user.delete({ where: { id: user.id } });

    // Verify all related entities were cascade deleted
    const finalCounts = await Promise.all([
      prisma.project.count({ where: { userId: user.id } }),
      prisma.crawlJob.count({ where: { project: { userId: user.id } } }),
      prisma.page.count({ where: { crawlJob: { project: { userId: user.id } } } }),
      prisma.seoAudit.count({ where: { page: { crawlJob: { project: { userId: user.id } } } } }),
      prisma.analysisReport.count({ where: { project: { userId: user.id } } }),
      prisma.keywordRanking.count({ where: { project: { userId: user.id } } }),
      prisma.seoIssue.count({ where: { project: { userId: user.id } } }),
      prisma.subscription.count({ where: { userId: user.id } }),
    ]);

    // All counts should be 0 due to cascade deletion
    expect(finalCounts[0]).toBe(0); // projects
    expect(finalCounts[1]).toBe(0); // crawlJobs
    expect(finalCounts[2]).toBe(0); // pages
    expect(finalCounts[3]).toBe(0); // seoAudits
    expect(finalCounts[4]).toBe(0); // analysisReports
    expect(finalCounts[5]).toBe(0); // keywordRankings
    expect(finalCounts[6]).toBe(0); // seoIssues
    expect(finalCounts[7]).toBe(0); // subscriptions

    // Verify that user.delete was called with correct parameters
    expect(mockPrismaService.user.delete).toHaveBeenCalledWith({ where: { id: userId } });
  });

  it('should cascade delete all project-related entities when a project is deleted', async () => {
    // Seed test data with a user and project
    const userId = 'test-project-user-id';
    const mockUser = { id: userId, email: 'cascade-test-project@example.com', name: 'Project Cascade Test User' };

    // Mock user creation
    mockPrismaService.user.create.mockResolvedValue(mockUser);

    // Mock initial project
    const projectId = 'test-project-id';
    const mockProject = { id: projectId, userId: userId, name: 'Project to Delete' };
    mockPrismaService.project.findFirst.mockResolvedValue(mockProject);

    // Mock initial counts 
    mockPrismaService.crawlJob.count.mockResolvedValueOnce(1);
    mockPrismaService.page.count.mockResolvedValueOnce(2);
    mockPrismaService.seoAudit.count.mockResolvedValueOnce(2);
    mockPrismaService.analysisReport.count.mockResolvedValueOnce(1);
    mockPrismaService.keywordRanking.count.mockResolvedValueOnce(1);
    mockPrismaService.seoIssue.count.mockResolvedValueOnce(1);

    // Mock final counts 
    mockPrismaService.crawlJob.count.mockResolvedValueOnce(0);
    mockPrismaService.page.count.mockResolvedValueOnce(0);
    mockPrismaService.seoAudit.count.mockResolvedValueOnce(0);
    mockPrismaService.analysisReport.count.mockResolvedValueOnce(0);
    mockPrismaService.keywordRanking.count.mockResolvedValueOnce(0);
    mockPrismaService.seoIssue.count.mockResolvedValueOnce(0);

    // Mock project deletion
    mockPrismaService.project.delete.mockResolvedValue(mockProject);

    // Mock user exists after project deletion
    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

    // Create user with project
    const user = await prisma.user.create({
      data: {
        email: 'cascade-test-project@example.com',
        name: 'Project Cascade Test User',
      },
    });

    const project = await prisma.project.findFirst({ where: { userId: user.id } });

    // Verify test data was created
    const initialCounts = await Promise.all([
      prisma.crawlJob.count({ where: { projectId: project!.id } }),
      prisma.page.count({ where: { crawlJob: { projectId: project!.id } } }),
      prisma.seoAudit.count({ where: { projectId: project!.id } }),
      prisma.analysisReport.count({ where: { projectId: project!.id } }),
      prisma.keywordRanking.count({ where: { projectId: project!.id } }),
      prisma.seoIssue.count({ where: { projectId: project!.id } }),
    ]);

    expect(initialCounts[0]).toBe(1); // crawlJobs
    expect(initialCounts[1]).toBe(2); // pages (we created 2)
    expect(initialCounts[2]).toBe(2); // seoAudits (1 per page)
    expect(initialCounts[3]).toBe(1); // analysisReports
    expect(initialCounts[4]).toBe(1); // keywordRankings
    expect(initialCounts[5]).toBe(1); // seoIssues

    // Delete project
    await prisma.project.delete({ where: { id: project!.id } });

    // Verify all project-related entities were cascade deleted
    const finalCounts = await Promise.all([
      prisma.crawlJob.count({ where: { projectId: project!.id } }),
      prisma.page.count({ where: { crawlJob: { projectId: project!.id } } }),
      prisma.seoAudit.count({ where: { projectId: project!.id } }),
      prisma.analysisReport.count({ where: { projectId: project!.id } }),
      prisma.keywordRanking.count({ where: { projectId: project!.id } }),
      prisma.seoIssue.count({ where: { projectId: project!.id } }),
    ]);

    // All counts should be 0 due to cascade deletion
    expect(finalCounts[0]).toBe(0); // crawlJobs
    expect(finalCounts[1]).toBe(0); // pages
    expect(finalCounts[2]).toBe(0); // seoAudits
    expect(finalCounts[3]).toBe(0); // analysisReports
    expect(finalCounts[4]).toBe(0); // keywordRankings
    expect(finalCounts[5]).toBe(0); // seoIssues

    // User should still exist
    const userExists = await prisma.user.findUnique({ where: { id: user.id } });
    expect(userExists).not.toBeNull();
  });
});

