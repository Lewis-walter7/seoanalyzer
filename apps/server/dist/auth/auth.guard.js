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
exports.IS_PUBLIC_KEY = 'isPublic';
let AuthGuard = class AuthGuard {
    jwtService;
    reflector;
    prisma;
    authService;
    constructor(jwtService, reflector, prisma, authService) {
        this.jwtService = jwtService;
        this.reflector = reflector;
        this.prisma = prisma;
        this.authService = authService;
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
            // Use AuthService to validate access token (includes database session validation)
            const validation = await this.authService.validateAccessToken(token);
            // Attach user to request object
            request['user'] = validation.user;
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
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        core_1.Reflector,
        prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], AuthGuard);
