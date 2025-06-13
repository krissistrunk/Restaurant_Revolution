import {
  User, InsertUser, Restaurant, InsertRestaurant,
  Category, InsertCategory, MenuItem, InsertMenuItem,
  Modifier, InsertModifier, Reservation, InsertReservation,
  Order, InsertOrder, OrderItem, InsertOrderItem,
  LoyaltyReward, InsertLoyaltyReward, Promotion, InsertPromotion,
  Review, InsertReview, QueueEntry, InsertQueueEntry, AiConversation, InsertAiConversation,
  UserPreference, InsertUserPreference, UserItemInteraction, InsertUserItemInteraction,
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
  
  // Review methods
  getReviews(restaurantId: number): Promise<Review[]>;
  getUserReviews(userId: number): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Virtual Queue methods
  getQueueEntries(restaurantId: number): Promise<QueueEntry[]>;
  getQueueEntry(id: number): Promise<QueueEntry | undefined>;
  getUserQueueEntry(userId: number, restaurantId: number): Promise<QueueEntry | undefined>;
  createQueueEntry(entry: InsertQueueEntry): Promise<QueueEntry>;
  updateQueueEntry(id: number, updates: Partial<QueueEntry>): Promise<QueueEntry | undefined>;
  getQueueEstimatedWaitTime(restaurantId: number, partySize: number): Promise<number>;
  
  // AI Assistant methods
  getAiConversations(userId: number): Promise<AiConversation[]>;
  getAiConversation(id: number): Promise<AiConversation | undefined>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  updateAiConversation(id: number, message: any): Promise<AiConversation | undefined>;
  resolveAiConversation(id: number): Promise<AiConversation | undefined>;
  
  // User Preferences methods
  getUserPreference(userId: number): Promise<UserPreference | undefined>;
  createUserPreference(preference: InsertUserPreference): Promise<UserPreference>;
  updateUserPreference(userId: number, updates: Partial<UserPreference>): Promise<UserPreference | undefined>;
  
  // Menu Recommendation methods
  recordUserItemInteraction(interaction: InsertUserItemInteraction): Promise<UserItemInteraction>;
  getUserItemInteractions(userId: number): Promise<UserItemInteraction[]>;
  getMenuItemInteractions(menuItemId: number): Promise<UserItemInteraction[]>;
  getPersonalizedMenuRecommendations(userId: number, restaurantId: number, limit?: number): Promise<MenuItem[]>;
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
  private reviews: Map<number, Review>;
  private queueEntries: Map<number, QueueEntry>;
  private aiConversations: Map<number, AiConversation>;
  private userPreferences: Map<number, UserPreference>;
  private userItemInteractions: Map<number, UserItemInteraction>;
  
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
  private reviewId: number;
  private queueEntryId: number;
  private aiConversationId: number;
  private userPreferenceId: number;
  private userItemInteractionId: number;
  
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
    this.reviews = new Map();
    this.queueEntries = new Map();
    this.aiConversations = new Map();
    this.userPreferences = new Map();
    this.userItemInteractions = new Map();
    
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
    this.reviewId = 1;
    this.queueEntryId = 1;
    this.aiConversationId = 1;
    this.userPreferenceId = 1;
    this.userItemInteractionId = 1;
    
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
        imageUrl: "https://images.unsplash.com/photo-1546241072-48010ad2862c",
        images: [
          "https://images.unsplash.com/photo-1546241072-48010ad2862c",
          "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f"
        ],
        categoryId: 1,
        isAvailable: true,
        isVegetarian: true,
        restaurantId: 1
      },
      {
        name: "Calamari",
        description: "Crispy fried calamari served with marinara sauce",
        price: 14.50,
        imageUrl: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb",
        images: [
          "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb",
          "https://images.unsplash.com/photo-1571162372345-3f5fcfc51b55"
        ],
        categoryId: 1,
        isAvailable: true,
        isSeafood: true,
        restaurantId: 1
      },
      {
        name: "Spinach Artichoke Dip",
        description: "Creamy spinach and artichoke dip with tortilla chips",
        price: 13.99,
        imageUrl: "https://images.unsplash.com/photo-1576072115035-d3694794275a",
        images: [
          "https://images.unsplash.com/photo-1576072115035-d3694794275a",
          "https://images.unsplash.com/photo-1576072115035-d3694794275b"
        ],
        categoryId: 1,
        isAvailable: true,
        isVegetarian: true,
        restaurantId: 1
      },
      {
        name: "Shrimp Cocktail",
        description: "Chilled jumbo shrimp with cocktail sauce",
        price: 16.99,
        imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641",
        images: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641",
          "https://images.unsplash.com/photo-1565557623262-b51c2513a642"
        ],
        categoryId: 1,
        isAvailable: true,
        isSeafood: true,
        restaurantId: 1
      },
      {
        name: "Chicken Wings",
        description: "Choose from buffalo, BBQ, or garlic parmesan",
        price: 15.99,
        imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f",
        images: [
          "https://images.unsplash.com/photo-1567620832903-9fc6debc209f",
          "https://images.unsplash.com/photo-1567620832903-9fc6debc209e"
        ],
        categoryId: 1,
        isAvailable: true,
        restaurantId: 1
      },
      {
        name: "Caprese Salad",
        description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze",
        price: 13.99,
        imageUrl: "https://images.unsplash.com/photo-1580064755419-883acc42900b",
        images: [
          "https://images.unsplash.com/photo-1580064755419-883acc42900b",
          "https://images.unsplash.com/photo-1580064755419-883acc42900c"
        ],
        categoryId: 1,
        isAvailable: true,
        isVegetarian: true,
        restaurantId: 1
      },
      // Main Course
      {
        name: "Ribeye Steak",
        description: "12oz prime ribeye with roasted potatoes and seasonal vegetables",
        price: 32.99,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947",
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947",
          "https://images.unsplash.com/photo-1544025162-d76694265948"
        ],
        categoryId: 2,
        isAvailable: true,
        isGlutenFree: true,
        restaurantId: 1
      },
      {
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with lemon herb butter",
        price: 28.99,
        imageUrl: "https://images.unsplash.com/photo-1485921325833-c519f76c4927",
        images: [
          "https://images.unsplash.com/photo-1485921325833-c519f76c4927",
          "https://images.unsplash.com/photo-1485921325833-c519f76c4928"
        ],
        categoryId: 2,
        isAvailable: true,
        isSeafood: true,
        isGlutenFree: true,
        restaurantId: 1
      },
      {
        name: "Chicken Marsala",
        description: "Pan-seared chicken with mushroom marsala sauce",
        price: 24.99,
        imageUrl: "https://images.unsplash.com/photo-1549572189-dddb1adf739b",
        images: [
          "https://images.unsplash.com/photo-1549572189-dddb1adf739b",
          "https://images.unsplash.com/photo-1549572189-dddb1adf739c"
        ],
        categoryId: 2,
        isAvailable: true,
        restaurantId: 1
      },
      {
        name: "Vegetable Stir Fry",
        description: "Fresh vegetables in garlic sauce with tofu",
        price: 19.99,
        imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19",
        images: [
          "https://images.unsplash.com/photo-1512058564366-18510be2db19",
          "https://images.unsplash.com/photo-1512058564366-18510be2db20"
        ],
        categoryId: 2,
        isAvailable: true,
        isVegetarian: true,
        isGlutenFree: true,
        restaurantId: 1
      },
      // Pasta
      {
        name: "Fettuccine Alfredo",
        description: "Creamy parmesan sauce with fettuccine",
        price: 18.99,
        imageUrl: "https://images.unsplash.com/photo-1645112411341-6c4fd023882c",
        images: [
          "https://images.unsplash.com/photo-1645112411341-6c4fd023882c",
          "https://images.unsplash.com/photo-1645112411341-6c4fd023882d"
        ],
        categoryId: 3,
        isAvailable: true,
        isVegetarian: true,
        restaurantId: 1
      },
      {
        name: "Spaghetti Carbonara",
        description: "Classic carbonara with pancetta and egg",
        price: 19.99,
        imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3",
        images: [
          "https://images.unsplash.com/photo-1612874742237-6526221588e3",
          "https://images.unsplash.com/photo-1612874742237-6526221588e4"
        ],
        categoryId: 3,
        isAvailable: true,
        restaurantId: 1
      },
      {
        name: "Penne Arrabbiata",
        description: "Spicy tomato sauce with garlic and red chili",
        price: 17.99,
        imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8",
        images: [
          "https://images.unsplash.com/photo-1563379926898-05f4575a45d8",
          "https://images.unsplash.com/photo-1563379926898-05f4575a45d9"
        ],
        categoryId: 3,
        isAvailable: true,
        isVegetarian: true,
        restaurantId: 1
      },
      // Pizza
      {
        name: "Margherita Pizza",
        description: "Fresh mozzarella, tomatoes, and basil",
        price: 16.99,
        imageUrl: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca",
        images: [
          "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca",
          "https://images.unsplash.com/photo-1604068549290-dea0e4a305cb"
        ],
        categoryId: 4,
        isAvailable: true,
        isVegetarian: true,
        restaurantId: 1
      },
      {
        name: "Pepperoni Pizza",
        description: "Classic pepperoni with mozzarella",
        price: 17.99,
        imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee",
        images: [
          "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee",
          "https://images.unsplash.com/photo-1534308983496-4fabb1a015ef"
        ],
        categoryId: 4,
        isAvailable: true,
        restaurantId: 1
      },
      {
        name: "Vegetarian Supreme",
        description: "Bell peppers, onions, mushrooms, olives",
        price: 18.99,
        imageUrl: "https://images.unsplash.com/photo-1571066811602-716837d681de",
        images: [
          "https://images.unsplash.com/photo-1571066811602-716837d681de",
          "https://images.unsplash.com/photo-1571066811602-716837d681df"
        ],
        categoryId: 4,
        isAvailable: true,
        isVegetarian: true,
        restaurantId: 1
      },
      // Desserts
      {
        name: "Tiramisu",
        description: "Classic Italian coffee-flavored dessert",
        price: 9.99,
        imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
        images: [
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607ea"
        ],
        categoryId: 5,
        isAvailable: true,
        restaurantId: 1
      },
      {
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center",
        price: 10.99,
        imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c",
        images: [
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476c",
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476d"
        ],
        categoryId: 5,
        isAvailable: true,
        restaurantId: 1
      },
      {
        name: "New York Cheesecake",
        description: "Classic cheesecake with berry compote",
        price: 9.99,
        imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad",
        images: [
          "https://images.unsplash.com/photo-1533134242443-d4fd215305ad",
          "https://images.unsplash.com/photo-1533134242443-d4fd215305ae"
        ],
        categoryId: 5,
        isAvailable: true,
        restaurantId: 1
      },
      // Drinks
      {
        name: "Signature Sangria",
        description: "Red wine sangria with fresh fruit",
        price: 11.99,
        imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc",
        images: [
          "https://images.unsplash.com/photo-1556679343-c7306c1976bc",
          "https://images.unsplash.com/photo-1556679343-c7306c1976bd"
        ],
        categoryId: 6,
        isAvailable: true,
        restaurantId: 1
      },
      {
        name: "Craft Beer Flight",
        description: "Selection of four local craft beers",
        price: 14.99,
        imageUrl: "https://images.unsplash.com/photo-1575367439058-6096bb9cf5e2",
        images: [
          "https://images.unsplash.com/photo-1575367439058-6096bb9cf5e2",
          "https://images.unsplash.com/photo-1575367439058-6096bb9cf5e3"
        ],
        categoryId: 6,
        isAvailable: true,
        restaurantId: 1
      },
      {
        name: "Espresso Martini",
        description: "Vodka, coffee liqueur, fresh espresso",
        price: 12.99,
        imageUrl: "https://images.unsplash.com/photo-1545438102-799c3991ffb2",
        images: [
          "https://images.unsplash.com/photo-1545438102-799c3991ffb2",
          "https://images.unsplash.com/photo-1545438102-799c3991ffb3"
        ],
        categoryId: 6,
        isAvailable: true,
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

  // Review methods
  async getReviews(restaurantId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const now = new Date();
    const newReview: Review = { 
      ...review, 
      id,
      comment: review.comment || null,
      orderId: review.orderId || null,
      createdAt: now,
      updatedAt: now
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  // Virtual Queue methods
  async getQueueEntries(restaurantId: number): Promise<QueueEntry[]> {
    return Array.from(this.queueEntries.values())
      .filter(entry => entry.restaurantId === restaurantId)
      .sort((a, b) => a.position - b.position);
  }
  
  async getQueueEntry(id: number): Promise<QueueEntry | undefined> {
    return this.queueEntries.get(id);
  }

  async getUserQueueEntry(userId: number, restaurantId: number): Promise<QueueEntry | undefined> {
    return Array.from(this.queueEntries.values())
      .find(entry => entry.userId === userId && entry.restaurantId === restaurantId && entry.status !== 'completed');
  }

  async createQueueEntry(entry: InsertQueueEntry): Promise<QueueEntry> {
    const id = this.queueEntryId++;
    
    // Calculate position based on current queue length
    const currentEntries = await this.getQueueEntries(entry.restaurantId);
    const activeEntries = currentEntries.filter(e => e.status === 'waiting' || e.status === 'ready');
    const position = activeEntries.length + 1;
    
    const newEntry: QueueEntry = {
      id,
      userId: entry.userId,
      restaurantId: entry.restaurantId,
      partySize: entry.partySize,
      position,
      status: entry.status || 'waiting',
      estimatedWaitTime: entry.estimatedWaitTime || await this.getQueueEstimatedWaitTime(entry.restaurantId, entry.partySize),
      actualWaitTime: null,
      joinedAt: new Date(),
      notificationSent: false,
      seatedAt: null,
      phone: entry.phone ?? null,
      note: entry.note ?? null,
    };
    
    this.queueEntries.set(id, newEntry);
    return newEntry;
  }

  async updateQueueEntry(id: number, updates: Partial<QueueEntry>): Promise<QueueEntry | undefined> {
    const entry = this.queueEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...updates };
    this.queueEntries.set(id, updatedEntry);
    
    // If status changed to completed, recalculate positions for remaining entries
    if (updates.status === 'completed' && entry.status !== 'completed') {
      const restaurantEntries = await this.getQueueEntries(entry.restaurantId);
      const activeEntries = restaurantEntries
        .filter(e => e.status === 'waiting' || e.status === 'ready')
        .sort((a, b) => a.position - b.position);
      
      // Update positions
      activeEntries.forEach((e, index) => {
        if (e.id !== id) {
          this.queueEntries.set(e.id, { ...e, position: index + 1 });
        }
      });
    }
    
    return updatedEntry;
  }

  async getQueueEstimatedWaitTime(restaurantId: number, partySize: number): Promise<number> {
    // Basic wait time algorithm
    // Larger parties wait longer, and the wait time is proportional to the number of people in the queue
    const currentEntries = await this.getQueueEntries(restaurantId);
    const activeEntries = currentEntries.filter(e => e.status === 'waiting' || e.status === 'ready');
    
    // Base wait time: 5 minutes per person ahead in line
    const baseWaitTime = activeEntries.length * 5;
    
    // Adjust for party size (larger parties wait longer)
    // For every person over 2, add 2 minutes per person
    const partySizeAdjustment = Math.max(0, partySize - 2) * 2;
    
    return baseWaitTime + partySizeAdjustment;
  }

  // AI Assistant methods
  async getAiConversations(userId: number): Promise<AiConversation[]> {
    return Array.from(this.aiConversations.values())
      .filter(convo => convo.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAiConversation(id: number): Promise<AiConversation | undefined> {
    return this.aiConversations.get(id);
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const id = this.aiConversationId++;
    const newConversation: AiConversation = {
      id,
      userId: conversation.userId,
      restaurantId: conversation.restaurantId,
      messages: conversation.messages || [],
      context: conversation.context || null,
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.aiConversations.set(id, newConversation);
    return newConversation;
  }

  async updateAiConversation(id: number, message: any): Promise<AiConversation | undefined> {
    const conversation = this.aiConversations.get(id);
    if (!conversation) return undefined;
    
    const updatedMessages = [...(Array.isArray(conversation.messages) ? conversation.messages : []), message];
    const updatedConversation = { 
      ...conversation, 
      messages: updatedMessages,
      updatedAt: new Date()
    };
    
    this.aiConversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async resolveAiConversation(id: number): Promise<AiConversation | undefined> {
    const conversation = this.aiConversations.get(id);
    if (!conversation) return undefined;
    
    const resolvedConversation = { 
      ...conversation, 
      status: 'resolved',
      updatedAt: new Date()
    };
    
    this.aiConversations.set(id, resolvedConversation);
    return resolvedConversation;
  }

  // User Preferences methods
  async getUserPreference(userId: number): Promise<UserPreference | undefined> {
    return Array.from(this.userPreferences.values())
      .find(pref => pref.userId === userId);
  }

  async createUserPreference(preference: InsertUserPreference): Promise<UserPreference> {
    const id = this.userPreferenceId++;
    const newPreference: UserPreference = {
      ...preference,
      id,
      allergens: preference.allergens || null,
      favoriteCategories: preference.favoriteCategories || null,
      dietaryPreferences: preference.dietaryPreferences || null,
      dislikedItems: preference.dislikedItems || null,
      tastePreferences: preference.tastePreferences || null,
      lastUpdated: new Date()
    };
    
    this.userPreferences.set(id, newPreference);
    return newPreference;
  }

  async updateUserPreference(userId: number, updates: Partial<UserPreference>): Promise<UserPreference | undefined> {
    const preference = Array.from(this.userPreferences.values())
      .find(pref => pref.userId === userId);
    
    if (!preference) return undefined;
    
    const updatedPreference = { 
      ...preference, 
      ...updates,
      updatedAt: new Date()
    };
    
    this.userPreferences.set(preference.id, updatedPreference);
    return updatedPreference;
  }

  // Menu Recommendation methods
  async recordUserItemInteraction(interaction: InsertUserItemInteraction): Promise<UserItemInteraction> {
    const id = this.userItemInteractionId++;
    const newInteraction: UserItemInteraction = {
      ...interaction,
      id,
      rating: interaction.rating || null,
      timestamp: new Date()
    };
    
    this.userItemInteractions.set(id, newInteraction);
    return newInteraction;
  }

  async getUserItemInteractions(userId: number): Promise<UserItemInteraction[]> {
    return Array.from(this.userItemInteractions.values())
      .filter(interaction => interaction.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getMenuItemInteractions(menuItemId: number): Promise<UserItemInteraction[]> {
    return Array.from(this.userItemInteractions.values())
      .filter(interaction => interaction.menuItemId === menuItemId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getPersonalizedMenuRecommendations(userId: number, restaurantId: number, limit: number = 5): Promise<MenuItem[]> {
    // Get user preferences and interactions
    const userPreference = await this.getUserPreference(userId);
    const userInteractions = await this.getUserItemInteractions(userId);
    
    // Get all menu items for the restaurant
    const allItems = await this.getMenuItems(restaurantId);
    
    // No personalization if no preferences or interactions
    if (!userPreference && userInteractions.length === 0) {
      // Return featured or popular items
      const featuredItems = allItems.filter(item => item.isFeatured || item.isPopular);
      return featuredItems.slice(0, limit);
    }
    
    // Apply personalization logic
    const scoredItems = allItems.map(item => {
      let score = 0;
      
      // Boost score based on preferences
      if (userPreference) {
        // Match dietary preferences
        if (userPreference.dietaryPreferences && typeof userPreference.dietaryPreferences === 'object') {
          const dietaryPrefs = userPreference.dietaryPreferences as Record<string, any>;
          if (dietaryPrefs.vegetarian && item.isVegetarian) {
            score += 10;
          }
          if (dietaryPrefs['gluten-free'] && item.isGlutenFree) {
            score += 10;
          }
        }
        
        // Match favorite categories
        if (userPreference.favoriteCategories && Array.isArray(userPreference.favoriteCategories) && 
            userPreference.favoriteCategories.includes(item.categoryId)) {
          score += 15;
        }
        
        // Avoid allergens if specified
        if (userPreference.allergens && Array.isArray(userPreference.allergens) && 
            item.allergens && Array.isArray(item.allergens)) {
          const allergenMatch = userPreference.allergens.some((allergen: any) => 
            (item.allergens as any[])?.includes(allergen)
          );
          if (allergenMatch) {
            score -= 50; // Strong negative score for allergies
          }
        }
      }
      
      // Boost score based on past interactions
      const itemInteractions = userInteractions.filter(i => i.menuItemId === item.id);
      itemInteractions.forEach(interaction => {
        if (interaction.interaction === 'viewed') score += 2;
        if (interaction.interaction === 'liked') score += 10;
        if (interaction.interaction === 'ordered') score += 15;
        if (interaction.interaction === 'favorited') score += 20;
      });
      
      // Boost score for popular and featured items (but less than personalized factors)
      if (item.isPopular) score += 5;
      if (item.isFeatured) score += 5;
      
      return { item, score };
    });
    
    // Sort by score and return top items
    scoredItems.sort((a, b) => b.score - a.score);
    return scoredItems.slice(0, limit).map(scored => scored.item);
  }
}

import { PgStorage } from './pgStorage';

// Use in-memory storage for development when PostgreSQL is not available
export const storage = process.env.DATABASE_URL ? new PgStorage() : new MemStorage();
