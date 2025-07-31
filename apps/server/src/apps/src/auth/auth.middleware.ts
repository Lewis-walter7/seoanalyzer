import { Request, Response, NextFunction } from 'express';
import { FastifyRequest, FastifyReply } from 'fastify';
import { authService, User, JWTPayload } from './auth.service';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}

// Extend Fastify Request interface to include user
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
 * Extract JWT token from request headers
 */
function extractToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer token" and "token" formats
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return null;
}

/**
 * Express middleware for JWT authentication
 * Validates JWT token and attaches user to req.user
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({
      error: 'Access denied',
      message: 'No token provided',
    });
    return;
  }

  try {
    // Verify token
    const payload = authService.verifyToken(token);
    if (!payload) {
      res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token',
      });
      return;
    }

    // Fetch user details (this should be replaced with actual database query)
    authService.findUserById(payload.userId)
      .then((user) => {
        if (!user) {
          res.status(401).json({
            error: 'Access denied',
            message: 'User not found',
          });
          return;
        }

        // Attach user and token to request
        req.user = user;
        req.token = token;
        next();
      })
      .catch((error) => {
        // Log error for debugging but with structured logging
        console.error('[AuthMiddleware] User fetch error:', error.message);
        res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to authenticate user',
        });
      });
  } catch (error) {
    console.error('[AuthMiddleware] Token verification error:', (error as Error).message);
    res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token',
    });
  }
}

/**
 * Express middleware for optional JWT authentication
 * Attaches user to req.user if token is valid, but doesn't reject if no token
 */
export function optionalAuthenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    // No token provided, continue without user
    next();
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    if (!payload) {
      // Invalid token, continue without user
      next();
      return;
    }

    // Fetch user details
    authService.findUserById(payload.userId)
      .then((user) => {
        if (user) {
          req.user = user;
          req.token = token;
        }
        next();
      })
      .catch((error) => {
        console.debug('[AuthMiddleware] Optional auth - user fetch error:', (error as Error).message);
        // Continue without user on error
        next();
      });
  } catch (error) {
    console.debug('[AuthMiddleware] Optional auth - token verification error:', (error as Error).message);
    // Continue without user on error
    next();
  }
}

/**
 * Fastify plugin for JWT authentication
 * Validates JWT token and attaches user to request.user
 */
export async function fastifyAuthenticateJWT(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const token = extractToken(request.headers.authorization as string);

  if (!token) {
    reply.status(401).send({
      error: 'Access denied',
      message: 'No token provided',
    });
    return;
  }

  try {
    // Verify token
    const payload = authService.verifyToken(token);
    if (!payload) {
      reply.status(401).send({
        error: 'Access denied',
        message: 'Invalid token',
      });
      return;
    }

    // Fetch user details
    const user = await authService.findUserById(payload.userId);
    if (!user) {
      reply.status(401).send({
        error: 'Access denied',
        message: 'User not found',
      });
      return;
    }

    // Attach user and token to request
    request.user = user;
    request.token = token;
  } catch (error) {
    console.error('[AuthMiddleware] Fastify token verification error:', (error as Error).message);
    reply.status(401).send({
      error: 'Access denied',
      message: 'Invalid token',
    });
  }
}

/**
 * Fastify plugin for optional JWT authentication
 * Attaches user to request.user if token is valid, but doesn't reject if no token
 */
export async function fastifyOptionalAuthenticateJWT(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const token = extractToken(request.headers.authorization as string);

  if (!token) {
    // No token provided, continue without user
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    if (!payload) {
      // Invalid token, continue without user
      return;
    }

    // Fetch user details
    const user = await authService.findUserById(payload.userId);
    if (user) {
      request.user = user;
      request.token = token;
    }
  } catch (error) {
    console.debug('[AuthMiddleware] Fastify optional auth - token verification error:', (error as Error).message);
    // Continue without user on error
  }
}

/**
 * Type guard to check if request has authenticated user
 */
export function isAuthenticated(req: Request): req is AuthenticatedRequest {
  return req.user !== undefined && req.token !== undefined;
}

/**
 * Type guard to check if Fastify request has authenticated user
 */
export function isFastifyAuthenticated(req: FastifyRequest): req is AuthenticatedFastifyRequest {
  return req.user !== undefined && req.token !== undefined;
}

/**
 * Express middleware to require authentication (use after authenticateJWT)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isAuthenticated(req)) {
    res.status(401).json({
      error: 'Access denied',
      message: 'Authentication required',
    });
    return;
  }
  next();
}

/**
 * Fastify prehandler to require authentication (use after fastifyAuthenticateJWT)
 */
export async function fastifyRequireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!isFastifyAuthenticated(request)) {
    reply.status(401).send({
      error: 'Access denied',
      message: 'Authentication required',
    });
    return;
  }
}
