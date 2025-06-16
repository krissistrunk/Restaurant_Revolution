import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { requireOwner, requireAdmin } from '../middleware/authMiddleware';
import { log } from '../vite';

const router = Router();

// Validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  restaurantId: z.number().int().optional()
});

const metricFiltersSchema = z.object({
  ...dateRangeSchema.shape,
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  orderType: z.enum(['dine-in', 'takeout', 'delivery']).optional(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']).optional()
});

/**
 * Helper function to filter data by date range
 */
function filterByDateRange(data: any[], startDate?: string, endDate?: string) {
  let filtered = data;
  
  if (startDate) {
    filtered = filtered.filter(item => new Date(item.createdAt) >= new Date(startDate));
  }
  
  if (endDate) {
    filtered = filtered.filter(item => new Date(item.createdAt) <= new Date(endDate));
  }
  
  return filtered;
}

/**
 * Helper function to group data by time period
 */
function groupByPeriod(data: any[], period: string = 'day') {
  const grouped = new Map();
  
  data.forEach(item => {
    const date = new Date(item.createdAt);
    let key;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(item);
  });
  
  return Array.from(grouped.entries()).map(([period, items]) => ({
    period,
    items,
    count: items.length,
    revenue: items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0)
  }));
}

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get dashboard overview analytics
 */
router.get('/dashboard', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId || 1;
    const { startDate, endDate, period = 'month' } = dateRangeSchema.parse(req.query);
    
    // Verify access
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    // Get all data
    const orders = await storage.getRestaurantOrders(restaurantId);
    const reservations = await storage.getReservations(restaurantId);
    const queueEntries = await storage.getQueueEntries(restaurantId);
    const reviews = await storage.getReviews(restaurantId);
    const menuItems = await storage.getMenuItems(restaurantId);
    
    // Filter by date range
    const filteredOrders = filterByDateRange(orders, startDate, endDate);
    const filteredReservations = filterByDateRange(reservations, startDate, endDate);
    const filteredQueueEntries = filterByDateRange(queueEntries, startDate, endDate);
    const filteredReviews = filterByDateRange(reviews, startDate, endDate);
    
    // Calculate current period metrics
    const totalRevenue = filteredOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + order.totalPrice, 0);
    
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    
    const totalReservations = filteredReservations.length;
    const totalQueueEntries = filteredQueueEntries.length;
    
    const averageRating = filteredReviews.length > 0 
      ? filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length 
      : 0;
    
    // Calculate previous period for comparison
    const periodDays = {
      day: 1,
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };
    
    const currentPeriodDays = periodDays[period as keyof typeof periodDays] || 30;
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (currentPeriodDays * 2));
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - currentPeriodDays);
    
    const previousOrders = orders.filter(o => 
      new Date(o.createdAt) >= previousPeriodStart && 
      new Date(o.createdAt) <= previousPeriodEnd
    );
    
    const previousRevenue = previousOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + order.totalPrice, 0);
    
    const previousOrderCount = previousOrders.length;
    const previousCompletedOrders = previousOrders.filter(o => o.status === 'completed').length;
    const previousAOV = previousCompletedOrders > 0 ? previousRevenue / previousCompletedOrders : 0;
    
    // Calculate trends
    const revenueChange = calculatePercentageChange(totalRevenue, previousRevenue);
    const orderChange = calculatePercentageChange(totalOrders, previousOrderCount);
    const aovChange = calculatePercentageChange(averageOrderValue, previousAOV);
    
    // Group data by time period for charts
    const revenueByPeriod = groupByPeriod(filteredOrders.filter(o => o.status === 'completed'), 'day');
    const ordersByPeriod = groupByPeriod(filteredOrders, 'day');
    
    // Popular menu items
    const orderItems = await Promise.all(
      filteredOrders.map(order => storage.getOrderItems(order.id))
    );
    const allOrderItems = orderItems.flat();
    
    const itemPopularity = new Map();
    for (const item of allOrderItems) {
      const menuItem = await storage.getMenuItem(item.menuItemId);
      if (menuItem) {
        const current = itemPopularity.get(menuItem.id) || { item: menuItem, quantity: 0, revenue: 0 };
        current.quantity += item.quantity;
        current.revenue += item.price * item.quantity;
        itemPopularity.set(menuItem.id, current);
      }
    }
    
    const popularItems = Array.from(itemPopularity.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    const dashboard = {
      overview: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalReservations,
        totalQueueEntries,
        averageRating: Math.round(averageRating * 100) / 100,
        completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
      },
      trends: {
        revenueChange: Math.round(revenueChange * 100) / 100,
        orderChange: Math.round(orderChange * 100) / 100,
        aovChange: Math.round(aovChange * 100) / 100
      },
      charts: {
        revenueByPeriod: revenueByPeriod.map(p => ({
          period: p.period,
          revenue: Math.round(p.revenue * 100) / 100
        })),
        ordersByPeriod: ordersByPeriod.map(p => ({
          period: p.period,
          orders: p.count
        }))
      },
      popularItems: popularItems.map(item => ({
        id: item.item.id,
        name: item.item.name,
        quantity: item.quantity,
        revenue: Math.round(item.revenue * 100) / 100
      })),
      ordersByType: {
        'dine-in': filteredOrders.filter(o => o.orderType === 'dine-in').length,
        takeout: filteredOrders.filter(o => o.orderType === 'takeout').length,
        delivery: filteredOrders.filter(o => o.orderType === 'delivery').length
      },
      ordersByStatus: {
        pending: filteredOrders.filter(o => o.status === 'pending').length,
        confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
        preparing: filteredOrders.filter(o => o.status === 'preparing').length,
        ready: filteredOrders.filter(o => o.status === 'ready').length,
        completed: filteredOrders.filter(o => o.status === 'completed').length,
        cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
      }
    };
    
    res.json(dashboard);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error fetching dashboard analytics: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get detailed revenue analytics
 */
