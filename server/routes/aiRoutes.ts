import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { aiRecommendationService } from '../services/aiRecommendationService';
import { aiPricingService } from '../services/aiPricingService';
import { aiAnalyticsService } from '../services/aiAnalyticsService';
import { aiChatbotService } from '../services/aiChatbotService';
import { aiOrchestrationService } from '../services/aiOrchestrationService';
import { requireAuth, requireOwner, requireAdmin } from '../middleware/authMiddleware';
import { log } from '../vite';

const router = Router();

// Validation schemas
const recommendationOptionsSchema = z.object({
  limit: z.number().int().min(1).max(20).optional(),
  includeWeatherContext: z.boolean().optional(),
  includePriceOptimization: z.boolean().optional(),
  includeTimingContext: z.boolean().optional()
});

const pricingOptionsSchema = z.object({
  includeWeatherAdjustment: z.boolean().optional(),
  includeInventoryAdjustment: z.boolean().optional(),
  includeCompetitiveAdjustment: z.boolean().optional(),
  includeSeasonalAdjustment: z.boolean().optional()
});

const demandPredictionSchema = z.object({
  timeframe: z.enum(['1h', '4h', '1d', '3d', '7d', '30d']),
  targetDate: z.string().datetime().optional()
});

const staffingPredictionSchema = z.object({
  targetDate: z.string().datetime(),
  shifts: z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    role: z.enum(['server', 'kitchen', 'host', 'manager'])
  }))
});

const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  restaurantId: z.number().int(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.string().datetime()
  })).optional()
});

/**
 * Get personalized menu recommendations for a user
 */
