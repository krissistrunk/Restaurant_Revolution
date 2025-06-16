import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../auth/authService';
import { getWebSocketManager } from '../websocket';
import { log } from '../vite';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
  role: z.enum(['customer', 'owner', 'admin']).optional(),
  restaurantId: z.number().optional()
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  preferences: z.record(z.any()).optional()
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

/**
 * Register new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const userData = registerSchema.parse(req.body);
    const result = await AuthService.register(userData);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    // Set secure HTTP-only cookies for tokens
    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(201).json({
      user: result.user,
      message: 'Registration successful'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    log(`Registration error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const credentials = loginSchema.parse(req.body);
    const result = await AuthService.login(credentials);
    
    if (!result.success) {
      return res.status(401).json({ message: result.error });
    }
    
    // Set secure HTTP-only cookies for tokens
    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Broadcast user login event
    const wsManager = getWebSocketManager();
    if (wsManager && result.user) {
      wsManager.broadcastToUser(result.user.id, {
        type: 'user_logged_in',
        payload: { message: 'Welcome back!' },
        channel: `user:${result.user.id}:system`
      });
    }
    
    res.json({
      user: result.user,
      message: 'Login successful'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    log(`Login error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await AuthService.refreshToken(refreshToken);
    
    if (!result.success) {
      return res.status(401).json({ message: result.error });
    }
    
    // Set new secure HTTP-only cookies
    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({
      user: result.user,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    log(`Token refresh error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Logout user
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    log(`Logout error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get current user profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const result = await AuthService.getUserProfile(userId);
    
    if (!result.success) {
      return res.status(404).json({ message: result.error });
    }
    
    res.json({ user: result.user });
  } catch (error) {
    log(`Get profile error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Update user profile
 */
router.patch('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const updates = updateProfileSchema.parse(req.body);
    const result = await AuthService.updateUserProfile(userId, updates);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    // Broadcast profile update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.broadcastToUser(userId, {
        type: 'profile_updated',
        payload: { user: result.user },
        channel: `user:${userId}:profile`
      });
    }
    
    res.json({
      user: result.user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    log(`Profile update error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Change password
 */
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const result = await AuthService.changePassword(userId, currentPassword, newPassword);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    log(`Change password error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Forgot password - request reset token
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    
    // Generate reset token
    const resetToken = AuthService.generatePasswordResetToken(email);
    
    // In a real app, send email with reset link
    // For demo purposes, we'll log it or return it
    log(`Password reset token for ${email}: ${resetToken}`);
    
    // In production, don't return the token in response
    res.json({ 
      message: 'Password reset instructions sent to your email',
      // Remove this in production:
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    log(`Forgot password error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Reset password with token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const result = await AuthService.resetPassword(token, newPassword);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    log(`Reset password error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Verify email with token
 */
router.post('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const result = await AuthService.verifyEmail(token);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.json({ 
      message: 'Email verified successfully',
      user: result.user
    });
  } catch (error) {
    log(`Email verification error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Admin route: Get all users
 */
router.get('/admin/users', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (userRole !== 'admin' && userRole !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      role: req.query.role as string,
      emailVerified: req.query.emailVerified === 'true' ? true : 
                     req.query.emailVerified === 'false' ? false : undefined,
      restaurantId: req.query.restaurantId ? parseInt(req.query.restaurantId as string) : undefined
    };
    
    const result = await AuthService.getAllUsers(page, limit, filters);
    
    res.json(result);
  } catch (error) {
    log(`Get all users error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Social login callback (placeholder)
 */
router.post('/social/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { profile } = req.body;
    
    // Validate provider
    if (!['google', 'facebook', 'apple'].includes(provider)) {
      return res.status(400).json({ message: 'Unsupported social provider' });
    }
    
    const result = await AuthService.socialLogin(provider, profile);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    // Set secure HTTP-only cookies for tokens
    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      user: result.user,
      message: 'Social login successful'
    });
  } catch (error) {
    log(`Social login error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as authRoutes };