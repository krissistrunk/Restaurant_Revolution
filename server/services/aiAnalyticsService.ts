import { storage } from '../storage';
import { Order, MenuItem, User, QueueEntry } from '@shared/schema';

interface PredictionResult {
  value: number;
  confidence: number;
  factors: string[];
  timeframe: string;
}

interface CustomerSegment {
  name: string;
  description: string;
  customers: User[];
  characteristics: Record<string, any>;
  recommendations: string[];
}

/**
 * AI-powered analytics and predictive service
 */
export class AIAnalyticsService {
  
  /**
   * Predict future demand for a specific time period
   */
  async predictDemand(
    restaurantId: number,
    timeframe: '1h' | '4h' | '1d' | '3d' | '7d' | '30d',
    targetDate?: Date
  ): Promise<PredictionResult> {
    const target = targetDate || new Date();
    const historical = await this.getHistoricalData(restaurantId, target, timeframe);
    
    // Simple time series analysis with trend and seasonality
    const values = historical.map(d => d.value);
    const trend = this.calculateTrend(values);
    const seasonality = this.calculateSeasonality(values, target);
    const baselineAverage = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Predict based on historical patterns
    let prediction = baselineAverage + trend + seasonality;
    
    // Apply external factors
    const weatherFactor = await this.calculateWeatherImpact(target);
    const eventFactor = await this.calculateEventImpact(target);
    const dayTypeFactor = this.calculateDayTypeImpact(target);
    
    prediction *= (1 + weatherFactor + eventFactor + dayTypeFactor);
    
    // Calculate confidence based on data quality
    const confidence = this.calculatePredictionConfidence(values.length, trend, seasonality);
    
    const factors = [];
    if (Math.abs(trend) > 0.1) factors.push(`${trend > 0 ? 'Upward' : 'Downward'} trend detected`);
    if (Math.abs(seasonality) > 0.1) factors.push('Seasonal pattern influence');
    if (Math.abs(weatherFactor) > 0.05) factors.push('Weather impact considered');
    if (Math.abs(eventFactor) > 0.05) factors.push('Special events impact');
    if (Math.abs(dayTypeFactor) > 0.05) factors.push('Day type variation');
    
    return {
      value: Math.max(0, Math.round(prediction)),
      confidence: Math.round(confidence),
      factors,
      timeframe
    };
  }
  
  /**
   * Predict revenue for a future period
   */
  async predictRevenue(
    restaurantId: number,
    timeframe: '1d' | '7d' | '30d',
    targetDate?: Date
  ): Promise<PredictionResult> {
    const target = targetDate || new Date();
    const orders = await storage.getRestaurantOrders(restaurantId);
    
    // Get historical revenue data
    const timeframeMs = this.getTimeframeMs(timeframe);
    const historicalRevenue = [];
    
    for (let i = 1; i <= 8; i++) { // 8 periods for trend analysis
      const periodStart = new Date(target.getTime() - (i + 1) * timeframeMs);
      const periodEnd = new Date(target.getTime() - i * timeframeMs);
      
      const periodOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= periodStart && orderDate < periodEnd && order.status === 'completed';
      });
      
