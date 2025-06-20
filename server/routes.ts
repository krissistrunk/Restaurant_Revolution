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
import { waitlistService } from "./services/waitlistService";
import { guestProfileService } from "./services/guestProfileService";
import { cmsMiddleware } from "./middleware/cmsMiddleware";
import { requireAuth, requireOwner, requireAdmin, requireCMSAccess, requireRestaurantAccess, authenticateToken, attachUser } from "./middleware/authMiddleware";
import { getWebSocketManager } from "./websocket";
import { authRoutes } from "./routes/authRoutes";
import { menuRoutes } from "./routes/menuRoutes";
import { orderRoutes } from "./routes/orderRoutes";
import { analyticsRoutes } from "./routes/analyticsRoutes";
import { aiRoutes } from "./routes/aiRoutes";
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';

// QR Code utility functions
function generateQrCodeValue(userId: number, qrType: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `RR-${qrType.toUpperCase()}-${userId}-${timestamp}-${random}`;
}

async function processLoyaltyRedemption(qrRedemption: any, staffUserId: number) {
  if (!qrRedemption.rewardId) {
    throw new Error("Reward ID is required for loyalty redemption");
  }

  const reward = await storage.getLoyaltyReward(qrRedemption.rewardId);
  if (!reward) {
    throw new Error("Reward not found");
  }

  const user = await storage.getUser(qrRedemption.userId);
  if (!user || user.loyaltyPoints < reward.pointsRequired) {
    throw new Error("Insufficient points for this reward");
  }

  // Deduct points and mark as redeemed
  await storage.updateUserLoyaltyPoints(qrRedemption.userId, -reward.pointsRequired);
  await storage.markQrRedemptionAsRedeemed(qrRedemption.id, staffUserId);

  return {
    type: "loyalty",
    reward,
    pointsDeducted: reward.pointsRequired,
    remainingPoints: user.loyaltyPoints - reward.pointsRequired
  };
}

async function processDiscountRedemption(qrRedemption: any, staffUserId: number) {
  // Mark as redeemed
  await storage.markQrRedemptionAsRedeemed(qrRedemption.id, staffUserId);

  return {
    type: "discount",
    discountAmount: qrRedemption.discountAmount,
    discountType: qrRedemption.discountType,
    message: `${qrRedemption.discountType === 'percentage' ? qrRedemption.discountAmount + '%' : '$' + qrRedemption.discountAmount} discount applied`
  };
}

async function processLightningDealRedemption(qrRedemption: any, staffUserId: number) {
  if (qrRedemption.promotionId) {
    const promotion = await storage.getPromotion(qrRedemption.promotionId);
    if (!promotion || !promotion.isActive) {
      throw new Error("Lightning deal is no longer active");
    }
    
    // Check if deal is still within time window
    const now = new Date();
    if (now < new Date(promotion.startDate) || now > new Date(promotion.endDate)) {
      throw new Error("Lightning deal has expired");
    }
  }

  // Mark as redeemed
  await storage.markQrRedemptionAsRedeemed(qrRedemption.id, staffUserId);

  return {
    type: "lightning",
    deal: qrRedemption.metadata,
    message: "Lightning deal redeemed successfully"
  };
}

