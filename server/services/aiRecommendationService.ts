import { storage } from '../storage';
import { MenuItem, User, UserPreference, UserItemInteraction, Order } from '@shared/schema';

/**
 * AI-powered recommendation service with machine learning algorithms
 */
export class AIRecommendationService {
  
  /**
   * Get personalized menu recommendations using collaborative filtering
   */
  async getPersonalizedRecommendations(
    userId: number, 
    restaurantId: number, 
    options: {
      limit?: number;
      includeWeatherContext?: boolean;
      includePriceOptimization?: boolean;
      includeTimingContext?: boolean;
    } = {}
  ): Promise<{
    recommendations: MenuItem[];
    reasoning: string[];
    confidence: number;
    algorithm: string;
  }> {
    const { limit = 8, includeWeatherContext = true, includePriceOptimization = true, includeTimingContext = true } = options;
    
    // Get user data
    const user = await storage.getUser(userId);
    const userPreferences = await storage.getUserPreference(userId);
    const userInteractions = await storage.getUserItemInteractions(userId);
    const userOrders = await storage.getUserOrders(userId);
    
    // Get menu items
    const allMenuItems = await storage.getMenuItems(restaurantId);
    
    // Apply multiple recommendation algorithms
    const algorithms = [];
    let combinedScores = new Map<number, number>();
    let reasoning: string[] = [];
    
    // 1. Collaborative Filtering
    const collaborativeScores = await this.collaborativeFiltering(userId, restaurantId, allMenuItems);
    this.combineScores(combinedScores, collaborativeScores, 0.3);
    algorithms.push('Collaborative Filtering');
    reasoning.push('Based on similar users\' preferences');
    
    // 2. Content-Based Filtering
    const contentScores = await this.contentBasedFiltering(userPreferences, userInteractions, allMenuItems);
    this.combineScores(combinedScores, contentScores, 0.25);
    algorithms.push('Content-Based Filtering');
    reasoning.push('Based on your taste preferences and dietary needs');
    
    // 3. Behavior-Based Recommendations
    const behaviorScores = await this.behaviorBasedRecommendations(userInteractions, userOrders, allMenuItems);
    this.combineScores(combinedScores, behaviorScores, 0.2);
    algorithms.push('Behavior Analysis');
    reasoning.push('Based on your ordering patterns and interactions');
    
    // 4. Weather-Based Recommendations (if enabled)
    if (includeWeatherContext) {
      const weatherScores = await this.weatherBasedRecommendations(allMenuItems);
      this.combineScores(combinedScores, weatherScores, 0.1);
      algorithms.push('Weather Context');
      reasoning.push('Adjusted for current weather conditions');
    }
    
    // 5. Time-Based Recommendations (if enabled)
    if (includeTimingContext) {
      const timingScores = await this.timeBasedRecommendations(allMenuItems);
      this.combineScores(combinedScores, timingScores, 0.1);
      algorithms.push('Time Context');
      reasoning.push('Popular items for current time of day');
    }
    
    // 6. Price Optimization (if enabled)
    if (includePriceOptimization && user) {
      const priceScores = await this.priceOptimizedRecommendations(user, userOrders, allMenuItems);
      this.combineScores(combinedScores, priceScores, 0.05);
      algorithms.push('Price Optimization');
      reasoning.push('Optimized for your typical spending range');
    }
    
    // Sort by combined scores and get top recommendations
    const sortedItems = Array.from(combinedScores.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, limit)
      .map(([itemId]) => allMenuItems.find(item => item.id === itemId))
      .filter(item => item && item.isAvailable) as MenuItem[];
    
    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(userPreferences, userInteractions, userOrders);
    
    return {
      recommendations: sortedItems,
      reasoning,
      confidence,
      algorithm: algorithms.join(' + ')
    };
  }
  
