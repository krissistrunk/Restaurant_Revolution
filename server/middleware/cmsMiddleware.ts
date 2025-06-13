/**
 * CMS Middleware - Handles fallback to CMS data when local storage is empty
 * or when CMS data should take precedence
 */

import { Request, Response, NextFunction } from 'express';
import { cmsService } from '../services/cmsService';

interface CMSConfig {
  enableCMS: boolean;
  cmsFirst: boolean; // If true, check CMS first, then fallback to local storage
  cacheTimeout: number; // Cache timeout in milliseconds
}

// Simple in-memory cache for CMS data
class CMSCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private timeout: number;

  constructor(timeout: number = 5 * 60 * 1000) { // 5 minutes default
    this.timeout = timeout;
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.timeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const cmsCache = new CMSCache();

export class CMSMiddleware {
  private config: CMSConfig;

  constructor(config: Partial<CMSConfig> = {}) {
    this.config = {
      enableCMS: process.env.ENABLE_CMS === 'true' || false,
      cmsFirst: process.env.CMS_FIRST === 'true' || false,
      cacheTimeout: parseInt(process.env.CMS_CACHE_TIMEOUT || '300000'), // 5 minutes
      ...config
    };
  }

  // Restaurant data middleware
  withRestaurantCMS = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.enableCMS) {
        return next();
      }

      try {
        const restaurantId = parseInt(req.params.id || '1');
        const cacheKey = `restaurant_${restaurantId}`;
        
        // Check cache first
        let cmsData = cmsCache.get(cacheKey);
        
        if (!cmsData) {
          const strapiRestaurant = await cmsService.getRestaurant(restaurantId);
          if (strapiRestaurant) {
            cmsData = cmsService.convertRestaurantData(strapiRestaurant);
            cmsCache.set(cacheKey, cmsData);
          }
        }

        if (cmsData) {
          // Add CMS data to request object
          req.cmsData = { restaurant: cmsData };
          
          if (this.config.cmsFirst) {
            return res.json(cmsData);
          }
        }

        next();
      } catch (error) {
        console.error('CMS Restaurant Middleware Error:', error);
        next();
      }
    };
  };

  // Menu categories middleware
  withMenuCategoriesCMS = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.enableCMS) {
        return next();
      }

      try {
        const restaurantId = parseInt(req.query.restaurantId as string || '1');
        const cacheKey = `categories_${restaurantId}`;
        
        let cmsData = cmsCache.get(cacheKey);
        
        if (!cmsData) {
          const strapiCategories = await cmsService.getMenuCategories(restaurantId);
          if (strapiCategories.length > 0) {
            cmsData = strapiCategories.map(cat => ({
              id: cat.id,
              name: cat.name,
              description: cat.description,
              displayOrder: cat.display_order,
              restaurantId
            }));
            cmsCache.set(cacheKey, cmsData);
          }
        }

        if (cmsData) {
          req.cmsData = { ...(req.cmsData || {}), categories: cmsData };
          
          if (this.config.cmsFirst) {
            return res.json(cmsData);
          }
        }

        next();
      } catch (error) {
        console.error('CMS Categories Middleware Error:', error);
        next();
      }
    };
  };

  // Menu items middleware
  withMenuItemsCMS = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.enableCMS) {
        return next();
      }

      try {
        const restaurantId = parseInt(req.query.restaurantId as string || '1');
        const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : null;
        const cacheKey = categoryId ? `items_${categoryId}` : `featured_${restaurantId}`;
        
        let cmsData = cmsCache.get(cacheKey);
        
        if (!cmsData) {
          let strapiItems;
          
          if (categoryId) {
            strapiItems = await cmsService.getMenuItems(categoryId);
          } else {
            strapiItems = await cmsService.getFeaturedMenuItems(restaurantId);
          }
          
          if (strapiItems.length > 0) {
            cmsData = strapiItems.map(item => cmsService.convertMenuItemData(item));
            cmsCache.set(cacheKey, cmsData);
          }
        }

        if (cmsData) {
          req.cmsData = { ...(req.cmsData || {}), menuItems: cmsData };
          
          if (this.config.cmsFirst) {
            return res.json(cmsData);
          }
        }

        next();
      } catch (error) {
        console.error('CMS Menu Items Middleware Error:', error);
        next();
      }
    };
  };

  // AI Knowledge middleware for AI service
  withAIKnowledgeCMS = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.enableCMS) {
        return next();
      }

      try {
        const restaurantId = parseInt(req.body.restaurantId || req.query.restaurantId || '1');
        const cacheKey = `ai_knowledge_${restaurantId}`;
        
        let cmsData = cmsCache.get(cacheKey);
        
        if (!cmsData) {
          const aiKnowledge = await cmsService.getAIKnowledge(restaurantId);
          if (aiKnowledge) {
            cmsData = aiKnowledge;
            cmsCache.set(cacheKey, cmsData);
          }
        }

        if (cmsData) {
          req.cmsData = { ...(req.cmsData || {}), aiKnowledge: cmsData };
        }

        next();
      } catch (error) {
        console.error('CMS AI Knowledge Middleware Error:', error);
        next();
      }
    };
  };

  // Fallback middleware - if local storage returns empty, use CMS data
  withCMSFallback = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.enableCMS || !req.cmsData) {
        return next();
      }

      // Store original res.json to intercept response
      const originalJson = res.json.bind(res);
      
      res.json = (data: any) => {
        // If local storage returns empty array/null and we have CMS data, use CMS data
        if ((!data || (Array.isArray(data) && data.length === 0)) && req.cmsData) {
          const cmsDataKey = req.route?.path.includes('categories') ? 'categories' :
                            req.route?.path.includes('menu-items') ? 'menuItems' :
                            req.route?.path.includes('restaurant') ? 'restaurant' : null;
          
          if (cmsDataKey && req.cmsData[cmsDataKey]) {
            return originalJson(req.cmsData[cmsDataKey]);
          }
        }
        
        return originalJson(data);
      };

      next();
    };
  };

  // Health check endpoint
  healthCheck = async (req: Request, res: Response) => {
    try {
      const isHealthy = await cmsService.healthCheck();
      res.json({
        cms: {
          enabled: this.config.enableCMS,
          healthy: isHealthy,
          cacheSize: cmsCache['cache'].size,
          config: this.config
        }
      });
    } catch (error) {
      res.status(500).json({
        cms: {
          enabled: this.config.enableCMS,
          healthy: false,
          error: error.message
        }
      });
    }
  };

  // Clear cache endpoint (for admin use)
  clearCache = (req: Request, res: Response) => {
    cmsCache.clear();
    res.json({ message: 'CMS cache cleared successfully' });
  };
}

// Export configured instance
export const cmsMiddleware = new CMSMiddleware();

// Extend Request interface to include CMS data
declare global {
  namespace Express {
    interface Request {
      cmsData?: {
        restaurant?: any;
        categories?: any[];
        menuItems?: any[];
        aiKnowledge?: any;
      };
    }
  }
}