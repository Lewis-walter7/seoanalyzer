import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { KeywordResearchController } from './keyword-research.controller';
import { KeywordResearchService } from './keyword-research.service';
import { AuthGuard } from '../../auth/auth.guard';
import { CreateKeywordResearchDto, UpdateKeywordResearchDto, KeywordAnalysisDto } from './dto/keyword-research.dto';

describe('KeywordResearchController', () => {
  let controller: KeywordResearchController;
  let service: KeywordResearchService;

  const mockKeywordResearchService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    analyzeKeywords: jest.fn(),
    getKeywordSuggestions: jest.fn(),
    getKeywordMetrics: jest.fn(),
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
      controllers: [KeywordResearchController],
      providers: [
        {
          provide: KeywordResearchService,
          useValue: mockKeywordResearchService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<KeywordResearchController>(KeywordResearchController);
    service = module.get<KeywordResearchService>(KeywordResearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createKeywordResearch', () => {
    it('should create keyword research successfully', async () => {
      const createDto: CreateKeywordResearchDto = {
        name: 'Test Research',
        description: 'Test description',
        projectId: 'project-123',
        seedKeywords: ['test', 'keyword'],
      };

      const mockResult = {
        id: 'research-123',
        ...createDto,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockKeywordResearchService.create.mockResolvedValue(mockResult);

      const result = await controller.createKeywordResearch(mockUser, createDto);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(mockUser.id, createDto);
    });
  });

  describe('getAllKeywordResearch', () => {
    it('should return all keyword research for user', async () => {
      const mockResults = [
        {
          id: 'research-1',
          name: 'Research 1',
          projectId: 'project-123',
          userId: mockUser.id,
        },
        {
          id: 'research-2',
          name: 'Research 2',
          projectId: 'project-123',
          userId: mockUser.id,
        },
      ];

      mockKeywordResearchService.findAll.mockResolvedValue(mockResults);

      const result = await controller.getAllKeywordResearch(mockUser, 'project-123', 10, 0);

      expect(result).toEqual(mockResults);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, {
        projectId: 'project-123',
        limit: 10,
        offset: 0,
      });
    });

    it('should use default pagination values', async () => {
      mockKeywordResearchService.findAll.mockResolvedValue([]);

      await controller.getAllKeywordResearch(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, {
        projectId: undefined,
        limit: 10,
        offset: 0,
      });
    });
  });

  describe('getKeywordResearch', () => {
    it('should return a specific keyword research', async () => {
      const mockResult = {
        id: 'research-123',
        name: 'Test Research',
        projectId: 'project-123',
        userId: mockUser.id,
      };

      mockKeywordResearchService.findOne.mockResolvedValue(mockResult);

      const result = await controller.getKeywordResearch(mockUser, 'research-123');

      expect(result).toEqual(mockResult);
      expect(service.findOne).toHaveBeenCalledWith(mockUser.id, 'research-123');
    });
  });

  describe('updateKeywordResearch', () => {
    it('should update keyword research successfully', async () => {
      const updateDto: UpdateKeywordResearchDto = {
        name: 'Updated Research',
        description: 'Updated description',
      };

      const mockResult = {
        id: 'research-123',
        ...updateDto,
        projectId: 'project-123',
        userId: mockUser.id,
      };

      mockKeywordResearchService.update.mockResolvedValue(mockResult);

      const result = await controller.updateKeywordResearch(mockUser, 'research-123', updateDto);

      expect(result).toEqual(mockResult);
      expect(service.update).toHaveBeenCalledWith(mockUser.id, 'research-123', updateDto);
    });
  });

  describe('deleteKeywordResearch', () => {
    it('should delete keyword research successfully', async () => {
      mockKeywordResearchService.remove.mockResolvedValue(undefined);

      await controller.deleteKeywordResearch(mockUser, 'research-123');

      expect(service.remove).toHaveBeenCalledWith(mockUser.id, 'research-123');
    });
  });

  describe('analyzeKeywords', () => {
    it('should analyze keywords successfully', async () => {
      const analysisDto: KeywordAnalysisDto = {
        keywords: ['test', 'keyword'],
        includeSearchVolume: true,
        includeCompetition: true,
      };

      const mockResult = [
        {
          keyword: 'test',
          searchVolume: 1000,
          competition: 0.5,
          cpc: 1.25,
          difficulty: 45,
        },
      ];

      mockKeywordResearchService.analyzeKeywords.mockResolvedValue(mockResult);

      const result = await controller.analyzeKeywords(mockUser, 'research-123', analysisDto);

      expect(result).toEqual(mockResult);
      expect(service.analyzeKeywords).toHaveBeenCalledWith(mockUser.id, 'research-123', analysisDto);
    });
  });

  describe('getKeywordSuggestions', () => {
    it('should return keyword suggestions', async () => {
      const mockSuggestions = [
        { keyword: 'test suggestion 1', relevanceScore: 95 },
        { keyword: 'test suggestion 2', relevanceScore: 90 },
      ];

      mockKeywordResearchService.getKeywordSuggestions.mockResolvedValue(mockSuggestions);

      const result = await controller.getKeywordSuggestions(mockUser, 'research-123', 'test', 50);

      expect(result).toEqual(mockSuggestions);
      expect(service.getKeywordSuggestions).toHaveBeenCalledWith(mockUser.id, 'research-123', 'test', 50);
    });

    it('should use default limit', async () => {
      mockKeywordResearchService.getKeywordSuggestions.mockResolvedValue([]);

      await controller.getKeywordSuggestions(mockUser, 'research-123', 'test');

      expect(service.getKeywordSuggestions).toHaveBeenCalledWith(mockUser.id, 'research-123', 'test', 50);
    });
  });

  describe('getKeywordMetrics', () => {
    it('should return keyword metrics', async () => {
      const mockMetrics = [
        { keyword: 'test', searchVolume: 1000, competition: 0.5 },
        { keyword: 'keyword', searchVolume: 800, competition: 0.3 },
      ];

      mockKeywordResearchService.getKeywordMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getKeywordMetrics(mockUser, 'research-123', 'test,keyword');

      expect(result).toEqual(mockMetrics);
      expect(service.getKeywordMetrics).toHaveBeenCalledWith(mockUser.id, 'research-123', ['test', 'keyword']);
    });
  });
});
