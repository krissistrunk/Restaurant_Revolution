import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull().default("customer"), // customer, owner, admin
  restaurantId: integer("restaurant_id"), // only for owners
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
  dietaryPreferences: jsonb("dietary_preferences"),
  emailVerified: boolean("email_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  loyaltyPoints: true,
});

// Restaurant Schema
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  logoUrl: text("logo_url"),
  openingHours: jsonb("opening_hours"),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
});

// Menu Category Schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayOrder: integer("display_order").default(0),
  restaurantId: integer("restaurant_id").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Menu Item Schema
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").notNull(),
  isAvailable: boolean("is_available").default(true),
  isPopular: boolean("is_popular").default(false),
  isFeatured: boolean("is_featured").default(false),
  isVegetarian: boolean("is_vegetarian").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
  isSeafood: boolean("is_seafood").default(false),
  nutritionInfo: jsonb("nutrition_info"),
  allergens: jsonb("allergens"),
  restaurantId: integer("restaurant_id").notNull(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

// Modifier Schema
export const modifiers = pgTable("modifiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: real("price").default(0),
  menuItemId: integer("menu_item_id").notNull(),
});

export const insertModifierSchema = createInsertSchema(modifiers).omit({
  id: true,
});

// Reservation Schema
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  time: time("time").notNull(),
  partySize: integer("party_size").notNull(),
  status: text("status").default("confirmed"),
  notes: text("notes"),
  specialOccasion: text("special_occasion"),
  seatingPreference: text("seating_preference"),
  restaurantId: integer("restaurant_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
});

// Order Schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").default("pending"),
  totalPrice: real("total_price").notNull(),
  pickupTime: timestamp("pickup_time"),
  restaurantId: integer("restaurant_id").notNull(),
  orderDate: timestamp("order_date").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderDate: true,
});

// Order Item Schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  price: real("price").notNull(),
  notes: text("notes"),
  modifiers: jsonb("modifiers"),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Loyalty Reward Schema
export const loyaltyRewards = pgTable("loyalty_rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  pointsRequired: integer("points_required").notNull(),
  isActive: boolean("is_active").default(true),
  restaurantId: integer("restaurant_id").notNull(),
});

export const insertLoyaltyRewardSchema = createInsertSchema(loyaltyRewards).omit({
  id: true,
});

// Promotion Schema
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(),
  discountValue: real("discount_value").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  code: text("code"),
  isActive: boolean("is_active").default(true),
  restaurantId: integer("restaurant_id").notNull(),
});

// Virtual Queue Schema
export const queueEntries = pgTable("queue_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  partySize: integer("party_size").notNull(),
  status: text("status").default("waiting").notNull(), // waiting, seated, cancelled, called, no_show
  position: integer("position").notNull(),
  estimatedWaitTime: integer("estimated_wait_time").notNull(), // in minutes
  actualWaitTime: integer("actual_wait_time"), // in minutes
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  notificationSent: boolean("notification_sent").default(false),
  seatedAt: timestamp("seated_at"),
  phone: text("phone"),
  note: text("note"),
  seatingPreference: text("seating_preference"), // booth, window, bar, outdoor
  specialRequests: text("special_requests"),
  smsNotifications: boolean("sms_notifications").default(true),
  lastNotificationSent: timestamp("last_notification_sent"),
});

// Review Schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  orderId: integer("order_id"),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// AI Assistant Conversations Schema
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  messages: jsonb("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  context: jsonb("context"), // Context like order ID, menu items, etc.
  resolved: boolean("resolved").default(false),
});

// User Preferences for Personalized Recommendations
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  dietaryPreferences: jsonb("dietary_preferences"),
  favoriteCategories: jsonb("favorite_categories"),
  dislikedItems: jsonb("disliked_items"),
  allergens: jsonb("allergens"),
  tastePreferences: jsonb("taste_preferences"), // spicy, sweet, savory, etc.
  seatingPreferences: jsonb("seating_preferences"), // booth, window, quiet, outdoor
  specialOccasions: jsonb("special_occasions"), // birthday, anniversary with dates
  visitHistory: jsonb("visit_history"), // frequency, last visit, favorite times
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Table for storing user item interactions for recommendations
export const userItemInteractions = pgTable("user_item_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  interaction: text("interaction").notNull(), // viewed, ordered, liked, favorited
  rating: integer("rating"), // 1-5 stars if provided
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Guest Visit History Tracking
export const guestVisits = pgTable("guest_visits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  visitDate: timestamp("visit_date").defaultNow().notNull(),
  partySize: integer("party_size").notNull(),
  totalSpent: real("total_spent"),
  tableSection: text("table_section"), // main dining, bar, patio, private
  specialOccasion: text("special_occasion"), // birthday, anniversary, date night
  satisfactionRating: integer("satisfaction_rating"), // 1-5 stars
  waitTime: integer("wait_time"), // actual wait time in minutes
  notes: text("notes"), // staff notes about the visit
  orderId: integer("order_id"), // link to order if applicable
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
});

// Insert schemas for new tables
export const insertQueueEntrySchema = createInsertSchema(queueEntries).omit({
  id: true,
  joinedAt: true,
  seatedAt: true,
  actualWaitTime: true,
  notificationSent: true,
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolved: true,
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
  id: true,
  lastUpdated: true,
});

export const insertUserItemInteractionSchema = createInsertSchema(userItemInteractions).omit({
  id: true,
  timestamp: true,
});

export const insertGuestVisitSchema = createInsertSchema(guestVisits).omit({
  id: true,
  visitDate: true,
});

