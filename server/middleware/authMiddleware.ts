import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth/authService';
import { storage } from '../storage';
import { log } from '../vite';
import { User } from "../../shared/schema";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Extract token from request (cookie, header, or body)
 */
function extractToken(req: Request): string | null {
  // Try cookie first (most secure)
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  
  // Try Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try custom header (for development)
  const customToken = req.headers['x-access-token'] as string;
  if (customToken) {
    return customToken;
  }
  
  return null;
}

/**
 * Middleware to authenticate user with JWT
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    
    const payload = AuthService.verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Get user from database to ensure they still exist
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    log(`Authentication error: ${error}`);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const payload = AuthService.verifyToken(token);
      if (payload) {
        const user = await storage.getUser(payload.userId);
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Fail silently for optional auth
    next();
  }
};

// Legacy middleware for backward compatibility
export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (userId && userRole) {
    const user = await storage.getUser(parseInt(userId as string));
    if (user) {
      req.user = user;
    }
  }
  next();
};

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Middleware to check if user is a restaurant owner
export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (req.user.role !== "owner" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Owner access required" });
  }
  
  next();
};

// Middleware to check if user is an admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
};

// Middleware to check if user can access restaurant data
export const requireRestaurantAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const restaurantId = parseInt(req.params.restaurantId || req.query.restaurantId as string || "1");
  
  // Admin can access any restaurant
  if (req.user.role === "admin") {
    return next();
  }
  
  // Owner can only access their own restaurant
  if (req.user.role === "owner" && req.user.restaurantId === restaurantId) {
    return next();
  }
  
  // Customers can only read (GET requests), not modify
  if (req.user.role === "customer" && req.method === "GET") {
    return next();
  }
  
  return res.status(403).json({ error: "Access denied to this restaurant" });
};

// Middleware to restrict CMS access to owners and admins only
export const requireCMSAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (req.user.role !== "owner" && req.user.role !== "admin") {
    return res.status(403).json({ error: "CMS access restricted to restaurant owners and administrators" });
  }
  
  next();
};