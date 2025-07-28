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
import * as jwt from 'jsonwebtoken';

export const IS_PUBLIC_KEY = 'isPublic';

interface NextAuthJWTPayload {
  sub: string;
  email: string;
  name: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private prisma: PrismaService,
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
      // Try to validate as NextAuth JWT first
      const nextAuthPayload = await this.validateNextAuthJWT(token);
      if (nextAuthPayload) {
        // Fetch user from database to ensure they still exist and get fresh data
        const user = await this.prisma.user.findUnique({
          where: { id: nextAuthPayload.email },
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

        // Attach user to request object
        request['user'] = user;
        return true;
      }

      // Fallback to regular JWT validation (for backward compatibility)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Fetch user from database to ensure they still exist
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub.userId },
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

      // Attach user to request object
      request['user'] = user;
    } catch (error) {
      console.error('JWT validation error:', (error as Error).message);
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }

  private async validateNextAuthJWT(token: string): Promise<NextAuthJWTPayload | null> {
    try {
      // First try to decode as base64 (our simple implementation)
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const payload = JSON.parse(decoded) as NextAuthJWTPayload;
        
        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          throw new Error('Token expired');
        }
        
        return payload;
      } catch {
        // Not base64, try JWT verification with NextAuth secret
        const nextAuthSecret = process.env.NEXTAUTH_SECRET;
        if (!nextAuthSecret) {
          return null;
        }

        const decoded = jwt.verify(token, nextAuthSecret) as any;
        return {
          sub: decoded.sub || decoded.id,
          email: decoded.email,
          name: decoded.name,
          isAdmin: decoded.isAdmin || false,
          iat: decoded.iat,
          exp: decoded.exp,
        };
      }
    } catch (error) {
      console.error('NextAuth JWT validation failed:', (error as Error).message);
      return null;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