  /**
   * Collaborative filtering based on similar users
   */
  private async collaborativeFiltering(
    userId: number, 
    restaurantId: number, 
    allMenuItems: MenuItem[]
  ): Promise<Map<number, number>> {
    const scores = new Map<number, number>();
    
    // Get all users' interactions
    const allInteractions = await Promise.all(
      allMenuItems.map(item => storage.getMenuItemInteractions(item.id))
    );
    
    // Find similar users based on interaction patterns
    const userInteractions = await storage.getUserItemInteractions(userId);
    const userItemSet = new Set(userInteractions.map(i => i.menuItemId));
    
    const similarUsers = new Map<number, number>(); // userId -> similarity score
    
    for (const interactions of allInteractions.flat()) {
      if (interactions.userId === userId) continue;
      
      const otherUserInteractions = await storage.getUserItemInteractions(interactions.userId);
      const otherUserItemSet = new Set(otherUserInteractions.map(i => i.menuItemId));
      
      // Calculate Jaccard similarity
      const intersection = new Set([...userItemSet].filter(x => otherUserItemSet.has(x)));
      const union = new Set([...userItemSet, ...otherUserItemSet]);
      const similarity = intersection.size / union.size;
      
      if (similarity > 0.1) { // Minimum similarity threshold
        similarUsers.set(interactions.userId, similarity);
      }
    }
    
    // Recommend items liked by similar users
    for (const [similarUserId, similarity] of similarUsers) {
      const similarUserInteractions = await storage.getUserItemInteractions(similarUserId);
      
      for (const interaction of similarUserInteractions) {
        if (!userItemSet.has(interaction.menuItemId)) {
          const currentScore = scores.get(interaction.menuItemId) || 0;
          let interactionWeight = 0;
          
          switch (interaction.interaction) {
            case 'viewed': interactionWeight = 1; break;
            case 'liked': interactionWeight = 3; break;
            case 'ordered': interactionWeight = 5; break;
            case 'favorited': interactionWeight = 4; break;
          }
          
          scores.set(interaction.menuItemId, currentScore + (similarity * interactionWeight));
        }
      }
    }
    
    return scores;
  }
  
  /**
   * Content-based filtering using user preferences
   */
  private async contentBasedFiltering(
    userPreferences: UserPreference | undefined,
    userInteractions: UserItemInteraction[],
    allMenuItems: MenuItem[]
  ): Promise<Map<number, number>> {
    const scores = new Map<number, number>();
    
    for (const item of allMenuItems) {
      let score = 0;
      
      // Apply user preferences
      if (userPreferences) {
        // Dietary preferences
        if (userPreferences.dietaryPreferences) {
          const prefs = userPreferences.dietaryPreferences as any;
          if (prefs.vegetarian && item.isVegetarian) score += 15;
          if (prefs.glutenFree && item.isGlutenFree) score += 15;
          if (prefs.seafood && item.isSeafood) score += 10;
        }
        
        // Favorite categories
        if (userPreferences.favoriteCategories && 
            Array.isArray(userPreferences.favoriteCategories) &&
            userPreferences.favoriteCategories.includes(item.categoryId)) {
          score += 20;
        }
        
        // Avoid allergens
        if (userPreferences.allergens && item.allergens) {
          const userAllergens = userPreferences.allergens as string[];
          const itemAllergens = item.allergens as string[];
          const hasAllergen = userAllergens.some(allergen => itemAllergens.includes(allergen));
          if (hasAllergen) score -= 100; // Strong penalty for allergens
        }
        
        // Taste preferences (spicy, sweet, etc.)
        if (userPreferences.tastePreferences) {
          const tastePrefs = userPreferences.tastePreferences as any;
          // This would be expanded based on item tags/descriptions
          if (tastePrefs.spicy && item.description?.toLowerCase().includes('spicy')) score += 10;
          if (tastePrefs.sweet && item.description?.toLowerCase().includes('sweet')) score += 10;
        }
      }
      
      // Boost items similar to previously liked items
      const likedItems = userInteractions.filter(i => 
        i.interaction === 'liked' || i.interaction === 'favorited' || i.interaction === 'ordered'
      );
      
      for (const likedInteraction of likedItems) {
        const likedItem = await storage.getMenuItem(likedInteraction.menuItemId);
        if (likedItem && item.id !== likedItem.id) {
          // Same category bonus
          if (item.categoryId === likedItem.categoryId) score += 5;
          
          // Similar price range bonus
          const priceDiff = Math.abs(item.price - likedItem.price);
          if (priceDiff < 5) score += 3;
          
          // Similar dietary properties
          if (item.isVegetarian === likedItem.isVegetarian) score += 2;
          if (item.isGlutenFree === likedItem.isGlutenFree) score += 2;
        }
      }
      
      scores.set(item.id, score);
    }
    
    return scores;
  }
  
