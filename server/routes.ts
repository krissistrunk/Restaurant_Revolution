import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertReservationSchema, insertOrderSchema, 
  insertOrderItemSchema, insertQueueEntrySchema, insertAiConversationSchema,
  insertUserPreferenceSchema, insertUserItemInteractionSchema, insertReviewSchema
} from "@shared/schema";
import { z } from "zod";
import { sendTableReadySMS, sendQueueConfirmationSMS } from "./services/notificationService";
import AiService from "./aiService";

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

  // Get restaurant info by ID (alternative endpoint)
  app.get("/api/restaurants/:id", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const restaurant = await storage.getRestaurant(restaurantId);
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
      
      // Get user's order statistics
      const orders = await storage.getUserOrders(userId);
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      
      // Remove password from response and add calculated stats
      const { password, ...userResponse } = user;
      
      return res.json({
        ...userResponse,
        totalOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2))
      });
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
          const orderItems = await storage.getOrderItems(order.id);
          return { ...order, orderItems };
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
  
  // Virtual Queue routes
  app.get("/api/queue-entries", async (req: Request, res: Response) => {
    try {
      const restaurantId = 1; // Default restaurant ID
      
      const queueEntries = await storage.getQueueEntries(restaurantId);
      return res.json(queueEntries);
    } catch (error) {
      console.error("Error fetching queue entries:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/user-queue-entry", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const restaurantId = 1; // Default restaurant ID
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const queueEntry = await storage.getUserQueueEntry(userId, restaurantId);
      return res.json(queueEntry || null);
    } catch (error) {
      console.error("Error fetching user queue entry:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/queue-entries", async (req: Request, res: Response) => {
    try {
      const queueEntryInput = insertQueueEntrySchema.parse(req.body);
      
      // Check if user is already in queue
      const existingEntry = await storage.getUserQueueEntry(
        queueEntryInput.userId, 
        queueEntryInput.restaurantId
      );
      
      if (existingEntry) {
        return res.status(400).json({ 
          message: "User is already in queue", 
          queueEntry: existingEntry 
        });
      }
      
      // Get estimated wait time
      const estimatedWaitTime = await storage.getQueueEstimatedWaitTime(
        queueEntryInput.restaurantId, 
        queueEntryInput.partySize
      );
      
      // Create queue entry
      const queueEntry = await storage.createQueueEntry({
        ...queueEntryInput,
        estimatedWaitTime
      });
      
      // Send confirmation SMS if phone number is available
      if (queueEntry.phone) {
        // Get restaurant info for the notification
        const restaurant = await storage.getRestaurant(queueEntry.restaurantId);
        const restaurantName = restaurant ? restaurant.name : "the restaurant";
        
        // Send SMS notification asynchronously (don't await)
        sendQueueConfirmationSMS(queueEntry, restaurantName)
          .then(success => {
            console.log(`Confirmation SMS ${success ? 'sent' : 'failed'} for queue entry ${queueEntry.id}`);
          })
          .catch(error => {
            console.error('Error sending confirmation SMS:', error);
          });
      }
      
      return res.status(201).json(queueEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating queue entry:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/queue-entries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Get the queue entry before updating
      const queueEntry = await storage.getQueueEntry(id);
      
      if (!queueEntry) {
        return res.status(404).json({ message: "Queue entry not found" });
      }
      
      const updatedEntry = await storage.updateQueueEntry(id, updates);
      
      // Check if status was updated to "ready" and notification hasn't been sent yet
      if (updates.status === 'ready' && !queueEntry.notificationSent) {
        // Get restaurant info for the notification
        const restaurant = await storage.getRestaurant(queueEntry.restaurantId);
        const restaurantName = restaurant ? restaurant.name : "the restaurant";
        
        // Send SMS notification
        if (queueEntry.phone) {
          const notificationSent = await sendTableReadySMS(queueEntry, restaurantName);
          
          // Mark notification as sent if successful
          if (notificationSent) {
            await storage.updateQueueEntry(id, { notificationSent: true });
          }
        }
      }
      
      return res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating queue entry:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/queue-wait-time", async (req: Request, res: Response) => {
    try {
      const restaurantId = 1; // Default restaurant ID
      const partySize = parseInt(req.query.partySize as string) || 2;
      
      const waitTime = await storage.getQueueEstimatedWaitTime(restaurantId, partySize);
      return res.json({ estimatedWaitTime: waitTime });
    } catch (error) {
      console.error("Error calculating wait time:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // AI Assistant routes
  app.get("/api/ai-conversations", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const conversations = await storage.getAiConversations(userId);
      return res.json(conversations);
    } catch (error) {
      console.error("Error fetching AI conversations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/ai-conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const conversation = await storage.getAiConversation(id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      return res.json(conversation);
    } catch (error) {
      console.error("Error fetching AI conversation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/ai-conversations", async (req: Request, res: Response) => {
    try {
      const conversationInput = insertAiConversationSchema.parse(req.body);
      
      const conversation = await storage.createAiConversation(conversationInput);
      return res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating AI conversation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/ai-conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userMessage = req.body;
      
      // 1. Add user message to conversation
      const updatedWithUserMessage = await storage.updateAiConversation(id, userMessage);
      if (!updatedWithUserMessage) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // 2. Process the user message with AI service
      const aiService = new AiService(storage);
      const aiResponse = await aiService.processMessage(id, userMessage);
      
      // 3. Add AI response to conversation
      const finalConversation = await storage.updateAiConversation(id, aiResponse);
      
      return res.json(finalConversation);
    } catch (error) {
      console.error("Error adding message to conversation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/ai-conversations/:id/resolve", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const resolvedConversation = await storage.resolveAiConversation(id);
      
      if (!resolvedConversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      return res.json(resolvedConversation);
    } catch (error) {
      console.error("Error resolving conversation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // User Preferences routes
  app.get("/api/user-preferences", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const preferences = await storage.getUserPreference(userId);
      return res.json(preferences || null);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/user-preferences", async (req: Request, res: Response) => {
    try {
      const preferenceInput = insertUserPreferenceSchema.parse(req.body);
      
      // Check if preferences already exist
      const existingPreferences = await storage.getUserPreference(preferenceInput.userId);
      
      if (existingPreferences) {
        // Update existing preferences
        const updatedPreferences = await storage.updateUserPreference(
          preferenceInput.userId, 
          preferenceInput
        );
        return res.json(updatedPreferences);
      }
      
      // Create new preferences
      const preferences = await storage.createUserPreference(preferenceInput);
      return res.status(201).json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating user preferences:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/user-preferences/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;
      
      const updatedPreferences = await storage.updateUserPreference(userId, updates);
      
      if (!updatedPreferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      return res.json(updatedPreferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Review routes
  app.get("/api/reviews", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.query.restaurantId as string) || 1;
      const reviews = await storage.getReviews(restaurantId);
      return res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/user-reviews", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const reviews = await storage.getUserReviews(userId);
      return res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const reviewInput = insertReviewSchema.parse(req.body);
      
      // Validate rating is between 1 and 5
      if (reviewInput.rating < 1 || reviewInput.rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      const review = await storage.createReview(reviewInput);
      return res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating review:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Menu Recommendation routes
  app.post("/api/menu-interactions", async (req: Request, res: Response) => {
    try {
      const interactionInput = insertUserItemInteractionSchema.parse(req.body);
      
      const interaction = await storage.recordUserItemInteraction(interactionInput);
      return res.status(201).json(interaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error recording menu interaction:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/recommended-menu-items", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const restaurantId = 1; // Default restaurant ID
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const recommendations = await storage.getPersonalizedMenuRecommendations(
        userId, 
        restaurantId,
        limit
      );
      
      return res.json(recommendations);
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
