export interface User {
    id: string;
    email: string;
    password?: string;
    googleId?: string;
    name: string;
    createdAt: Date;
}
export interface Plan {
    id: string;
    displayName: string;
    priceMonthly: number;
    priceYearly?: number;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterCredentials {
    email: string;
    password: string;
    name: string;
}
export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export declare class AuthService {
    private readonly JWT_SECRET;
    private readonly GOOGLE_CLIENT_ID;
    private readonly GOOGLE_CLIENT_SECRET;
    private readonly BCRYPT_ROUNDS;
    constructor();
    /**
     * Hash password using bcrypt with 12 rounds
     */
    hashPassword(password: string): Promise<string>;
    /**
     * Verify password against hash
     */
    verifyPassword(password: string, hash: string): Promise<boolean>;
    /**
     * Generate JWT token for user
     */
    generateToken(user: User): string;
    /**
     * Verify and decode JWT token
     */
    verifyToken(token: string): JWTPayload | null;
    /**
     * Register new user with email and password
     */
    register(credentials: RegisterCredentials): Promise<{
        user: User;
        token: string;
    }>;
    /**
     * Login user with email and password
     */
    login(credentials: LoginCredentials): Promise<{
        user: User;
        token: string;
    }>;
    /**
     * Setup Google OAuth strategy
     */
    private setupGoogleStrategy;
    /**
     * Handle Google OAuth callback
     */
    handleGoogleCallback(user: User): Promise<{
        user: User;
        token: string;
    }>;
    /**
     * Remove sensitive data from user object
     */
    private sanitizeUser;
    /**
     * Generate unique user ID (replace with your database's ID generation)
     */
    private generateUserId;
    /**
     * Find user by email (replace with database query)
     */
    private findUserByEmail;
    /**
     * Save user to database (replace with database operation)
     */
    private saveUser;
    /**
     * Update user in database (replace with database operation)
     */
    private updateUser;
    /**
     * Find user by ID (replace with database query)
     */
    findUserById(userId: string): Promise<User | null>;
}
export declare const authService: AuthService;