  /**
   * Behavior-based recommendations from user patterns
   */
  private async behaviorBasedRecommendations(
    userInteractions: UserItemInteraction[],
    userOrders: Order[],
    allMenuItems: MenuItem[]
  ): Promise<Map<number, number>> {
    const scores = new Map<number, number>();
    
    // Analyze ordering frequency patterns
    const itemFrequency = new Map<number, number>();
    for (const order of userOrders) {
      const orderItems = await storage.getOrderItems(order.id);
      for (const orderItem of orderItems) {
        const current = itemFrequency.get(orderItem.menuItemId) || 0;
        itemFrequency.set(orderItem.menuItemId, current + orderItem.quantity);
      }
    }
    
    // Recommend items from frequently ordered categories
    const categoryFrequency = new Map<number, number>();
    for (const [itemId, frequency] of itemFrequency) {
      const item = await storage.getMenuItem(itemId);
      if (item) {
        const current = categoryFrequency.get(item.categoryId) || 0;
        categoryFrequency.set(item.categoryId, current + frequency);
      }
    }
    
    // Score items based on category preferences
    for (const item of allMenuItems) {
      const categoryScore = categoryFrequency.get(item.categoryId) || 0;
      scores.set(item.id, categoryScore * 2);
    }
    
    // Analyze time-based patterns
    const recentInteractions = userInteractions.filter(i => 
      new Date(i.timestamp).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) // Last 30 days
    );
    
    for (const interaction of recentInteractions) {
      const currentScore = scores.get(interaction.menuItemId) || 0;
      let boost = 0;
      
      switch (interaction.interaction) {
        case 'viewed': boost = 1; break;
        case 'liked': boost = 5; break;
        case 'ordered': boost = 8; break;
        case 'favorited': boost = 6; break;
      }
      
      scores.set(interaction.menuItemId, currentScore + boost);
    }
    
