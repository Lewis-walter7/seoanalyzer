import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, TokenPayload } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    isAdmin: false,
  };

  const mockSession = {
    id: 'session-123',
    userId: 'user-123',
    sessionToken: 'session-token',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    refreshToken: 'refresh-token',
    accessTokenExp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    refreshTokenExp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceInfo: null,
    ipAddress: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            session: {
              create: jest.fn(),
              update: jest.fn(),
              findFirst: jest.fn(),
              updateMany: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-jwt-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('JWT Token Signing', () => {
    it('should sign access token with correct payload structure', async () => {
      // Mock the session creation
      (prismaService.session.create as jest.Mock).mockResolvedValue(mockSession);
      (prismaService.session.update as jest.Mock).mockResolvedValue(mockSession);
      
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';
      
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce(mockAccessToken) // for access token
        .mockResolvedValueOnce(mockRefreshToken); // for refresh token

      // Call the private method through public method
      const result = await service['createSession'](mockUser);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe(mockAccessToken);
      expect(result.refreshToken).toBe(mockRefreshToken);

      // Verify JWT signing was called with correct payload structure
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          sessionId: mockSession.id,
          type: 'access',
        }),
        expect.any(Object)
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          sessionId: mockSession.id,
          type: 'refresh',
        }),
        expect.any(Object)
      );
    });

    it('should create access token payload with userId at root level', async () => {
      (prismaService.session.create as jest.Mock).mockResolvedValue(mockSession);
      (prismaService.session.update as jest.Mock).mockResolvedValue(mockSession);
      
      const mockAccessToken = 'mock-access-token';
      (jwtService.signAsync as jest.Mock).mockResolvedValue(mockAccessToken);

      await service['createSession'](mockUser);

      const accessTokenCall = (jwtService.signAsync as jest.Mock).mock.calls.find(
        call => call[0].type === 'access'
      );

      expect(accessTokenCall).toBeDefined();
      const payload = accessTokenCall[0] as TokenPayload;
      
      // Verify the payload structure has userId at root level (not nested under sub)
      expect(payload).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        sessionId: mockSession.id,
        type: 'access',
      });
      
      // Ensure there's no nested sub structure
      expect(payload).not.toHaveProperty('sub');
    });

    it('should create refresh token payload with userId at root level', async () => {
      (prismaService.session.create as jest.Mock).mockResolvedValue(mockSession);
      (prismaService.session.update as jest.Mock).mockResolvedValue(mockSession);
      
      const mockRefreshToken = 'mock-refresh-token';
      (jwtService.signAsync as jest.Mock).mockResolvedValue(mockRefreshToken);

      await service['createSession'](mockUser);

      const refreshTokenCall = (jwtService.signAsync as jest.Mock).mock.calls.find(
        call => call[0].type === 'refresh'
      );

      expect(refreshTokenCall).toBeDefined();
      const payload = refreshTokenCall[0] as TokenPayload;
      
      // Verify the payload structure has userId at root level (not nested under sub)
      expect(payload).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        sessionId: mockSession.id,
        type: 'refresh',
      });
      
      // Ensure there's no nested sub structure
      expect(payload).not.toHaveProperty('sub');
    });
  });

  describe('Token Validation', () => {
    it('should validate access token with direct userId in payload', async () => {
      const mockToken = 'mock-token';
      const mockPayload: TokenPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        sessionId: mockSession.id,
        type: 'access',
      };

      const mockSessionWithUser = {
        ...mockSession,
        user: mockUser,
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (prismaService.session.findFirst as jest.Mock).mockResolvedValue(mockSessionWithUser);
      (prismaService.session.update as jest.Mock).mockResolvedValue(mockSessionWithUser);

      const result = await service.validateAccessToken(mockToken);

      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.session).toBeDefined();
    });
  });
});
