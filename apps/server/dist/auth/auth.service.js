"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes in seconds
    REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    /**
     * Register a new user
     */
    async register(credentials, deviceInfo, ipAddress) {
        const { email, password, name } = credentials;
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User already exists with this email');
        }
        if (!password) {
            throw new common_1.BadRequestException('Password is required');
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
    async login(credentials, deviceInfo, ipAddress) {
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
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const safePassword = user.password;
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, safePassword);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;
        // Create session with tokens
        return this.createSession(userWithoutPassword, deviceInfo, ipAddress);
    }
    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshToken, deviceInfo, ipAddress) {
        // Verify refresh token
        let payload;
        try {
            const jwtSecret = this.configService.get('JWT_SECRET') ?? (() => { throw new Error('JWT_SECRET missing'); })();
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: jwtSecret,
            });
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (payload.type !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        // Find session in database
        const session = await this.prisma.session.findFirst({
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
            throw new common_1.UnauthorizedException('Session not found or revoked');
        }
        // Check if refresh token is expired
        if (new Date() > session.refreshTokenExp) {
            // Revoke expired session
            await this.revokeSession(session.id);
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        // Generate new access token
        const now = new Date();
        const accessTokenExp = new Date(now.getTime() + this.ACCESS_TOKEN_EXPIRY * 1000);
        const newAccessTokenPayload = {
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
    async validateAccessToken(accessToken) {
        // Verify JWT
        let payload;
        try {
            const jwtSecret = this.configService.get('JWT_SECRET') ?? (() => { throw new Error('JWT_SECRET missing'); })();
            payload = await this.jwtService.verifyAsync(accessToken, {
                secret: jwtSecret,
            });
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
        if (payload.type !== 'access') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        // Find session in database
        const session = await this.prisma.session.findFirst({
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
            throw new common_1.UnauthorizedException('Session not found or revoked');
        }
        // Check if access token is expired (double check)
        if (new Date() > session.accessTokenExp) {
            throw new common_1.UnauthorizedException('Access token expired');
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
    async logout(accessToken, refreshToken) {
        const whereClause = { isRevoked: false };
        if (accessToken) {
            whereClause.accessToken = accessToken;
        }
        else if (refreshToken) {
            whereClause.refreshToken = refreshToken;
        }
        else {
            throw new common_1.BadRequestException('Either access token or refresh token required');
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
    async logoutFromAllDevices(userId) {
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
    async revokeAllSessionsOnPasswordChange(userId) {
        await this.logoutFromAllDevices(userId);
    }
    /**
     * Get user's active sessions
     */
    async getUserSessions(userId) {
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
    async revokeSessionById(sessionId, userId) {
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
    async cleanupExpiredSessions() {
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
    async createSession(user, deviceInfo, ipAddress) {
        const now = new Date();
        const accessTokenExp = new Date(now.getTime() + this.ACCESS_TOKEN_EXPIRY * 1000);
        const refreshTokenExp = new Date(now.getTime() + this.REFRESH_TOKEN_EXPIRY * 1000);
        // Create session first to get real sessionId
        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                sessionToken: this.generateSecureToken(),
                expires: refreshTokenExp,
                refreshToken: this.generateSecureToken(), // temporary
                accessToken: this.generateSecureToken(), // temporary, will be replaced
                accessTokenExp,
                refreshTokenExp,
                deviceInfo,
                ipAddress,
            },
        });
        // Generate JWT tokens with real session ID
        const accessTokenPayload = {
            userId: user.id,
            email: user.email,
            sessionId: session.id,
            type: 'access',
        };
        const refreshTokenPayload = {
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
    async revokeSession(sessionId) {
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
    generateSecureToken() {
        return crypto.randomBytes(32).toString('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
