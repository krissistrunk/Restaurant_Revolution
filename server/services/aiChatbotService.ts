import { storage } from '../storage';
import { aiRecommendationService } from './aiRecommendationService';
import { aiPricingService } from './aiPricingService';
import { aiAnalyticsService } from './aiAnalyticsService';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  data?: any;
  actions?: Array<{
    type: string;
    label: string;
    payload: any;
  }>;
  confidence: number;
}

/**
 * AI Chatbot service for natural language interactions
 */
export class AIChatbotService {
  
  /**
   * Process a chat message and generate a response
   */
  async processMessage(
    message: string,
    userId: number,
    restaurantId: number,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatbotResponse> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Determine intent and extract entities
    const intent = await this.classifyIntent(normalizedMessage);
    const entities = await this.extractEntities(normalizedMessage, restaurantId);
    
    // Generate response based on intent
    let response: ChatbotResponse;
    
    switch (intent.type) {
      case 'menu_recommendation':
        response = await this.handleMenuRecommendation(userId, restaurantId, entities, intent);
        break;
        
      case 'order_inquiry':
        response = await this.handleOrderInquiry(userId, entities);
        break;
        
      case 'restaurant_info':
        response = await this.handleRestaurantInfo(restaurantId, entities);
        break;
        
      case 'reservation':
        response = await this.handleReservationRequest(userId, restaurantId, entities);
        break;
        
      case 'pricing_question':
        response = await this.handlePricingQuestion(restaurantId, entities);
        break;
        
      case 'analytics_request':
        response = await this.handleAnalyticsRequest(restaurantId, entities, userId);
        break;
        
      case 'complaint_feedback':
        response = await this.handleComplaintFeedback(userId, restaurantId, message);
        break;
        
      case 'greeting':
        response = await this.handleGreeting(userId, restaurantId);
        break;
        
      case 'help':
        response = await this.handleHelp(userId);
        break;
        
      default:
        response = await this.handleGeneral(normalizedMessage, userId, restaurantId);
    }
    
    response.confidence = intent.confidence;
    return response;
  }
  
