import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertReservationSchema, insertOrderSchema, 
  insertOrderItemSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route("/api");
  
  // Get restaurant info
  app.get("/api/restaurant", async (req: Request, res: Response) => {
    try {
      const restaurant = await storage.getRestaurant(1);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      return res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userInput.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userInput.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userInput);
      // Remove password from response
      const { password, ...userResponse } = user;
      
      return res.status(201).json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error registering user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      return res.json(userResponse);
    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      // In a real app, this would use session/JWT to get the current user
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userResponse } = user;
      
      return res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Menu routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const restaurantId = 1; // Default restaurant ID
      const categories = await storage.getCategories(restaurantId);
      return res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/menu-items", async (req: Request, res: Response) => {
    try {
      const restaurantId = 1; // Default restaurant ID
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      const menuItems = await storage.getMenuItems(restaurantId, categoryId);
      return res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/featured-items", async (req: Request, res: Response) => {
    try {
      const restaurantId = 1; // Default restaurant ID
      const featuredItems = await storage.getFeaturedMenuItems(restaurantId);
      return res.json(featuredItems);
    } catch (error) {
      console.error("Error fetching featured items:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/menu-items/:id", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      const menuItem = await storage.getMenuItem(itemId);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      // Get modifiers for this menu item
      const modifiers = await storage.getModifiers(itemId);
      
      return res.json({ ...menuItem, modifiers });
    } catch (error) {
      console.error("Error fetching menu item:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Reservation routes
  app.get("/api/reservations", async (req: Request, res: Response) => {
    try {
      const restaurantId = 1; // Default restaurant ID
      const date = req.query.date as string | undefined;
      
      const reservations = await storage.getReservations(restaurantId, date);
      return res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/user-reservations", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const reservations = await storage.getUserReservations(userId);
      return res.json(reservations);
    } catch (error) {
      console.error("Error fetching user reservations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/reservations", async (req: Request, res: Response) => {
    try {
      const reservationInput = insertReservationSchema.parse(req.body);
      
      const reservation = await storage.createReservation(reservationInput);
      return res.status(201).json(reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating reservation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Order routes
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const orders = await storage.getUserOrders(userId);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return { ...order, items };
        })
      );
      
      return res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      const orderInput = insertOrderSchema.parse(order);
      
      // Create the order
      const newOrder = await storage.createOrder(orderInput);
      
      // Create order items
      const orderItems = await Promise.all(
        items.map(async (item: any) => {
          const orderItemInput = insertOrderItemSchema.parse({
            ...item,
            orderId: newOrder.id
          });
          return await storage.createOrderItem(orderItemInput);
        })
      );
      
      // Update user loyalty points (1 point per dollar spent)
      const pointsToAdd = Math.floor(newOrder.totalPrice);
      await storage.updateUserLoyaltyPoints(newOrder.userId, pointsToAdd);
      
      return res.status(201).json({ ...newOrder, items: orderItems, pointsEarned: pointsToAdd });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Loyalty routes
  app.get("/api/loyalty-rewards", async (req: Request, res: Response) => {
    try {
      const restaurantId = 1; // Default restaurant ID
      const rewards = await storage.getLoyaltyRewards(restaurantId);
      return res.json(rewards);
    } catch (error) {
      console.error("Error fetching loyalty rewards:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/redeem-reward", async (req: Request, res: Response) => {
    try {
      const { userId, rewardId } = req.body;
      
      if (!userId || !rewardId) {
        return res.status(400).json({ message: "User ID and reward ID are required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const reward = await storage.getLoyaltyReward(rewardId);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      if (user.loyaltyPoints < reward.pointsRequired) {
        return res.status(400).json({ message: "Not enough points to redeem this reward" });
      }
      
      // Deduct points from user
      const updatedUser = await storage.updateUserLoyaltyPoints(userId, -reward.pointsRequired);
      
      return res.json({ 
        message: "Reward redeemed successfully", 
        reward, 
        remainingPoints: updatedUser?.loyaltyPoints 
      });
    } catch (error) {
      console.error("Error redeeming reward:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
