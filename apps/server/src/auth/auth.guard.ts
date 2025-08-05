import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

export const IS_PUBLIC_KEY = 'isPublic';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private prisma: PrismaService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      // First, try to validate as a backend-generated token
      try {
        const validation = await this.authService.validateAccessToken(token);
        request['user'] = validation.user;
        return true;
      } catch (backendTokenError) {
        // If backend token validation fails, try frontend token validation
        const user = await this.validateFrontendToken(token);
        request['user'] = user;
        return true;
      }
    } catch (error) {
      console.error(
        '[AuthGuard] Caught error in canActivate:',
        (error as Error).message,
      );
      throw new UnauthorizedException('Unauthorized, expired or invalid token');
    }
    
    return true;
  }


  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Validates frontend-generated JWT tokens signed with NEXTAUTH_SECRET
   */
  private async validateFrontendToken(token: string): Promise<any> {
    const nextAuthSecret = this.configService.get('NEXTAUTH_SECRET');
    if (!nextAuthSecret) {
      throw new UnauthorizedException('NEXTAUTH_SECRET not configured');
    }

    try {
      // Verify and decode the JWT token
      const payload = jwt.verify(token, nextAuthSecret) as any;
      
      // Validate token structure
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
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
        throw new UnauthorizedException('User not found');
      }

      // Verify email matches (additional security check)
      if (user.email !== payload.email) {
        throw new UnauthorizedException('Token email mismatch');
      }

      return user;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid JWT token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('JWT token expired');
      }
      throw error;
    }
  }
}
