import { storage } from '../storage';
import { MenuItem, Order } from '@shared/schema';

/**
 * AI-powered dynamic pricing service
 */
export class AIPricingService {
  
  /**
   * Calculate dynamic price for a menu item based on demand, time, and other factors
   */
  async getDynamicPrice(
    menuItemId: number,
    restaurantId: number,
    options: {
      includeWeatherAdjustment?: boolean;
      includeInventoryAdjustment?: boolean;
      includeCompetitiveAdjustment?: boolean;
      includeSeasonalAdjustment?: boolean;
    } = {}
  ): Promise<{
    originalPrice: number;
    dynamicPrice: number;
    adjustments: Array<{
      factor: string;
      adjustment: number;
      percentage: number;
      reasoning: string;
    }>;
    confidence: number;
    validUntil: Date;
  }> {
    const {
      includeWeatherAdjustment = true,
      includeInventoryAdjustment = true,
      includeCompetitiveAdjustment = false, // Requires external data
      includeSeasonalAdjustment = true
    } = options;
    
    const menuItem = await storage.getMenuItem(menuItemId);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }
    
    const originalPrice = menuItem.price;
    let dynamicPrice = originalPrice;
    const adjustments: Array<{
      factor: string;
      adjustment: number;
      percentage: number;
      reasoning: string;
    }> = [];
    
    // 1. Demand-based pricing
    const demandAdjustment = await this.calculateDemandAdjustment(menuItemId, restaurantId);
    if (demandAdjustment.percentage !== 0) {
      const adjustment = originalPrice * (demandAdjustment.percentage / 100);
      dynamicPrice += adjustment;
      adjustments.push({
        factor: 'Demand',
        adjustment,
        percentage: demandAdjustment.percentage,
        reasoning: demandAdjustment.reasoning
      });
    }
    
    // 2. Time-based pricing
    const timeAdjustment = await this.calculateTimeBasedAdjustment(menuItemId);
    if (timeAdjustment.percentage !== 0) {
      const adjustment = originalPrice * (timeAdjustment.percentage / 100);
      dynamicPrice += adjustment;
      adjustments.push({
        factor: 'Time of Day',
        adjustment,
        percentage: timeAdjustment.percentage,
        reasoning: timeAdjustment.reasoning
      });
    }
    
    // 3. Weather-based pricing
    if (includeWeatherAdjustment) {
      const weatherAdjustment = await this.calculateWeatherAdjustment(menuItem);
      if (weatherAdjustment.percentage !== 0) {
        const adjustment = originalPrice * (weatherAdjustment.percentage / 100);
        dynamicPrice += adjustment;
        adjustments.push({
          factor: 'Weather',
          adjustment,
          percentage: weatherAdjustment.percentage,
          reasoning: weatherAdjustment.reasoning
        });
      }
    }
    
    // 4. Inventory-based pricing
    if (includeInventoryAdjustment) {
      const inventoryAdjustment = await this.calculateInventoryAdjustment(menuItem);
      if (inventoryAdjustment.percentage !== 0) {
        const adjustment = originalPrice * (inventoryAdjustment.percentage / 100);
        dynamicPrice += adjustment;
        adjustments.push({
          factor: 'Inventory Level',
          adjustment,
          percentage: inventoryAdjustment.percentage,
          reasoning: inventoryAdjustment.reasoning
        });
      }
    }
    
    // 5. Seasonal adjustment
    if (includeSeasonalAdjustment) {
      const seasonalAdjustment = await this.calculateSeasonalAdjustment(menuItem);
      if (seasonalAdjustment.percentage !== 0) {
        const adjustment = originalPrice * (seasonalAdjustment.percentage / 100);
        dynamicPrice += adjustment;
        adjustments.push({
          factor: 'Seasonal',
          adjustment,
          percentage: seasonalAdjustment.percentage,
          reasoning: seasonalAdjustment.reasoning
        });
      }
    }
    
    // 6. Day of week adjustment
    const dayAdjustment = await this.calculateDayOfWeekAdjustment(menuItemId);
    if (dayAdjustment.percentage !== 0) {
      const adjustment = originalPrice * (dayAdjustment.percentage / 100);
      dynamicPrice += adjustment;
      adjustments.push({
        factor: 'Day of Week',
        adjustment,
        percentage: dayAdjustment.percentage,
        reasoning: dayAdjustment.reasoning
      });
    }
    
