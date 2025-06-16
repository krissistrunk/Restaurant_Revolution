import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storage } from '../storage';
import { log } from '../vite';

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  restaurantId?: number;
  iat?: number;
  exp?: number;
}

interface AuthResult {
  success: boolean;
  user?: any;
  token?: string;
  refreshToken?: string;
  error?: string;
}

interface PasswordResetRequest {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  private static JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
  private static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  private static JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  private static BCRYPT_ROUNDS = 12;
  
  // In-memory storage for demo - in production, use Redis or database
  private static passwordResetTokens = new Map<string, PasswordResetRequest>();
  private static emailVerificationTokens = new Map<string, { email: string; userId: number; expiresAt: Date }>();
  private static refreshTokens = new Set<string>();

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: this.JWT_REFRESH_EXPIRES_IN });
    this.refreshTokens.add(refreshToken);
    return refreshToken;
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      log(`Token verification failed: ${error}`);
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      if (!this.refreshTokens.has(token)) {
        return null;
      }
      return jwt.verify(token, this.JWT_REFRESH_SECRET) as TokenPayload;
    } catch (error) {
      log(`Refresh token verification failed: ${error}`);
      return null;
    }
  }

  /**
   * Register new user
   */
  static async register(userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: string;
    restaurantId?: number;
  }): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return { success: false, error: 'Username already exists' };
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return { success: false, error: 'Email already exists' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: userData.role || 'customer',
        emailVerified: false
      });

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId
      };

      const token = this.generateToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      // Generate email verification token
      const verificationToken = this.generateEmailVerificationToken(user.email, user.id);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      log(`User registered: ${user.email} (${user.role})`);

      return {
        success: true,
        user: userResponse,
        token,
        refreshToken
      };
    } catch (error) {
      log(`Registration error: ${error}`);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Login user
   */
  static async login(credentials: {
    username: string;
    password: string;
  }): Promise<AuthResult> {
    try {
      // Find user by username or email
      let user = await storage.getUserByUsername(credentials.username);
      if (!user) {
        user = await storage.getUserByEmail(credentials.username);
      }

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(credentials.password, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId
      };

      const token = this.generateToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      log(`User logged in: ${user.email} (${user.role})`);

      return {
        success: true,
        user: userResponse,
        token,
        refreshToken
      };
    } catch (error) {
      log(`Login error: ${error}`);
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      if (!payload) {
        return { success: false, error: 'Invalid refresh token' };
      }

      // Verify user still exists
      const user = await storage.getUser(payload.userId);
      if (!user) {
        this.refreshTokens.delete(refreshToken);
        return { success: false, error: 'User not found' };
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId
      };

      const newToken = this.generateToken(tokenPayload);
      const newRefreshToken = this.generateRefreshToken(tokenPayload);

      // Remove old refresh token
      this.refreshTokens.delete(refreshToken);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      return {
        success: true,
        user: userResponse,
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      log(`Token refresh error: ${error}`);
      return { success: false, error: 'Token refresh failed' };
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  static async logout(refreshToken: string): Promise<boolean> {
    try {
      this.refreshTokens.delete(refreshToken);
      return true;
    } catch (error) {
      log(`Logout error: ${error}`);
      return false;
    }
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(email: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    this.passwordResetTokens.set(token, {
      email,
      token,
      expiresAt,
      used: false
    });

    return token;
  }

  /**
   * Verify password reset token
   */
  static verifyPasswordResetToken(token: string): { valid: boolean; email?: string } {
    const resetRequest = this.passwordResetTokens.get(token);
    
    if (!resetRequest || resetRequest.used || resetRequest.expiresAt < new Date()) {
      return { valid: false };
    }

    return { valid: true, email: resetRequest.email };
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      const verification = this.verifyPasswordResetToken(token);
      if (!verification.valid || !verification.email) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update user password
      const user = await storage.getUserByEmail(verification.email);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      await storage.updateUserPassword(user.id, hashedPassword);

      // Mark token as used
      const resetRequest = this.passwordResetTokens.get(token);
      if (resetRequest) {
        resetRequest.used = true;
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;

      log(`Password reset for user: ${user.email}`);

      return { success: true, user: userResponse };
    } catch (error) {
      log(`Password reset error: ${error}`);
      return { success: false, error: 'Password reset failed' };
    }
  }

  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(email: string, userId: number): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    this.emailVerificationTokens.set(token, {
      email,
      userId,
      expiresAt
    });

    return token;
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<AuthResult> {
    try {
      const verification = this.emailVerificationTokens.get(token);
      
      if (!verification || verification.expiresAt < new Date()) {
        return { success: false, error: 'Invalid or expired verification token' };
      }

      // Update user email verification status
      await storage.updateUserEmailVerification(verification.userId, true);
      
      // Remove token
      this.emailVerificationTokens.delete(token);

      const user = await storage.getUser(verification.userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;

      log(`Email verified for user: ${user.email}`);

      return { success: true, user: userResponse };
    } catch (error) {
      log(`Email verification error: ${error}`);
      return { success: false, error: 'Email verification failed' };
    }
  }

  /**
   * Change password (for authenticated users)
   */
  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isValidPassword = await this.verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await storage.updateUserPassword(userId, hashedPassword);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      log(`Password changed for user: ${user.email}`);

      return { success: true, user: userResponse };
    } catch (error) {
      log(`Password change error: ${error}`);
      return { success: false, error: 'Password change failed' };
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: number): Promise<AuthResult> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get additional user stats
      const orders = await storage.getUserOrders(userId);
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      return {
        success: true,
        user: {
          ...userResponse,
          totalOrders,
          totalSpent: parseFloat(totalSpent.toFixed(2))
        }
      };
    } catch (error) {
      log(`Get user profile error: ${error}`);
      return { success: false, error: 'Failed to get user profile' };
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: number, updates: {
    name?: string;
    email?: string;
    phone?: string;
    preferences?: any;
  }): Promise<AuthResult> {
    try {
      // If email is being updated, check if it's already taken
      if (updates.email) {
        const existingUser = await storage.getUserByEmail(updates.email);
        if (existingUser && existingUser.id !== userId) {
          return { success: false, error: 'Email already exists' };
        }
      }

      const updatedUser = await storage.updateUserProfile(userId, updates);
      if (!updatedUser) {
        return { success: false, error: 'User not found' };
      }

      // Remove password from response
      const { password: _, ...userResponse } = updatedUser;

      log(`Profile updated for user: ${updatedUser.email}`);

      return { success: true, user: userResponse };
    } catch (error) {
      log(`Update user profile error: ${error}`);
      return { success: false, error: 'Profile update failed' };
    }
  }

  /**
   * Social login (OAuth)
   */
  static async socialLogin(provider: string, profile: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<AuthResult> {
    try {
      // Check if user exists by email
      let user = await storage.getUserByEmail(profile.email);
      
      if (!user) {
        // Create new user from social profile
        const username = profile.email.split('@')[0] + '_' + provider;
        const randomPassword = crypto.randomBytes(16).toString('hex');
        
        user = await storage.createUser({
          username,
          email: profile.email,
          password: await this.hashPassword(randomPassword),
          name: profile.name,
          role: 'customer',
          emailVerified: true, // Social logins are pre-verified
          socialProvider: provider,
          socialId: profile.id,
          avatar: profile.picture
        });
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId
      };

      const token = this.generateToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      log(`Social login: ${user.email} via ${provider}`);

      return {
        success: true,
        user: userResponse,
        token,
        refreshToken
      };
    } catch (error) {
      log(`Social login error: ${error}`);
      return { success: false, error: 'Social login failed' };
    }
  }

  /**
   * Admin functions
   */
  static async getAllUsers(page: number = 1, limit: number = 20, filters?: {
    role?: string;
    emailVerified?: boolean;
    restaurantId?: number;
  }): Promise<{ users: any[]; total: number; page: number; limit: number }> {
    try {
      const result = await storage.getAllUsers(page, limit, filters);
      
      // Remove passwords from all users
      const users = result.users.map(({ password, ...user }) => user);
      
      return {
        users,
        total: result.total,
        page,
        limit
      };
    } catch (error) {
      log(`Get all users error: ${error}`);
      return { users: [], total: 0, page, limit };
    }
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  static cleanupExpiredTokens(): void {
    const now = new Date();
    
    // Clean up password reset tokens
    for (const [token, request] of this.passwordResetTokens.entries()) {
      if (request.expiresAt < now) {
        this.passwordResetTokens.delete(token);
      }
    }
    
    // Clean up email verification tokens
    for (const [token, verification] of this.emailVerificationTokens.entries()) {
      if (verification.expiresAt < now) {
        this.emailVerificationTokens.delete(token);
      }
    }
    
    log('Expired tokens cleaned up');
  }
}