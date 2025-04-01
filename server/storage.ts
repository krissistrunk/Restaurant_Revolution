import {
  User, InsertUser, Restaurant, InsertRestaurant,
  Category, InsertCategory, MenuItem, InsertMenuItem,
  Modifier, InsertModifier, Reservation, InsertReservation,
  Order, InsertOrder, OrderItem, InsertOrderItem,
  LoyaltyReward, InsertLoyaltyReward, Promotion, InsertPromotion,
  users
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLoyaltyPoints(userId: number, points: number): Promise<User | undefined>;
  
  // Restaurant methods
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: number, restaurant: Partial<Restaurant>): Promise<Restaurant | undefined>;
  
  // Category methods
  getCategories(restaurantId: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // MenuItem methods
  getMenuItems(restaurantId: number, categoryId?: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getFeaturedMenuItems(restaurantId: number): Promise<MenuItem[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  
  // Modifier methods
  getModifiers(menuItemId: number): Promise<Modifier[]>;
  createModifier(modifier: InsertModifier): Promise<Modifier>;
  
  // Reservation methods
  getReservations(restaurantId: number, date?: string): Promise<Reservation[]>;
  getUserReservations(userId: number): Promise<Reservation[]>;
  getReservation(id: number): Promise<Reservation | undefined>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, status: string): Promise<Reservation | undefined>;
  
  // Order methods
  getOrders(restaurantId: number): Promise<Order[]>;
  getUserOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // OrderItem methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // LoyaltyReward methods
  getLoyaltyRewards(restaurantId: number): Promise<LoyaltyReward[]>;
  getLoyaltyReward(id: number): Promise<LoyaltyReward | undefined>;
  createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward>;
  
  // Promotion methods
  getPromotions(restaurantId: number): Promise<Promotion[]>;
  getPromotion(id: number): Promise<Promotion | undefined>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private restaurants: Map<number, Restaurant>;
  private categories: Map<number, Category>;
  private menuItems: Map<number, MenuItem>;
  private modifiers: Map<number, Modifier>;
  private reservations: Map<number, Reservation>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private loyaltyRewards: Map<number, LoyaltyReward>;
  private promotions: Map<number, Promotion>;
  
  private userId: number;
  private restaurantId: number;
  private categoryId: number;
  private menuItemId: number;
  private modifierId: number;
  private reservationId: number;
  private orderId: number;
  private orderItemId: number;
  private loyaltyRewardId: number;
  private promotionId: number;
  
  constructor() {
    this.users = new Map();
    this.restaurants = new Map();
    this.categories = new Map();
    this.menuItems = new Map();
    this.modifiers = new Map();
    this.reservations = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.loyaltyRewards = new Map();
    this.promotions = new Map();
    
    this.userId = 1;
    this.restaurantId = 1;
    this.categoryId = 1;
    this.menuItemId = 1;
    this.modifierId = 1;
    this.reservationId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.loyaltyRewardId = 1;
    this.promotionId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  // Initialize with sample restaurant data
  private initializeData() {
    // Create default restaurant
    const restaurant: InsertRestaurant = {
      name: "Bistro 23",
      description: "A modern restaurant with a focus on fresh, local ingredients",
      address: "123 Main St, Anytown, USA",
      phone: "555-123-4567",
      email: "info@bistro23.com",
      logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
      openingHours: {
        monday: "11:00 AM - 10:00 PM",
        tuesday: "11:00 AM - 10:00 PM",
        wednesday: "11:00 AM - 10:00 PM",
        thursday: "11:00 AM - 10:00 PM",
        friday: "11:00 AM - 11:00 PM",
        saturday: "10:00 AM - 11:00 PM",
        sunday: "10:00 AM - 9:00 PM"
      },
      latitude: 40.7128,
      longitude: -74.0060
    };
    this.createRestaurant(restaurant);
    
    // Create categories
    const categories = [
      { name: "Appetizers", displayOrder: 1, restaurantId: 1 },
      { name: "Main Course", displayOrder: 2, restaurantId: 1 },
      { name: "Pasta", displayOrder: 3, restaurantId: 1 },
      { name: "Pizza", displayOrder: 4, restaurantId: 1 },
      { name: "Desserts", displayOrder: 5, restaurantId: 1 },
      { name: "Drinks", displayOrder: 6, restaurantId: 1 }
    ];
    
    categories.forEach(category => this.createCategory(category));
    
    // Create menu items
    const menuItems = [
      // Appetizers
      {
        name: "Bruschetta",
        description: "Toasted bread topped with tomatoes, fresh basil, and garlic",
        price: 12.99,
        imageUrl: "https://images.unsplash.com/photo-1546241072-48010ad2862c?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
        categoryId: 1,
        isAvailable: true,
        isVegetarian: true,
        restaurantId: 1
      },
      {
        name: "Calamari",
        description: "Crispy fried calamari served with marinara sauce",
        price: 14.50,
        imageUrl: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
        categoryId: 1,
        isAvailable: true,
        isSeafood: true,
        restaurantId: 1
      },
      // Main Course
      {
        name: "Ribeye Steak",
        description: "12oz prime ribeye with roasted potatoes and seasonal vegetables",
        price: 32.99,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
        categoryId: 2,
        isAvailable: true,
        isGlutenFree: true,
        restaurantId: 1
      },
      {
        name: "Chicken Parmesan",
        description: "Breaded chicken breast with marinara sauce and melted mozzarella",
        price: 24.50,
        imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
        categoryId: 2,
        isAvailable: true,
        isPopular: true,
        restaurantId: 1
      },
      {
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with lemon herb butter and asparagus",
        price: 26.99,
        imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
        categoryId: 2,
        isAvailable: true,
        isSeafood: true,
        isGlutenFree: true,
        isFeatured: true,
        restaurantId: 1
      },
      // Pasta
      {
        name: "Weekend Special",
        description: "Chef's special pasta with truffle oil",
        price: 22.99,
        imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80",
        categoryId: 3,
        isAvailable: true,
        isFeatured: true,
        restaurantId: 1
      },
      // Pizza
      {
        name: "Margherita Pizza",
        description: "Fresh mozzarella, tomatoes, and basil",
        price: 18.50,
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80",
        categoryId: 4,
        isAvailable: true,
        isVegetarian: true,
        isFeatured: true,
        restaurantId: 1
      },
      // Desserts
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with layers of coffee-soaked ladyfingers",
        price: 8.99,
        imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
        categoryId: 5,
        isAvailable: true,
        isPopular: true,
        isVegetarian: true,
        restaurantId: 1
      },
      {
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
        price: 9.50,
        imageUrl: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
        categoryId: 5,
        isAvailable: true,
        isVegetarian: true,
        restaurantId: 1
      }
    ];
    
    menuItems.forEach(menuItem => this.createMenuItem(menuItem));
    
    // Create loyalty rewards
    const loyaltyRewards = [
      {
        name: "Free Appetizer",
        description: "Enjoy a free appetizer with your meal",
        pointsRequired: 100,
        isActive: true,
        restaurantId: 1
      },
      {
        name: "Free Dessert",
        description: "Enjoy a free dessert with your meal",
        pointsRequired: 150,
        isActive: true,
        restaurantId: 1
      },
      {
        name: "10% Off Your Order",
        description: "10% discount on your entire order",
        pointsRequired: 200,
        isActive: true,
        restaurantId: 1
      },
      {
        name: "Free Entrée",
        description: "Enjoy a free entrée (up to $25)",
        pointsRequired: 500,
        isActive: true,
        restaurantId: 1
      }
    ];
    
    loyaltyRewards.forEach(reward => this.createLoyaltyReward(reward));
    
    // Add promotions
    const promotions = [
      {
        name: "Summer Special",
        description: "Get 20% off your entire order",
        discountType: "percentage",
        discountValue: 20,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-08-31"),
        code: "SUMMER25",
        isActive: true,
        restaurantId: 1
      },
      {
        name: "Happy Hour",
        description: "Buy one get one free on appetizers",
        discountType: "bogo",
        discountValue: 100,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        code: "HAPPYHOUR",
        isActive: true,
        restaurantId: 1
      }
    ];
    
    promotions.forEach(promotion => this.createPromotion(promotion));
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      ...user, 
      id, 
      loyaltyPoints: 0,
      phone: user.phone || null,
      dietaryPreferences: user.dietaryPreferences || null
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUserLoyaltyPoints(userId: number, points: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, loyaltyPoints: user.loyaltyPoints + points };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }
  
  // Restaurant methods
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }
  
  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.restaurantId++;
    const newRestaurant: Restaurant = { 
      ...restaurant, 
      id,
      email: restaurant.email || null,
      description: restaurant.description || null,
      logoUrl: restaurant.logoUrl || null,
      openingHours: restaurant.openingHours || null,
      latitude: restaurant.latitude || null,
      longitude: restaurant.longitude || null
    };
    this.restaurants.set(id, newRestaurant);
    return newRestaurant;
  }
  
  async updateRestaurant(id: number, restaurant: Partial<Restaurant>): Promise<Restaurant | undefined> {
    const existingRestaurant = await this.getRestaurant(id);
    if (existingRestaurant) {
      const updatedRestaurant = { ...existingRestaurant, ...restaurant };
      this.restaurants.set(id, updatedRestaurant);
      return updatedRestaurant;
    }
    return undefined;
  }
  
  // Category methods
  async getCategories(restaurantId: number): Promise<Category[]> {
    return Array.from(this.categories.values())
      .filter(category => category.restaurantId === restaurantId)
      .sort((a, b) => {
        // Handle null display orders, treating null as the highest value
        const orderA = a.displayOrder === null ? Number.MAX_SAFE_INTEGER : a.displayOrder;
        const orderB = b.displayOrder === null ? Number.MAX_SAFE_INTEGER : b.displayOrder;
        return orderA - orderB;
      });
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { 
      ...category, 
      id,
      displayOrder: category.displayOrder || null 
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // MenuItem methods
  async getMenuItems(restaurantId: number, categoryId?: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(item => 
        item.restaurantId === restaurantId && 
        (categoryId ? item.categoryId === categoryId : true)
      );
  }
  
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }
  
  async getFeaturedMenuItems(restaurantId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(item => item.restaurantId === restaurantId && item.isFeatured);
  }
  
  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.menuItemId++;
    const newMenuItem: MenuItem = { 
      ...menuItem, 
      id,
      description: menuItem.description || null,
      imageUrl: menuItem.imageUrl || null,
      isAvailable: menuItem.isAvailable ?? true,
      isPopular: menuItem.isPopular ?? false,
      isFeatured: menuItem.isFeatured ?? false,
      isVegetarian: menuItem.isVegetarian ?? false,
      isGlutenFree: menuItem.isGlutenFree ?? false,
      isSeafood: menuItem.isSeafood ?? false,
      nutritionInfo: menuItem.nutritionInfo || null,
      allergens: menuItem.allergens || null,
      modifiers: []
    };
    this.menuItems.set(id, newMenuItem);
    return newMenuItem;
  }
  
  // Modifier methods
  async getModifiers(menuItemId: number): Promise<Modifier[]> {
    return Array.from(this.modifiers.values())
      .filter(modifier => modifier.menuItemId === menuItemId);
  }
  
  async createModifier(modifier: InsertModifier): Promise<Modifier> {
    const id = this.modifierId++;
    const newModifier: Modifier = { 
      ...modifier, 
      id,
      price: modifier.price || null
    };
    this.modifiers.set(id, newModifier);
    return newModifier;
  }
  
  // Reservation methods
  async getReservations(restaurantId: number, date?: string): Promise<Reservation[]> {
    return Array.from(this.reservations.values())
      .filter(reservation => 
        reservation.restaurantId === restaurantId && 
        (date ? reservation.date.toString() === date : true)
      );
  }
  
  async getUserReservations(userId: number): Promise<Reservation[]> {
    return Array.from(this.reservations.values())
      .filter(reservation => reservation.userId === userId);
  }
  
  async getReservation(id: number): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }
  
  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const id = this.reservationId++;
    const newReservation: Reservation = { 
      ...reservation, 
      id,
      status: reservation.status || 'pending',
      notes: reservation.notes || null,
      createdAt: new Date()
    };
    this.reservations.set(id, newReservation);
    return newReservation;
  }
  
  async updateReservation(id: number, status: string): Promise<Reservation | undefined> {
    const reservation = await this.getReservation(id);
    if (reservation) {
      const updatedReservation = { ...reservation, status };
      this.reservations.set(id, updatedReservation);
      return updatedReservation;
    }
    return undefined;
  }
  
  // Order methods
  async getOrders(restaurantId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.restaurantId === restaurantId);
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId);
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id,
      status: order.status || 'pending',
      pickupTime: order.pickupTime || null,
      orderDate: new Date(),
      items: []
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (order) {
      const updatedOrder = { ...order, status };
      this.orders.set(id, updatedOrder);
      return updatedOrder;
    }
    return undefined;
  }
  
  // OrderItem methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { 
      ...orderItem, 
      id,
      notes: orderItem.notes || null,
      quantity: orderItem.quantity || 1,
      modifiers: orderItem.modifiers || null
    };
    this.orderItems.set(id, newOrderItem);
    
    // Add this order item to the order's items array
    const order = await this.getOrder(orderItem.orderId);
    if (order && order.items) {
      order.items.push(newOrderItem);
      this.orders.set(order.id, order);
    }
    
    return newOrderItem;
  }
  
  // LoyaltyReward methods
  async getLoyaltyRewards(restaurantId: number): Promise<LoyaltyReward[]> {
    return Array.from(this.loyaltyRewards.values())
      .filter(reward => reward.restaurantId === restaurantId && reward.isActive);
  }
  
  async getLoyaltyReward(id: number): Promise<LoyaltyReward | undefined> {
    return this.loyaltyRewards.get(id);
  }
  
  async createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const id = this.loyaltyRewardId++;
    const newReward: LoyaltyReward = { 
      ...reward, 
      id,
      description: reward.description || null,
      isActive: reward.isActive ?? true
    };
    this.loyaltyRewards.set(id, newReward);
    return newReward;
  }
  
  // Promotion methods
  async getPromotions(restaurantId: number): Promise<Promotion[]> {
    const now = new Date();
    return Array.from(this.promotions.values())
      .filter(promotion => 
        promotion.restaurantId === restaurantId &&
        new Date(promotion.startDate) <= now &&
        new Date(promotion.endDate) >= now
      );
  }
  
  async getPromotion(id: number): Promise<Promotion | undefined> {
    return this.promotions.get(id);
  }
  
  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const id = this.promotionId++;
    const newPromotion: Promotion = { 
      ...promotion, 
      id,
      code: promotion.code || null,
      description: promotion.description || null,
      isActive: promotion.isActive ?? true
    };
    this.promotions.set(id, newPromotion);
    return newPromotion;
  }
}

import { PgStorage } from './pgStorage';

// Use PostgreSQL storage implementation for database persistence
export const storage = new PgStorage();
