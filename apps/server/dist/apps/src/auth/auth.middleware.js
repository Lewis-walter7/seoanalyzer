"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
exports.optionalAuthenticateJWT = optionalAuthenticateJWT;
exports.fastifyAuthenticateJWT = fastifyAuthenticateJWT;
exports.fastifyOptionalAuthenticateJWT = fastifyOptionalAuthenticateJWT;
exports.isAuthenticated = isAuthenticated;
exports.isFastifyAuthenticated = isFastifyAuthenticated;
exports.requireAuth = requireAuth;
exports.fastifyRequireAuth = fastifyRequireAuth;
const auth_service_1 = require("./auth.service");
/**
 * Extract JWT token from request headers
 */
function extractToken(authHeader) {
    if (!authHeader) {
        return null;
    }
    // Support both "Bearer token" and "token" formats
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
    }
    else if (parts.length === 1) {
        return parts[0];
    }
    return null;
}
/**
 * Express middleware for JWT authentication
 * Validates JWT token and attaches user to req.user
 */
function authenticateJWT(req, res, next) {
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
        const payload = auth_service_1.authService.verifyToken(token);
        if (!payload) {
            res.status(401).json({
                error: 'Access denied',
                message: 'Invalid token',
            });
            return;
        }
        // Fetch user details (this should be replaced with actual database query)
        auth_service_1.authService.findUserById(payload.userId)
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
    }
    catch (error) {
        console.error('[AuthMiddleware] Token verification error:', error.message);
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
function optionalAuthenticateJWT(req, res, next) {
    const token = extractToken(req.headers.authorization);
    if (!token) {
        // No token provided, continue without user
        next();
        return;
    }
    try {
        const payload = auth_service_1.authService.verifyToken(token);
        if (!payload) {
            // Invalid token, continue without user
            next();
            return;
        }
        // Fetch user details
        auth_service_1.authService.findUserById(payload.userId)
            .then((user) => {
            if (user) {
                req.user = user;
                req.token = token;
            }
            next();
        })
            .catch((error) => {
            console.debug('[AuthMiddleware] Optional auth - user fetch error:', error.message);
            // Continue without user on error
            next();
        });
    }
    catch (error) {
        console.debug('[AuthMiddleware] Optional auth - token verification error:', error.message);
        // Continue without user on error
        next();
    }
}
/**
 * Fastify plugin for JWT authentication
 * Validates JWT token and attaches user to request.user
 */
async function fastifyAuthenticateJWT(request, reply) {
    const token = extractToken(request.headers.authorization);
    if (!token) {
        reply.status(401).send({
            error: 'Access denied',
            message: 'No token provided',
        });
        return;
    }
    try {
        // Verify token
        const payload = auth_service_1.authService.verifyToken(token);
        if (!payload) {
            reply.status(401).send({
                error: 'Access denied',
                message: 'Invalid token',
            });
            return;
        }
        // Fetch user details
        const user = await auth_service_1.authService.findUserById(payload.userId);
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
    }
    catch (error) {
        console.error('[AuthMiddleware] Fastify token verification error:', error.message);
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
async function fastifyOptionalAuthenticateJWT(request, reply) {
    const token = extractToken(request.headers.authorization);
    if (!token) {
        // No token provided, continue without user
        return;
    }
    try {
        const payload = auth_service_1.authService.verifyToken(token);
        if (!payload) {
            // Invalid token, continue without user
            return;
        }
        // Fetch user details
        const user = await auth_service_1.authService.findUserById(payload.userId);
        if (user) {
            request.user = user;
            request.token = token;
        }
    }
    catch (error) {
        console.debug('[AuthMiddleware] Fastify optional auth - token verification error:', error.message);
        // Continue without user on error
    }
}
/**
 * Type guard to check if request has authenticated user
 */
function isAuthenticated(req) {
    return req.user !== undefined && req.token !== undefined;
}
/**
 * Type guard to check if Fastify request has authenticated user
 */
function isFastifyAuthenticated(req) {
    return req.user !== undefined && req.token !== undefined;
}
/**
 * Express middleware to require authentication (use after authenticateJWT)
 */
function requireAuth(req, res, next) {
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
async function fastifyRequireAuth(request, reply) {
    if (!isFastifyAuthenticated(request)) {
        reply.status(401).send({
            error: 'Access denied',
            message: 'Authentication required',
        });
        return;
    }
}
