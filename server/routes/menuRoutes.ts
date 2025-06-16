import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { getWebSocketManager } from '../websocket';
import { requireOwner, requireAdmin, requireRestaurantAccess } from '../middleware/authMiddleware';
import { log } from '../vite';

const router = Router();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  displayOrder: z.number().int().min(0),
  restaurantId: z.number().int(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true)
});

const updateCategorySchema = createCategorySchema.partial();

const createMenuItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  price: z.number().positive(),
  categoryId: z.number().int(),
  restaurantId: z.number().int(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  allergens: z.array(z.string()).optional(),
  nutritionInfo: z.record(z.any()).optional(),
  preparationTime: z.number().int().min(0).optional(),
  calories: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional()
});

const updateMenuItemSchema = createMenuItemSchema.partial();

const createModifierSchema = z.object({
  menuItemId: z.number().int(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().min(0),
  isRequired: z.boolean().default(false),
  maxSelections: z.number().int().min(1).optional(),
  options: z.array(z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    isDefault: z.boolean().default(false)
  })).optional()
});

const bulkUpdateSchema = z.object({
  items: z.array(z.object({
    id: z.number().int(),
    updates: updateMenuItemSchema
  }))
});

/**
 * Get all categories for a restaurant
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string) || 1;
    const includeInactive = req.query.includeInactive === 'true';
    
    let categories = await storage.getCategories(restaurantId);
    
    if (!includeInactive) {
      categories = categories.filter(cat => cat.isActive !== false);
    }
    
    // Sort by display order
    categories.sort((a, b) => a.displayOrder - b.displayOrder);
    
    res.json(categories);
  } catch (error) {
    log(`Error fetching categories: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Create new category (Owner/Admin only)
 */
