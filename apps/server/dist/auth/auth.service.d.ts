import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
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
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly ACCESS_TOKEN_EXPIRY;
    private readonly REFRESH_TOKEN_EXPIRY;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    /**
     * Register a new user
     */
    register(credentials: RegisterCredentials, deviceInfo?: string, ipAddress?: string): Promise<SessionData>;
    /**
     * Login user with email and password
     */
    login(credentials: LoginCredentials, deviceInfo?: string, ipAddress?: string): Promise<SessionData>;
    /**
     * Refresh access token using refresh token
     */
    refreshAccessToken(refreshToken: string, deviceInfo?: string, ipAddress?: string): Promise<SessionData>;
    /**
     * Validate access token
     */
    validateAccessToken(accessToken: string): Promise<{
        user: any;
        session: any;
    }>;
    /**
     * Logout user by revoking session
     */
    logout(accessToken?: string, refreshToken?: string): Promise<void>;
    /**
     * Logout user from all devices
     */
    logoutFromAllDevices(userId: string): Promise<void>;
    /**
     * Revoke all sessions when password changes
     */
    revokeAllSessionsOnPasswordChange(userId: string): Promise<void>;
    /**
     * Get user's active sessions
     */
    getUserSessions(userId: string): Promise<{
        id: string;
        accessTokenExp: Date;
        refreshTokenExp: Date;
        lastUsedAt: Date;
        deviceInfo: string | null;
        ipAddress: string | null;
        createdAt: Date;
    }[]>;
    /**
     * Revoke a specific session
     */
    revokeSessionById(sessionId: string, userId: string): Promise<void>;
    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions(): Promise<number>;
    /**
     * Private method to create a new session with tokens
     */
    private createSession;
    /**
     * Private method to revoke a session
     */
    private revokeSession;
    /**
     * Generate a secure random token
     */
    private generateSecureToken;
}