// QR Redemption Tracking Schema
export const qrRedemptions = pgTable("qr_redemptions", {
  id: serial("id").primaryKey(),
  qrCodeValue: text("qr_code_value").notNull().unique(),
  qrType: text("qr_type").notNull(), // loyalty, discount, lightning, tier
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id"), // for loyalty rewards
  promotionId: integer("promotion_id"), // for promotions/discounts
  discountAmount: real("discount_amount"), // for discount coupons
  discountType: text("discount_type"), // percentage, fixed
  expiresAt: timestamp("expires_at").notNull(),
  redeemedAt: timestamp("redeemed_at"),
  redeemedBy: integer("redeemed_by"), // staff user ID who processed redemption
  status: text("status").default("active").notNull(), // active, redeemed, expired
  restaurantId: integer("restaurant_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata"), // additional data for different QR types
});

export const insertQrRedemptionSchema = createInsertSchema(qrRedemptions).omit({
  id: true,
  createdAt: true,
  redeemedAt: true,
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  restaurant: one(restaurants, {
    fields: [users.restaurantId],
    references: [restaurants.id]
  }),
  reservations: many(reservations),
  orders: many(orders),
  reviews: many(reviews),
  queueEntries: many(queueEntries),
  aiConversations: many(aiConversations),
  preferences: one(userPreferences),
  itemInteractions: many(userItemInteractions),
  qrRedemptions: many(qrRedemptions),
  visits: many(guestVisits)
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  categories: many(categories),
  menuItems: many(menuItems),
  reservations: many(reservations),
  orders: many(orders),
  reviews: many(reviews),
  loyaltyRewards: many(loyaltyRewards),
  promotions: many(promotions),
  queueEntries: many(queueEntries),
  aiConversations: many(aiConversations),
  qrRedemptions: many(qrRedemptions),
  guestVisits: many(guestVisits)
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [categories.restaurantId],
    references: [restaurants.id]
  }),
  menuItems: many(menuItems)
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id]
  }),
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id]
  }),
  modifiers: many(modifiers),
  orderItems: many(orderItems),
  userInteractions: many(userItemInteractions)
}));

export const modifiersRelations = relations(modifiers, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [modifiers.menuItemId],
    references: [menuItems.id]
  })
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id]
  }),
  restaurant: one(restaurants, {
    fields: [reservations.restaurantId],
    references: [restaurants.id]
  })
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id]
  }),
  orderItems: many(orderItems)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id]
  })
}));

export const loyaltyRewardsRelations = relations(loyaltyRewards, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [loyaltyRewards.restaurantId],
    references: [restaurants.id]
  }),
  qrRedemptions: many(qrRedemptions)
}));

export const promotionsRelations = relations(promotions, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [promotions.restaurantId],
    references: [restaurants.id]
  }),
  qrRedemptions: many(qrRedemptions)
}));

export const queueEntriesRelations = relations(queueEntries, ({ one }) => ({
  user: one(users, {
    fields: [queueEntries.userId],
    references: [users.id]
  }),
  restaurant: one(restaurants, {
    fields: [queueEntries.restaurantId],
    references: [restaurants.id]
  })
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  }),
  restaurant: one(restaurants, {
    fields: [reviews.restaurantId],
    references: [restaurants.id]
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id]
  })
}));

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id]
  }),
  restaurant: one(restaurants, {
    fields: [aiConversations.restaurantId],
    references: [restaurants.id]
  })
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id]
  })
}));

export const userItemInteractionsRelations = relations(userItemInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userItemInteractions.userId],
    references: [users.id]
  }),
  menuItem: one(menuItems, {
    fields: [userItemInteractions.menuItemId],
    references: [menuItems.id]
  })
}));

export const qrRedemptionsRelations = relations(qrRedemptions, ({ one }) => ({
  user: one(users, {
    fields: [qrRedemptions.userId],
    references: [users.id]
  }),
  redeemedByUser: one(users, {
    fields: [qrRedemptions.redeemedBy],
    references: [users.id]
  }),
  restaurant: one(restaurants, {
    fields: [qrRedemptions.restaurantId],
    references: [restaurants.id]
  }),
  reward: one(loyaltyRewards, {
    fields: [qrRedemptions.rewardId],
    references: [loyaltyRewards.id]
  }),
  promotion: one(promotions, {
    fields: [qrRedemptions.promotionId],
    references: [promotions.id]
  })
}));

export const guestVisitsRelations = relations(guestVisits, ({ one }) => ({
  user: one(users, {
    fields: [guestVisits.userId],
    references: [users.id]
  }),
  restaurant: one(restaurants, {
    fields: [guestVisits.restaurantId],
    references: [restaurants.id]
  }),
  order: one(orders, {
    fields: [guestVisits.orderId],
    references: [orders.id]
  })
}));

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect & {
  modifiers?: Modifier[];
  images?: string[];
};
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Modifier = typeof modifiers.$inferSelect;
export type InsertModifier = z.infer<typeof insertModifierSchema>;

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;

export type Order = typeof orders.$inferSelect & {
  items?: OrderItem[];
};
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect & {
  menuItem?: MenuItem;
};
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type InsertLoyaltyReward = z.infer<typeof insertLoyaltyRewardSchema>;

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// New table types
export type QueueEntry = typeof queueEntries.$inferSelect;
export type InsertQueueEntry = z.infer<typeof insertQueueEntrySchema>;

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;

export type UserItemInteraction = typeof userItemInteractions.$inferSelect;
export type InsertUserItemInteraction = z.infer<typeof insertUserItemInteractionSchema>;

export type QrRedemption = typeof qrRedemptions.$inferSelect;
export type InsertQrRedemption = z.infer<typeof insertQrRedemptionSchema>;

export type GuestVisit = typeof guestVisits.$inferSelect;
export type InsertGuestVisit = z.infer<typeof insertGuestVisitSchema>;