      const revenue = periodOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      historicalRevenue.push(revenue);
    }
    
    historicalRevenue.reverse(); // Oldest to newest
    
    // Calculate prediction
    const trend = this.calculateTrend(historicalRevenue);
    const seasonality = this.calculateSeasonality(historicalRevenue, target);
    const baseline = historicalRevenue[historicalRevenue.length - 1] || 0;
    
    let prediction = baseline + trend + seasonality;
    
    // Apply market factors
    const marketGrowth = 0.02; // 2% market growth assumption
    const competitiveFactor = -0.01; // 1% competitive pressure
    const loyaltyFactor = await this.calculateLoyaltyImpact(restaurantId);
    
    prediction *= (1 + marketGrowth + competitiveFactor + loyaltyFactor);
    
    const confidence = this.calculatePredictionConfidence(
      historicalRevenue.length,
      trend / baseline,
      seasonality / baseline
    );
    
    return {
      value: Math.round(prediction * 100) / 100,
      confidence: Math.round(confidence),
      factors: [
        'Historical revenue trends',
        'Seasonal patterns',
        'Market growth assumptions',
        'Customer loyalty indicators'
      ],
      timeframe
    };
  }
  
  /**
   * Predict optimal staffing levels
   */
  async predictStaffingNeeds(
    restaurantId: number,
    targetDate: Date,
    shifts: Array<{ start: string; end: string; role: string }>
  ): Promise<Array<{
    shift: { start: string; end: string; role: string };
    recommendedStaff: number;
    reasoning: string[];
    confidence: number;
  }>> {
    const results = [];
    
    for (const shift of shifts) {
      const shiftStart = new Date(`${targetDate.toDateString()} ${shift.start}`);
      const shiftEnd = new Date(`${targetDate.toDateString()} ${shift.end}`);
      
      // Predict demand for this time period
      const demandPrediction = await this.predictDemand(restaurantId, '4h', shiftStart);
      
      // Calculate staffing based on role and predicted demand
      let recommendedStaff = 0;
      const reasoning = [];
      
      switch (shift.role) {
        case 'server':
          // 1 server per 15-20 customers
          recommendedStaff = Math.ceil(demandPrediction.value / 17);
          reasoning.push(`Based on ${demandPrediction.value} predicted customers`);
          reasoning.push('Average 17 customers per server');
          break;
          
        case 'kitchen':
          // 1 kitchen staff per 25-30 orders
          recommendedStaff = Math.ceil(demandPrediction.value / 27);
          reasoning.push(`Based on ${demandPrediction.value} predicted orders`);
          reasoning.push('Average 27 orders per kitchen staff');
          break;
          
        case 'host':
          // 1 host per shift during busy times
          recommendedStaff = demandPrediction.value > 30 ? 1 : 0;
          reasoning.push(demandPrediction.value > 30 ? 'High volume expected' : 'Low volume period');
          break;
          
        case 'manager':
          // 1 manager for evening/weekend shifts
          const hour = shiftStart.getHours();
          const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
          recommendedStaff = (hour >= 17 || isWeekend) ? 1 : 0;
          reasoning.push(hour >= 17 ? 'Evening shift' : isWeekend ? 'Weekend' : 'Day shift');
          break;
      }
      
      // Adjust for special factors
      if (this.isHoliday(targetDate)) {
        recommendedStaff = Math.ceil(recommendedStaff * 1.3);
        reasoning.push('Holiday adjustment (+30%)');
      }
      
      results.push({
        shift,
        recommendedStaff: Math.max(1, recommendedStaff), // Minimum 1 staff
        reasoning,
        confidence: demandPrediction.confidence
      });
    }
    
    return results;
  }
  
  /**
   * Analyze customer behavior patterns and segment customers
   */
  async analyzeCustomerSegments(restaurantId: number): Promise<CustomerSegment[]> {
    const orders = await storage.getRestaurantOrders(restaurantId);
    const customers = new Map<number, User>();
    
    // Get all customers who have ordered
    for (const order of orders) {
      if (!customers.has(order.userId)) {
        const user = await storage.getUser(order.userId);
        if (user) customers.set(order.userId, user);
      }
    }
    
    const customerArray = Array.from(customers.values());
    const segments: CustomerSegment[] = [];
    
    // Segment 1: High-Value Customers
    const highValueCustomers = await this.identifyHighValueCustomers(customerArray, orders);
    segments.push({
      name: 'VIP Customers',
      description: 'High-spending frequent customers',
      customers: highValueCustomers,
      characteristics: {
        avgOrderValue: this.calculateAvgOrderValue(highValueCustomers, orders),
        visitFrequency: 'Weekly or more',
        loyaltyPoints: 'High (>500 points)'
      },
      recommendations: [
        'Offer exclusive menu previews',
        'Provide priority reservations',
        'Send personalized promotions',
        'Create loyalty tier benefits'
      ]
    });
    
    // Segment 2: Occasional Diners
    const occasionalDiners = await this.identifyOccasionalDiners(customerArray, orders);
    segments.push({
      name: 'Occasional Diners',
      description: 'Customers who visit monthly or less frequently',
      customers: occasionalDiners,
      characteristics: {
        avgOrderValue: this.calculateAvgOrderValue(occasionalDiners, orders),
        visitFrequency: 'Monthly or less',
        loyaltyPoints: 'Low (<100 points)'
      },
      recommendations: [
        'Send re-engagement campaigns',
        'Offer comeback incentives',
        'Share seasonal menu highlights',
        'Provide birthday/anniversary offers'
      ]
    });
    
    // Segment 3: Price-Conscious Customers
    const budgetCustomers = await this.identifyBudgetCustomers(customerArray, orders);
    segments.push({
      name: 'Budget-Conscious',
      description: 'Customers who prefer value-oriented options',
      customers: budgetCustomers,
      characteristics: {
        avgOrderValue: this.calculateAvgOrderValue(budgetCustomers, orders),
        visitFrequency: 'Varies',
        loyaltyPoints: 'Medium'
      },
      recommendations: [
        'Promote daily specials',
        'Offer combo deals',
        'Send discount coupons',
        'Highlight value menu items'
      ]
    });
    
    // Segment 4: New Customers
    const newCustomers = await this.identifyNewCustomers(customerArray, orders);
    segments.push({
      name: 'New Customers',
      description: 'Recently acquired customers (last 30 days)',
      customers: newCustomers,
      characteristics: {
        avgOrderValue: this.calculateAvgOrderValue(newCustomers, orders),
        visitFrequency: 'First-time or few visits',
        loyaltyPoints: 'Very low'
      },
      recommendations: [
        'Send welcome messages',
        'Offer first-time visitor discounts',
        'Encourage app downloads',
        'Request feedback surveys'
      ]
    });
    
    return segments;
  }
  
  /**
   * Predict customer churn risk
   */
  async predictCustomerChurn(restaurantId: number): Promise<Array<{
    customer: User;
    churnRisk: 'Low' | 'Medium' | 'High';
    riskScore: number;
    factors: string[];
    recommendations: string[];
  }>> {
    const orders = await storage.getRestaurantOrders(restaurantId);
    const customers = new Map<number, User>();
    
    // Get all customers
    for (const order of orders) {
      if (!customers.has(order.userId)) {
        const user = await storage.getUser(order.userId);
        if (user) customers.set(order.userId, user);
      }
    }
    
    const results = [];
    const now = new Date();
    
    for (const [userId, customer] of customers) {
      const customerOrders = orders.filter(o => o.userId === userId);
      
      if (customerOrders.length === 0) continue;
      
      let riskScore = 0;
      const factors = [];
      
      // Factor 1: Time since last order
      const lastOrder = customerOrders.reduce((latest, order) => 
        new Date(order.createdAt) > new Date(latest.createdAt) ? order : latest
      );
      
      const daysSinceLastOrder = (now.getTime() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastOrder > 60) {
        riskScore += 40;
        factors.push('No orders in 60+ days');
      } else if (daysSinceLastOrder > 30) {
        riskScore += 25;
        factors.push('No orders in 30+ days');
      } else if (daysSinceLastOrder > 14) {
        riskScore += 10;
        factors.push('No recent orders (14+ days)');
      }
      
      // Factor 2: Declining order frequency
      const recentOrders = customerOrders.filter(o => 
        new Date(o.createdAt).getTime() > now.getTime() - (90 * 24 * 60 * 60 * 1000)
      );
      
      if (recentOrders.length < customerOrders.length * 0.3) {
        riskScore += 20;
        factors.push('Declining order frequency');
      }
      
      // Factor 3: Decreasing order value
      if (customerOrders.length >= 3) {
        const recentAvg = recentOrders.reduce((sum, o) => sum + o.totalPrice, 0) / recentOrders.length;
        const overallAvg = customerOrders.reduce((sum, o) => sum + o.totalPrice, 0) / customerOrders.length;
        
        if (recentAvg < overallAvg * 0.8) {
          riskScore += 15;
          factors.push('Decreasing order values');
        }
      }
      
      // Factor 4: Low engagement
      if (customer.loyaltyPoints < 50 && customerOrders.length > 5) {
        riskScore += 10;
        factors.push('Low loyalty engagement');
      }
      
      // Factor 5: No recent app activity (simulated)
      const mockAppActivity = Math.random();
      if (mockAppActivity < 0.3) {
        riskScore += 15;
        factors.push('Low app engagement');
      }
      
      // Determine risk level
      let churnRisk: 'Low' | 'Medium' | 'High';
      if (riskScore >= 60) churnRisk = 'High';
      else if (riskScore >= 30) churnRisk = 'Medium';
      else churnRisk = 'Low';
      
      // Generate recommendations
      const recommendations = [];
      if (churnRisk === 'High') {
        recommendations.push('Send personalized win-back offer');
        recommendations.push('Call for direct feedback');
        recommendations.push('Offer exclusive discount');
      } else if (churnRisk === 'Medium') {
        recommendations.push('Send re-engagement email');
        recommendations.push('Offer loyalty bonus');
        recommendations.push('Invite to special events');
      } else {
        recommendations.push('Continue regular communications');
        recommendations.push('Reward loyalty consistently');
      }
      
      results.push({
        customer,
        churnRisk,
        riskScore,
        factors,
        recommendations
      });
    }
    
    return results.sort((a, b) => b.riskScore - a.riskScore);
  }
  
  /**
   * Optimize menu pricing based on demand elasticity
   */
  async optimizeMenuPricing(restaurantId: number): Promise<Array<{
    menuItem: MenuItem;
    currentPrice: number;
    optimizedPrice: number;
    expectedDemandChange: number;
    expectedRevenueChange: number;
    confidence: number;
  }>> {
    const menuItems = await storage.getMenuItems(restaurantId);
    const orders = await storage.getRestaurantOrders(restaurantId);
    const results = [];
    
    for (const item of menuItems) {
      if (!item.isAvailable) continue;
      
      // Calculate current demand and price elasticity
      const itemOrders = [];
      for (const order of orders) {
        const orderItems = await storage.getOrderItems(order.id);
        const itemOrder = orderItems.find(oi => oi.menuItemId === item.id);
        if (itemOrder) {
          itemOrders.push({
            date: new Date(order.createdAt),
            quantity: itemOrder.quantity,
            price: itemOrder.price
          });
        }
      }
      
      if (itemOrders.length < 10) continue; // Need sufficient data
      
      // Calculate demand elasticity (simplified)
      const elasticity = this.calculatePriceElasticity(itemOrders);
      
      // Find optimal price using elasticity
      const currentPrice = item.price;
      const optimalPriceChange = this.findOptimalPriceChange(elasticity, currentPrice);
      const optimizedPrice = currentPrice * (1 + optimalPriceChange);
      
      // Calculate expected changes
      const expectedDemandChange = -elasticity * optimalPriceChange * 100;
      const expectedRevenueChange = ((optimizedPrice / currentPrice - 1) + (expectedDemandChange / 100)) * 100;
      
      // Calculate confidence based on data quality
      const confidence = Math.min(100, itemOrders.length * 2);
      
      if (Math.abs(optimizedPrice - currentPrice) > 0.25) { // Only if significant change
        results.push({
          menuItem: item,
          currentPrice: Math.round(currentPrice * 100) / 100,
          optimizedPrice: Math.round(optimizedPrice * 100) / 100,
          expectedDemandChange: Math.round(expectedDemandChange * 100) / 100,
          expectedRevenueChange: Math.round(expectedRevenueChange * 100) / 100,
          confidence: Math.round(confidence)
        });
      }
    }
    
    return results.sort((a, b) => b.expectedRevenueChange - a.expectedRevenueChange);
  }
  
  // Helper methods
  private async getHistoricalData(restaurantId: number, targetDate: Date, timeframe: string) {
    const orders = await storage.getRestaurantOrders(restaurantId);
    const timeframeMs = this.getTimeframeMs(timeframe);
    const periods = [];
    
    for (let i = 1; i <= 8; i++) {
      const periodStart = new Date(targetDate.getTime() - (i + 1) * timeframeMs);
      const periodEnd = new Date(targetDate.getTime() - i * timeframeMs);
      
      const periodOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= periodStart && orderDate < periodEnd;
      });
      
      periods.push({
        start: periodStart,
        end: periodEnd,
        value: periodOrders.length
      });
    }
    
    return periods.reverse();
  }
  
  private getTimeframeMs(timeframe: string): number {
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe as keyof typeof timeframes] || timeframes['1d'];
  }
  
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * (i + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope || 0;
  }
  
  private calculateSeasonality(values: number[], targetDate: Date): number {
    const hour = targetDate.getHours();
    const dayOfWeek = targetDate.getDay();
    
    // Simple seasonality based on time of day and day of week
    let seasonalFactor = 0;
    
    // Hour-based seasonality
    if (hour >= 11 && hour <= 13) seasonalFactor += 0.2; // Lunch rush
    if (hour >= 18 && hour <= 20) seasonalFactor += 0.3; // Dinner rush
    if (hour <= 7 || hour >= 22) seasonalFactor -= 0.3; // Slow hours
    
    // Day-based seasonality
    if (dayOfWeek === 0 || dayOfWeek === 6) seasonalFactor += 0.1; // Weekend
    if (dayOfWeek === 1) seasonalFactor -= 0.1; // Monday slow
    
    const baseline = values.reduce((sum, val) => sum + val, 0) / values.length;
    return baseline * seasonalFactor;
  }
  
  private async calculateWeatherImpact(date: Date): Promise<number> {
    // Mock weather impact - in production, integrate with weather API
    const mockWeather = Math.random();
    if (mockWeather < 0.2) return -0.15; // Bad weather
    if (mockWeather > 0.8) return 0.1; // Great weather
    return 0; // Normal weather
  }
  
  private async calculateEventImpact(date: Date): Promise<number> {
    // Mock event impact - in production, integrate with event calendars
    if (this.isHoliday(date)) return 0.3;
    if (this.isGameDay(date)) return 0.2;
    return 0;
  }
  
  private calculateDayTypeImpact(date: Date): number {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return 0.15; // Weekend
    if (dayOfWeek === 5) return 0.1; // Friday
    if (dayOfWeek === 1) return -0.1; // Monday
    return 0;
  }
  
  private calculatePredictionConfidence(dataPoints: number, trend: number, seasonality: number): number {
    let confidence = 50;
    
    // More data points = higher confidence
    confidence += Math.min(dataPoints * 3, 30);
    
    // Stable trends increase confidence
    if (Math.abs(trend) < 0.5) confidence += 10;
    
    // Clear seasonality patterns increase confidence
    if (Math.abs(seasonality) > 0.1) confidence += 10;
    
    return Math.min(confidence, 95);
  }
  
  private async calculateLoyaltyImpact(restaurantId: number): Promise<number> {
    const orders = await storage.getRestaurantOrders(restaurantId);
    const recentOrders = orders.filter(o => 
      new Date(o.createdAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)
    );
    
    const loyaltyUsers = recentOrders.filter(o => o.loyaltyPointsUsed > 0).length;
    const loyaltyRate = loyaltyUsers / recentOrders.length;
    
    return loyaltyRate * 0.05; // 5% max boost for high loyalty usage
  }
  
  private isHoliday(date: Date): boolean {
    // Simple holiday detection - in production, use a comprehensive holiday API
    const month = date.getMonth();
    const day = date.getDate();
    
    // Major holidays
    if (month === 11 && day === 25) return true; // Christmas
    if (month === 0 && day === 1) return true; // New Year
    if (month === 6 && day === 4) return true; // July 4th
    
    return false;
  }
  
  private isGameDay(date: Date): boolean {
    // Mock game day detection
    return Math.random() < 0.1; // 10% chance of being a game day
  }
  
  private async identifyHighValueCustomers(customers: User[], orders: Order[]): Promise<User[]> {
    return customers.filter(customer => {
      const customerOrders = orders.filter(o => o.userId === customer.id);
      const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      const avgOrderValue = totalSpent / customerOrders.length;
      
      return customerOrders.length >= 5 && avgOrderValue > 25 && customer.loyaltyPoints > 200;
    });
  }
  
  private async identifyOccasionalDiners(customers: User[], orders: Order[]): Promise<User[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return customers.filter(customer => {
      const customerOrders = orders.filter(o => o.userId === customer.id);
      const recentOrders = customerOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
      
      return customerOrders.length > 0 && recentOrders.length <= 1;
    });
  }
  
  private async identifyBudgetCustomers(customers: User[], orders: Order[]): Promise<User[]> {
    return customers.filter(customer => {
      const customerOrders = orders.filter(o => o.userId === customer.id);
      if (customerOrders.length === 0) return false;
      
      const avgOrderValue = customerOrders.reduce((sum, o) => sum + o.totalPrice, 0) / customerOrders.length;
      return avgOrderValue < 20;
    });
  }
  
  private async identifyNewCustomers(customers: User[], orders: Order[]): Promise<User[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return customers.filter(customer => {
      const customerOrders = orders.filter(o => o.userId === customer.id);
      const firstOrder = customerOrders.reduce((earliest, order) => 
        new Date(order.createdAt) < new Date(earliest.createdAt) ? order : earliest
      );
      
      return new Date(firstOrder.createdAt) >= thirtyDaysAgo;
    });
  }
  
  private calculateAvgOrderValue(customers: User[], orders: Order[]): number {
    const customerIds = new Set(customers.map(c => c.id));
    const relevantOrders = orders.filter(o => customerIds.has(o.userId));
    
    if (relevantOrders.length === 0) return 0;
    
    const total = relevantOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    return Math.round((total / relevantOrders.length) * 100) / 100;
  }
  
  private calculatePriceElasticity(itemOrders: Array<{date: Date, quantity: number, price: number}>): number {
    // Simplified elasticity calculation
    // In production, use more sophisticated econometric methods
    
    if (itemOrders.length < 10) return -1; // Default elasticity
    
    const priceChanges = [];
    const quantityChanges = [];
    
    for (let i = 1; i < itemOrders.length; i++) {
      const prevOrder = itemOrders[i - 1];
      const currentOrder = itemOrders[i];
      
      const priceChange = (currentOrder.price - prevOrder.price) / prevOrder.price;
      const quantityChange = (currentOrder.quantity - prevOrder.quantity) / prevOrder.quantity;
      
      if (Math.abs(priceChange) > 0.01) { // Only consider significant price changes
        priceChanges.push(priceChange);
        quantityChanges.push(quantityChange);
      }
    }
    
    if (priceChanges.length === 0) return -1;
    
    // Calculate average elasticity
    const elasticities = priceChanges.map((pc, i) => quantityChanges[i] / pc);
    const avgElasticity = elasticities.reduce((sum, e) => sum + e, 0) / elasticities.length;
    
    return Math.max(-5, Math.min(-0.1, avgElasticity)); // Bound between -5 and -0.1
  }
  
  private findOptimalPriceChange(elasticity: number, currentPrice: number): number {
    // Simplified optimal pricing - maximize revenue
    // Optimal price change = -1 / (2 * elasticity)
    const optimalChange = -1 / (2 * elasticity);
    
    // Limit to reasonable bounds
    return Math.max(-0.15, Math.min(0.25, optimalChange));
  }
}

export const aiAnalyticsService = new AIAnalyticsService();