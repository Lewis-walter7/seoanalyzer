import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service.ts';
import type { LoginCredentials, RegisterCredentials } from './auth.service.ts';
import { AuthGuard } from './auth.guard';
import { Public } from './public.decorator';
import { User } from './user.decorator';
import type { AuthenticatedUser } from './user.interface';

interface RefreshTokenDto {
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   */
  @Public()
  @Post('register')
  async register(@Body() credentials: RegisterCredentials, @Request() req: any) {
    const deviceInfo = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;

    const sessionData = await this.authService.register(credentials, deviceInfo, ipAddress);

    return {
      message: 'User registered successfully',
      user: sessionData.user,
      accessToken: sessionData.accessToken,
      refreshToken: sessionData.refreshToken,
      expiresIn: Math.floor((sessionData.accessTokenExp.getTime() - Date.now()) / 1000),
    };
  }

  /**
   * Login user
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() credentials: LoginCredentials, @Request() req: any) {
    const deviceInfo = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;

    const sessionData = await this.authService.login(credentials, deviceInfo, ipAddress);

    return {
      message: 'Logged in successfully',
      user: sessionData.user,
      accessToken: sessionData.accessToken,
      refreshToken: sessionData.refreshToken,
      expiresIn: Math.floor((sessionData.accessTokenExp.getTime() - Date.now()) / 1000),
    };
  }

  /**
   * Refresh access token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: RefreshTokenDto, @Request() req: any) {
    const { refreshToken } = body;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const deviceInfo = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;

    const sessionData = await this.authService.refreshAccessToken(refreshToken, deviceInfo, ipAddress);

    return {
      message: 'Access token refreshed successfully',
      user: sessionData.user,
      accessToken: sessionData.accessToken,
      refreshToken: sessionData.refreshToken,
      expiresIn: Math.floor((sessionData.accessTokenExp.getTime() - Date.now()) / 1000),
    };
  }

  /**
   * Logout from current session
   */
  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    const authHeader = req.get('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    await this.authService.logout(accessToken);

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Logout from all devices
   */
  @UseGuards(AuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutFromAllDevices(@User() user: AuthenticatedUser) {
    await this.authService.logoutFromAllDevices(user.id);

    return {
      message: 'Logged out from all devices successfully',
    };
  }

  /**
   * Get current user profile and session info
   */
  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@User() user: AuthenticatedUser, @Request() req: any) {
    return {
      message: 'User profile retrieved successfully',
      user,
      session: req.session,
    };
  }

  /**
   * Get user's active sessions
   */
  @UseGuards(AuthGuard)
  @Get('sessions')
  async getUserSessions(@User() user: AuthenticatedUser) {
    const sessions = await this.authService.getUserSessions(user.id);

    return {
      message: 'Active sessions retrieved successfully',
      sessions,
    };
  }

  /**
   * Revoke a specific session
   */
  @UseGuards(AuthGuard)
  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  async revokeSession(@Param('sessionId') sessionId: string, @User() user: AuthenticatedUser) {
    await this.authService.revokeSessionById(sessionId, user.id);

    return {
      message: 'Session revoked successfully',
    };
  }

  /**
   * Validate current session (health check)
   */
  @UseGuards(AuthGuard)
  @Get('validate')
  async validateSession(@User() user: AuthenticatedUser, @Request() req: any) {
    return {
      message: 'Session is valid',
      user,
      session: req.session,
      timestamp: new Date().toISOString(),
    };
  }
}