  /**
   * Classify the user's intent
   */
  private async classifyIntent(message: string): Promise<{ type: string; confidence: number }> {
    const patterns = {
      menu_recommendation: [
        /recommend|suggest|what should i|good|popular|best/,
        /menu|food|dish|meal|eat/,
        /vegetarian|vegan|gluten.free|dairy.free/
      ],
      order_inquiry: [
        /order|my order|order status|where.*order|when.*ready/,
        /track|status|ready|pick.*up|delivery/
      ],
      restaurant_info: [
        /hours|open|close|location|address|phone|contact/,
        /restaurant|about|info|details/
      ],
      reservation: [
        /book|reserve|table|seat|party/,
        /tonight|tomorrow|weekend|date/
      ],
      pricing_question: [
        /price|cost|how much|expensive|cheap|deal|special/,
        /\$|dollar|money|pay/
      ],
      analytics_request: [
        /sales|revenue|popular|trending|analytics|stats|report/,
        /how.*doing|business|performance/
      ],
      complaint_feedback: [
        /complaint|complain|problem|issue|wrong|bad|terrible|disappointed/,
        /feedback|review|experience/
      ],
      greeting: [
        /^(hi|hello|hey|good morning|good afternoon|good evening)/,
        /how are you|what.*up/
      ],
      help: [
        /help|assist|support|what can you|commands|options/
      ]
    };
    
    let bestMatch = { type: 'general', confidence: 0 };
    
    for (const [intentType, regexes] of Object.entries(patterns)) {
      let matches = 0;
      for (const regex of regexes) {
        if (regex.test(message)) {
          matches++;
        }
      }
      
      const confidence = matches / regexes.length;
      if (confidence > bestMatch.confidence) {
        bestMatch = { type: intentType, confidence };
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Extract entities from the message
   */
  private async extractEntities(message: string, restaurantId: number): Promise<any> {
    const entities: any = {};
    
    // Extract menu items
    const menuItems = await storage.getMenuItems(restaurantId);
    for (const item of menuItems) {
      const itemName = item.name.toLowerCase();
      if (message.includes(itemName)) {
        entities.menuItem = item;
        break;
      }
    }
    
    // Extract dietary preferences
    if (/vegetarian|veggie/i.test(message)) entities.dietary = 'vegetarian';
    if (/vegan/i.test(message)) entities.dietary = 'vegan';
    if (/gluten.free/i.test(message)) entities.dietary = 'gluten-free';
    if (/keto/i.test(message)) entities.dietary = 'keto';
    
    // Extract time references
    if (/tonight|today/i.test(message)) entities.when = 'today';
    if (/tomorrow/i.test(message)) entities.when = 'tomorrow';
    if (/weekend/i.test(message)) entities.when = 'weekend';
    
    // Extract numbers (party size, etc.)
    const numbers = message.match(/\d+/g);
    if (numbers) {
      entities.number = parseInt(numbers[0]);
    }
    
    return entities;
  }
  
  /**
   * Handle menu recommendation requests
   */
  private async handleMenuRecommendation(
    userId: number,
    restaurantId: number,
    entities: any,
    intent: any
  ): Promise<ChatbotResponse> {
    try {
      let recommendations;
      
      if (entities.dietary) {
        recommendations = await aiRecommendationService.getDietaryRecommendations(
          restaurantId,
          entities.dietary
        );
      } else {
        const result = await aiRecommendationService.getPersonalizedRecommendations(
          userId,
          restaurantId,
          { limit: 5 }
        );
        recommendations = result.recommendations;
      }
      
      if (recommendations.length === 0) {
        return {
          message: "I'm sorry, I couldn't find any recommendations that match your preferences right now. Would you like to see our popular items instead?",
          suggestions: ["Show popular items", "Browse menu", "Help me choose"],
          confidence: 0.8
        };
      }
      
      const topItems = recommendations.slice(0, 3);
      const itemList = topItems.map((item, index) => 
        `${index + 1}. **${item.name}** - $${item.price}\n   ${item.description}`
      ).join('\n\n');
      
      const message = entities.dietary 
        ? `Here are some great ${entities.dietary} options for you:\n\n${itemList}`
        : `Based on your preferences, I recommend:\n\n${itemList}`;
      
      return {
        message,
        suggestions: [
          "Tell me more about #1",
          "Add to cart",
          "See more recommendations",
          "Browse full menu"
        ],
        data: { recommendations: topItems },
        actions: topItems.map(item => ({
          type: 'view_item',
          label: `View ${item.name}`,
          payload: { itemId: item.id }
        })),
        confidence: intent.confidence
      };
    } catch (error) {
      return {
        message: "I'm having trouble accessing our menu right now. Please try again in a moment.",
        suggestions: ["Try again", "Browse menu", "Contact support"],
        confidence: 0.5
      };
    }
  }
  
  /**
   * Handle order status inquiries
   */
  private async handleOrderInquiry(userId: number, entities: any): Promise<ChatbotResponse> {
    try {
      const orders = await storage.getUserOrders(userId);
      const activeOrders = orders.filter(o => 
        ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
      );
      
      if (activeOrders.length === 0) {
        return {
          message: "You don't have any active orders right now. Would you like to place a new order?",
          suggestions: ["Place new order", "View menu", "Order history"],
          actions: [{
            type: 'place_order',
            label: 'Start ordering',
            payload: {}
          }],
          confidence: 0.9
        };
      }
      
      const latestOrder = activeOrders[0];
      const orderItems = await storage.getOrderItems(latestOrder.id);
      
      let statusMessage = '';
      switch (latestOrder.status) {
        case 'pending':
          statusMessage = 'Your order has been received and is being processed.';
          break;
        case 'confirmed':
          statusMessage = 'Your order has been confirmed and will start being prepared shortly.';
          break;
        case 'preparing':
          statusMessage = 'Your order is currently being prepared in our kitchen.';
          break;
        case 'ready':
          statusMessage = 'Great news! Your order is ready for pickup.';
          break;
      }
      
      const itemsList = orderItems.map(item => `${item.quantity}x ${item.menuItemId}`).join(', ');
      
      return {
        message: `**Order #${latestOrder.id}**\n${statusMessage}\n\nItems: ${itemsList}\nTotal: $${latestOrder.totalPrice}`,
        suggestions: ["Track order", "Contact restaurant", "Order again"],
        data: { order: latestOrder, items: orderItems },
        confidence: 0.95
      };
    } catch (error) {
      return {
        message: "I'm having trouble accessing your order information. Please try again or contact the restaurant directly.",
        suggestions: ["Try again", "Contact restaurant", "Help"],
        confidence: 0.5
      };
    }
  }
  
  /**
   * Handle restaurant information requests
   */
  private async handleRestaurantInfo(restaurantId: number, entities: any): Promise<ChatbotResponse> {
    try {
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) {
        return {
          message: "I'm sorry, I couldn't find restaurant information right now.",
          suggestions: ["Try again", "Contact support"],
          confidence: 0.3
        };
      }
      
      let message = `**${restaurant.name}**\n\n`;
      
      if (restaurant.description) {
        message += `${restaurant.description}\n\n`;
      }
      
      message += `📍 **Address:** ${restaurant.address}\n`;
      message += `📞 **Phone:** ${restaurant.phone}\n`;
      
      if (restaurant.openingHours) {
        message += `\n🕒 **Hours:**\n`;
        const hours = restaurant.openingHours as any;
        Object.entries(hours).forEach(([day, time]) => {
          message += `${day.charAt(0).toUpperCase() + day.slice(1)}: ${time}\n`;
        });
      }
      
      return {
        message,
        suggestions: ["View menu", "Make reservation", "Get directions"],
        data: { restaurant },
        actions: [
          {
            type: 'get_directions',
            label: 'Get Directions',
            payload: { address: restaurant.address }
          },
          {
            type: 'call_restaurant',
            label: 'Call Restaurant',
            payload: { phone: restaurant.phone }
          }
        ],
        confidence: 0.95
      };
    } catch (error) {
      return {
        message: "I'm having trouble accessing restaurant information. Please try again.",
        suggestions: ["Try again", "Contact support"],
        confidence: 0.5
      };
    }
  }
  
  /**
   * Handle reservation requests
   */
  private async handleReservationRequest(
    userId: number,
    restaurantId: number,
    entities: any
  ): Promise<ChatbotResponse> {
    const partySize = entities.number || 2;
    const when = entities.when || 'today';
    
    return {
      message: `I'd be happy to help you make a reservation! It looks like you're interested in a table for ${partySize} ${when}.\n\nTo complete your reservation, I'll need a few more details:`,
      suggestions: [
        "Book for tonight",
        "Book for tomorrow",
        "Choose different time",
        "Party size: " + partySize
      ],
      actions: [
        {
          type: 'make_reservation',
          label: 'Make Reservation',
          payload: { partySize, when, restaurantId, userId }
        }
      ],
      confidence: 0.8
    };
  }
  
  /**
   * Handle pricing questions
   */
  private async handlePricingQuestion(restaurantId: number, entities: any): Promise<ChatbotResponse> {
    try {
      if (entities.menuItem) {
        const item = entities.menuItem;
        const pricing = await aiPricingService.getDynamicPrice(item.id, restaurantId);
        
        let message = `**${item.name}** is currently $${pricing.dynamicPrice}`;
        
        if (pricing.originalPrice !== pricing.dynamicPrice) {
          message += ` (regular price: $${pricing.originalPrice})`;
        }
        
        if (pricing.adjustments.length > 0) {
          message += `\n\nPrice factors: ${pricing.adjustments.map(adj => adj.reasoning).join(', ')}`;
        }
        
        return {
          message,
          suggestions: ["Add to cart", "View details", "See similar items"],
          data: { item, pricing },
          actions: [
            {
              type: 'add_to_cart',
              label: 'Add to Cart',
              payload: { itemId: item.id }
            }
          ],
          confidence: 0.9
        };
      } else {
        const menuItems = await storage.getMenuItems(restaurantId);
        const priceRanges = {
          appetizers: menuItems.filter(i => i.categoryId === 1),
          mains: menuItems.filter(i => i.categoryId === 2),
          desserts: menuItems.filter(i => i.categoryId === 5)
        };
        
        let message = "Here's an overview of our pricing:\n\n";
        
        for (const [category, items] of Object.entries(priceRanges)) {
          if (items.length > 0) {
            const prices = items.map(i => i.price);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            message += `**${category.charAt(0).toUpperCase() + category.slice(1)}:** $${min} - $${max}\n`;
          }
        }
        
        return {
          message,
          suggestions: ["View menu", "See specials", "Budget options"],
          confidence: 0.8
        };
      }
    } catch (error) {
      return {
        message: "I'm having trouble accessing pricing information. Please check our menu or contact the restaurant.",
        suggestions: ["View menu", "Contact restaurant"],
        confidence: 0.5
      };
    }
  }
  
  /**
   * Handle analytics requests (for restaurant owners)
   */
  private async handleAnalyticsRequest(
    restaurantId: number,
    entities: any,
    userId: number
  ): Promise<ChatbotResponse> {
    try {
      // Check if user has access to analytics
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
        return {
          message: "I'm sorry, analytics information is only available to restaurant owners and managers.",
          suggestions: ["View menu", "Make reservation", "Contact support"],
          confidence: 0.9
        };
      }
      
      // Get basic analytics
      const orders = await storage.getRestaurantOrders(restaurantId);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart);
      const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      
      const message = `**Today's Performance:**\n\n📊 Orders: ${todayOrders.length}\n💰 Revenue: $${todayRevenue.toFixed(2)}\n📈 Avg Order: $${todayOrders.length > 0 ? (todayRevenue / todayOrders.length).toFixed(2) : '0.00'}`;
      
      return {
        message,
        suggestions: ["Detailed analytics", "Revenue trends", "Customer insights"],
        actions: [
          {
            type: 'view_analytics',
            label: 'View Full Dashboard',
            payload: { restaurantId }
          }
        ],
        confidence: 0.9
      };
    } catch (error) {
      return {
        message: "I'm having trouble accessing analytics data. Please try again.",
        suggestions: ["Try again", "Contact support"],
        confidence: 0.5
      };
    }
  }
  
