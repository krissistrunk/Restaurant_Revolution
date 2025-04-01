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
  Promotion, InsertPromotion
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
}