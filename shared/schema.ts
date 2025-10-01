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
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  loyaltyPoints: true,
});

// Restaurant Schema - Extended for Multi-Tenant SaaS
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

  // Multi-Tenant Fields
  subdomain: text("subdomain").notNull().unique(), // e.g., "mikes_pizza"
  customDomain: text("custom_domain").unique(), // e.g., "order.mikespizza.com"
  domainVerified: boolean("domain_verified").default(false),
  domainVerificationToken: text("domain_verification_token"),

  // Subscription & Billing
  subscriptionPlanId: integer("subscription_plan_id"), // Reference to subscription plan
  subscriptionStatus: text("subscription_status").default("trial"), // trial, active, past_due, cancelled, expired
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionStartedAt: timestamp("subscription_started_at"),
  billingCycleAnchor: timestamp("billing_cycle_anchor"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),

  // International Support
  currency: text("currency").default("USD").notNull(), // USD, EUR, GBP, JPY, etc.
  locale: text("locale").default("en-US").notNull(), // Language and region
  timezone: text("timezone").default("America/New_York").notNull(),
  countryCode: text("country_code").default("US"), // ISO country code

  // Business Information
  businessType: text("business_type"), // cafe, restaurant, food_truck, bar, etc.
  cuisineType: text("cuisine_type"), // Italian, Chinese, Mexican, etc.
  businessRegistrationNumber: text("business_registration_number"),
  taxId: text("tax_id"),

  // Platform Settings
  isActive: boolean("is_active").default(true),
  setupCompleted: boolean("setup_completed").default(false),
  onboardingStep: integer("onboarding_step").default(0), // Track onboarding progress

  // Branding & Theme
  primaryColor: text("primary_color").default("#FF6B35"),
  secondaryColor: text("secondary_color").default("#FFD23F"),
  themeSettings: jsonb("theme_settings"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// ========== MULTI-TENANT SAAS TABLES ==========

// Subscription Plans Schema
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Starter, Professional, Growth, Enterprise
  slug: text("slug").notNull().unique(), // starter, professional, growth, enterprise
  description: text("description"),
  price: real("price").notNull(), // Monthly price in USD
  annualPrice: real("annual_price"), // Annual price if different
  stripePriceId: text("stripe_price_id"),
  stripeAnnualPriceId: text("stripe_annual_price_id"),

  // Features & Limits
  maxOrders: integer("max_orders"), // null = unlimited
  maxLocations: integer("max_locations").default(1),
  maxMenuItems: integer("max_menu_items"), // null = unlimited
  maxStaffMembers: integer("max_staff_members"), // null = unlimited

  // Feature Flags
  features: jsonb("features").notNull(), // Array of enabled features

  // Commission Rates
  transactionFeePercent: real("transaction_fee_percent").default(0), // e.g., 1.9
  transactionFeeFixed: real("transaction_fee_fixed").default(0), // e.g., 0.30

  // Plan Status
  isActive: boolean("is_active").default(true),
  isPopular: boolean("is_popular").default(false),
  displayOrder: integer("display_order").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tenant Settings Schema (Additional configuration per restaurant)
export const tenantSettings = pgTable("tenant_settings", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().unique(),

  // Notification Settings
  emailNotificationsEnabled: boolean("email_notifications_enabled").default(true),
  smsNotificationsEnabled: boolean("sms_notifications_enabled").default(true),
  orderNotificationEmail: text("order_notification_email"),

  // Operational Settings
  autoAcceptOrders: boolean("auto_accept_orders").default(false),
  requireOrderConfirmation: boolean("require_order_confirmation").default(true),
  minOrderAmount: real("min_order_amount").default(0),
  estimatedPrepTime: integer("estimated_prep_time").default(30), // minutes

  // Payment Settings
  acceptCash: boolean("accept_cash").default(true),
  acceptCards: boolean("accept_cards").default(true),
  acceptDigitalWallets: boolean("accept_digital_wallets").default(false),

  // Loyalty Settings
  loyaltyEnabled: boolean("loyalty_enabled").default(true),
  pointsPerDollar: real("points_per_dollar").default(1.0),

  // Advanced Settings
  customCss: text("custom_css"),
  customJs: text("custom_js"),
  analyticsCode: text("analytics_code"),

  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTenantSettingsSchema = createInsertSchema(tenantSettings).omit({
  id: true,
  updatedAt: true,
});

// Tenant Staff Schema (Staff members per restaurant)
export const tenantStaff = pgTable("tenant_staff", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(), // manager, server, kitchen, host
  permissions: jsonb("permissions"), // Granular permissions
  isActive: boolean("is_active").default(true),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTenantStaffSchema = createInsertSchema(tenantStaff).omit({
  id: true,
  invitedAt: true,
  createdAt: true,
});

// Usage Tracking Schema (Track usage for billing and limits)
export const usageTracking = pgTable("usage_tracking", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  month: text("month").notNull(), // YYYY-MM format

  // Usage Metrics
  orderCount: integer("order_count").default(0),
  revenue: real("revenue").default(0),
  transactionFees: real("transaction_fees").default(0),

  // Feature Usage
  smsMessagesSent: integer("sms_messages_sent").default(0),
  emailsSent: integer("emails_sent").default(0),
  apiCalls: integer("api_calls").default(0),
  storageUsedMb: real("storage_used_mb").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUsageTrackingSchema = createInsertSchema(usageTracking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Billing History Schema
export const billingHistory = pgTable("billing_history", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),

  // Invoice Information
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: real("amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  status: text("status").notNull(), // pending, paid, failed, refunded

  // Billing Details
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),

  // Stripe Information
  stripeInvoiceId: text("stripe_invoice_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),

  // Invoice Items
  items: jsonb("items").notNull(), // Line items

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBillingHistorySchema = createInsertSchema(billingHistory).omit({
  id: true,
  createdAt: true,
});

// Promotional Codes Schema
export const promotionalCodes = pgTable("promotional_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),

  // Discount Details
  discountType: text("discount_type").notNull(), // percentage, fixed, trial_extension
  discountValue: real("discount_value").notNull(),
  durationMonths: integer("duration_months"), // null = forever

  // Usage Limits
  maxUses: integer("max_uses"), // null = unlimited
  usesCount: integer("uses_count").default(0),

  // Validity
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),

  // Target Audience
  applicablePlans: jsonb("applicable_plans"), // Array of plan slugs, null = all plans

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromotionalCodeSchema = createInsertSchema(promotionalCodes).omit({
  id: true,
  usesCount: true,
  createdAt: true,
});

// Domain Verification Schema
export const domainVerifications = pgTable("domain_verifications", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  domain: text("domain").notNull(),
  verificationToken: text("verification_token").notNull(),
  verificationMethod: text("verification_method").notNull(), // dns_txt, dns_cname, file
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  lastCheckedAt: timestamp("last_checked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDomainVerificationSchema = createInsertSchema(domainVerifications).omit({
  id: true,
  createdAt: true,
});

// Relations for new tables
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  restaurants: many(restaurants)
}));

export const tenantSettingsRelations = relations(tenantSettings, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [tenantSettings.restaurantId],
    references: [restaurants.id]
  })
}));

