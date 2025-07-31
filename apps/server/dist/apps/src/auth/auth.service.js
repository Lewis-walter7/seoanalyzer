"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_1 = require("passport");
class AuthService {
    JWT_SECRET;
    GOOGLE_CLIENT_ID;
    GOOGLE_CLIENT_SECRET;
    BCRYPT_ROUNDS = 12;
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        this.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
        if (!this.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is required');
        }
        this.setupGoogleStrategy();
    }
    /**
     * Hash password using bcrypt with 12 rounds
     */
    async hashPassword(password) {
        return bcrypt_1.default.hash(password, this.BCRYPT_ROUNDS);
    }
    /**
     * Verify password against hash
     */
    async verifyPassword(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
    /**
     * Generate JWT token for user
     */
    generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
        };
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: '24h',
        });
    }
    /**
     * Verify and decode JWT token
     */
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Register new user with email and password
     */
    async register(credentials) {
        const { email, password, name } = credentials;
        // Check if user already exists (this would typically query your database)
        const existingUser = await this.findUserByEmail(email);
        if (existingUser) {
            throw new Error('User already exists with this email');
        }
        // Hash password
        const hashedPassword = await this.hashPassword(password);
        // Create user (this would typically save to your database)
        const user = {
            id: this.generateUserId(), // You'd typically use your database's ID generation
            email,
            password: hashedPassword,
            name,
            createdAt: new Date(),
        };
        await this.saveUser(user);
        // Generate token
        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            token,
        };
    }
    /**
     * Login user with email and password
     */
    async login(credentials) {
        const { email, password } = credentials;
        // Find user by email
        const user = await this.findUserByEmail(email);
        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }
        // Verify password
        const isPasswordValid = await this.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        // Generate token
        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            token,
        };
    }
    /**
     * Setup Google OAuth strategy
     */
    setupGoogleStrategy() {
        if (!this.GOOGLE_CLIENT_ID || !this.GOOGLE_CLIENT_SECRET) {
            console.warn('Google OAuth credentials not provided. Google authentication will be disabled.');
            return;
        }
        passport_1.default.use(new passport_google_oauth20_1.Strategy({
            clientID: this.GOOGLE_CLIENT_ID,
            clientSecret: this.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(new Error('No email found in Google profile'), undefined);
                }
                // Check if user exists
                let user = await this.findUserByEmail(email);
                if (!user) {
                    // Create new user from Google profile
                    user = {
                        id: this.generateUserId(),
                        email,
                        googleId: profile.id,
                        name: profile.displayName || profile.username || 'Google User',
                        createdAt: new Date(),
                    };
                    await this.saveUser(user);
                }
                else if (!user.googleId) {
                    // Link Google account to existing user
                    user.googleId = profile.id;
                    await this.updateUser(user);
                }
                return done(null, user);
            }
            catch (error) {
                return done(error, undefined);
            }
        }));
    }
    /**
     * Handle Google OAuth callback
     */
    async handleGoogleCallback(user) {
        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            token,
        };
    }
    /**
     * Remove sensitive data from user object
     */
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }
    /**
     * Generate unique user ID (replace with your database's ID generation)
     */
    generateUserId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Database methods - These should be replaced with your actual database operations
    /**
     * Find user by email (replace with database query)
     */
    async findUserByEmail(email) {
        // TODO: Replace with actual database query
        // Example: return await this.userRepository.findByEmail(email);
        throw new Error('Database integration required: implement findUserByEmail');
    }
    /**
     * Save user to database (replace with database operation)
     */
    async saveUser(user) {
        // TODO: Replace with actual database operation
        // Example: await this.userRepository.save(user);
        throw new Error('Database integration required: implement saveUser');
    }
    /**
     * Update user in database (replace with database operation)
     */
    async updateUser(user) {
        // TODO: Replace with actual database operation
        // Example: await this.userRepository.update(user.id, user);
        throw new Error('Database integration required: implement updateUser');
    }
    /**
     * Find user by ID (replace with database query)
     */
    async findUserById(userId) {
        // TODO: Replace with actual database query
        // Example: return await this.userRepository.findById(userId);
        throw new Error('Database integration required: implement findUserById');
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
