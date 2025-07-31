import { AuthService } from './auth.service';
import type { LoginCredentials, RegisterCredentials } from './auth.service';
import type { AuthenticatedUser } from './user.interface';
interface RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    /**
     * Register a new user
     */
    register(credentials: RegisterCredentials, req: any): Promise<{
        message: string;
        user: {
            id: string;
            email: string | null;
            name: string | null;
            isAdmin: boolean;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    /**
     * Login user
     */
    login(credentials: LoginCredentials, req: any): Promise<{
        message: string;
        user: {
            id: string;
            email: string | null;
            name: string | null;
            isAdmin: boolean;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    /**
     * Refresh access token
     */
    refresh(body: RefreshTokenDto, req: any): Promise<{
        message: string;
        user: {
            id: string;
            email: string | null;
            name: string | null;
            isAdmin: boolean;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    /**
     * Logout from current session
     */
    logout(req: any): Promise<{
        message: string;
    }>;
    /**
     * Logout from all devices
     */
    logoutFromAllDevices(user: AuthenticatedUser): Promise<{
        message: string;
    }>;
    /**
     * Get current user profile and session info
     */
    getProfile(user: AuthenticatedUser, req: any): Promise<{
        message: string;
        user: AuthenticatedUser;
        session: any;
    }>;
    /**
     * Get user's active sessions
     */
    getUserSessions(user: AuthenticatedUser): Promise<{
        message: string;
        sessions: {
            id: string;
            createdAt: Date;
            accessTokenExp: Date;
            refreshTokenExp: Date;
            lastUsedAt: Date;
            deviceInfo: string | null;
            ipAddress: string | null;
        }[];
    }>;
    /**
     * Revoke a specific session
     */
    revokeSession(sessionId: string, user: AuthenticatedUser): Promise<{
        message: string;
    }>;
    /**
     * Validate current session (health check)
     */
    validateSession(user: AuthenticatedUser, req: any): Promise<{
        message: string;
        user: AuthenticatedUser;
        session: any;
        timestamp: string;
    }>;
}
export {};