export const tenantStaffRelations = relations(tenantStaff, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [tenantStaff.restaurantId],
    references: [restaurants.id]
  }),
  user: one(users, {
    fields: [tenantStaff.userId],
    references: [users.id]
  })
}));

export const usageTrackingRelations = relations(usageTracking, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [usageTracking.restaurantId],
    references: [restaurants.id]
  })
}));

export const billingHistoryRelations = relations(billingHistory, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [billingHistory.restaurantId],
    references: [restaurants.id]
  })
}));

export const domainVerificationsRelations = relations(domainVerifications, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [domainVerifications.restaurantId],
    references: [restaurants.id]
  })
}));

// Types for new tables
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type TenantSettings = typeof tenantSettings.$inferSelect;
export type InsertTenantSettings = z.infer<typeof insertTenantSettingsSchema>;

export type TenantStaff = typeof tenantStaff.$inferSelect;
export type InsertTenantStaff = z.infer<typeof insertTenantStaffSchema>;

export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = z.infer<typeof insertUsageTrackingSchema>;

export type BillingHistory = typeof billingHistory.$inferSelect;
export type InsertBillingHistory = z.infer<typeof insertBillingHistorySchema>;

export type PromotionalCode = typeof promotionalCodes.$inferSelect;
export type InsertPromotionalCode = z.infer<typeof insertPromotionalCodeSchema>;

export type DomainVerification = typeof domainVerifications.$inferSelect;
export type InsertDomainVerification = z.infer<typeof insertDomainVerificationSchema>;