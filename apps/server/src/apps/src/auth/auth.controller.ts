import { Router, Request, Response } from 'express';
import { authService, RegisterCredentials, LoginCredentials } from './auth.service';
import { authenticateJWT, requireAuth } from './auth.middleware';

const authRouter = Router();

// POST /auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const credentials: RegisterCredentials = req.body;
    const { user, token } = await authService.register(credentials);
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    res.status(400).json({
      error: 'Registration failed',
      message: (error as Error).message,
    });
  }
});

// POST /auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const credentials: LoginCredentials = req.body;
    const { user, token } = await authService.login(credentials);
    res.json({
      message: 'Logged in successfully',
      user,
      token,
    });
  } catch (error) {
    res.status(401).json({
      error: 'Login failed',
      message: (error as Error).message,
    });
  }
});

// POST /auth/logout
authRouter.post('/logout', authenticateJWT, requireAuth, (req: Request, res: Response) => {
  // Just a demonstration; in a real app, you might handle token blacklisting or session termination
  res.json({ message: 'Logged out successfully' });
});

// GET /auth/session
authRouter.get('/session', authenticateJWT, requireAuth, (req: Request, res: Response) => {
  res.json({
    message: 'Session is valid',
    user: req.user,
    token: req.token,
  });
});

export { authRouter };
