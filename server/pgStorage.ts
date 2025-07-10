import { db } from './db';
import { IStorage } from './storage';
import { eq, and, desc, sql } from 'drizzle-orm';
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
  UserItemInteraction, InsertUserItemInteraction,
  Review, InsertReview
} from '../shared/schema';
import * as schema from '../shared/schema';

export class PgStorage implements IStorage {
  private db = db;
  
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
      return { ...menuItem, modifiers };
    }
    
    return menuItem;
  }

  async getFeaturedMenuItems(restaurantId: number): Promise<MenuItem[]> {
    const result = await db
      .select({
        id: schema.menuItems.id,
        name: schema.menuItems.name,
        description: schema.menuItems.description,
        price: schema.menuItems.price,
        categoryId: schema.menuItems.categoryId,
        restaurantId: schema.menuItems.restaurantId,
        imageUrl: schema.menuItems.imageUrl,
        isAvailable: schema.menuItems.isAvailable,
        isFeatured: schema.menuItems.isFeatured,
        isVegetarian: schema.menuItems.isVegetarian,
        isGlutenFree: schema.menuItems.isGlutenFree,
        isSeafood: schema.menuItems.isSeafood,
        isPopular: schema.menuItems.isPopular,
        allergens: schema.menuItems.allergens,
        nutritionInfo: schema.menuItems.nutritionInfo,
        // Modifier fields (nullable)
        modifierId: schema.modifiers.id,
        modifierName: schema.modifiers.name,
        modifierPrice: schema.modifiers.price,
      })
      .from(schema.menuItems)
      .leftJoin(schema.modifiers, eq(schema.menuItems.id, schema.modifiers.menuItemId))
      .where(
        and(
          eq(schema.menuItems.restaurantId, restaurantId),
          eq(schema.menuItems.isFeatured, true)
        )
      );

    const menuItemsMap = new Map<number, MenuItem>();
    
    for (const row of result) {
      if (!menuItemsMap.has(row.id)) {
        menuItemsMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          categoryId: row.categoryId,
          restaurantId: row.restaurantId,
          imageUrl: row.imageUrl,
          isAvailable: row.isAvailable,
          isFeatured: row.isFeatured,
          isVegetarian: row.isVegetarian,
          isGlutenFree: row.isGlutenFree,
          isSeafood: row.isSeafood,
          isPopular: row.isPopular,
          allergens: row.allergens,
          nutritionInfo: row.nutritionInfo,
          modifiers: []
        });
      }
      
      // Add modifier if it exists
      if (row.modifierId) {
        menuItemsMap.get(row.id)!.modifiers!.push({
          id: row.modifierId,
          name: row.modifierName || '',
          price: row.modifierPrice || 0,
          menuItemId: row.id
        });
      }
    }
    
    return Array.from(menuItemsMap.values());
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
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await this.getOrderItems(order.id);
        return { ...order, items };
      })
    );
    
    return ordersWithItems;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    const orders = await db.select().from(schema.orders).where(eq(schema.orders.userId, userId));
    
    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await this.getOrderItems(order.id);
        return { ...order, items };
      })
    );
    
    return ordersWithItems;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const orders = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    const order = orders[0];
    
    if (order) {
      // Fetch order items
      const items = await this.getOrderItems(id);
      return { ...order, items };
    }
    
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(schema.orders).values(order).returning();
    return result[0];
  }

  // Removed duplicate method - enhanced version exists below

  // OrderItem methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const orderItems = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
    
    // Fetch menuItem details for each order item
    const orderItemsWithMenuItems = await Promise.all(
      orderItems.map(async (item) => {
        if (item.menuItemId) {
          const menuItem = await this.getMenuItem(item.menuItemId);
          return { ...item, menuItem };
        }
        return item;
      })
    );
    
    return orderItemsWithMenuItems;
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
    const activeEntriesCount = await db.select().from(schema.queueEntries).where(
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
    
    const position = activeEntriesCount.length + 1;
    
    const result = await db.insert(schema.queueEntries).values({
      ...entry,
      position,
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

  // Review methods
  async getReviews(restaurantId: number): Promise<Review[]> {
    return await this.db.select().from(schema.reviews).where(eq(schema.reviews.restaurantId, restaurantId));
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return await this.db.select().from(schema.reviews).where(eq(schema.reviews.userId, userId));
  }

  async getReview(id: number): Promise<Review | undefined> {
    const result = await this.db.select().from(schema.reviews).where(eq(schema.reviews.id, id)).limit(1);
    return result[0];
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await this.db.insert(schema.reviews).values(review).returning();
    return result[0];
  }

  // Missing methods from IStorage interface
  async updateCategory(id: number, updates: Partial<Category>): Promise<Category | undefined> {
    const result = await this.db
      .update(schema.categories)
      .set(updates)
      .where(eq(schema.categories.id, id))
      .returning();
    
    return result[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await this.db
      .delete(schema.categories)
      .where(eq(schema.categories.id, id));
    
    return result.rowCount > 0;
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const result = await this.db
      .update(schema.menuItems)
      .set(updates)
      .where(eq(schema.menuItems.id, id))
      .returning();
    
    return result[0];
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    const result = await this.db
      .delete(schema.menuItems)
      .where(eq(schema.menuItems.id, id));
    
    return result.rowCount > 0;
  }

  async getModifier(id: number): Promise<Modifier | undefined> {
    const modifiers = await this.db.select().from(schema.modifiers).where(eq(schema.modifiers.id, id));
    return modifiers[0];
  }

  async getRestaurantOrders(restaurantId: number): Promise<Order[]> {
    return this.getOrders(restaurantId);
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const result = await this.db
      .update(schema.orders)
      .set(updates)
      .where(eq(schema.orders.id, id))
      .returning();
    
    return result[0];
  }

  async updateOrderStatus(id: number, status: string, estimatedReadyTime?: string, notes?: string): Promise<Order | undefined> {
    const updates: any = { status };
    if (estimatedReadyTime) updates.estimatedReadyTime = new Date(estimatedReadyTime);
    if (notes) updates.notes = notes;
    
    return this.updateOrder(id, updates);
  }

  async updateUserLastLogin(userId: number): Promise<User | undefined> {
    const result = await this.db
      .update(schema.users)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return result[0];
  }

  async updateUserPassword(userId: number, password: string): Promise<User | undefined> {
    const result = await this.db
      .update(schema.users)
      .set({ password })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return result[0];
  }

  async updateUserEmailVerification(userId: number, verified: boolean): Promise<User | undefined> {
    const result = await this.db
      .update(schema.users)
      .set({ emailVerified: verified })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return result[0];
  }

  async updateUserProfile(userId: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await this.db
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, userId))
      .returning();
    
    return result[0];
  }

  async getAllUsers(page: number = 1, limit: number = 20, filters?: any): Promise<{ users: User[]; total: number }> {
    // Get total count
    let totalQuery = this.db.select({ count: sql`count(*)` }).from(schema.users);
    
    // Apply filters to count query
    if (filters) {
      if (filters.role) {
        totalQuery = totalQuery.where(eq(schema.users.role, filters.role));
      }
      if (filters.emailVerified !== undefined) {
        totalQuery = totalQuery.where(eq(schema.users.emailVerified, filters.emailVerified));
      }
      if (filters.restaurantId) {
        totalQuery = totalQuery.where(eq(schema.users.restaurantId, filters.restaurantId));
      }
    }
    
    const totalResult = await totalQuery;
    const total = Number(totalResult[0]?.count || 0);

    // Get paginated results
    let usersQuery = this.db.select().from(schema.users);
    
    // Apply same filters to data query
    if (filters) {
      if (filters.role) {
        usersQuery = usersQuery.where(eq(schema.users.role, filters.role));
      }
      if (filters.emailVerified !== undefined) {
        usersQuery = usersQuery.where(eq(schema.users.emailVerified, filters.emailVerified));
      }
      if (filters.restaurantId) {
        usersQuery = usersQuery.where(eq(schema.users.restaurantId, filters.restaurantId));
      }
    }
    
    const offset = (page - 1) * limit;
    const users = await usersQuery
      .orderBy(desc(schema.users.createdAt))
      .limit(limit)
      .offset(offset);

    return { users, total };
  }
}
