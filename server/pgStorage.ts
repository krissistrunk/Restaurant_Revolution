import { db } from './db';
import { IStorage } from './storage';
import { eq, and } from 'drizzle-orm';
import {
  User, InsertUser,
  Restaurant, InsertRestaurant,
  Category, InsertCategory,
  MenuItem, InsertMenuItem,
  Modifier, InsertModifier,
  Reservation, InsertReservation,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  LoyaltyReward, InsertLoyaltyReward,
  Promotion, InsertPromotion,
  QueueEntry, InsertQueueEntry,
  AiConversation, InsertAiConversation,
  UserPreference, InsertUserPreference,
  UserItemInteraction, InsertUserItemInteraction
} from '../shared/schema';
import * as schema from '../shared/schema';

export class PgStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return users[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUserLoyaltyPoints(userId: number, points: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const newPoints = user.loyaltyPoints + points;
    const result = await db
      .update(schema.users)
      .set({ loyaltyPoints: newPoints })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return result[0];
  }

  // Restaurant methods
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const restaurants = await db.select().from(schema.restaurants).where(eq(schema.restaurants.id, id));
    return restaurants[0];
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const result = await db.insert(schema.restaurants).values(restaurant).returning();
    return result[0];
  }

  async updateRestaurant(id: number, restaurant: Partial<Restaurant>): Promise<Restaurant | undefined> {
    const result = await db
      .update(schema.restaurants)
      .set(restaurant)
      .where(eq(schema.restaurants.id, id))
      .returning();
    
    return result[0];
  }

  // Category methods
  async getCategories(restaurantId: number): Promise<Category[]> {
    return db.select().from(schema.categories).where(eq(schema.categories.restaurantId, restaurantId));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const categories = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
    return categories[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(schema.categories).values(category).returning();
    return result[0];
  }

  // MenuItem methods
  async getMenuItems(restaurantId: number, categoryId?: number): Promise<MenuItem[]> {
    if (categoryId) {
      return db.select().from(schema.menuItems).where(
        and(
          eq(schema.menuItems.restaurantId, restaurantId),
          eq(schema.menuItems.categoryId, categoryId)
        )
      );
    }
    return db.select().from(schema.menuItems).where(eq(schema.menuItems.restaurantId, restaurantId));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const menuItems = await db.select().from(schema.menuItems).where(eq(schema.menuItems.id, id));
    const menuItem = menuItems[0];
    
    if (menuItem) {
      // Fetch modifiers for this menu item
      const modifiers = await this.getModifiers(id);
      menuItem.modifiers = modifiers;
    }
    
    return menuItem;
  }

  async getFeaturedMenuItems(restaurantId: number): Promise<MenuItem[]> {
    const menuItems = await db.select().from(schema.menuItems).where(
      and(
        eq(schema.menuItems.restaurantId, restaurantId),
        eq(schema.menuItems.isFeatured, true)
      )
    );

    // Fetch modifiers for each menu item
    for (const menuItem of menuItems) {
      menuItem.modifiers = await this.getModifiers(menuItem.id);
    }
    
    return menuItems;
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const result = await db.insert(schema.menuItems).values(menuItem).returning();
    return result[0];
  }

  // Modifier methods
  async getModifiers(menuItemId: number): Promise<Modifier[]> {
    return db.select().from(schema.modifiers).where(eq(schema.modifiers.menuItemId, menuItemId));
  }

  async createModifier(modifier: InsertModifier): Promise<Modifier> {
    const result = await db.insert(schema.modifiers).values(modifier).returning();
    return result[0];
  }

  // Reservation methods
  async getReservations(restaurantId: number, date?: string): Promise<Reservation[]> {
    if (date) {
      return db.select().from(schema.reservations).where(
        and(
          eq(schema.reservations.restaurantId, restaurantId),
          eq(schema.reservations.date, date)
        )
      );
    }
    return db.select().from(schema.reservations).where(eq(schema.reservations.restaurantId, restaurantId));
  }

  async getUserReservations(userId: number): Promise<Reservation[]> {
    return db.select().from(schema.reservations).where(eq(schema.reservations.userId, userId));
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    const reservations = await db.select().from(schema.reservations).where(eq(schema.reservations.id, id));
    return reservations[0];
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const result = await db.insert(schema.reservations).values(reservation).returning();
    return result[0];
  }

  async updateReservation(id: number, status: string): Promise<Reservation | undefined> {
    const result = await db
      .update(schema.reservations)
      .set({ status })
      .where(eq(schema.reservations.id, id))
      .returning();
    
    return result[0];
  }

  // Order methods
  async getOrders(restaurantId: number): Promise<Order[]> {
    const orders = await db.select().from(schema.orders).where(eq(schema.orders.restaurantId, restaurantId));
    
    // Fetch order items for each order
    for (const order of orders) {
      const items = await this.getOrderItems(order.id);
      order.items = items;
    }
    
    return orders;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    const orders = await db.select().from(schema.orders).where(eq(schema.orders.userId, userId));
    
    // Fetch order items for each order
    for (const order of orders) {
      const items = await this.getOrderItems(order.id);
      order.items = items;
    }
    
    return orders;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const orders = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    const order = orders[0];
    
    if (order) {
      // Fetch order items
      const items = await this.getOrderItems(id);
      order.items = items;
    }
    
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(schema.orders).values(order).returning();
    return result[0];
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const result = await db
      .update(schema.orders)
      .set({ status })
      .where(eq(schema.orders.id, id))
      .returning();
    
    return result[0];
  }

  // OrderItem methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const orderItems = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
    
    // Fetch menuItem details for each order item
    for (const item of orderItems) {
      if (item.menuItemId) {
        const menuItem = await this.getMenuItem(item.menuItemId);
        item.menuItem = menuItem;
      }
    }
    
    return orderItems;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(schema.orderItems).values(orderItem).returning();
    return result[0];
  }

  // LoyaltyReward methods
  async getLoyaltyRewards(restaurantId: number): Promise<LoyaltyReward[]> {
    return db.select().from(schema.loyaltyRewards).where(eq(schema.loyaltyRewards.restaurantId, restaurantId));
  }

  async getLoyaltyReward(id: number): Promise<LoyaltyReward | undefined> {
    const rewards = await db.select().from(schema.loyaltyRewards).where(eq(schema.loyaltyRewards.id, id));
    return rewards[0];
  }

  async createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const result = await db.insert(schema.loyaltyRewards).values(reward).returning();
    return result[0];
  }

  // Promotion methods
  async getPromotions(restaurantId: number): Promise<Promotion[]> {
    return db.select().from(schema.promotions).where(eq(schema.promotions.restaurantId, restaurantId));
  }

  async getPromotion(id: number): Promise<Promotion | undefined> {
    const promotions = await db.select().from(schema.promotions).where(eq(schema.promotions.id, id));
    return promotions[0];
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const result = await db.insert(schema.promotions).values(promotion).returning();
    return result[0];
  }

  // Virtual Queue methods
  async getQueueEntries(restaurantId: number): Promise<QueueEntry[]> {
    return db.select().from(schema.queueEntries).where(eq(schema.queueEntries.restaurantId, restaurantId));
  }
  
  async getQueueEntry(id: number): Promise<QueueEntry | undefined> {
    const entries = await db.select().from(schema.queueEntries).where(eq(schema.queueEntries.id, id));
    return entries[0];
  }

  async getUserQueueEntry(userId: number, restaurantId: number): Promise<QueueEntry | undefined> {
    const entries = await db.select().from(schema.queueEntries).where(
      and(
        eq(schema.queueEntries.userId, userId),
        eq(schema.queueEntries.restaurantId, restaurantId),
        eq(schema.queueEntries.status, 'waiting')
      )
    );
    return entries[0];
  }

  async createQueueEntry(entry: InsertQueueEntry): Promise<QueueEntry> {
    // Get current queue size for position calculation
    const activeEntries = await db.select().from(schema.queueEntries).where(
      and(
        eq(schema.queueEntries.restaurantId, entry.restaurantId),
        eq(schema.queueEntries.status, 'waiting')
      )
    );
    
    // Calculate estimated wait time if not provided
    let estimatedWaitTime = entry.estimatedWaitTime;
    if (!estimatedWaitTime) {
      estimatedWaitTime = await this.getQueueEstimatedWaitTime(entry.restaurantId, entry.partySize);
    }
    
    // Set joined time to now if not provided
    const joinedAt = new Date();
    
    const result = await db.insert(schema.queueEntries).values({
      ...entry,
      estimatedWaitTime,
      joinedAt
    }).returning();
    
    return result[0];
  }

  async updateQueueEntry(id: number, updates: Partial<QueueEntry>): Promise<QueueEntry | undefined> {
    const result = await db
      .update(schema.queueEntries)
      .set(updates)
      .where(eq(schema.queueEntries.id, id))
      .returning();
    
    return result[0];
  }

  async getQueueEstimatedWaitTime(restaurantId: number, partySize: number): Promise<number> {
    // Get number of active parties in queue
    const activeEntries = await db.select().from(schema.queueEntries).where(
      and(
        eq(schema.queueEntries.restaurantId, restaurantId),
        eq(schema.queueEntries.status, 'waiting')
      )
    );
    
    // Base wait time: 5 minutes per party ahead in queue
    const baseWaitTime = activeEntries.length * 5;
    
    // Adjust for party size (larger parties wait longer)
    // Add 2 minutes for each person over 2
    const partySizeAdjustment = Math.max(0, partySize - 2) * 2;
    
    return baseWaitTime + partySizeAdjustment;
  }

  // AI Assistant methods
  async getAiConversations(userId: number): Promise<AiConversation[]> {
    return db.select().from(schema.aiConversations).where(eq(schema.aiConversations.userId, userId));
  }

  async getAiConversation(id: number): Promise<AiConversation | undefined> {
    const conversations = await db.select().from(schema.aiConversations).where(eq(schema.aiConversations.id, id));
    return conversations[0];
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const now = new Date();
    const result = await db.insert(schema.aiConversations).values({
      ...conversation,
      createdAt: now,
      updatedAt: now,
      resolved: false
    }).returning();
    
    return result[0];
  }

  async updateAiConversation(id: number, message: any): Promise<AiConversation | undefined> {
    const conversation = await this.getAiConversation(id);
    if (!conversation) return undefined;
    
    // Update the messages array
    const messages = Array.isArray(conversation.messages) ? [...conversation.messages, message] : [message];
    
    const result = await db
      .update(schema.aiConversations)
      .set({ 
        messages, 
        updatedAt: new Date() 
      })
      .where(eq(schema.aiConversations.id, id))
      .returning();
    
    return result[0];
  }

  async resolveAiConversation(id: number): Promise<AiConversation | undefined> {
    const result = await db
      .update(schema.aiConversations)
      .set({ 
        resolved: true,
        updatedAt: new Date() 
      })
      .where(eq(schema.aiConversations.id, id))
      .returning();
    
    return result[0];
  }

  // User Preferences methods
  async getUserPreference(userId: number): Promise<UserPreference | undefined> {
    const preferences = await db.select().from(schema.userPreferences).where(eq(schema.userPreferences.userId, userId));
    return preferences[0];
  }

  async createUserPreference(preference: InsertUserPreference): Promise<UserPreference> {
    const result = await db.insert(schema.userPreferences).values({
      ...preference,
      lastUpdated: new Date()
    }).returning();
    
    return result[0];
  }

  async updateUserPreference(userId: number, updates: Partial<UserPreference>): Promise<UserPreference | undefined> {
    const result = await db
      .update(schema.userPreferences)
      .set({ 
        ...updates,
        lastUpdated: new Date() 
      })
      .where(eq(schema.userPreferences.userId, userId))
      .returning();
    
    return result[0];
  }

  // Menu Recommendation methods
  async recordUserItemInteraction(interaction: InsertUserItemInteraction): Promise<UserItemInteraction> {
    const result = await db.insert(schema.userItemInteractions).values({
      ...interaction,
      timestamp: new Date()
    }).returning();
    
    return result[0];
  }

  async getUserItemInteractions(userId: number): Promise<UserItemInteraction[]> {
    return db.select().from(schema.userItemInteractions).where(eq(schema.userItemInteractions.userId, userId));
  }

  async getMenuItemInteractions(menuItemId: number): Promise<UserItemInteraction[]> {
    return db.select().from(schema.userItemInteractions).where(eq(schema.userItemInteractions.menuItemId, menuItemId));
  }

  async getPersonalizedMenuRecommendations(userId: number, restaurantId: number, limit: number = 5): Promise<MenuItem[]> {
    // 1. Get user preferences and interactions
    const userPreference = await this.getUserPreference(userId);
    const userInteractions = await this.getUserItemInteractions(userId);
    
    // 2. Get all menu items from the restaurant
    const allMenuItems = await this.getMenuItems(restaurantId);
    
    // If we have no personalization data, return featured items
    if (!userPreference && userInteractions.length === 0) {
      return this.getFeaturedMenuItems(restaurantId);
    }
    
    // 3. Create a scored list of menu items
    const scoredItems = await Promise.all(allMenuItems.map(async (item) => {
      let score = 0;
      
      // 3.1 Score based on user preferences
      if (userPreference) {
        // Match dietary preferences from dietaryPreferences array
        const dietaryPreferences = userPreference.dietaryPreferences || {};
        
        // Check for vegetarian preference
        if (
          Object.keys(dietaryPreferences).includes('vegetarian') &&
          item.isVegetarian
        ) {
          score += 10;
        }
        
        // Check for gluten-free preference
        if (
          Object.keys(dietaryPreferences).includes('glutenFree') &&
          item.isGlutenFree
        ) {
          score += 10;
        }
        
        // Match favorite categories
        const favoriteCategories = userPreference.favoriteCategories || {};
        if (
          Object.keys(favoriteCategories).includes(item.categoryId.toString())
        ) {
          score += 15;
        }
        
        // Avoid allergens
        const allergens = userPreference.allergens || {};
        const itemAllergens = item.allergens || {};
        
        const hasAllergen = Object.keys(allergens).some(allergen => 
          Object.keys(itemAllergens).includes(allergen)
        );
        
        if (hasAllergen) {
          score -= 50; // Strong negative score for allergens
        }
      }
      
      // 3.2 Score based on past interactions
      const itemInteractions = userInteractions.filter(i => i.menuItemId === item.id);
      itemInteractions.forEach(interaction => {
        if (interaction.interaction === 'view') score += 2;
        if (interaction.interaction === 'like') score += 10;
        if (interaction.interaction === 'purchase') score += 15;
        if (interaction.interaction === 'dislike') score -= 20;
      });
      
      // 3.3 Boost score for popular and featured items
      if (item.isPopular) score += 5;
      if (item.isFeatured) score += 5;
      
      // Add modifiers to items
      item.modifiers = await this.getModifiers(item.id);
      
      return { item, score };
    }));
    
    // 4. Sort by score and return top items
    scoredItems.sort((a, b) => b.score - a.score);
    return scoredItems.slice(0, limit).map(scored => scored.item);
  }
}