    // Ensure price doesn't fluctuate too dramatically
    const maxIncrease = 0.25; // Max 25% increase
    const maxDecrease = 0.20; // Max 20% decrease
    
    const maxPrice = originalPrice * (1 + maxIncrease);
    const minPrice = originalPrice * (1 - maxDecrease);
    
    dynamicPrice = Math.max(minPrice, Math.min(maxPrice, dynamicPrice));
    
    // Calculate confidence based on data availability
    const confidence = this.calculatePricingConfidence(adjustments);
    
    // Price is valid for 30 minutes
    const validUntil = new Date(Date.now() + 30 * 60 * 1000);
    
    return {
      originalPrice: Math.round(originalPrice * 100) / 100,
      dynamicPrice: Math.round(dynamicPrice * 100) / 100,
      adjustments,
      confidence,
      validUntil
    };
  }
  
  /**
   * Calculate demand-based pricing adjustment
   */
  private async calculateDemandAdjustment(
    menuItemId: number, 
    restaurantId: number
  ): Promise<{ percentage: number; reasoning: string }> {
    // Get recent orders for this item
    const recentOrders = await this.getRecentOrders(restaurantId, 7); // Last 7 days
    const itemOrders = [];
    
    for (const order of recentOrders) {
      const orderItems = await storage.getOrderItems(order.id);
      const itemOrder = orderItems.find(item => item.menuItemId === menuItemId);
      if (itemOrder) {
        itemOrders.push({ order, quantity: itemOrder.quantity });
      }
    }
    
    // Calculate demand metrics
    const totalQuantity = itemOrders.reduce((sum, io) => sum + io.quantity, 0);
    const avgDailyDemand = totalQuantity / 7;
    
    // Get today's orders
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayOrders = itemOrders.filter(io => 
      new Date(io.order.createdAt) >= todayStart
    );
    const todayDemand = todayOrders.reduce((sum, io) => sum + io.quantity, 0);
    
    // Calculate recent demand trend (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentDemand = itemOrders.filter(io => 
      new Date(io.order.createdAt) >= twoHoursAgo
    ).reduce((sum, io) => sum + io.quantity, 0);
    
    let percentage = 0;
    let reasoning = '';
    
    // High recent demand
    if (recentDemand > avgDailyDemand * 0.3) {
      percentage += 10;
      reasoning = 'High recent demand detected';
    }
    
    // High daily demand compared to average
    if (todayDemand > avgDailyDemand * 1.5) {
      percentage += 5;
      reasoning += (reasoning ? ', ' : '') + 'Above average daily demand';
    }
    
    // Low demand - slight discount
    if (todayDemand < avgDailyDemand * 0.5 && recentDemand === 0) {
      percentage -= 3;
      reasoning = 'Lower than average demand';
    }
    
    return { percentage, reasoning: reasoning || 'Normal demand levels' };
  }
  
  /**
   * Calculate time-based pricing adjustment
   */
  private async calculateTimeBasedAdjustment(
    menuItemId: number
  ): Promise<{ percentage: number; reasoning: string }> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    
    let percentage = 0;
    let reasoning = '';
    
    // Peak hours pricing
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isLunchTime = hour >= 11 && hour <= 14;
    const isDinnerTime = hour >= 17 && hour <= 21;
    const isBreakfastTime = hour >= 7 && hour <= 10;
    
    if (isWeekend && (isLunchTime || isDinnerTime)) {
      percentage += 8;
      reasoning = 'Weekend peak hours';
    } else if (isLunchTime || isDinnerTime) {
      percentage += 5;
      reasoning = 'Peak dining hours';
    } else if (isBreakfastTime && !isWeekend) {
      percentage += 3;
      reasoning = 'Morning rush hour';
    }
    
    // Late night discount
    if (hour >= 22 || hour <= 6) {
      percentage -= 5;
      reasoning = 'Late night discount';
    }
    
    // Early bird discount
    if (hour >= 7 && hour <= 9 && !isWeekend) {
      percentage -= 3;
      reasoning = 'Early bird special';
    }
    
    return { percentage, reasoning: reasoning || 'Standard time pricing' };
  }
  
  /**
   * Calculate weather-based pricing adjustment
   */
  private async calculateWeatherAdjustment(
    menuItem: MenuItem
  ): Promise<{ percentage: number; reasoning: string }> {
    // Mock weather data - in production, integrate with weather API
    const mockWeather = {
      temperature: 75,
      condition: 'sunny', // sunny, rainy, cloudy, stormy
      humidity: 60,
      isExtreme: false // extreme heat/cold
    };
    
    let percentage = 0;
    let reasoning = '';
    
    const description = menuItem.description?.toLowerCase() || '';
    const name = menuItem.name.toLowerCase();
    
    // Hot weather adjustments
    if (mockWeather.temperature > 85) {
      if (description.includes('cold') || description.includes('iced') || 
          name.includes('salad') || name.includes('ice cream')) {
        percentage += 6;
        reasoning = 'High demand due to hot weather';
      } else if (description.includes('hot') || description.includes('soup')) {
        percentage -= 4;
        reasoning = 'Lower demand for hot items in hot weather';
      }
    }
    
    // Cold weather adjustments
    else if (mockWeather.temperature < 45) {
      if (description.includes('hot') || description.includes('warm') || 
          description.includes('soup') || name.includes('coffee')) {
        percentage += 5;
        reasoning = 'High demand due to cold weather';
      } else if (description.includes('cold') || name.includes('salad')) {
        percentage -= 3;
        reasoning = 'Lower demand for cold items in cold weather';
      }
    }
    
    // Rainy weather
    if (mockWeather.condition === 'rainy') {
      if (description.includes('comfort') || description.includes('hearty') ||
          name.includes('pasta') || name.includes('soup')) {
        percentage += 4;
        reasoning = 'Comfort food demand due to rainy weather';
      }
    }
    
    return { percentage, reasoning: reasoning || 'Weather-neutral pricing' };
  }
  
  /**
   * Calculate inventory-based pricing adjustment
   */
  private async calculateInventoryAdjustment(
    menuItem: MenuItem
  ): Promise<{ percentage: number; reasoning: string }> {
    // Mock inventory data - in production, integrate with inventory system
    const mockInventory = {
      level: Math.random(), // 0-1, where 1 is fully stocked
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
      lastRestock: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    };
    
    let percentage = 0;
    let reasoning = '';
    
    // Low inventory - increase price to reduce demand
    if (mockInventory.level < 0.2) {
      percentage += 8;
      reasoning = 'Limited inventory available';
    } else if (mockInventory.level < 0.4) {
      percentage += 4;
      reasoning = 'Low inventory levels';
    }
    
    // High inventory - decrease price to move stock
    else if (mockInventory.level > 0.8) {
      percentage -= 3;
      reasoning = 'High inventory - promotional pricing';
    }
    
    // Inventory trend adjustment
    if (mockInventory.trend === 'decreasing' && mockInventory.level < 0.6) {
      percentage += 2;
      reasoning += (reasoning ? ', ' : '') + 'decreasing inventory trend';
    }
    
    return { percentage, reasoning: reasoning || 'Normal inventory levels' };
  }
  
  /**
   * Calculate seasonal pricing adjustment
   */
  private async calculateSeasonalAdjustment(
    menuItem: MenuItem
  ): Promise<{ percentage: number; reasoning: string }> {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    
    let percentage = 0;
    let reasoning = '';
    
    const description = menuItem.description?.toLowerCase() || '';
    const name = menuItem.name.toLowerCase();
    
    // Spring (March-May)
    if (month >= 2 && month <= 4) {
      if (description.includes('fresh') || description.includes('spring') ||
          name.includes('salad') || description.includes('light')) {
        percentage += 3;
        reasoning = 'Spring seasonal favorite';
      }
    }
    
    // Summer (June-August)
    else if (month >= 5 && month <= 7) {
      if (description.includes('grilled') || description.includes('bbq') ||
          name.includes('cold') || description.includes('refreshing')) {
        percentage += 4;
        reasoning = 'Summer seasonal demand';
      }
    }
    
    // Fall (September-November)
    else if (month >= 8 && month <= 10) {
      if (description.includes('pumpkin') || description.includes('apple') ||
          description.includes('warm') || description.includes('spiced')) {
        percentage += 5;
        reasoning = 'Fall seasonal specialty';
      }
    }
    
    // Winter (December-February)
    else {
      if (description.includes('hot') || description.includes('warm') ||
          description.includes('comfort') || description.includes('hearty')) {
        percentage += 4;
        reasoning = 'Winter comfort food demand';
      }
    }
    
    return { percentage, reasoning: reasoning || 'No seasonal adjustment' };
  }
  
  /**
   * Calculate day of week adjustment
   */
  private async calculateDayOfWeekAdjustment(
    menuItemId: number
  ): Promise<{ percentage: number; reasoning: string }> {
    const dayOfWeek = new Date().getDay(); // 0 = Sunday
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    let percentage = 0;
    let reasoning = '';
    
    // Weekend pricing
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      percentage += 6;
      reasoning = 'Weekend premium pricing';
    }
    
    // Monday blues discount
    else if (dayOfWeek === 1) {
      percentage -= 4;
      reasoning = 'Monday motivation discount';
    }
    
    // Mid-week special
    else if (dayOfWeek === 3) { // Wednesday
      percentage -= 2;
      reasoning = 'Midweek special pricing';
    }
    
    // TGIF pricing
    else if (dayOfWeek === 5) { // Friday
      percentage += 3;
      reasoning = 'Friday celebration pricing';
    }
    
    return { percentage, reasoning: reasoning || `Standard ${dayNames[dayOfWeek]} pricing` };
  }
  
  /**
   * Get recent orders for analysis
   */
  private async getRecentOrders(restaurantId: number, days: number): Promise<Order[]> {
    const orders = await storage.getRestaurantOrders(restaurantId);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return orders.filter(order => new Date(order.createdAt) >= cutoffDate);
  }
  
  /**
   * Calculate confidence in pricing decision
   */
  private calculatePricingConfidence(adjustments: Array<any>): number {
    let confidence = 50; // Base confidence
    
    // More adjustments = higher confidence (more data points)
    confidence += adjustments.length * 8;
    
    // Large adjustments reduce confidence (more uncertainty)
    const totalAdjustment = adjustments.reduce((sum, adj) => sum + Math.abs(adj.percentage), 0);
    if (totalAdjustment > 20) {
      confidence -= 10;
    }
    
    return Math.min(Math.max(confidence, 0), 100);
  }
  
  /**
   * Get price optimization recommendations for restaurant owners
   */
  async getPriceOptimizationRecommendations(
    restaurantId: number
  ): Promise<Array<{
    menuItem: MenuItem;
    currentPrice: number;
    recommendedPrice: number;
    expectedImpact: {
      demandChange: string;
      revenueChange: string;
      reasoning: string;
    };
    confidence: number;
  }>> {
    const menuItems = await storage.getMenuItems(restaurantId);
    const recommendations = [];
    
    for (const item of menuItems) {
      if (!item.isAvailable) continue;
      
      const pricing = await this.getDynamicPrice(item.id, restaurantId);
      const currentPrice = pricing.originalPrice;
      const recommendedPrice = pricing.dynamicPrice;
      
      if (Math.abs(recommendedPrice - currentPrice) > 0.50) { // Only recommend if change > $0.50
        const priceChange = ((recommendedPrice - currentPrice) / currentPrice) * 100;
        
        let demandChange = '';
        let revenueChange = '';
        let reasoning = '';
        
        if (priceChange > 0) {
          demandChange = 'Expected to decrease by 5-15%';
          revenueChange = 'Expected to increase by 3-8%';
          reasoning = 'Price increase justified by high demand factors';
        } else {
          demandChange = 'Expected to increase by 10-25%';
          revenueChange = 'Expected to increase by 5-12%';
          reasoning = 'Price reduction to stimulate demand and move inventory';
        }
        
        recommendations.push({
          menuItem: item,
          currentPrice,
          recommendedPrice,
          expectedImpact: {
            demandChange,
            revenueChange,
            reasoning
          },
          confidence: pricing.confidence
        });
      }
    }
    
    return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }
  
  /**
   * A/B test pricing strategies
   */
  async createPricingABTest(
    menuItemId: number,
    testPrices: number[],
    testDuration: number = 7 // days
  ): Promise<{
    testId: string;
    menuItemId: number;
    originalPrice: number;
    testPrices: number[];
    startDate: Date;
    endDate: Date;
    status: 'active' | 'pending';
  }> {
    const menuItem = await storage.getMenuItem(menuItemId);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }
    
    const testId = `pricing_test_${menuItemId}_${Date.now()}`;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + testDuration * 24 * 60 * 60 * 1000);
    
    // In production, this would be stored in a database
    const test = {
      testId,
      menuItemId,
      originalPrice: menuItem.price,
      testPrices,
      startDate,
      endDate,
      status: 'active' as const
    };
    
    return test;
  }
}

export const aiPricingService = new AIPricingService();