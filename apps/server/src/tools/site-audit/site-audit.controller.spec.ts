import { Test, TestingModule } from '@nestjs/testing';
import { SiteAuditController } from './site-audit.controller';
import { SiteAuditService } from './site-audit.service';
import { AuthGuard } from '../../auth/auth.guard';

describe('SiteAuditController', () => {
  let controller: SiteAuditController;
  let service: SiteAuditService;

  const mockSiteAuditService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    isAdmin: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteAuditController],
      providers: [
        {
          provide: SiteAuditService,
          useValue: mockSiteAuditService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<SiteAuditController>(SiteAuditController);
    service = module.get<SiteAuditService>(SiteAuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSiteAudit', () => {
    it('should create site audit successfully', async () => {
      const createDto = { projectId: 'project-123' };
      const mockResult = {
        id: 'audit-123',
        projectId: 'project-123',
        seoScore: 85,
        auditedAt: new Date(),
        status: 'COMPLETED',
      };

      mockSiteAuditService.create.mockResolvedValue(mockResult);

      const result = await controller.createSiteAudit(mockUser, createDto);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(mockUser.id, createDto);
    });
  });

  describe('getAllSiteAudits', () => {
    it('should return all site audits for user', async () => {
      const mockResults = [
        {
          id: 'audit-1',
          projectId: 'project-123',
          seoScore: 85,
          auditedAt: new Date(),
          status: 'COMPLETED',
        },
      ];

      mockSiteAuditService.findAll.mockResolvedValue(mockResults);

      const result = await controller.getAllSiteAudits(mockUser, 'project-123');

      expect(result).toEqual(mockResults);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, { projectId: 'project-123' });
    });
  });

  describe('getSiteAudit', () => {
    it('should return a specific site audit', async () => {
      const mockResult = {
        id: 'audit-123',
        projectId: 'project-123',
        seoScore: 85,
        auditedAt: new Date(),
        status: 'COMPLETED',
      };

      mockSiteAuditService.findOne.mockResolvedValue(mockResult);

      const result = await controller.getSiteAudit(mockUser, 'audit-123');

      expect(result).toEqual(mockResult);
      expect(service.findOne).toHaveBeenCalledWith(mockUser.id, 'audit-123');
    });
  });

  describe('deleteSiteAudit', () => {
    it('should delete site audit successfully', async () => {
      mockSiteAuditService.remove.mockResolvedValue(undefined);

      await controller.deleteSiteAudit(mockUser, 'audit-123');

      expect(service.remove).toHaveBeenCalledWith(mockUser.id, 'audit-123');
    });
  });
});
