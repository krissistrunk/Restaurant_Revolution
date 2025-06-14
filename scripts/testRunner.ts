import { db } from "../server/db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

interface TestResult {
  test: string;
  passed: boolean;
  details?: string;
  data?: any;
}

class RestaurantTestRunner {
  private results: TestResult[] = [];
  private baseUrl = "http://localhost:5000/api";

  private async apiCall(endpoint: string, method: string = "GET", body?: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  private addResult(test: string, passed: boolean, details?: string, data?: any) {
    this.results.push({ test, passed, details, data });
    console.log(`${passed ? '✅' : '❌'} ${test}${details ? `: ${details}` : ''}`);
  }

  async testDatabaseConnectivity() {
    console.log("\n🔗 Testing Database Connectivity...");
    
    try {
      // Test direct database query
      const users = await db.select().from(schema.users).limit(1);
      this.addResult("Database connection", true, `Found ${users.length} users`);
      
      const restaurants = await db.select().from(schema.restaurants).limit(1);
      this.addResult("Restaurant data access", true, `Restaurant: ${restaurants[0]?.name}`);
      
      const menuItems = await db.select().from(schema.menuItems).limit(5);
      this.addResult("Menu items retrieval", true, `Found ${menuItems.length} menu items`);
      
    } catch (error) {
      this.addResult("Database connectivity", false, error.message);
    }
  }

  async testRestaurantAPI() {
    console.log("\n🏪 Testing Restaurant API...");
    
    try {
      // Test restaurant info
      const restaurant = await this.apiCall("/restaurant");
      this.addResult("Get restaurant info", true, `${restaurant.name} - ${restaurant.address}`);
      
      // Test categories
      const categories = await this.apiCall("/categories");
      this.addResult("Get categories", true, `Found ${categories.length} categories`);
      
      // Test menu items
      const menuItems = await this.apiCall("/menu-items");
      this.addResult("Get menu items", true, `Found ${menuItems.length} menu items`);
      
      // Test featured items
      const featuredItems = await this.apiCall("/featured-items");
      this.addResult("Get featured items", true, `Found ${featuredItems.length} featured items`);
      
      // Test specific menu item
      if (menuItems.length > 0) {
        const item = await this.apiCall(`/menu-items/${menuItems[0].id}`);
        this.addResult("Get specific menu item", true, `${item.name} - $${item.price}`);
      }
      
    } catch (error) {
      this.addResult("Restaurant API", false, error.message);
    }
  }

  async testUserAuthentication() {
    console.log("\n👤 Testing User Authentication...");
    
    try {
      // Test user registration
      const newUser = {
        username: `testuser_${Date.now()}`,
        password: "testpass123",
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        phone: "(555) 000-0000"
      };
      
      const registeredUser = await this.apiCall("/auth/register", "POST", newUser);
      this.addResult("User registration", true, `Created user: ${registeredUser.name}`);
      
      // Test user login
      const loginResult = await this.apiCall("/auth/login", "POST", {
        username: "john_customer",
        password: "password123"
      });
      this.addResult("User login", true, `Logged in: ${loginResult.name}`);
      
      // Test get user info
      const userInfo = await this.apiCall(`/auth/user?userId=${loginResult.id}`);
      this.addResult("Get user info", true, `User: ${userInfo.name}, Points: ${userInfo.loyaltyPoints}`);
      
    } catch (error) {
      this.addResult("User authentication", false, error.message);
    }
  }

  async testOrderSystem() {
    console.log("\n🛒 Testing Order System...");
    
    try {
      // Get a test user
      const users = await db.select().from(schema.users).where(eq(schema.users.username, "john_customer"));
      const testUser = users[0];
      
      if (!testUser) {
        this.addResult("Order system setup", false, "Test user not found");
        return;
      }
      
      // Get menu items for ordering
      const menuItems = await this.apiCall("/menu-items");
      
      if (menuItems.length === 0) {
        this.addResult("Order system setup", false, "No menu items available");
        return;
      }
      
      // Create test order
      const orderData = {
        userId: testUser.id,
        restaurantId: 1,
        totalPrice: 45.98,
        pickupTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        status: "pending"
      };
      
      const order = await this.apiCall("/orders", "POST", orderData);
      this.addResult("Create order", true, `Order #${order.id} created`);
      
      // Add order items
      const orderItem = {
        orderId: order.id,
        menuItemId: menuItems[0].id,
        quantity: 2,
        price: menuItems[0].price,
        notes: "Extra spicy please"
      };
      
      await this.apiCall("/orders", "POST", orderItem);
      this.addResult("Add order item", true, `Added ${menuItems[0].name} x2`);
      
      // Get user orders
      const userOrders = await this.apiCall(`/orders?userId=${testUser.id}`);
      this.addResult("Get user orders", true, `Found ${userOrders.length} orders`);
      
    } catch (error) {
      this.addResult("Order system", false, error.message);
    }
  }

  async testReservationSystem() {
    console.log("\n📅 Testing Reservation System...");
    
    try {
      // Get test user
      const users = await db.select().from(schema.users).where(eq(schema.users.username, "jane_foodie"));
      const testUser = users[0];
      
      if (!testUser) {
        this.addResult("Reservation system setup", false, "Test user not found");
        return;
      }
      
      // Create reservation
      const reservationData = {
        userId: testUser.id,
        restaurantId: 1,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        time: "19:00",
        partySize: 4,
        notes: "Anniversary dinner",
        status: "confirmed"
      };
      
      const reservation = await this.apiCall("/reservations", "POST", reservationData);
      this.addResult("Create reservation", true, `Reservation #${reservation.id} for ${reservation.partySize} people`);
      
      // Get reservations
      const reservations = await this.apiCall("/reservations");
      this.addResult("Get reservations", true, `Found ${reservations.length} reservations`);
      
      // Get user reservations
      const userReservations = await this.apiCall(`/user-reservations?userId=${testUser.id}`);
      this.addResult("Get user reservations", true, `Found ${userReservations.length} user reservations`);
      
    } catch (error) {
      this.addResult("Reservation system", false, error.message);
    }
  }

  async testLoyaltySystem() {
    console.log("\n🎁 Testing Loyalty System...");
    
    try {
      // Get loyalty rewards
      const rewards = await this.apiCall("/loyalty-rewards");
      this.addResult("Get loyalty rewards", true, `Found ${rewards.length} rewards`);
      
      // Test reward redemption
      if (rewards.length > 0) {
        const users = await db.select().from(schema.users).where(eq(schema.users.username, "jane_foodie"));
        const testUser = users[0];
        
        if (testUser && testUser.loyaltyPoints >= rewards[0].pointsRequired) {
          const redeemData = {
            userId: testUser.id,
            rewardId: rewards[0].id
          };
          
          await this.apiCall("/redeem-reward", "POST", redeemData);
          this.addResult("Redeem loyalty reward", true, `Redeemed: ${rewards[0].name}`);
        } else {
          this.addResult("Loyalty reward redemption", false, "Insufficient points for redemption");
        }
      }
      
    } catch (error) {
      this.addResult("Loyalty system", false, error.message);
    }
  }

  async testQueueSystem() {
    console.log("\n⏳ Testing Queue System...");
    
    try {
      // Get test user
      const users = await db.select().from(schema.users).where(eq(schema.users.username, "john_customer"));
      const testUser = users[0];
      
      if (!testUser) {
        this.addResult("Queue system setup", false, "Test user not found");
        return;
      }
      
      // Join queue
      const queueData = {
        userId: testUser.id,
        restaurantId: 1,
        partySize: 2,
        position: 1,
        estimatedWaitTime: 15,
        phone: testUser.phone || "(555) 000-0000"
      };
      
      const queueEntry = await this.apiCall("/queue-entries", "POST", queueData);
      this.addResult("Join queue", true, `Queue position: ${queueEntry.position}`);
      
      // Get queue entries
      const queueEntries = await this.apiCall("/queue-entries");
      this.addResult("Get queue entries", true, `Found ${queueEntries.length} queue entries`);
      
      // Get wait time
      const waitTime = await this.apiCall("/queue-wait-time?restaurantId=1&partySize=2");
      this.addResult("Get estimated wait time", true, `Wait time: ${waitTime.estimatedWaitTime} minutes`);
      
    } catch (error) {
      this.addResult("Queue system", false, error.message);
    }
  }

  async testAIAssistant() {
    console.log("\n🤖 Testing AI Assistant...");
    
    try {
      // Get test user
      const users = await db.select().from(schema.users).where(eq(schema.users.username, "john_customer"));
      const testUser = users[0];
      
      if (!testUser) {
        this.addResult("AI assistant setup", false, "Test user not found");
        return;
      }
      
      // Create AI conversation
      const conversationData = {
        userId: testUser.id,
        restaurantId: 1,
        messages: [{
          role: "user",
          content: "Hello, I'd like some menu recommendations",
          timestamp: new Date()
        }]
      };
      
      const conversation = await this.apiCall("/ai-conversations", "POST", conversationData);
      this.addResult("Create AI conversation", true, `Conversation #${conversation.id} created`);
      
      // Send message to AI
      const messageData = {
        role: "user",
        content: "What are your vegetarian options?",
        timestamp: new Date()
      };
      
      await this.apiCall(`/ai-conversations/${conversation.id}/messages`, "POST", messageData);
      this.addResult("Send AI message", true, "Message sent to AI assistant");
      
      // Get conversations
      const conversations = await this.apiCall(`/ai-conversations?userId=${testUser.id}`);
      this.addResult("Get AI conversations", true, `Found ${conversations.length} conversations`);
      
    } catch (error) {
      this.addResult("AI assistant", false, error.message);
    }
  }

  async runAllTests() {
    console.log("🚀 Starting RestaurantRush Comprehensive Testing...\n");
    
    await this.testDatabaseConnectivity();
    await this.testRestaurantAPI();
    await this.testUserAuthentication();
    await this.testOrderSystem();
    await this.testReservationSystem();
    await this.testLoyaltySystem();
    await this.testQueueSystem();
    await this.testAIAssistant();
    
    console.log("\n📊 Test Results Summary:");
    console.log("=" * 50);
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const failedTests = this.results.filter(r => !r.passed);
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failedTests.length > 0) {
      console.log("\n❌ Failed Tests:");
      failedTests.forEach(test => {
        console.log(`  - ${test.test}: ${test.details}`);
      });
    }
    
    console.log("\n🎉 Testing completed!");
    return this.results;
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new RestaurantTestRunner();
  runner.runAllTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Test runner failed:", error);
      process.exit(1);
    });
}

export { RestaurantTestRunner };