  /**
   * Handle complaints and feedback
   */
  private async handleComplaintFeedback(
    userId: number,
    restaurantId: number,
    message: string
  ): Promise<ChatbotResponse> {
    // In production, this would create a support ticket
    return {
      message: "I'm sorry to hear about your experience. Your feedback is very important to us. I've recorded your concern and a manager will follow up with you shortly.\n\nIs there anything I can help you with right now to improve your experience?",
      suggestions: ["Speak to manager", "Request refund", "Leave detailed review"],
      actions: [
        {
          type: 'create_support_ticket',
          label: 'Create Support Ticket',
          payload: { userId, restaurantId, message }
        }
      ],
      confidence: 0.9
    };
  }
  
  /**
   * Handle greetings
   */
  private async handleGreeting(userId: number, restaurantId: number): Promise<ChatbotResponse> {
    const user = await storage.getUser(userId);
    const restaurant = await storage.getRestaurant(restaurantId);
    
    const greeting = user 
      ? `Hello ${user.name}! Welcome back to ${restaurant?.name || 'our restaurant'}.`
      : `Hello! Welcome to ${restaurant?.name || 'our restaurant'}.`;
    
    return {
      message: `${greeting} I'm your AI assistant and I'm here to help you with menu recommendations, orders, reservations, and any questions you might have. What can I do for you today?`,
      suggestions: [
        "Recommend something delicious",
        "Check my order",
        "Make a reservation",
        "Restaurant info"
      ],
      confidence: 0.95
    };
  }
  
