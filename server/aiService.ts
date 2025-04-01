import { IStorage } from "./storage";
import { User, MenuItem, Restaurant } from "../shared/schema";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ConversationContext {
  userId?: number;
  restaurantId?: number;
  selectedMenuItems?: number[];
  reservationDetails?: {
    date?: string;
    time?: string;
    partySize?: number;
  };
  orderContext?: {
    pickupTime?: string;
    items?: any[];
  };
}

interface RestaurantHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  [key: string]: string;
}

export class AiService {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  async processMessage(conversationId: number, userMessage: Message): Promise<Message> {
    // Get the conversation
    const conversation = await this.storage.getAiConversation(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    // Get user and restaurant data
    const user = await this.storage.getUser(conversation.userId);
    const restaurant = await this.storage.getRestaurant(conversation.restaurantId);
    
    if (!user || !restaurant) {
      throw new Error("User or restaurant not found");
    }
    
    // Process the message based on content
    const response = await this.generateResponse(
      userMessage.content,
      user,
      restaurant,
      conversation.context || {}
    );
    
    // Return assistant message
    return {
      role: "assistant",
      content: response,
      timestamp: new Date()
    };
  }
  
  private async generateResponse(
    userMessage: string,
    user: User,
    restaurant: Restaurant,
    context: ConversationContext
  ): Promise<string> {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Check for greetings
    if (this.containsGreeting(lowerCaseMessage)) {
      return `Hello, ${user.name}! I'm your personal assistant for ${restaurant.name}. I can help you with menu recommendations, making reservations, or placing orders. How can I help you today?`;
    }
    
    // Check for menu recommendations
    if (this.isAskingForRecommendations(lowerCaseMessage)) {
      return await this.getMenuRecommendations(user, restaurant);
    }
    
    // Check for reservation requests
    if (this.isAskingAboutReservation(lowerCaseMessage)) {
      return this.handleReservationRequest(lowerCaseMessage, restaurant, context);
    }
    
    // Check for ordering requests
    if (this.isAskingAboutOrdering(lowerCaseMessage)) {
      return this.handleOrderingRequest(lowerCaseMessage, restaurant, context);
    }
    
    // Check for loyalty program questions
    if (this.isAskingAboutLoyalty(lowerCaseMessage)) {
      return this.handleLoyaltyQuestion(user, restaurant);
    }
    
    // Default response
    return "I'm here to help with menu recommendations, reservations, and orders. What would you like assistance with?";
  }
  
  private containsGreeting(message: string): boolean {
    const greetings = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"];
    return greetings.some(greeting => message.includes(greeting));
  }
  
  private isAskingForRecommendations(message: string): boolean {
    const recommendationKeywords = [
      "recommend", "suggestion", "what's good", "best dish", "popular", "favorite",
      "what should i try", "what's tasty", "special", "what do you recommend"
    ];
    return recommendationKeywords.some(keyword => message.includes(keyword));
  }
  
  private async getMenuRecommendations(user: User, restaurant: Restaurant): Promise<string> {
    // Get personalized recommendations for the user
    const recommendations = await this.storage.getPersonalizedMenuRecommendations(user.id, restaurant.id, 3);
    
    if (recommendations.length === 0) {
      return "I don't have any specific recommendations for you yet. Try exploring our menu to help me learn your preferences!";
    }
    
    // Create response with recommendations
    let response = `Based on your preferences, I'd recommend these items from our menu:\n\n`;
    
    recommendations.forEach((item, index) => {
      const description = item.description || '';
      response += `${index + 1}. **${item.name}** - ${description.substring(0, 80)}${description.length > 80 ? '...' : ''} ($${item.price.toFixed(2)})\n`;
    });
    
    response += `\nWould you like more details about any of these items?`;
    
    return response;
  }
  
  private isAskingAboutReservation(message: string): boolean {
    const reservationKeywords = [
      "reservation", "reserve", "book", "table", "when can i come",
      "availability", "available time", "busy", "how many people"
    ];
    return reservationKeywords.some(keyword => message.includes(keyword));
  }
  
  private handleReservationRequest(message: string, restaurant: Restaurant, context: ConversationContext): string {
    // Simple response about reservations
    return `Yes, I can help you make a reservation at ${restaurant.name}.
    
Would you like to reserve a table? I'll need to know what day, what time, and how many people will be in your party.`;
  }
  
  private isAskingAboutOrdering(message: string): boolean {
    const orderKeywords = [
      "order", "take out", "takeout", "delivery", "pick up", "pickup",
      "to go", "buy", "purchase", "get food", "menu", "place an order"
    ];
    return orderKeywords.some(keyword => message.includes(keyword));
  }
  
  private handleOrderingRequest(message: string, restaurant: Restaurant, context: ConversationContext): string {
    return `I'd be happy to help you place an order for pickup or delivery from ${restaurant.name}. 
    
You can browse our full menu and add items to your cart. Is there something specific you're interested in ordering?`;
  }
  
  private isAskingAboutLoyalty(message: string): boolean {
    const loyaltyKeywords = [
      "loyalty", "points", "rewards", "frequent", "discount", "member",
      "membership", "how many points", "earn points", "redeem"
    ];
    return loyaltyKeywords.some(keyword => message.includes(keyword));
  }
  
  private async handleLoyaltyQuestion(user: User, restaurant: Restaurant): Promise<string> {
    // Get loyalty rewards
    const rewards = await this.storage.getLoyaltyRewards(restaurant.id);
    
    let response = `You currently have ${user.loyaltyPoints} loyalty points at ${restaurant.name}. `;
    
    if (rewards.length > 0) {
      response += `Here's what you can redeem:\n\n`;
      
      rewards.forEach(reward => {
        const canRedeem = user.loyaltyPoints >= reward.pointsRequired;
        
        response += `- ${reward.name} (${reward.pointsRequired} points): ${reward.description}${canRedeem ? ' - **Available to redeem now!**' : ''}\n`;
      });
      
      response += `\nYou earn 1 point for every $1 spent on orders. Would you like to redeem any rewards?`;
    } else {
      response += `Keep ordering to earn more points!`;
    }
    
    return response;
  }
}

export default AiService;