"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const auth_middleware_1 = require("./auth.middleware");
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
// POST /auth/register
authRouter.post('/register', async (req, res) => {
    try {
        const credentials = req.body;
        const { user, token } = await auth_service_1.authService.register(credentials);
        res.status(201).json({
            message: 'User registered successfully',
            user,
            token,
        });
    }
    catch (error) {
        res.status(400).json({
            error: 'Registration failed',
            message: error.message,
        });
    }
});
// POST /auth/login
authRouter.post('/login', async (req, res) => {
    try {
        const credentials = req.body;
        const { user, token } = await auth_service_1.authService.login(credentials);
        res.json({
            message: 'Logged in successfully',
            user,
            token,
        });
    }
    catch (error) {
        res.status(401).json({
            error: 'Login failed',
            message: error.message,
        });
    }
});
// POST /auth/logout
authRouter.post('/logout', auth_middleware_1.authenticateJWT, auth_middleware_1.requireAuth, (req, res) => {
    // Just a demonstration; in a real app, you might handle token blacklisting or session termination
    res.json({ message: 'Logged out successfully' });
});
// GET /auth/session
authRouter.get('/session', auth_middleware_1.authenticateJWT, auth_middleware_1.requireAuth, (req, res) => {
    res.json({
        message: 'Session is valid',
        user: req.user,
        token: req.token,
    });
});