    return scores;
  }
  
  /**
   * Weather-based recommendations
   */
  private async weatherBasedRecommendations(allMenuItems: MenuItem[]): Promise<Map<number, number>> {
    const scores = new Map<number, number>();
    
    // Mock weather data - in production, integrate with weather API
    const mockWeather = {
      temperature: 72, // Fahrenheit
      condition: 'sunny', // sunny, rainy, cold, hot
      season: 'summer'
    };
    
    for (const item of allMenuItems) {
      let score = 0;
      const description = item.description?.toLowerCase() || '';
      const name = item.name.toLowerCase();
      
      // Temperature-based recommendations
      if (mockWeather.temperature > 80) {
        // Hot weather - recommend cold/refreshing items
        if (description.includes('cold') || description.includes('iced') || 
            description.includes('salad') || description.includes('gazpacho')) {
          score += 8;
        }
        if (name.includes('ice cream') || name.includes('smoothie')) score += 10;
      } else if (mockWeather.temperature < 50) {
        // Cold weather - recommend warm/comfort items
        if (description.includes('hot') || description.includes('warm') || 
            description.includes('soup') || description.includes('stew')) {
          score += 8;
        }
        if (name.includes('coffee') || name.includes('tea') || name.includes('hot chocolate')) score += 10;
      }
      
      // Condition-based recommendations
      if (mockWeather.condition === 'rainy') {
        if (description.includes('comfort') || description.includes('hearty') || 
            description.includes('soup') || name.includes('pasta')) {
          score += 6;
        }
      }
      
      scores.set(item.id, score);
    }
    
    return scores;
  }
  
  /**
   * Time-based recommendations
   */
  private async timeBasedRecommendations(allMenuItems: MenuItem[]): Promise<Map<number, number>> {
    const scores = new Map<number, number>();
    const currentHour = new Date().getHours();
    
    for (const item of allMenuItems) {
      let score = 0;
      const name = item.name.toLowerCase();
      const description = item.description?.toLowerCase() || '';
      
      // Breakfast time (6 AM - 11 AM)
      if (currentHour >= 6 && currentHour < 11) {
        if (name.includes('breakfast') || name.includes('coffee') || 
            name.includes('pancake') || name.includes('omelet') ||
            description.includes('morning')) {
          score += 15;
        }
      }
      
      // Lunch time (11 AM - 3 PM)
      else if (currentHour >= 11 && currentHour < 15) {
        if (name.includes('sandwich') || name.includes('salad') || 
            name.includes('soup') || description.includes('lunch')) {
          score += 10;
        }
      }
      
      // Dinner time (5 PM - 10 PM)
      else if (currentHour >= 17 && currentHour < 22) {
        if (item.categoryId === 2 || // Main Course
            name.includes('steak') || name.includes('salmon') ||
            description.includes('dinner')) {
          score += 12;
        }
      }
      
      // Late night (10 PM - 2 AM)
      else if (currentHour >= 22 || currentHour < 2) {
        if (name.includes('appetizer') || name.includes('dessert') ||
            description.includes('light') || description.includes('small')) {
          score += 8;
        }
      }
      
      scores.set(item.id, score);
    }
    
    return scores;
  }
  
  /**
   * Price-optimized recommendations based on user spending patterns
   */
  private async priceOptimizedRecommendations(
    user: User,
    userOrders: Order[],
    allMenuItems: MenuItem[]
  ): Promise<Map<number, number>> {
    const scores = new Map<number, number>();
    
    if (userOrders.length === 0) {
      // New user - recommend mid-range items
      for (const item of allMenuItems) {
        if (item.price >= 15 && item.price <= 25) {
          scores.set(item.id, 5);
        }
      }
      return scores;
    }
    
    // Calculate user's average order value and typical price range
    const averageOrderValue = userOrders.reduce((sum, order) => sum + order.totalPrice, 0) / userOrders.length;
    const typicalItemPrice = averageOrderValue * 0.7; // Assume 70% goes to main items
    
    for (const item of allMenuItems) {
      let score = 0;
      
      // Score based on how close the price is to user's typical range
      const priceDifference = Math.abs(item.price - typicalItemPrice);
      const priceScore = Math.max(0, 10 - (priceDifference / typicalItemPrice) * 10);
      score += priceScore;
      
      // Boost slightly cheaper items to provide value
      if (item.price < typicalItemPrice * 0.8) {
        score += 2;
      }
      
      scores.set(item.id, score);
    }
    
    return scores;
  }
  
  /**
   * Combine multiple scoring algorithms with weights
   */
  private combineScores(
    combinedScores: Map<number, number>, 
    newScores: Map<number, number>, 
    weight: number
  ): void {
    for (const [itemId, score] of newScores) {
      const currentScore = combinedScores.get(itemId) || 0;
      combinedScores.set(itemId, currentScore + (score * weight));
    }
  }
  
  /**
   * Calculate confidence score based on available data
   */
  private calculateConfidence(
    userPreferences: UserPreference | undefined,
    userInteractions: UserItemInteraction[],
    userOrders: Order[]
  ): number {
    let confidence = 0;
    
    // Base confidence from user preferences
    if (userPreferences) {
      confidence += 30;
      if (userPreferences.dietaryPreferences) confidence += 10;
      if (userPreferences.favoriteCategories) confidence += 10;
      if (userPreferences.allergens) confidence += 5;
    }
    
    // Confidence from interaction history
    confidence += Math.min(userInteractions.length * 2, 30);
    
    // Confidence from order history
    confidence += Math.min(userOrders.length * 3, 30);
    
    return Math.min(confidence, 100);
  }
  
  /**
   * Get trending items across all users
   */
  async getTrendingItems(restaurantId: number, timeframe: '24h' | '7d' | '30d' = '7d'): Promise<MenuItem[]> {
    const allMenuItems = await storage.getMenuItems(restaurantId);
    const itemScores = new Map<number, number>();
    
    // Calculate timeframe
    const now = new Date();
    const timeframeMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }[timeframe];
    
    const cutoffTime = new Date(now.getTime() - timeframeMs);
    
    // Analyze interactions for trending calculation
    for (const item of allMenuItems) {
      const interactions = await storage.getMenuItemInteractions(item.id);
      const recentInteractions = interactions.filter(i => new Date(i.timestamp) >= cutoffTime);
      
      let score = 0;
      for (const interaction of recentInteractions) {
        switch (interaction.interaction) {
          case 'viewed': score += 1; break;
          case 'liked': score += 3; break;
          case 'ordered': score += 5; break;
          case 'favorited': score += 4; break;
        }
      }
      
      // Boost score based on recency (more recent = higher score)
      const avgRecency = recentInteractions.reduce((sum, i) => 
        sum + (now.getTime() - new Date(i.timestamp).getTime()), 0) / recentInteractions.length;
      const recencyBoost = Math.max(0, 10 - (avgRecency / timeframeMs) * 10);
      
      itemScores.set(item.id, score + recencyBoost);
    }
    
    // Sort and return top trending items
    return Array.from(itemScores.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, 10)
      .map(([itemId]) => allMenuItems.find(item => item.id === itemId))
      .filter(item => item && item.isAvailable) as MenuItem[];
  }
  
  /**
   * Get recommendations for a specific dietary requirement
   */
  async getDietaryRecommendations(
    restaurantId: number, 
    dietaryType: 'vegetarian' | 'vegan' | 'gluten-free' | 'keto' | 'low-carb'
  ): Promise<MenuItem[]> {
    const allMenuItems = await storage.getMenuItems(restaurantId);
    
    return allMenuItems.filter(item => {
      if (!item.isAvailable) return false;
      
      switch (dietaryType) {
        case 'vegetarian':
          return item.isVegetarian;
        case 'gluten-free':
          return item.isGlutenFree;
        case 'vegan':
          return item.isVegetarian && !this.containsAnimalProducts(item);
        case 'keto':
        case 'low-carb':
          return this.isLowCarb(item);
        default:
          return false;
      }
    }).slice(0, 8);
  }
  
  private containsAnimalProducts(item: MenuItem): boolean {
    const description = item.description?.toLowerCase() || '';
    const name = item.name.toLowerCase();
    
    const animalProducts = ['cheese', 'milk', 'cream', 'butter', 'egg', 'honey', 'dairy'];
    return animalProducts.some(product => 
      description.includes(product) || name.includes(product)
    );
  }
  
  private isLowCarb(item: MenuItem): boolean {
    const description = item.description?.toLowerCase() || '';
    const name = item.name.toLowerCase();
    
    const highCarbFoods = ['pasta', 'bread', 'rice', 'potato', 'pizza', 'sandwich'];
    const lowCarbIndicators = ['salad', 'grilled', 'steak', 'salmon', 'chicken', 'vegetables'];
    
    const hasHighCarbs = highCarbFoods.some(food => 
      description.includes(food) || name.includes(food)
    );
    
    const hasLowCarbIndicators = lowCarbIndicators.some(indicator => 
      description.includes(indicator) || name.includes(indicator)
    );
    
    return !hasHighCarbs && hasLowCarbIndicators;
  }
}

export const aiRecommendationService = new AIRecommendationService();