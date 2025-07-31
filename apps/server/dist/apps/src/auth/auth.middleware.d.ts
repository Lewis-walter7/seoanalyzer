import { Request, Response, NextFunction } from 'express';
import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from './auth.service';
declare global {
    namespace Express {
        interface Request {
            user?: User;
            token?: string;
        }
    }
}
declare module 'fastify' {
    interface FastifyRequest {
        user?: User;
        token?: string;
    }
}
export interface AuthenticatedRequest extends Request {
    user: User;
    token: string;
}
export interface AuthenticatedFastifyRequest extends FastifyRequest {
    user: User;
    token: string;
}
/**
 * Express middleware for JWT authentication
 * Validates JWT token and attaches user to req.user
 */
export declare function authenticateJWT(req: Request, res: Response, next: NextFunction): void;
/**
 * Express middleware for optional JWT authentication
 * Attaches user to req.user if token is valid, but doesn't reject if no token
 */
export declare function optionalAuthenticateJWT(req: Request, res: Response, next: NextFunction): void;
/**
 * Fastify plugin for JWT authentication
 * Validates JWT token and attaches user to request.user
 */
export declare function fastifyAuthenticateJWT(request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * Fastify plugin for optional JWT authentication
 * Attaches user to request.user if token is valid, but doesn't reject if no token
 */
export declare function fastifyOptionalAuthenticateJWT(request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * Type guard to check if request has authenticated user
 */
export declare function isAuthenticated(req: Request): req is AuthenticatedRequest;
/**
 * Type guard to check if Fastify request has authenticated user
 */
export declare function isFastifyAuthenticated(req: FastifyRequest): req is AuthenticatedFastifyRequest;
/**
 * Express middleware to require authentication (use after authenticateJWT)
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
/**
 * Fastify prehandler to require authentication (use after fastifyAuthenticateJWT)
 */
export declare function fastifyRequireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void>;