router.get('/recommendations/menu/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const restaurantId = parseInt(req.query.restaurantId as string) || 1;
    const options = recommendationOptionsSchema.parse(req.query);
    
    // Check if user has permission
    if (req.user!.id !== userId && req.user!.role !== 'admin' && req.user!.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const recommendations = await aiRecommendationService.getPersonalizedRecommendations(
      userId,
      restaurantId,
      options
    );
    
    res.json(recommendations);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error getting AI recommendations: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get trending menu items
 */
router.get('/recommendations/trending/:restaurantId', async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const timeframe = (req.query.timeframe as '24h' | '7d' | '30d') || '7d';
    
    const trendingItems = await aiRecommendationService.getTrendingItems(restaurantId, timeframe);
    
    res.json({
      timeframe,
      items: trendingItems,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    log(`Error getting trending items: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get dietary-specific recommendations
 */
router.get('/recommendations/dietary/:restaurantId/:dietaryType', async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const dietaryType = req.params.dietaryType as 'vegetarian' | 'vegan' | 'gluten-free' | 'keto' | 'low-carb';
    
    if (!['vegetarian', 'vegan', 'gluten-free', 'keto', 'low-carb'].includes(dietaryType)) {
      return res.status(400).json({ message: 'Invalid dietary type' });
    }
    
    const recommendations = await aiRecommendationService.getDietaryRecommendations(restaurantId, dietaryType);
    
    res.json({
      dietaryType,
      items: recommendations,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    log(`Error getting dietary recommendations: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get dynamic pricing for a menu item
 */
router.get('/pricing/dynamic/:menuItemId', requireOwner, async (req: Request, res: Response) => {
  try {
    const menuItemId = parseInt(req.params.menuItemId);
    const restaurantId = parseInt(req.query.restaurantId as string) || req.user!.restaurantId || 1;
    const options = pricingOptionsSchema.parse(req.query);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const pricing = await aiPricingService.getDynamicPrice(menuItemId, restaurantId, options);
    
    res.json(pricing);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error getting dynamic pricing: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get price optimization recommendations
 */
router.get('/pricing/optimization/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const recommendations = await aiPricingService.getPriceOptimizationRecommendations(restaurantId);
    
    res.json({
      restaurantId,
      recommendations,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    log(`Error getting price optimization: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Create A/B pricing test
 */
router.post('/pricing/ab-test', requireOwner, async (req: Request, res: Response) => {
  try {
    const { menuItemId, testPrices, testDuration } = req.body;
    
    if (!menuItemId || !testPrices || !Array.isArray(testPrices)) {
      return res.status(400).json({ message: 'menuItemId and testPrices array are required' });
    }
    
    const test = await aiPricingService.createPricingABTest(
      menuItemId,
      testPrices,
      testDuration || 7
    );
    
    res.status(201).json(test);
  } catch (error) {
    log(`Error creating A/B pricing test: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Predict demand
 */
router.post('/analytics/predict-demand/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { timeframe, targetDate } = demandPredictionSchema.parse(req.body);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const prediction = await aiAnalyticsService.predictDemand(
      restaurantId,
      timeframe,
      targetDate ? new Date(targetDate) : undefined
    );
    
    res.json({
      restaurantId,
      prediction,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error predicting demand: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Predict revenue
 */
router.post('/analytics/predict-revenue/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { timeframe, targetDate } = req.body;
    
    if (!['1d', '7d', '30d'].includes(timeframe)) {
      return res.status(400).json({ message: 'Invalid timeframe. Use 1d, 7d, or 30d' });
    }
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const prediction = await aiAnalyticsService.predictRevenue(
      restaurantId,
      timeframe,
      targetDate ? new Date(targetDate) : undefined
    );
    
    res.json({
      restaurantId,
      prediction,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    log(`Error predicting revenue: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Predict staffing needs
 */
router.post('/analytics/predict-staffing/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { targetDate, shifts } = staffingPredictionSchema.parse(req.body);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const predictions = await aiAnalyticsService.predictStaffingNeeds(
      restaurantId,
      new Date(targetDate),
      shifts
    );
    
    res.json({
      restaurantId,
      targetDate,
      staffingPredictions: predictions,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error predicting staffing needs: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Analyze customer segments
 */
router.get('/analytics/customer-segments/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const segments = await aiAnalyticsService.analyzeCustomerSegments(restaurantId);
    
    res.json({
      restaurantId,
      segments: segments.map(segment => ({
        ...segment,
        customerCount: segment.customers.length,
        customers: segment.customers.slice(0, 10) // Limit customer details for performance
      })),
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    log(`Error analyzing customer segments: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Predict customer churn
 */
router.get('/analytics/churn-prediction/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const churnPredictions = await aiAnalyticsService.predictCustomerChurn(restaurantId);
    
    res.json({
      restaurantId,
      predictions: churnPredictions.slice(0, limit),
      summary: {
        totalCustomers: churnPredictions.length,
        highRisk: churnPredictions.filter(p => p.churnRisk === 'High').length,
        mediumRisk: churnPredictions.filter(p => p.churnRisk === 'Medium').length,
        lowRisk: churnPredictions.filter(p => p.churnRisk === 'Low').length
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    log(`Error predicting customer churn: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Optimize menu pricing
 */
router.get('/analytics/pricing-optimization/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const optimizations = await aiAnalyticsService.optimizeMenuPricing(restaurantId);
    
    res.json({
      restaurantId,
      optimizations,
      summary: {
        totalItems: optimizations.length,
        avgExpectedRevenueIncrease: optimizations.length > 0 
          ? optimizations.reduce((sum, opt) => sum + opt.expectedRevenueChange, 0) / optimizations.length 
          : 0,
        totalPotentialRevenue: optimizations.reduce((sum, opt) => 
          sum + (opt.expectedRevenueChange * opt.currentPrice / 100), 0
        )
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    log(`Error optimizing menu pricing: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get AI insights dashboard
 */
router.get('/insights/dashboard/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    // Get multiple AI insights in parallel
    const [
      demandPrediction,
      revenuePrediction,
      trendingItems,
      customerSegments,
      churnPredictions,
      pricingOptimizations
    ] = await Promise.all([
      aiAnalyticsService.predictDemand(restaurantId, '1d'),
      aiAnalyticsService.predictRevenue(restaurantId, '7d'),
      aiRecommendationService.getTrendingItems(restaurantId, '7d'),
      aiAnalyticsService.analyzeCustomerSegments(restaurantId),
      aiAnalyticsService.predictCustomerChurn(restaurantId),
      aiAnalyticsService.optimizeMenuPricing(restaurantId)
    ]);
    
    const dashboard = {
      restaurantId,
      overview: {
        demandPrediction: {
          nextDay: demandPrediction.value,
          confidence: demandPrediction.confidence,
          trend: demandPrediction.factors.join(', ')
        },
        revenuePrediction: {
          nextWeek: revenuePrediction.value,
          confidence: revenuePrediction.confidence
        },
        customerHealth: {
          totalSegments: customerSegments.length,
          highRiskCustomers: churnPredictions.filter(p => p.churnRisk === 'High').length,
          vipCustomers: customerSegments.find(s => s.name === 'VIP Customers')?.customers.length || 0
        },
        pricingOpportunities: pricingOptimizations.length
      },
      quickInsights: [
        `${trendingItems.length} items are currently trending`,
        `${churnPredictions.filter(p => p.churnRisk === 'High').length} customers at high churn risk`,
        `${pricingOptimizations.length} pricing optimization opportunities`,
        `${Math.round(demandPrediction.confidence)}% confidence in demand predictions`
      ],
      recommendations: [
        ...churnPredictions.slice(0, 3).map(p => 
          `Re-engage ${p.customer.name} - ${p.churnRisk} churn risk`
        ),
        ...pricingOptimizations.slice(0, 2).map(opt => 
          `Consider ${opt.optimizedPrice > opt.currentPrice ? 'increasing' : 'decreasing'} price of ${opt.menuItem.name}`
        )
      ],
      generatedAt: new Date().toISOString()
    };
    
    res.json(dashboard);
  } catch (error) {
    log(`Error generating AI insights dashboard: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * AI Chatbot endpoint
 */
router.post('/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const { message, restaurantId, conversationHistory } = chatMessageSchema.parse(req.body);
    const userId = req.user!.id;
    
    // Convert conversation history to the expected format
    const history = conversationHistory?.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp)
    })) || [];
    
    const response = await aiChatbotService.processMessage(
      message,
      userId,
      restaurantId,
      history
    );
    
    res.json({
      response,
      timestamp: new Date().toISOString(),
      conversationId: `conv_${userId}_${Date.now()}`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    log(`Error processing chat message: ${error}`);
    res.status(500).json({ 
      response: {
        message: "I'm sorry, I'm having technical difficulties right now. Please try again in a moment.",
        suggestions: ["Try again", "Contact support"],
        confidence: 0.1
      }
    });
  }
});

/**
 * Get comprehensive AI insights
 */
router.get('/insights/comprehensive/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const insights = await aiOrchestrationService.getComprehensiveInsights(restaurantId);
    
    res.json({
      restaurantId,
      insights,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    log(`Error getting comprehensive AI insights: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Run AI optimization tasks
 */
router.post('/optimize/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const results = await aiOrchestrationService.runOptimizationTasks(restaurantId);
    
    res.json({
      restaurantId,
      optimization: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log(`Error running AI optimization: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get AI configuration
 */
router.get('/config', requireAdmin, async (req: Request, res: Response) => {
  try {
    const config = aiOrchestrationService.getConfiguration();
    
    res.json({
      config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log(`Error getting AI configuration: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Update AI configuration
 */
router.patch('/config', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    aiOrchestrationService.updateConfiguration(updates);
    const newConfig = aiOrchestrationService.getConfiguration();
    
    res.json({
      message: 'AI configuration updated successfully',
      config: newConfig,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log(`Error updating AI configuration: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get AI system health
 */
router.get('/system/health', requireOwner, async (req: Request, res: Response) => {
  try {
    const health = await aiOrchestrationService.getSystemHealth();
    
    res.json({
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log(`Error getting AI system health: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Export AI data
 */
router.get('/export/:restaurantId', requireOwner, async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    // Verify user has access to this restaurant
    if (req.user?.role !== 'admin' && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Access denied to this restaurant' });
    }
    
    const exportData = await aiOrchestrationService.exportData(restaurantId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ai-data-${restaurantId}-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    log(`Error exporting AI data: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Health check for AI services
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'healthy',
      services: {
        recommendations: 'operational',
        pricing: 'operational',
        analytics: 'operational',
        chatbot: 'operational',
        orchestration: 'operational'
      },
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export { router as aiRoutes };