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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_guard_1 = require("./auth.guard");
const public_decorator_1 = require("./public.decorator");
const user_decorator_1 = require("./user.decorator");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    /**
     * Register a new user
     */
    async register(credentials, req) {
        const deviceInfo = req.get('User-Agent');
        const ipAddress = req.ip || req.connection.remoteAddress;
        const sessionData = await this.authService.register(credentials, deviceInfo, ipAddress);
        return {
            message: 'User registered successfully',
            user: sessionData.user,
            accessToken: sessionData.accessToken,
            refreshToken: sessionData.refreshToken,
            expiresIn: Math.floor((sessionData.accessTokenExp.getTime() - Date.now()) / 1000),
        };
    }
    /**
     * Login user
     */
    async login(credentials, req) {
        const deviceInfo = req.get('User-Agent');
        const ipAddress = req.ip || req.connection.remoteAddress;
        const sessionData = await this.authService.login(credentials, deviceInfo, ipAddress);
        return {
            message: 'Logged in successfully',
            user: sessionData.user,
            accessToken: sessionData.accessToken,
            refreshToken: sessionData.refreshToken,
            expiresIn: Math.floor((sessionData.accessTokenExp.getTime() - Date.now()) / 1000),
        };
    }
    /**
     * Refresh access token
     */
    async refresh(body, req) {
        const { refreshToken } = body;
        if (!refreshToken) {
            throw new common_1.BadRequestException('Refresh token is required');
        }
        const deviceInfo = req.get('User-Agent');
        const ipAddress = req.ip || req.connection.remoteAddress;
        const sessionData = await this.authService.refreshAccessToken(refreshToken, deviceInfo, ipAddress);
        return {
            message: 'Access token refreshed successfully',
            user: sessionData.user,
            accessToken: sessionData.accessToken,
            refreshToken: sessionData.refreshToken,
            expiresIn: Math.floor((sessionData.accessTokenExp.getTime() - Date.now()) / 1000),
        };
    }
    /**
     * Logout from current session
     */
    async logout(req) {
        const authHeader = req.get('Authorization');
        const accessToken = authHeader?.split(' ')[1];
        await this.authService.logout(accessToken);
        return {
            message: 'Logged out successfully',
        };
    }
    /**
     * Logout from all devices
     */
    async logoutFromAllDevices(user) {
        await this.authService.logoutFromAllDevices(user.id);
        return {
            message: 'Logged out from all devices successfully',
        };
    }
    /**
     * Get current user profile and session info
     */
    async getProfile(user, req) {
        return {
            message: 'User profile retrieved successfully',
            user,
            session: req.session,
        };
    }
    /**
     * Get user's active sessions
     */
    async getUserSessions(user) {
        const sessions = await this.authService.getUserSessions(user.id);
        return {
            message: 'Active sessions retrieved successfully',
            sessions,
        };
    }
    /**
     * Revoke a specific session
     */
    async revokeSession(sessionId, user) {
        await this.authService.revokeSessionById(sessionId, user.id);
        return {
            message: 'Session revoked successfully',
        };
    }
    /**
     * Validate current session (health check)
     */
    async validateSession(user, req) {
        return {
            message: 'Session is valid',
            user,
            session: req.session,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('logout-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutFromAllDevices", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('sessions'),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserSessions", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)('sessions/:sessionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('validate'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateSession", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
