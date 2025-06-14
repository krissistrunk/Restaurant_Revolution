import { db } from "../server/db";
import { users as usersTable } from "../shared/schema";

interface TestResult {
  test: string;
  passed: boolean;
  details?: string;
  data?: any;
}

class SystemTester {
  private results: TestResult[] = [];
  private baseUrl = "http://localhost:5000";

  private async apiCall(endpoint: string, method: string = "GET", body?: any, headers?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      return { status: 0, error: error.message };
    }
  }

  private addResult(test: string, passed: boolean, details?: string, data?: any) {
    this.results.push({ test, passed, details, data });
    const status = passed ? "✅" : "❌";
    console.log(`${status} ${test}: ${details || ""}`);
  }

  async testDatabaseConnection() {
    console.log("\n🔗 Testing Database Connection...");
    
    try {
      const allUsers = await db.select().from(usersTable).limit(1);
      this.addResult("Database Connection", true, `Connected successfully, found ${allUsers.length} users`);
    } catch (error) {
      this.addResult("Database Connection", false, `Failed: ${error.message}`);
    }
  }

  async testUserRoles() {
    console.log("\n👥 Testing User Roles...");
    
    try {
      const allUsers = await db.select().from(usersTable);
      const customerCount = allUsers.filter(u => u.role === "customer").length;
      const ownerCount = allUsers.filter(u => u.role === "owner").length;
      const adminCount = allUsers.filter(u => u.role === "admin").length;
      
      this.addResult("User Roles Setup", true, 
        `Found ${customerCount} customers, ${ownerCount} owners, ${adminCount} admins`);
      
      // Test specific user credentials
      const owner = allUsers.find(u => u.role === "owner");
      const customer = allUsers.find(u => u.role === "customer");
      const admin = allUsers.find(u => u.role === "admin");
      
      this.addResult("Owner Account", !!owner, owner ? `${owner.name} (${owner.email})` : "No owner found");
      this.addResult("Customer Account", !!customer, customer ? `${customer.name} (${customer.email})` : "No customer found");
      this.addResult("Admin Account", !!admin, admin ? `${admin.name} (${admin.email})` : "No admin found");
      
    } catch (error) {
      this.addResult("User Roles Setup", false, `Failed: ${error.message}`);
    }
  }

  async testRestaurantAPI() {
    console.log("\n🏪 Testing Restaurant API...");
    
    const response = await this.apiCall("/api/restaurant");
    
    if (response.status === 200 && response.data) {
      this.addResult("Restaurant API", true, `Restaurant: ${response.data.name}`);
    } else {
      this.addResult("Restaurant API", false, `Status: ${response.status}`);
    }
  }

  async testMenuAPI() {
    console.log("\n🍽️ Testing Menu API...");
    
    // Test categories
    const categoriesResponse = await this.apiCall("/api/categories");
    if (categoriesResponse.status === 200) {
      this.addResult("Categories API", true, `Found ${categoriesResponse.data.length} categories`);
    } else {
      this.addResult("Categories API", false, `Status: ${categoriesResponse.status}`);
    }
    
    // Test menu items
    const itemsResponse = await this.apiCall("/api/menu-items");
    if (itemsResponse.status === 200) {
      this.addResult("Menu Items API", true, `Found ${itemsResponse.data.length} items`);
    } else {
      this.addResult("Menu Items API", false, `Status: ${itemsResponse.status}`);
    }
    
    // Test featured items
    const featuredResponse = await this.apiCall("/api/featured-items");
    if (featuredResponse.status === 200) {
      this.addResult("Featured Items API", true, `Found ${featuredResponse.data.length} featured items`);
    } else {
      this.addResult("Featured Items API", false, `Status: ${featuredResponse.status}`);
    }
  }

  async testAuthenticationAPI() {
    console.log("\n🔐 Testing Authentication API...");
    
    // Test customer login
    const customerLogin = await this.apiCall("/api/auth/login", "POST", {
      username: "john_customer",
      password: "password123"
    });
    
    if (customerLogin.status === 200) {
      this.addResult("Customer Login", true, `Logged in as ${customerLogin.data.name}`);
    } else {
      this.addResult("Customer Login", false, `Status: ${customerLogin.status}`);
    }
    
    // Test owner login
    const ownerLogin = await this.apiCall("/api/auth/login", "POST", {
      username: "restaurant_owner",
      password: "password123"
    });
    
    if (ownerLogin.status === 200) {
      this.addResult("Owner Login", true, `Logged in as ${ownerLogin.data.name}`);
    } else {
      this.addResult("Owner Login", false, `Status: ${ownerLogin.status}`);
    }
    
    // Test admin login
    const adminLogin = await this.apiCall("/api/auth/login", "POST", {
      username: "admin1",
      password: "password123"
    });
    
    if (adminLogin.status === 200) {
      this.addResult("Admin Login", true, `Logged in as ${adminLogin.data.name}`);
    } else {
      this.addResult("Admin Login", false, `Status: ${adminLogin.status}`);
    }
  }

  async testCMSEndpoints() {
    console.log("\n🎛️ Testing CMS Endpoints...");
    
    // Test CMS health check
    const healthResponse = await this.apiCall("/api/cms/health");
    if (healthResponse.status === 200) {
      this.addResult("CMS Health Check", true, `CMS enabled: ${healthResponse.data.cms.enabled}`);
    } else {
      this.addResult("CMS Health Check", false, `Status: ${healthResponse.status}`);
    }
  }

  async testOrderSystem() {
    console.log("\n🛒 Testing Order System...");
    
    // Test getting orders
    const ordersResponse = await this.apiCall("/api/orders?restaurantId=1");
    if (ordersResponse.status === 200) {
      this.addResult("Orders API", true, `Found ${ordersResponse.data.length} orders`);
    } else {
      this.addResult("Orders API", false, `Status: ${ordersResponse.status}`);
    }
  }

  async testLoyaltySystem() {
    console.log("\n🎁 Testing Loyalty System...");
    
    // Test loyalty rewards
    const rewardsResponse = await this.apiCall("/api/loyalty-rewards?restaurantId=1");
    if (rewardsResponse.status === 200) {
      this.addResult("Loyalty Rewards API", true, `Found ${rewardsResponse.data.length} rewards`);
    } else {
      this.addResult("Loyalty Rewards API", false, `Status: ${rewardsResponse.status}`);
    }
  }

  async runAllTests() {
    console.log("🚀 Starting System Test Suite");
    console.log("================================");
    
    await this.testDatabaseConnection();
    await this.testUserRoles();
    await this.testRestaurantAPI();
    await this.testMenuAPI();
    await this.testAuthenticationAPI();
    await this.testCMSEndpoints();
    await this.testOrderSystem();
    await this.testLoyaltySystem();
    
    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    console.log("\n📊 Test Summary");
    console.log("===============");
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Pass Rate: ${passRate}%`);
    
    if (passed === total) {
      console.log("\n🎉 All tests passed! System is ready for use.");
    } else {
      console.log("\n⚠️ Some tests failed. Please check the details above.");
    }
    
    // Return failed tests for debugging
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log("\n❌ Failed Tests:");
      failedTests.forEach(test => {
        console.log(`- ${test.test}: ${test.details}`);
      });
    }
    
    return { passed, total, passRate, failedTests };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SystemTester();
  tester.runAllTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Test suite failed:", error);
      process.exit(1);
    });
}

export { SystemTester };