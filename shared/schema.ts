import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
  dietaryPreferences: jsonb("dietary_preferences"),
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
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  applicableItems: jsonb("applicable_items"),
  restaurantId: integer("restaurant_id").notNull(),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Modifier = typeof modifiers.$inferSelect;
export type InsertModifier = z.infer<typeof insertModifierSchema>;

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type InsertLoyaltyReward = z.infer<typeof insertLoyaltyRewardSchema>;

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
