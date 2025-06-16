import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { getWebSocketManager } from '../websocket';
import { requireAuth, requireOwner, requireResourceOwner } from '../middleware/authMiddleware';
import { log } from '../vite';

const router = Router();

// Validation schemas
const orderItemSchema = z.object({
  menuItemId: z.number().int(),
  quantity: z.number().int().min(1),
  specialInstructions: z.string().optional(),
  modifiers: z.array(z.object({
    modifierId: z.number().int(),
    selectedOptions: z.array(z.string())
  })).optional()
});

const createOrderSchema = z.object({
  restaurantId: z.number().int(),
  orderType: z.enum(['dine-in', 'takeout', 'delivery']),
  items: z.array(orderItemSchema).min(1),
  specialInstructions: z.string().optional(),
  scheduledFor: z.string().datetime().optional(),
  deliveryAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    instructions: z.string().optional()
  }).optional(),
  paymentMethod: z.enum(['card', 'cash', 'digital']).optional(),
  couponCode: z.string().optional(),
  loyaltyPointsToUse: z.number().int().min(0).optional()
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']),
  estimatedReadyTime: z.string().datetime().optional(),
  notes: z.string().optional()
});

const orderFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']).optional(),
  orderType: z.enum(['dine-in', 'takeout', 'delivery']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  restaurantId: z.number().int().optional(),
  userId: z.number().int().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

/**
 * Calculate order total with modifiers and taxes
 */
async function calculateOrderTotal(items: any[], restaurantId: number, couponCode?: string, loyaltyPointsToUse?: number): Promise<{
  subtotal: number;
  tax: number;
  discount: number;
  loyaltyDiscount: number;
  deliveryFee: number;
  total: number;
  breakdown: any[];
}> {
  let subtotal = 0;
  const breakdown = [];
  
  for (const item of items) {
    const menuItem = await storage.getMenuItem(item.menuItemId);
    if (!menuItem) {
      throw new Error(`Menu item ${item.menuItemId} not found`);
    }
    
    if (!menuItem.isAvailable) {
      throw new Error(`Menu item "${menuItem.name}" is not available`);
    }
    
    let itemPrice = menuItem.price;
    let modifierCost = 0;
    const appliedModifiers = [];
    
    // Calculate modifier costs
    if (item.modifiers) {
      for (const modifier of item.modifiers) {
        const modifierData = await storage.getModifier(modifier.modifierId);
        if (modifierData && modifierData.menuItemId === item.menuItemId) {
          modifierCost += modifierData.price;
          appliedModifiers.push({
            name: modifierData.name,
            price: modifierData.price,
            options: modifier.selectedOptions
          });
        }
      }
    }
    
    const lineTotal = (itemPrice + modifierCost) * item.quantity;
    subtotal += lineTotal;
    
    breakdown.push({
      menuItem: {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price
      },
      quantity: item.quantity,
      modifiers: appliedModifiers,
      modifierCost,
      lineTotal,
      specialInstructions: item.specialInstructions
    });
  }
  
  // Apply coupon discount (mock implementation)
  let discount = 0;
  if (couponCode) {
    // In real implementation, validate coupon and calculate discount
    discount = subtotal * 0.1; // 10% discount for demo
  }
  
  // Apply loyalty points discount (1 point = $0.01)
  let loyaltyDiscount = 0;
  if (loyaltyPointsToUse) {
    loyaltyDiscount = Math.min(loyaltyPointsToUse * 0.01, subtotal * 0.5); // Max 50% discount
  }
  
  // Calculate tax (mock rate)
  const taxRate = 0.08; // 8% tax
  const taxableAmount = subtotal - discount - loyaltyDiscount;
  const tax = Math.max(0, taxableAmount * taxRate);
  
  // Delivery fee (mock implementation)
  const deliveryFee = 0; // Would be calculated based on distance and restaurant settings
  
  const total = subtotal - discount - loyaltyDiscount + tax + deliveryFee;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    loyaltyDiscount: Math.round(loyaltyDiscount * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    total: Math.round(total * 100) / 100,
    breakdown
  };
}

/**
 * Get user's orders
 */
router.get('/my-orders', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status, orderType, dateFrom, dateTo, page, limit } = orderFiltersSchema.parse(req.query);
    
    let orders = await storage.getUserOrders(userId);
    
    // Apply filters
    if (status) {
      orders = orders.filter(order => order.status === status);
    }
    
    if (orderType) {
      orders = orders.filter(order => order.orderType === orderType);
    }
    
    if (dateFrom) {
      orders = orders.filter(order => new Date(order.createdAt) >= new Date(dateFrom));
    }
    
    if (dateTo) {
      orders = orders.filter(order => new Date(order.createdAt) <= new Date(dateTo));
    }
    
    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Paginate
    const total = orders.length;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = orders.slice(startIndex, startIndex + limit);
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      paginatedOrders.map(async (order) => {
        const orderItems = await storage.getOrderItems(order.id);
        return { ...order, items: orderItems };
      })
    );
    
    res.json({
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error fetching user orders: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get single order details
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await storage.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user has access to this order
    if (req.user!.role !== 'admin' && 
        req.user!.role !== 'owner' && 
        order.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied to this order' });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItems(orderId);
    
    res.json({ ...order, items: orderItems });
  } catch (error) {
    log(`Error fetching order: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Create new order
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const orderData = createOrderSchema.parse(req.body);
    const userId = req.user!.id;
    
    // Validate restaurant exists
    const restaurant = await storage.getRestaurant(orderData.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Calculate order total
    const pricing = await calculateOrderTotal(
      orderData.items, 
      orderData.restaurantId, 
      orderData.couponCode,
      orderData.loyaltyPointsToUse
    );
    
    // Check if user has enough loyalty points
    if (orderData.loyaltyPointsToUse && req.user!.loyaltyPoints < orderData.loyaltyPointsToUse) {
      return res.status(400).json({ 
        message: 'Insufficient loyalty points',
        available: req.user!.loyaltyPoints,
        requested: orderData.loyaltyPointsToUse
      });
    }
    
    // Create order
    const order = await storage.createOrder({
      userId,
      restaurantId: orderData.restaurantId,
      orderType: orderData.orderType,
      status: 'pending',
      totalPrice: pricing.total,
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      discount: pricing.discount,
      loyaltyDiscount: pricing.loyaltyDiscount,
      deliveryFee: pricing.deliveryFee,
      specialInstructions: orderData.specialInstructions,
      scheduledFor: orderData.scheduledFor ? new Date(orderData.scheduledFor) : undefined,
      deliveryAddress: orderData.deliveryAddress ? JSON.stringify(orderData.deliveryAddress) : undefined,
      paymentMethod: orderData.paymentMethod,
      couponCode: orderData.couponCode,
      loyaltyPointsUsed: orderData.loyaltyPointsToUse || 0
    });
    
    // Create order items
    const orderItems = await Promise.all(
      pricing.breakdown.map(async (item, index) => {
        const orderItemData = orderData.items[index];
        return await storage.createOrderItem({
          orderId: order.id,
          menuItemId: orderItemData.menuItemId,
          quantity: item.quantity,
          price: item.menuItem.price,
          modifiers: item.modifiers.length > 0 ? JSON.stringify(item.modifiers) : undefined,
          specialInstructions: item.specialInstructions
        });
      })
    );
    
    // Deduct loyalty points if used
    if (orderData.loyaltyPointsToUse) {
      await storage.updateUserLoyaltyPoints(userId, -orderData.loyaltyPointsToUse);
    }
    
    // Add loyalty points for this order (1 point per dollar spent)
    const pointsEarned = Math.floor(pricing.total);
    await storage.updateUserLoyaltyPoints(userId, pointsEarned);
    
    // Broadcast order update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyOrderUpdate(order.id, { ...order, items: orderItems }, orderData.restaurantId);
    }
    
    res.status(201).json({
      order: { ...order, items: orderItems },
      pricing,
      pointsEarned,
      pointsUsed: orderData.loyaltyPointsToUse || 0
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error creating order: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Update order status (Owner/Admin only)
 */
router.patch('/:id/status', requireOwner, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const updates = updateOrderStatusSchema.parse(req.body);
    
    const existingOrder = await storage.getOrder(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== existingOrder.restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    // Update order
    const updatedOrder = await storage.updateOrderStatus(orderId, updates.status, updates.estimatedReadyTime, updates.notes);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Broadcast order status update
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyOrderUpdate(orderId, updatedOrder, existingOrder.restaurantId);
    }
    
    res.json({ 
      message: `Order status updated to ${updates.status}`,
      order: updatedOrder
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error updating order status: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Cancel order
 */
router.patch('/:id/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { reason } = req.body;
    
    const existingOrder = await storage.getOrder(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user has permission to cancel this order
    const isOwner = req.user!.role === 'owner' || req.user!.role === 'admin';
    const isCustomer = existingOrder.userId === req.user!.id;
    
    if (!isOwner && !isCustomer) {
      return res.status(403).json({ message: 'Access denied to this order' });
    }
    
    // Check if order can be cancelled
    if (existingOrder.status === 'completed' || existingOrder.status === 'cancelled') {
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${existingOrder.status}` 
      });
    }
    
    // If order is being prepared, only owners can cancel
    if (existingOrder.status === 'preparing' && !isOwner) {
      return res.status(400).json({ 
        message: 'Order is being prepared and cannot be cancelled by customer' 
      });
    }
    
    // Update order status
    const updatedOrder = await storage.updateOrderStatus(orderId, 'cancelled', undefined, reason);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Refund loyalty points if they were used
    if (existingOrder.loyaltyPointsUsed > 0) {
      await storage.updateUserLoyaltyPoints(existingOrder.userId, existingOrder.loyaltyPointsUsed);
    }
    
    // Remove earned points from this order
    const pointsToRemove = Math.floor(existingOrder.totalPrice);
    await storage.updateUserLoyaltyPoints(existingOrder.userId, -pointsToRemove);
    
    // Broadcast order cancellation
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.notifyOrderUpdate(orderId, updatedOrder, existingOrder.restaurantId);
    }
    
    res.json({ 
      message: 'Order cancelled successfully',
      order: updatedOrder,
      refund: {
        loyaltyPointsRefunded: existingOrder.loyaltyPointsUsed,
        loyaltyPointsRemoved: pointsToRemove
      }
    });
  } catch (error) {
    log(`Error cancelling order: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get restaurant orders (Owner/Admin only)
 */
router.get('/restaurant/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { status, orderType, dateFrom, dateTo, page, limit } = orderFiltersSchema.parse(req.query);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    let orders = await storage.getRestaurantOrders(restaurantId);
    
    // Apply filters
    if (status) {
      orders = orders.filter(order => order.status === status);
    }
    
    if (orderType) {
      orders = orders.filter(order => order.orderType === orderType);
    }
    
    if (dateFrom) {
      orders = orders.filter(order => new Date(order.createdAt) >= new Date(dateFrom));
    }
    
    if (dateTo) {
      orders = orders.filter(order => new Date(order.createdAt) <= new Date(dateTo));
    }
    
    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Paginate
    const total = orders.length;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = orders.slice(startIndex, startIndex + limit);
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      paginatedOrders.map(async (order) => {
        const orderItems = await storage.getOrderItems(order.id);
        return { ...order, items: orderItems };
      })
    );
    
    res.json({
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error fetching restaurant orders: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get order analytics (Owner/Admin only)
 */
router.get('/analytics/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { dateFrom, dateTo } = req.query;
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    let orders = await storage.getRestaurantOrders(restaurantId);
    
    // Apply date filters
    if (dateFrom) {
      orders = orders.filter(order => new Date(order.createdAt) >= new Date(dateFrom as string));
    }
    
    if (dateTo) {
      orders = orders.filter(order => new Date(order.createdAt) <= new Date(dateTo as string));
    }
    
    const analytics = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalPrice, 0) / orders.length : 0,
      ordersByStatus: {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      },
      ordersByType: {
        'dine-in': orders.filter(o => o.orderType === 'dine-in').length,
        takeout: orders.filter(o => o.orderType === 'takeout').length,
        delivery: orders.filter(o => o.orderType === 'delivery').length
      },
      revenueByType: {
        'dine-in': orders.filter(o => o.orderType === 'dine-in').reduce((sum, order) => sum + order.totalPrice, 0),
        takeout: orders.filter(o => o.orderType === 'takeout').reduce((sum, order) => sum + order.totalPrice, 0),
        delivery: orders.filter(o => o.orderType === 'delivery').reduce((sum, order) => sum + order.totalPrice, 0)
      },
      completionRate: orders.length > 0 ? orders.filter(o => o.status === 'completed').length / orders.length : 0,
      cancellationRate: orders.length > 0 ? orders.filter(o => o.status === 'cancelled').length / orders.length : 0
    };
    
    res.json(analytics);
  } catch (error) {
    log(`Error fetching order analytics: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Estimate order price (before placing order)
 */
router.post('/estimate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { items, restaurantId, couponCode, loyaltyPointsToUse } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }
    
    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }
    
    // Check if user has enough loyalty points
    if (loyaltyPointsToUse && req.user!.loyaltyPoints < loyaltyPointsToUse) {
      return res.status(400).json({ 
        message: 'Insufficient loyalty points',
        available: req.user!.loyaltyPoints,
        requested: loyaltyPointsToUse
      });
    }
    
    const pricing = await calculateOrderTotal(items, restaurantId, couponCode, loyaltyPointsToUse);
    const pointsEarned = Math.floor(pricing.total);
    
    res.json({
      ...pricing,
      pointsEarned,
      pointsUsed: loyaltyPointsToUse || 0,
      userLoyaltyPoints: req.user!.loyaltyPoints
    });
  } catch (error) {
    log(`Error estimating order price: ${error}`);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export { router as orderRoutes };