async function processTierBasedRedemption(qrRedemption: any, staffUserId: number) {
  const user = await storage.getUser(qrRedemption.userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Determine user tier based on loyalty points
  let userTier = "regular";
  if (user.loyaltyPoints >= 1000) userTier = "premium";
  else if (user.loyaltyPoints >= 500) userTier = "vip";

  // Mark as redeemed
  await storage.markQrRedemptionAsRedeemed(qrRedemption.id, staffUserId);

  return {
    type: "tier",
    userTier,
    benefit: qrRedemption.metadata,
    message: `${userTier.toUpperCase()} tier benefit redeemed`
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable cookie parsing for JWT cookies
  app.use(cookieParser());

  // Enhanced Authentication Routes (no auth required)
  app.use("/api/auth", authRoutes);
  
  // Public routes that don't require authentication
  app.get("/api/restaurant", 
    cmsMiddleware.withRestaurantCMS(),
    cmsMiddleware.withCMSFallback(),
    async (req: Request, res: Response) => {
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
    }
  );
  
  app.get("/api/categories", 
    cmsMiddleware.withMenuCategoriesCMS(),
    cmsMiddleware.withCMSFallback(),
    async (req: Request, res: Response) => {
      try {
        const restaurantId = parseInt(req.query.restaurantId as string) || 1;
        const categories = await storage.getCategories(restaurantId);
        return res.json(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  
  app.get("/api/menu-items", 
    cmsMiddleware.withMenuItemsCMS(),
    cmsMiddleware.withCMSFallback(),
    async (req: Request, res: Response) => {
      try {
        const restaurantId = parseInt(req.query.restaurantId as string) || 1;
        const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;

        const menuItems = await storage.getMenuItems(restaurantId, categoryId);
        return res.json(menuItems);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  
  app.get("/api/featured-items", 
    cmsMiddleware.withMenuItemsCMS(),
    cmsMiddleware.withCMSFallback(),
    async (req: Request, res: Response) => {
      try {
        const restaurantId = parseInt(req.query.restaurantId as string) || 1;
        const featuredItems = await storage.getFeaturedMenuItems(restaurantId);
        return res.json(featuredItems);
    } catch (error) {
      console.error("Error fetching featured items:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Global authentication middleware for all other protected routes
  app.use("/api", authenticateToken);

  // Enhanced API Routes
  app.use("/api/menu", menuRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/ai", aiRoutes);

  // CMS Health check and cache management (restricted to owners/admins)
  app.get("/api/cms/health", attachUser, requireCMSAccess, cmsMiddleware.healthCheck);
  app.post("/api/cms/clear-cache", attachUser, requireCMSAccess, cmsMiddleware.clearCache);


  // Get restaurant info by ID (alternative endpoint)
  app.get("/api/restaurants/:id", 
    cmsMiddleware.withRestaurantCMS(),
    cmsMiddleware.withCMSFallback(),
    async (req: Request, res: Response) => {
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
    }
  );


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
      
      // Broadcast reservation update via WebSocket
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.notifyReservationUpdate(reservation, reservation.restaurantId);
      }
      
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

      // Broadcast order update via WebSocket
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.notifyOrderUpdate(newOrder.id, { ...newOrder, items: orderItems }, newOrder.restaurantId);
      }

      return res.status(201).json({ ...newOrder, items: orderItems, pointsEarned: pointsToAdd });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // QR Code scanning and redemption routes
  app.post("/api/scan-qr", async (req: Request, res: Response) => {
    try {
      const { qrCodeValue, staffUserId } = req.body;

      if (!qrCodeValue || !staffUserId) {
        return res.status(400).json({ message: "QR code value and staff user ID are required" });
      }

      // Verify staff user exists and has proper role
      const staffUser = await storage.getUser(staffUserId);
      if (!staffUser || (staffUser.role !== "owner" && staffUser.role !== "admin")) {
        return res.status(403).json({ message: "Unauthorized: Only staff members can scan QR codes" });
      }

      // Find the QR redemption record
      const qrRedemption = await storage.getQrRedemptionByCode(qrCodeValue);
      if (!qrRedemption) {
        return res.status(404).json({ message: "Invalid QR code" });
      }

      // Check if already redeemed
      if (qrRedemption.status === "redeemed") {
        return res.status(400).json({ 
          message: "QR code has already been redeemed",
          redeemedAt: qrRedemption.redeemedAt 
        });
      }

      // Check if expired
      if (new Date() > new Date(qrRedemption.expiresAt)) {
        await storage.updateQrRedemptionStatus(qrRedemption.id, "expired");
        return res.status(400).json({ message: "QR code has expired" });
      }

      // Process redemption based on QR type
      let redemptionResult;
      switch (qrRedemption.qrType) {
        case "loyalty":
          redemptionResult = await processLoyaltyRedemption(qrRedemption, staffUserId);
          break;
        case "discount":
          redemptionResult = await processDiscountRedemption(qrRedemption, staffUserId);
          break;
        case "lightning":
          redemptionResult = await processLightningDealRedemption(qrRedemption, staffUserId);
          break;
        case "tier":
          redemptionResult = await processTierBasedRedemption(qrRedemption, staffUserId);
          break;
        default:
          return res.status(400).json({ message: "Invalid QR code type" });
      }

      return res.json({
        message: "QR code redeemed successfully",
        redemption: redemptionResult,
        qrType: qrRedemption.qrType
      });

    } catch (error) {
      console.error("Error scanning QR code:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/generate-qr", async (req: Request, res: Response) => {
    try {
      const { userId, qrType, rewardId, promotionId, discountAmount, discountType, expiresIn, metadata } = req.body;

      if (!userId || !qrType) {
        return res.status(400).json({ message: "User ID and QR type are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate unique QR code value
      const qrCodeValue = generateQrCodeValue(userId, qrType);
      
      // Set expiration (default 24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (expiresIn || 24));

      const qrRedemption = await storage.createQrRedemption({
        qrCodeValue,
        qrType,
        userId,
        rewardId,
        promotionId,
        discountAmount,
        discountType,
        expiresAt,
        status: "active",
        restaurantId: 1, // Default restaurant ID
        metadata
      });

      return res.status(201).json(qrRedemption);
    } catch (error) {
      console.error("Error generating QR code:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user-qr-codes", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const qrCodes = await storage.getUserQrRedemptions(userId);
      return res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching user QR codes:", error);
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

      // Use enhanced waitlist service
      const queueEntry = await waitlistService.joinWaitlist({
        ...queueEntryInput,
        estimatedWaitTime
      });

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

      // Broadcast queue update via WebSocket
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.notifyQueueUpdate(updatedEntry, queueEntry.restaurantId);
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

  // Guest Profile & Preferences Routes
  app.get("/api/guest-profile/:userId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const restaurantId = parseInt(req.query.restaurantId as string) || 1;

      const preferences = await guestProfileService.getUserPreferences(userId);
      const analytics = await guestProfileService.getVisitAnalytics(userId, restaurantId);
      const recommendations = await guestProfileService.getPersonalizedRecommendations(userId, restaurantId);

      return res.json({
        preferences,
        analytics,
        recommendations
      });
    } catch (error) {
      console.error("Error fetching guest profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/guest-profile/:userId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = req.body;

      const updated = await guestProfileService.updateUserPreferences(userId, preferences);
      return res.json(updated);
    } catch (error) {
      console.error("Error updating guest profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/guest-visits/:userId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const restaurantId = req.query.restaurantId ? parseInt(req.query.restaurantId as string) : undefined;

      const visits = await guestProfileService.getGuestVisitHistory(userId, restaurantId);
      return res.json(visits);
    } catch (error) {
      console.error("Error fetching visit history:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enhanced Waitlist Management Routes
  app.post("/api/waitlist/:id/call", requireAuth, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      await waitlistService.callCustomer(entryId);
      return res.json({ message: "Customer called successfully" });
    } catch (error) {
      console.error("Error calling customer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/waitlist/:id/seat", requireAuth, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const { tableSection } = req.body;
      await waitlistService.seatCustomer(entryId, tableSection);
      return res.json({ message: "Customer seated successfully" });
    } catch (error) {
      console.error("Error seating customer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/waitlist/:id/cancel", requireAuth, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      await waitlistService.cancelWaitlistEntry(entryId);
      return res.json({ message: "Waitlist entry cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling waitlist entry:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/waitlist/:restaurantId/update-times", requireAuth, async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const { averageTableTurnover } = req.body;
      
      if (!averageTableTurnover || averageTableTurnover < 5) {
        return res.status(400).json({ message: "Average table turnover must be at least 5 minutes" });
      }

      await waitlistService.updateEstimatedWaitTime(restaurantId, averageTableTurnover);
      return res.json({ message: "Wait times updated successfully" });
    } catch (error) {
      console.error("Error updating wait times:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/waitlist/:id/position", requireAuth, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const { newPosition } = req.body;
      
      if (!newPosition || newPosition < 1) {
        return res.status(400).json({ message: "New position must be at least 1" });
      }

      await waitlistService.updateWaitlistPosition(entryId, newPosition);
      return res.json({ message: "Position updated successfully" });
    } catch (error) {
      console.error("Error updating position:", error);
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

  // WebSocket status endpoint
  app.get("/api/ws/status", (req: Request, res: Response) => {
    const wsManager = getWebSocketManager();
    if (!wsManager) {
      return res.status(503).json({ message: "WebSocket server not available" });
    }
    
    res.json(wsManager.getStats());
  });

  // Add fallback route for demo access (bypasses Vite host restrictions)
  app.get("/demo", (req: Request, res: Response) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RestaurantRush - Demo Access</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .container {
                text-align: center;
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 600px;
                width: 90%;
            }
            h1 { font-size: 2.5rem; margin-bottom: 10px; }
            p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
            .demo-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .demo-card {
                background: rgba(255,255,255,0.2);
                padding: 25px;
                border-radius: 15px;
                transition: all 0.3s;
                text-decoration: none;
                color: white;
                border: 2px solid transparent;
            }
            .demo-card:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-5px);
                border-color: rgba(255,255,255,0.5);
            }
            .demo-card h3 { font-size: 1.3rem; margin-bottom: 10px; }
            .demo-card p { font-size: 0.9rem; opacity: 0.8; }
            .status { margin-top: 20px; font-size: 0.9rem; opacity: 0.7; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>RestaurantRush</h1>
            <p>Restaurant Management System - Demo Access</p>

            <div class="demo-grid">
                <a href="/owner-demo.html" class="demo-card">
                    <h3>Restaurant Owner</h3>
                    <p>Dashboard, orders, reservations, queue management, and analytics</p>
                </a>

                <a href="/customer-demo.html" class="demo-card">
                    <h3>Customer Experience</h3>
                    <p>Mobile app for ordering, reservations, loyalty rewards</p>
                </a>

                <a href="/marketing-materials.html" class="demo-card">
                    <h3>Marketing Package</h3>
                    <p>Sales presentations, documentation, implementation guides</p>
                </a>
            </div>

            <div class="status">
                Server Status: Running | Database: Connected | Demos: Ready
            </div>
        </div>
    </body>
    </html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Serve demo and marketing files
  app.get('/owner-demo.html', (_req: Request, res: Response) => {
    res.sendFile('owner-demo.html', { root: process.cwd() });
  });

  app.get('/customer-demo.html', (_req: Request, res: Response) => {
    res.sendFile('customer-demo.html', { root: process.cwd() });
  });

  app.get('/marketing-materials.html', (_req: Request, res: Response) => {
    res.sendFile('marketing-materials.html', { root: process.cwd() });
  });

  // Serve marketing directory files with HTML formatting
  app.get('/marketing/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const filePath = path.join(process.cwd(), 'marketing', filename);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return res.status(404).send('Marketing material not found');
      }
      
      // If it's a markdown file, wrap it in HTML for better display
      if (filename.endsWith('.md')) {
        const title = filename.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RestaurantRush - ${title}</title>
    <style>
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #1A1A1A;
            background: #FDFCF9;
        }
        h1, h2, h3 { 
            color: #1A1A1A; 
            margin-top: 30px;
            font-weight: 600;
        }
        h1 { 
            border-bottom: 3px solid #8B1538; 
            padding-bottom: 10px;
            font-size: 2.5rem;
            margin-top: 0;
        }
        h2 { 
            border-bottom: 2px solid #E5E7EB; 
            padding-bottom: 5px;
            font-size: 1.875rem;
        }
        h3 {
            font-size: 1.5rem;
        }
        code { 
            background: #F8F6F2; 
            padding: 2px 6px; 
            border-radius: 4px;
            font-size: 0.875rem;
        }
        pre { 
            background: #F8F6F2; 
            padding: 20px; 
            border-radius: 8px; 
            overflow-x: auto;
            border-left: 4px solid #8B1538;
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        th, td { 
            border: 1px solid #E5E7EB; 
            padding: 12px 16px; 
            text-align: left; 
        }
        th { 
            background: #8B1538; 
            color: white;
            font-weight: 600; 
        }
        tr:nth-child(even) {
            background: #F8F6F2;
        }
        ul, ol { 
            margin-left: 20px; 
            margin-bottom: 16px;
        }
        li { 
            margin-bottom: 8px; 
        }
        blockquote { 
            border-left: 4px solid #D4AF37; 
            margin: 20px 0; 
            padding: 16px 20px; 
            color: #6B7280;
            background: #F8F6F2;
            border-radius: 8px;
        }
        strong {
            color: #8B1538;
            font-weight: 600;
        }
        em {
            color: #6B7280;
        }
        a {
            color: #8B1538;
            text-decoration: none;
            border-bottom: 1px solid #8B1538;
        }
        a:hover {
            background: #8B1538;
            color: white;
            border-radius: 2px;
        }
        .back-button {
            position: fixed;
            top: 20px;
            left: 20px;
            background: #8B1538;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            z-index: 1000;
        }
        .back-button:hover {
            background: #A62C4C;
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
    </style>
</head>
<body>
    <a href="/marketing-materials.html" class="back-button">← Back to Marketing</a>
    <div id="content"></div>
    <script>
        const markdown = \`${data.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`;
        
        // Simple markdown to HTML conversion
        let html = markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
            .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
            .replace(/\`(.*?)\`/gim, '<code>$1</code>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/^\\d+\\. (.*$)/gim, '<li>$1</li>')
            .replace(/\\n\\n/g, '</p><p>')
            .replace(/\\n/g, '<br>');
        
        // Wrap consecutive list items in ul/ol tags
        html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\\s*<ul>/g, '');
        
        // Wrap in paragraphs
        html = '<p>' + html + '</p>';
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        
        document.getElementById('content').innerHTML = html;
    </script>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
      } else {
        res.setHeader('Content-Type', 'text/plain');
        res.send(data);
      }
    });
  });

  // Serve marketing subdirectory files
  app.get('/marketing/:subdir/:filename', (req: Request, res: Response) => {
    const subdir = req.params.subdir;
    const filename = req.params.filename;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendFile(`marketing/${subdir}/${filename}`, { root: process.cwd() });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}