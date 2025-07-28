import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';



export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  sessionId: string;
  type: 'access' | 'refresh';
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  accessTokenExp: Date;
  refreshTokenExp: Date;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    isAdmin: boolean;
  };
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes in seconds
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials, deviceInfo?: string, ipAddress?: string): Promise<SessionData> {
    const { email, password, name } = credentials;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log(credentials)
    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    // Create session with tokens
    return this.createSession(user, deviceInfo, ipAddress);
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials, deviceInfo?: string, ipAddress?: string): Promise<SessionData> {
    const { email, password } = credentials;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isAdmin: true,
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Create session with tokens
    return this.createSession(userWithoutPassword, deviceInfo, ipAddress);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string, deviceInfo?: string, ipAddress?: string): Promise<SessionData> {
    // Verify refresh token
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Find session in database
    const session = await this.prisma.session.findUnique({
      where: {
        refreshToken,
        isRevoked: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or revoked');
    }

    // Check if refresh token is expired
    if (new Date() > session.refreshTokenExp) {
      // Revoke expired session
      await this.revokeSession(session.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new access token
    const now = new Date();
    const accessTokenExp = new Date(now.getTime() + this.ACCESS_TOKEN_EXPIRY * 1000);

    const newAccessTokenPayload: TokenPayload = {
      userId: session.userId,
      email: session.user.email,
      sessionId: session.id,
      type: 'access',
    };

    const newAccessToken = await this.jwtService.signAsync(newAccessTokenPayload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    // Update session with new access token
    const updatedSession = await this.prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken: newAccessToken,
        accessTokenExp,
        lastUsedAt: now,
        deviceInfo: deviceInfo || session.deviceInfo,
        ipAddress: ipAddress || session.ipAddress,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true,
          },
        },
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: session.refreshToken,
      accessTokenExp,
      refreshTokenExp: session.refreshTokenExp,
      user: updatedSession.user,
    };
  }

  /**
   * Validate access token
   */
  async validateAccessToken(accessToken: string): Promise<{ user: any; session: any }> {
    // Verify JWT
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Find session in database
    const session = await this.prisma.session.findUnique({
      where: {
        accessToken,
        isRevoked: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or revoked');
    }

    // Check if access token is expired (double check)
    if (new Date() > session.accessTokenExp) {
      throw new UnauthorizedException('Access token expired');
    }

    // Update last used timestamp
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      user: session.user,
      session: {
        id: session.id,
        lastUsedAt: session.lastUsedAt,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
      },
    };
  }

  /**
   * Logout user by revoking session
   */
  async logout(accessToken?: string, refreshToken?: string): Promise<void> {
    const whereClause: any = { isRevoked: false };

    if (accessToken) {
      whereClause.accessToken = accessToken;
    } else if (refreshToken) {
      whereClause.refreshToken = refreshToken;
    } else {
      throw new BadRequestException('Either access token or refresh token required');
    }

    const session = await this.prisma.session.findFirst({
      where: whereClause,
    });

    if (session) {
      await this.revokeSession(session.id);
    }
  }

  /**
   * Logout user from all devices
   */
  async logoutFromAllDevices(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all sessions when password changes
   */
  async revokeAllSessionsOnPasswordChange(userId: string): Promise<void> {
    await this.logoutFromAllDevices(userId);
  }

  /**
   * Get user's active sessions
   */
  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        isRevoked: false,
        refreshTokenExp: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        lastUsedAt: true,
        createdAt: true,
        accessTokenExp: true,
        refreshTokenExp: true,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });
  }

  /**
   * Revoke a specific session
   */
  async revokeSessionById(sessionId: string, userId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        isRevoked: false,
      },
    });

    if (session) {
      await this.revokeSession(sessionId);
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          {
            refreshTokenExp: {
              lt: new Date(),
            },
          },
          {
            isRevoked: true,
            revokedAt: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            },
          },
        ],
      },
    });

    return result.count;
  }

  /**
   * Private method to create a new session with tokens
   */
  private async createSession(
   user: { id: string; email: string | null; name: string | null; isAdmin: boolean },
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<SessionData> {
    const now = new Date();
    const accessTokenExp = new Date(now.getTime() + this.ACCESS_TOKEN_EXPIRY * 1000);
    const refreshTokenExp = new Date(now.getTime() + this.REFRESH_TOKEN_EXPIRY * 1000);

    // Create session first to get sessionId
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: this.generateSecureToken(),
        expires: refreshTokenExp,
        refreshToken: this.generateSecureToken(),
        accessTokenExp,
        refreshTokenExp,
        deviceInfo,
        ipAddress,
      },
    });

    // Generate JWT tokens with sessionId
    const accessTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      sessionId: session.id,
      type: 'access',
    };

    const refreshTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      sessionId: session.id,
      type: 'refresh',
    };

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    // Update session with JWT tokens
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken,
        refreshToken,
      },
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
      user,
    };
  }

  /**
   * Private method to revoke a session
   */
  private async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Generate a secure random token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
