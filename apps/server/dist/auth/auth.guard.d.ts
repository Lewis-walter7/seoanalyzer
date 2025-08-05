import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
export declare const IS_PUBLIC_KEY = "isPublic";
export declare class AuthGuard implements CanActivate {
    private jwtService;
    private reflector;
    private prisma;
    private authService;
    private configService;
    constructor(jwtService: JwtService, reflector: Reflector, prisma: PrismaService, authService: AuthService, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
    /**
     * Validates frontend-generated JWT tokens signed with NEXTAUTH_SECRET
     */
    private validateFrontendToken;
}
