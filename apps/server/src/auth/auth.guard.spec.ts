import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let reflector: Reflector;
  let authService: AuthService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    isAdmin: false,
  };

  const mockRequest = {
    headers: {
      authorization: 'Bearer mock-token',
    },
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    reflector = module.get<Reflector>(Reflector);
    authService = module.get<AuthService>(AuthService);

    // Setup environment variable for JWT_SECRET
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access for public routes', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
      expect(authService.validateAccessToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
      const requestWithoutToken = { headers: {} };
      const contextWithoutToken = {
        switchToHttp: () => ({ getRequest: () => requestWithoutToken }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(contextWithoutToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should validate the token and attach user to request', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
      (authService.validateAccessToken as jest.Mock).mockResolvedValue({ user: mockUser });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(authService.validateAccessToken).toHaveBeenCalledWith('mock-token');
      expect(mockRequest['user']).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if token validation fails', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
      (authService.validateAccessToken as jest.Mock).mockRejectedValue(new UnauthorizedException());

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });
  });
});
