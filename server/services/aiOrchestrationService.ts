import { storage } from '../storage';
import { aiRecommendationService } from './aiRecommendationService';
import { aiPricingService } from './aiPricingService';
import { aiAnalyticsService } from './aiAnalyticsService';
import { aiChatbotService } from './aiChatbotService';

interface AIConfiguration {
  recommendations: {
    enabled: boolean;
    algorithms: string[];
    defaultWeights: Record<string, number>;
    refreshInterval: number; // minutes
  };
  pricing: {
    enabled: boolean;
    maxPriceIncrease: number;
    maxPriceDecrease: number;
    updateFrequency: number; // minutes
    factors: string[];
  };
  analytics: {
    enabled: boolean;
    predictionHorizon: number; // days
    confidenceThreshold: number;
    refreshInterval: number; // minutes
  };
  chatbot: {
    enabled: boolean;
    maxConversationLength: number;
    confidenceThreshold: number;
    fallbackToHuman: boolean;
  };
}

interface AIPerformanceMetrics {
  recommendations: {
    accuracy: number;
    clickThroughRate: number;
    conversionRate: number;
    avgResponseTime: number;
  };
  pricing: {
    revenueImpact: number;
    demandAccuracy: number;
    priceOptimizationSuccess: number;
  };
  analytics: {
    predictionAccuracy: number;
    falsePositiveRate: number;
    businessValueGenerated: number;
  };
  chatbot: {
    intentAccuracy: number;
    resolutionRate: number;
    userSatisfaction: number;
    escalationRate: number;
  };
}

/**
 * AI Orchestration Service for managing all AI components
 */
export class AIOrchestrationService {
  private config: AIConfiguration;
  private performanceCache: Map<string, any> = new Map();
  
  constructor() {
    this.config = this.getDefaultConfig();
  }
  
  /**
   * Get the current AI configuration
   */
  getConfiguration(): AIConfiguration {
    return { ...this.config };
  }
  
  /**
   * Update AI configuration
   */
  updateConfiguration(updates: Partial<AIConfiguration>): void {
    this.config = { ...this.config, ...updates };
    this.invalidateCache();
  }
  
  /**
   * Get comprehensive AI insights for a restaurant
   */
  async getComprehensiveInsights(restaurantId: number): Promise<{
    recommendations: any;
    pricing: any;
    analytics: any;
    performance: AIPerformanceMetrics;
    alerts: string[];
    suggestions: string[];
  }> {
    const cacheKey = `insights_${restaurantId}`;
    const cached = this.performanceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
      return cached.data;
    }
    
    // Gather insights from all AI services in parallel
    const [
      trendingItems,
      pricingOptimizations,
      demandPrediction,
      revenuePrediction,
      customerSegments,
      churnPredictions
    ] = await Promise.all([
      this.config.recommendations.enabled 
        ? aiRecommendationService.getTrendingItems(restaurantId)
        : [],
      this.config.pricing.enabled 
        ? aiPricingService.getPriceOptimizationRecommendations(restaurantId)
        : [],
      this.config.analytics.enabled 
        ? aiAnalyticsService.predictDemand(restaurantId, '1d')
        : null,
      this.config.analytics.enabled 
        ? aiAnalyticsService.predictRevenue(restaurantId, '7d')
        : null,
      this.config.analytics.enabled 
        ? aiAnalyticsService.analyzeCustomerSegments(restaurantId)
        : [],
      this.config.analytics.enabled 
        ? aiAnalyticsService.predictCustomerChurn(restaurantId)
        : []
    ]);
    
    // Calculate performance metrics
    const performance = await this.calculatePerformanceMetrics(restaurantId);
    
    // Generate alerts and suggestions
    const { alerts, suggestions } = this.generateAlertsAndSuggestions({
      pricingOptimizations,
      demandPrediction,
      revenuePrediction,
      churnPredictions,
      performance
    });
    
    const insights = {
      recommendations: {
        trending: trendingItems,
        totalTrendingItems: trendingItems.length,
        lastUpdated: new Date().toISOString()
      },
      pricing: {
        optimizations: pricingOptimizations,
        totalOpportunities: pricingOptimizations.length,
        potentialRevenue: pricingOptimizations.reduce((sum, opt) => 
          sum + (opt.expectedRevenueChange * opt.currentPrice / 100), 0
        )
      },
      analytics: {
        demand: demandPrediction,
        revenue: revenuePrediction,
        customerSegments: customerSegments.map(seg => ({
          name: seg.name,
          count: seg.customers.length,
          characteristics: seg.characteristics
        })),
        churnRisk: {
          high: churnPredictions.filter(p => p.churnRisk === 'High').length,
          medium: churnPredictions.filter(p => p.churnRisk === 'Medium').length,
          low: churnPredictions.filter(p => p.churnRisk === 'Low').length
        }
      },
      performance,
      alerts,
      suggestions
    };
    
