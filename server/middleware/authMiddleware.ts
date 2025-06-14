import { Request, Response, NextFunction } from "express";
import { User } from "../../shared/schema";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

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