router.post('/categories', requireOwner, async (req: Request, res: Response) => {
  try {
    const categoryData = createCategorySchema.parse(req.body);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== categoryData.restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const category = await storage.createCategory(categoryData);
    
    // Broadcast menu update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyMenuUpdate({ type: 'category_created', category }, categoryData.restaurantId);
    }
    
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error creating category: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Update category (Owner/Admin only)
 */
router.patch('/categories/:id', requireOwner, async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    const updates = updateCategorySchema.parse(req.body);
    
    const existingCategory = await storage.getCategory(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== existingCategory.restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const updatedCategory = await storage.updateCategory(categoryId, updates);
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Broadcast menu update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyMenuUpdate({ type: 'category_updated', category: updatedCategory }, existingCategory.restaurantId);
    }
    
    res.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error updating category: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Delete category (Owner/Admin only)
 */
router.delete('/categories/:id', requireOwner, async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    const existingCategory = await storage.getCategory(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== existingCategory.restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    // Check if category has menu items
    const menuItems = await storage.getMenuItems(existingCategory.restaurantId, categoryId);
    if (menuItems.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with menu items. Move or delete menu items first.',
        itemCount: menuItems.length
      });
    }
    
    const deleted = await storage.deleteCategory(categoryId);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Broadcast menu update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyMenuUpdate({ type: 'category_deleted', categoryId }, existingCategory.restaurantId);
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    log(`Error deleting category: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get menu items with advanced filtering
 */
router.get('/items', async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string) || 1;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const includeUnavailable = req.query.includeUnavailable === 'true';
    const featuredOnly = req.query.featuredOnly === 'true';
    const vegetarianOnly = req.query.vegetarian === 'true';
    const veganOnly = req.query.vegan === 'true';
    const glutenFreeOnly = req.query.glutenFree === 'true';
    const searchTerm = req.query.search as string;
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined;
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined;
    const sortBy = req.query.sortBy as string || 'name';
    const sortOrder = req.query.sortOrder as string || 'asc';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    let menuItems = await storage.getMenuItems(restaurantId, categoryId);
    
    // Apply filters
    if (!includeUnavailable) {
      menuItems = menuItems.filter(item => item.isAvailable);
    }
    
    if (featuredOnly) {
      menuItems = menuItems.filter(item => item.isFeatured);
    }
    
    if (vegetarianOnly) {
      menuItems = menuItems.filter(item => item.isVegetarian);
    }
    
    if (veganOnly) {
      menuItems = menuItems.filter(item => item.isVegan);
    }
    
    if (glutenFreeOnly) {
      menuItems = menuItems.filter(item => item.isGlutenFree);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      menuItems = menuItems.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    if (priceMin !== undefined) {
      menuItems = menuItems.filter(item => item.price >= priceMin);
    }
    
    if (priceMax !== undefined) {
      menuItems = menuItems.filter(item => item.price <= priceMax);
    }
    
    // Sort items
    menuItems.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'preparationTime':
          aValue = a.preparationTime || 0;
          bValue = b.preparationTime || 0;
          break;
        case 'calories':
          aValue = a.calories || 0;
          bValue = b.calories || 0;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      } else {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }
    });
    
    // Paginate
    const total = menuItems.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = menuItems.slice(startIndex, startIndex + limit);
    
    res.json({
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        restaurantId,
        categoryId,
        includeUnavailable,
        featuredOnly,
        vegetarianOnly,
        veganOnly,
        glutenFreeOnly,
        searchTerm,
        priceMin,
        priceMax,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    log(`Error fetching menu items: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get single menu item with modifiers
 */
router.get('/items/:id', async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.id);
    const menuItem = await storage.getMenuItem(itemId);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Get modifiers
    const modifiers = await storage.getModifiers(itemId);
    
    res.json({ ...menuItem, modifiers });
  } catch (error) {
    log(`Error fetching menu item: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Create new menu item (Owner/Admin only)
 */
router.post('/items', requireOwner, async (req: Request, res: Response) => {
  try {
    const menuItemData = createMenuItemSchema.parse(req.body);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== menuItemData.restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    // Verify category exists and belongs to the restaurant
    const category = await storage.getCategory(menuItemData.categoryId);
    if (!category || category.restaurantId !== menuItemData.restaurantId) {
      return res.status(400).json({ message: 'Invalid category for this restaurant' });
    }
    
    const menuItem = await storage.createMenuItem(menuItemData);
    
    // Broadcast menu update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyMenuUpdate({ type: 'item_created', item: menuItem }, menuItemData.restaurantId);
    }
    
    res.status(201).json(menuItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error creating menu item: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Update menu item (Owner/Admin only)
 */
router.patch('/items/:id', requireOwner, async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.id);
    const updates = updateMenuItemSchema.parse(req.body);
    
    const existingItem = await storage.getMenuItem(itemId);
    if (!existingItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== existingItem.restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    // If categoryId is being updated, verify it belongs to the restaurant
    if (updates.categoryId) {
      const category = await storage.getCategory(updates.categoryId);
      if (!category || category.restaurantId !== existingItem.restaurantId) {
        return res.status(400).json({ message: 'Invalid category for this restaurant' });
      }
    }
    
    const updatedItem = await storage.updateMenuItem(itemId, updates);
    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Broadcast menu update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyMenuUpdate({ type: 'item_updated', item: updatedItem }, existingItem.restaurantId);
    }
    
    res.json(updatedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error updating menu item: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Bulk update menu items (Owner/Admin only)
 */
router.patch('/items/bulk', requireOwner, async (req: Request, res: Response) => {
  try {
    const { items } = bulkUpdateSchema.parse(req.body);
    const results = [];
    const errors = [];
    
    for (const { id, updates } of items) {
      try {
        const existingItem = await storage.getMenuItem(id);
        if (!existingItem) {
          errors.push({ id, error: 'Menu item not found' });
          continue;
        }
        
        // Verify user has access to this restaurant
        if (req.user?.role !== 'admin' && req.user?.restaurantId !== existingItem.restaurantId) {
          errors.push({ id, error: 'Access denied to this restaurant' });
          continue;
        }
        
        const updatedItem = await storage.updateMenuItem(id, updates);
        if (updatedItem) {
          results.push(updatedItem);
          
          // Broadcast individual updates
          const wsManager = getWebSocketManager();
          if (wsManager) {
            wsManager.notifyMenuUpdate({ type: 'item_updated', item: updatedItem }, existingItem.restaurantId);
          }
        }
      } catch (itemError) {
        errors.push({ id, error: itemError.message });
      }
    }
    
    res.json({
      updated: results,
      errors,
      summary: {
        total: items.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error bulk updating menu items: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Delete menu item (Owner/Admin only)
 */
router.delete('/items/:id', requireOwner, async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.id);
    
    const existingItem = await storage.getMenuItem(itemId);
    if (!existingItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== existingItem.restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const deleted = await storage.deleteMenuItem(itemId);
    if (!deleted) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Broadcast menu update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyMenuUpdate({ type: 'item_deleted', itemId }, existingItem.restaurantId);
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    log(`Error deleting menu item: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Toggle menu item availability (Owner/Admin only)
 */
router.patch('/items/:id/availability', requireOwner, async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.id);
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable must be a boolean' });
    }
    
    const existingItem = await storage.getMenuItem(itemId);
    if (!existingItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== existingItem.restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const updatedItem = await storage.updateMenuItem(itemId, { isAvailable });
    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Broadcast availability update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyMenuUpdate({ 
        type: 'availability_changed', 
        itemId, 
        isAvailable,
        item: updatedItem 
      }, existingItem.restaurantId);
    }
    
    res.json({ 
      message: `Menu item ${isAvailable ? 'enabled' : 'disabled'} successfully`,
      item: updatedItem
    });
  } catch (error) {
    log(`Error toggling menu item availability: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Create modifier for menu item (Owner/Admin only)
 */
router.post('/items/:itemId/modifiers', requireOwner, async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const modifierData = { ...createModifierSchema.parse(req.body), menuItemId: itemId };
    
    const existingItem = await storage.getMenuItem(itemId);
    if (!existingItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== existingItem.restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const modifier = await storage.createModifier(modifierData);
    
    // Broadcast menu update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyMenuUpdate({ type: 'modifier_created', modifier, itemId }, existingItem.restaurantId);
    }
    
    res.status(201).json(modifier);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error creating modifier: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get menu statistics (Owner/Admin only)
 */
router.get('/stats', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId || 1;
    
    const categories = await storage.getCategories(restaurantId);
    const allItems = await storage.getMenuItems(restaurantId);
    
    const stats = {
      totalCategories: categories.length,
      totalItems: allItems.length,
      availableItems: allItems.filter(item => item.isAvailable).length,
      featuredItems: allItems.filter(item => item.isFeatured).length,
      vegetarianItems: allItems.filter(item => item.isVegetarian).length,
      veganItems: allItems.filter(item => item.isVegan).length,
      glutenFreeItems: allItems.filter(item => item.isGlutenFree).length,
      averagePrice: allItems.length > 0 ? allItems.reduce((sum, item) => sum + item.price, 0) / allItems.length : 0,
      priceRange: {
        min: allItems.length > 0 ? Math.min(...allItems.map(item => item.price)) : 0,
        max: allItems.length > 0 ? Math.max(...allItems.map(item => item.price)) : 0
      },
      categoryBreakdown: categories.map(category => ({
        id: category.id,
        name: category.name,
        itemCount: allItems.filter(item => item.categoryId === category.id).length,
        availableCount: allItems.filter(item => item.categoryId === category.id && item.isAvailable).length
      }))
    };
    
    res.json(stats);
  } catch (error) {
    log(`Error fetching menu stats: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as menuRoutes };