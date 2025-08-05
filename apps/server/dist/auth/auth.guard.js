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
exports.AuthGuard = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_service_1 = require("./auth.service");
const jwt = require("jsonwebtoken");
const config_1 = require("@nestjs/config");
exports.IS_PUBLIC_KEY = 'isPublic';
let AuthGuard = class AuthGuard {
    jwtService;
    reflector;
    prisma;
    authService;
    configService;
    constructor(jwtService, reflector, prisma, authService, configService) {
        this.jwtService = jwtService;
        this.reflector = reflector;
        this.prisma = prisma;
        this.authService = authService;
        this.configService = configService;
    }
    async canActivate(context) {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride(exports.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Access token is required');
        }
        try {
            // First, try to validate as a backend-generated token
            try {
                const validation = await this.authService.validateAccessToken(token);
                request['user'] = validation.user;
                return true;
            }
            catch (backendTokenError) {
                // If backend token validation fails, try frontend token validation
                const user = await this.validateFrontendToken(token);
                request['user'] = user;
                return true;
            }
        }
        catch (error) {
            console.error('[AuthGuard] Caught error in canActivate:', error.message);
            throw new common_1.UnauthorizedException('Unauthorized, expired or invalid token');
        }
        return true;
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
    /**
     * Validates frontend-generated JWT tokens signed with NEXTAUTH_SECRET
     */
    async validateFrontendToken(token) {
        const nextAuthSecret = this.configService.get('NEXTAUTH_SECRET');
        if (!nextAuthSecret) {
            throw new common_1.UnauthorizedException('NEXTAUTH_SECRET not configured');
        }
        try {
            // Verify and decode the JWT token
            const payload = jwt.verify(token, nextAuthSecret);
            // Validate token structure
            if (!payload.sub || !payload.email) {
                throw new common_1.UnauthorizedException('Invalid token payload');
            }
            // Fetch user from database to ensure they exist and get latest data
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    isAdmin: true,
                },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            // Verify email matches (additional security check)
            if (user.email !== payload.email) {
                throw new common_1.UnauthorizedException('Token email mismatch');
            }
            return user;
        }
        catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new common_1.UnauthorizedException('Invalid JWT token');
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new common_1.UnauthorizedException('JWT token expired');
            }
            throw error;
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        core_1.Reflector,
        prisma_service_1.PrismaService,
        auth_service_1.AuthService,
        config_1.ConfigService])
], AuthGuard);