router.get('/revenue', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId || 1;
    const { startDate, endDate, groupBy = 'day', orderType } = metricFiltersSchema.parse(req.query);
    
    // Verify access
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    let orders = await storage.getRestaurantOrders(restaurantId);
    
    // Filter by date range
    orders = filterByDateRange(orders, startDate, endDate);
    
    // Filter by order type
    if (orderType) {
      orders = orders.filter(o => o.orderType === orderType);
    }
    
    // Only include completed orders for revenue
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    // Group by time period
    const groupedData = groupByPeriod(completedOrders, groupBy);
    
    // Calculate additional metrics
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = completedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Revenue breakdown by order type
    const revenueByType = {
      'dine-in': completedOrders.filter(o => o.orderType === 'dine-in').reduce((sum, o) => sum + o.totalPrice, 0),
      takeout: completedOrders.filter(o => o.orderType === 'takeout').reduce((sum, o) => sum + o.totalPrice, 0),
      delivery: completedOrders.filter(o => o.orderType === 'delivery').reduce((sum, o) => sum + o.totalPrice, 0)
    };
    
    // Tax and fees breakdown
    const totalTax = completedOrders.reduce((sum, order) => sum + (order.tax || 0), 0);
    const totalFees = completedOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
    const totalDiscounts = completedOrders.reduce((sum, order) => sum + (order.discount || 0) + (order.loyaltyDiscount || 0), 0);
    
    res.json({
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        totalFees: Math.round(totalFees * 100) / 100,
        totalDiscounts: Math.round(totalDiscounts * 100) / 100
      },
      timeSeries: groupedData.map(group => ({
        period: group.period,
        revenue: Math.round(group.revenue * 100) / 100,
        orders: group.count,
        averageOrderValue: group.count > 0 ? Math.round((group.revenue / group.count) * 100) / 100 : 0
      })),
      revenueByType: Object.fromEntries(
        Object.entries(revenueByType).map(([type, revenue]) => [
          type, 
          Math.round((revenue as number) * 100) / 100
        ])
      ),
      filters: {
        startDate,
        endDate,
        groupBy,
        orderType,
        restaurantId
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error fetching revenue analytics: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get customer analytics
 */
router.get('/customers', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId || 1;
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    
    // Verify access
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    let orders = await storage.getRestaurantOrders(restaurantId);
    let reservations = await storage.getReservations(restaurantId);
    let reviews = await storage.getReviews(restaurantId);
    
    // Filter by date range
    orders = filterByDateRange(orders, startDate, endDate);
    reservations = filterByDateRange(reservations, startDate, endDate);
    reviews = filterByDateRange(reviews, startDate, endDate);
    
    // Customer segmentation
    const customerOrders = new Map();
    for (const order of orders) {
      const current = customerOrders.get(order.userId) || { orders: 0, revenue: 0, user: null };
      current.orders += 1;
      current.revenue += order.totalPrice;
      if (!current.user) {
        current.user = await storage.getUser(order.userId);
      }
      customerOrders.set(order.userId, current);
    }
    
    const customers = Array.from(customerOrders.values());
    
    // Customer segments
    const segments = {
      newCustomers: customers.filter(c => c.orders === 1).length,
      returningCustomers: customers.filter(c => c.orders > 1 && c.orders <= 5).length,
      loyalCustomers: customers.filter(c => c.orders > 5).length
    };
    
    // Top customers by revenue
    const topCustomers = customers
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(customer => ({
        userId: customer.user?.id,
        name: customer.user?.name,
        email: customer.user?.email,
        orders: customer.orders,
        revenue: Math.round(customer.revenue * 100) / 100,
        averageOrderValue: Math.round((customer.revenue / customer.orders) * 100) / 100
      }));
    
    // Average metrics
    const totalCustomers = customers.length;
    const averageOrdersPerCustomer = totalCustomers > 0 ? customers.reduce((sum, c) => sum + c.orders, 0) / totalCustomers : 0;
    const averageRevenuePerCustomer = totalCustomers > 0 ? customers.reduce((sum, c) => sum + c.revenue, 0) / totalCustomers : 0;
    
    // Customer satisfaction
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };
    
    res.json({
      summary: {
        totalCustomers,
        averageOrdersPerCustomer: Math.round(averageOrdersPerCustomer * 100) / 100,
        averageRevenuePerCustomer: Math.round(averageRevenuePerCustomer * 100) / 100,
        averageRating: Math.round(averageRating * 100) / 100,
        totalReviews
      },
      segments,
      topCustomers,
      satisfaction: {
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution,
        totalReviews
      },
      filters: {
        startDate,
        endDate,
        restaurantId
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error fetching customer analytics: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get menu performance analytics
 */
router.get('/menu', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId || 1;
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    
    // Verify access
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    let orders = await storage.getRestaurantOrders(restaurantId);
    const menuItems = await storage.getMenuItems(restaurantId);
    const categories = await storage.getCategories(restaurantId);
    
    // Filter by date range
    orders = filterByDateRange(orders, startDate, endDate);
    
    // Get all order items
    const orderItems = await Promise.all(
      orders.map(order => storage.getOrderItems(order.id))
    );
    const allOrderItems = orderItems.flat();
    
    // Menu item performance
    const itemPerformance = new Map();
    for (const item of allOrderItems) {
      const menuItem = await storage.getMenuItem(item.menuItemId);
      if (menuItem) {
        const current = itemPerformance.get(menuItem.id) || {
          item: menuItem,
          orders: 0,
          quantity: 0,
          revenue: 0
        };
        current.orders += 1;
        current.quantity += item.quantity;
        current.revenue += item.price * item.quantity;
        itemPerformance.set(menuItem.id, current);
      }
    }
    
    const itemStats = Array.from(itemPerformance.values());
    
    // Category performance
    const categoryPerformance = new Map();
    for (const stat of itemStats) {
      const categoryId = stat.item.categoryId;
      const current = categoryPerformance.get(categoryId) || {
        categoryId,
        items: 0,
        orders: 0,
        quantity: 0,
        revenue: 0
      };
      current.items += 1;
      current.orders += stat.orders;
      current.quantity += stat.quantity;
      current.revenue += stat.revenue;
      categoryPerformance.set(categoryId, current);
    }
    
    // Add category names
    const categoryStats = await Promise.all(
      Array.from(categoryPerformance.values()).map(async (stat) => {
        const category = await storage.getCategory(stat.categoryId);
        return {
          ...stat,
          categoryName: category?.name || 'Unknown'
        };
      })
    );
    
    // Sort and format results
    const topSellingItems = itemStats
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 20)
      .map(stat => ({
        id: stat.item.id,
        name: stat.item.name,
        categoryId: stat.item.categoryId,
        orders: stat.orders,
        quantity: stat.quantity,
        revenue: Math.round(stat.revenue * 100) / 100,
        averagePrice: Math.round((stat.revenue / stat.quantity) * 100) / 100
      }));
    
    const topRevenueItems = itemStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20)
      .map(stat => ({
        id: stat.item.id,
        name: stat.item.name,
        categoryId: stat.item.categoryId,
        orders: stat.orders,
        quantity: stat.quantity,
        revenue: Math.round(stat.revenue * 100) / 100,
        averagePrice: Math.round((stat.revenue / stat.quantity) * 100) / 100
      }));
    
    // Items with no sales
    const soldItemIds = new Set(itemStats.map(stat => stat.item.id));
    const unsoldItems = menuItems
      .filter(item => !soldItemIds.has(item.id))
      .map(item => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        price: item.price,
        isAvailable: item.isAvailable
      }));
    
    res.json({
      summary: {
        totalMenuItems: menuItems.length,
        soldItems: itemStats.length,
        unsoldItems: unsoldItems.length,
        totalOrders: allOrderItems.length,
        totalRevenue: Math.round(itemStats.reduce((sum, stat) => sum + stat.revenue, 0) * 100) / 100
      },
      topSellingItems,
      topRevenueItems,
      unsoldItems: unsoldItems.slice(0, 10), // Limit to 10 for response size
      categoryPerformance: categoryStats
        .sort((a, b) => b.revenue - a.revenue)
        .map(stat => ({
          categoryId: stat.categoryId,
          categoryName: stat.categoryName,
          items: stat.items,
          orders: stat.orders,
          quantity: stat.quantity,
          revenue: Math.round(stat.revenue * 100) / 100
        })),
      filters: {
        startDate,
        endDate,
        restaurantId
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error fetching menu analytics: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get operational analytics
 */
router.get('/operations', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId || 1;
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    
    // Verify access
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    let orders = await storage.getRestaurantOrders(restaurantId);
    let reservations = await storage.getReservations(restaurantId);
    let queueEntries = await storage.getQueueEntries(restaurantId);
    
    // Filter by date range
    orders = filterByDateRange(orders, startDate, endDate);
    reservations = filterByDateRange(reservations, startDate, endDate);
    queueEntries = filterByDateRange(queueEntries, startDate, endDate);
    
    // Order fulfillment metrics
    const completedOrders = orders.filter(o => o.status === 'completed');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    const completionRate = orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0;
    const cancellationRate = orders.length > 0 ? (cancelledOrders.length / orders.length) * 100 : 0;
    
    // Average preparation time (mock calculation)
    const avgPreparationTime = 25; // minutes - would be calculated from actual timestamps
    
    // Reservation metrics
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled');
    const reservationCompletionRate = reservations.length > 0 ? (confirmedReservations.length / reservations.length) * 100 : 0;
    
    // Queue metrics
    const avgWaitTime = queueEntries.length > 0 
      ? queueEntries.reduce((sum, entry) => sum + (entry.estimatedWaitTime || 0), 0) / queueEntries.length 
      : 0;
    
    // Peak hours analysis
    const hourlyOrders = new Array(24).fill(0);
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyOrders[hour]++;
    });
    
    const peakHours = hourlyOrders
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Daily patterns
    const dailyOrders = new Array(7).fill(0); // 0 = Sunday
    orders.forEach(order => {
      const day = new Date(order.createdAt).getDay();
      dailyOrders[day]++;
    });
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyPatterns = dailyOrders.map((count, index) => ({
      day: dayNames[index],
      orders: count
    }));
    
    res.json({
      orderFulfillment: {
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        cancelledOrders: cancelledOrders.length,
        completionRate: Math.round(completionRate * 100) / 100,
        cancellationRate: Math.round(cancellationRate * 100) / 100,
        avgPreparationTime
      },
      reservations: {
        totalReservations: reservations.length,
        confirmedReservations: confirmedReservations.length,
        cancelledReservations: cancelledReservations.length,
        completionRate: Math.round(reservationCompletionRate * 100) / 100
      },
      queue: {
        totalEntries: queueEntries.length,
        avgWaitTime: Math.round(avgWaitTime * 100) / 100
      },
      peakTimes: {
        peakHours: peakHours.map(p => ({
          hour: p.hour,
          orders: p.count,
          timeSlot: `${p.hour.toString().padStart(2, '0')}:00 - ${((p.hour + 1) % 24).toString().padStart(2, '0')}:00`
        })),
        dailyPatterns
      },
      filters: {
        startDate,
        endDate,
        restaurantId
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error fetching operational analytics: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Export analytics data
 */
router.get('/export/:type', requireOwner, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const restaurantId = req.user?.restaurantId || 1;
    const { startDate, endDate, format = 'json' } = req.query;
    
    // Verify access
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    if (!['orders', 'revenue', 'customers', 'menu'].includes(type)) {
      return res.status(400).json({ message: 'Invalid export type' });
    }
    
    let data;
    let filename;
    
    switch (type) {
      case 'orders':
        data = await storage.getRestaurantOrders(restaurantId);
        filename = `orders-${restaurantId}`;
        break;
      case 'revenue':
        // Get revenue analytics endpoint data
        const revenueResponse = await fetch(`/api/analytics/revenue?startDate=${startDate}&endDate=${endDate}`);
        data = await revenueResponse.json();
        filename = `revenue-${restaurantId}`;
        break;
      case 'customers':
        // Get customer analytics endpoint data
        const customerResponse = await fetch(`/api/analytics/customers?startDate=${startDate}&endDate=${endDate}`);
        data = await customerResponse.json();
        filename = `customers-${restaurantId}`;
        break;
      case 'menu':
        // Get menu analytics endpoint data
        const menuResponse = await fetch(`/api/analytics/menu?startDate=${startDate}&endDate=${endDate}`);
        data = await menuResponse.json();
        filename = `menu-${restaurantId}`;
        break;
    }
    
    if (startDate) filename += `-from-${startDate}`;
    if (endDate) filename += `-to-${endDate}`;
    
    // Set appropriate headers
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      
      // Convert to CSV (simplified implementation)
      const csv = JSON.stringify(data).replace(/"/g, '""');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json({
        exportType: type,
        restaurantId,
        dateRange: { startDate, endDate },
        exportedAt: new Date().toISOString(),
        data
      });
    }
  } catch (error) {
    log(`Error exporting analytics data: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as analyticsRoutes };