    // Cache the results
    this.performanceCache.set(cacheKey, {
      data: insights,
      timestamp: Date.now()
    });
    
    return insights;
  }
  
  /**
   * Run AI optimization tasks
   */
  async runOptimizationTasks(restaurantId: number): Promise<{
    tasksRun: string[];
    results: Record<string, any>;
    errors: string[];
  }> {
    const tasksRun: string[] = [];
    const results: Record<string, any> = {};
    const errors: string[] = [];
    
    try {
      // Task 1: Update trending items
      if (this.config.recommendations.enabled) {
        const trending = await aiRecommendationService.getTrendingItems(restaurantId);
        results.trendingUpdate = { count: trending.length, updated: new Date() };
        tasksRun.push('trending_items_update');
      }
      
      // Task 2: Refresh pricing optimizations
      if (this.config.pricing.enabled) {
        const pricingOpts = await aiPricingService.getPriceOptimizationRecommendations(restaurantId);
        results.pricingOptimization = { opportunities: pricingOpts.length, updated: new Date() };
        tasksRun.push('pricing_optimization');
      }
      
      // Task 3: Update customer risk assessments
      if (this.config.analytics.enabled) {
        const churnPredictions = await aiAnalyticsService.predictCustomerChurn(restaurantId);
        const highRisk = churnPredictions.filter(p => p.churnRisk === 'High');
        results.churnAnalysis = { highRisk: highRisk.length, total: churnPredictions.length, updated: new Date() };
        tasksRun.push('churn_analysis');
      }
      
      // Task 4: Performance monitoring
      const performance = await this.calculatePerformanceMetrics(restaurantId);
      results.performanceMetrics = performance;
      tasksRun.push('performance_monitoring');
      
    } catch (error) {
      errors.push(`Optimization task failed: ${error.message}`);
    }
    
    return { tasksRun, results, errors };
  }
  
  /**
   * Calculate AI performance metrics
   */
  private async calculatePerformanceMetrics(restaurantId: number): Promise<AIPerformanceMetrics> {
    // In production, these would be calculated from real interaction data
    // For now, we'll use mock calculations based on available data
    
    const orders = await storage.getRestaurantOrders(restaurantId);
    const menuItems = await storage.getMenuItems(restaurantId);
    
    // Mock metrics - in production, track actual user interactions
    return {
      recommendations: {
        accuracy: 0.75 + Math.random() * 0.2, // 75-95%
        clickThroughRate: 0.12 + Math.random() * 0.08, // 12-20%
        conversionRate: 0.08 + Math.random() * 0.07, // 8-15%
        avgResponseTime: 150 + Math.random() * 100 // 150-250ms
      },
      pricing: {
        revenueImpact: (Math.random() * 10 - 2), // -2% to +8%
        demandAccuracy: 0.7 + Math.random() * 0.25, // 70-95%
        priceOptimizationSuccess: 0.6 + Math.random() * 0.3 // 60-90%
      },
      analytics: {
        predictionAccuracy: 0.72 + Math.random() * 0.23, // 72-95%
        falsePositiveRate: Math.random() * 0.15, // 0-15%
        businessValueGenerated: Math.random() * 5000 // $0-$5000
      },
      chatbot: {
        intentAccuracy: 0.8 + Math.random() * 0.15, // 80-95%
        resolutionRate: 0.65 + Math.random() * 0.25, // 65-90%
        userSatisfaction: 0.7 + Math.random() * 0.25, // 70-95%
        escalationRate: Math.random() * 0.2 // 0-20%
      }
    };
  }
  
  /**
   * Generate alerts and suggestions based on AI insights
   */
  private generateAlertsAndSuggestions(data: any): { alerts: string[]; suggestions: string[] } {
    const alerts: string[] = [];
    const suggestions: string[] = [];
    
    // Pricing alerts
    if (data.pricingOptimizations?.length > 5) {
      alerts.push(`${data.pricingOptimizations.length} menu items have significant pricing optimization opportunities`);
    }
    
    // Demand alerts
    if (data.demandPrediction?.confidence < 60) {
      alerts.push('Low confidence in demand predictions - consider collecting more data');
    }
    
    // Customer churn alerts
    const highRiskCustomers = data.churnPredictions?.filter(p => p.churnRisk === 'High')?.length || 0;
    if (highRiskCustomers > 10) {
      alerts.push(`${highRiskCustomers} customers are at high risk of churning`);
    }
    
    // Performance alerts
    if (data.performance?.recommendations?.accuracy < 0.7) {
      alerts.push('Recommendation accuracy is below target (70%)');
    }
    
    if (data.performance?.chatbot?.escalationRate > 0.3) {
      alerts.push('High chatbot escalation rate - consider improving AI training');
    }
    
    // Suggestions
    if (data.pricingOptimizations?.length > 0) {
      suggestions.push('Review pricing optimization recommendations to increase revenue');
    }
    
    if (data.churnPredictions?.length > 0) {
      suggestions.push('Implement retention campaigns for at-risk customers');
    }
    
    if (data.demandPrediction?.value) {
      if (data.demandPrediction.value > 50) {
        suggestions.push('High demand predicted - consider increasing staff and inventory');
      } else if (data.demandPrediction.value < 10) {
        suggestions.push('Low demand predicted - consider promotional campaigns');
      }
    }
    
    return { alerts, suggestions };
  }
  
  /**
   * Get AI system health status
   */
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    services: Record<string, { status: string; lastCheck: Date; metrics?: any }>;
    recommendations: string[];
  }> {
    const services: Record<string, any> = {};
    const recommendations: string[] = [];
    
    // Check each AI service
    try {
      // Recommendations service
      services.recommendations = {
        status: this.config.recommendations.enabled ? 'operational' : 'disabled',
        lastCheck: new Date(),
        metrics: {
          algorithmsActive: this.config.recommendations.algorithms.length,
          refreshInterval: this.config.recommendations.refreshInterval
        }
      };
      
      // Pricing service
      services.pricing = {
        status: this.config.pricing.enabled ? 'operational' : 'disabled',
        lastCheck: new Date(),
        metrics: {
          maxPriceIncrease: this.config.pricing.maxPriceIncrease,
          maxPriceDecrease: this.config.pricing.maxPriceDecrease,
          updateFrequency: this.config.pricing.updateFrequency
        }
      };
      
      // Analytics service
      services.analytics = {
        status: this.config.analytics.enabled ? 'operational' : 'disabled',
        lastCheck: new Date(),
        metrics: {
          predictionHorizon: this.config.analytics.predictionHorizon,
          confidenceThreshold: this.config.analytics.confidenceThreshold
        }
      };
      
      // Chatbot service
      services.chatbot = {
        status: this.config.chatbot.enabled ? 'operational' : 'disabled',
        lastCheck: new Date(),
        metrics: {
          maxConversationLength: this.config.chatbot.maxConversationLength,
          confidenceThreshold: this.config.chatbot.confidenceThreshold
        }
      };
      
    } catch (error) {
      services.error = {
        status: 'error',
        lastCheck: new Date(),
        error: error.message
      };
      recommendations.push('Investigate AI service connectivity issues');
    }
    
    // Determine overall health
    const activeServices = Object.values(services).filter(s => s.status === 'operational');
    const errorServices = Object.values(services).filter(s => s.status === 'error');
    
    let overall: 'healthy' | 'warning' | 'critical';
    if (errorServices.length > 0) {
      overall = 'critical';
      recommendations.push('Critical AI services are down - immediate attention required');
    } else if (activeServices.length < 2) {
      overall = 'warning';
      recommendations.push('Most AI services are disabled - consider enabling for better insights');
    } else {
      overall = 'healthy';
    }
    
    return { overall, services, recommendations };
  }
  
  /**
   * Get default AI configuration
   */
  private getDefaultConfig(): AIConfiguration {
    return {
      recommendations: {
        enabled: true,
        algorithms: ['collaborative_filtering', 'content_based', 'behavior_analysis'],
        defaultWeights: {
          collaborative: 0.3,
          content: 0.25,
          behavior: 0.2,
          weather: 0.1,
          timing: 0.1,
          pricing: 0.05
        },
        refreshInterval: 15 // minutes
      },
      pricing: {
        enabled: true,
        maxPriceIncrease: 0.25, // 25%
        maxPriceDecrease: 0.20, // 20%
        updateFrequency: 30, // minutes
        factors: ['demand', 'time', 'weather', 'inventory', 'seasonal', 'day_of_week']
      },
      analytics: {
        enabled: true,
        predictionHorizon: 30, // days
        confidenceThreshold: 0.7, // 70%
        refreshInterval: 60 // minutes
      },
      chatbot: {
        enabled: true,
        maxConversationLength: 50, // messages
        confidenceThreshold: 0.6, // 60%
        fallbackToHuman: true
      }
    };
  }
  
  /**
   * Clear performance cache
   */
  private invalidateCache(): void {
    this.performanceCache.clear();
  }
  
  /**
   * Export AI configuration and performance data
   */
  async exportData(restaurantId: number): Promise<{
    config: AIConfiguration;
    performance: AIPerformanceMetrics;
    insights: any;
    exportedAt: string;
  }> {
    const performance = await this.calculatePerformanceMetrics(restaurantId);
    const insights = await this.getComprehensiveInsights(restaurantId);
    
    return {
      config: this.config,
      performance,
      insights,
      exportedAt: new Date().toISOString()
    };
  }
}

export const aiOrchestrationService = new AIOrchestrationService();