  /**
   * Handle help requests
   */
  private async handleHelp(userId: number): Promise<ChatbotResponse> {
    return {
      message: "I'm here to help! Here's what I can do for you:\n\n🍽️ **Menu & Food:**\n- Get personalized recommendations\n- Find dishes for dietary needs\n- Check prices and specials\n\n📱 **Orders:**\n- Check order status\n- Track delivery\n- Order history\n\n🪑 **Reservations:**\n- Book a table\n- Check availability\n- Modify reservations\n\n🏪 **Restaurant Info:**\n- Hours and location\n- Contact information\n- Current offers\n\nJust ask me in natural language - I understand!",
      suggestions: [
        "Recommend food",
        "Check my order",
        "Make reservation",
        "Restaurant hours"
      ],
      confidence: 0.95
    };
  }
  
  /**
   * Handle general/unclassified messages
   */
  private async handleGeneral(
    message: string,
    userId: number,
    restaurantId: number
  ): Promise<ChatbotResponse> {
    return {
      message: "I'm not sure I understand what you're looking for. Could you try asking about:\n\n• Menu recommendations\n• Order status\n• Restaurant information\n• Making a reservation\n\nOr just say 'help' to see everything I can do!",
      suggestions: [
        "Help",
        "Recommend food",
        "Restaurant info",
        "Make reservation"
      ],
      confidence: 0.3
    };
  }
}

export const aiChatbotService = new AIChatbotService();