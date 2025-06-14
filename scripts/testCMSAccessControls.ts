import { db } from "../server/db";
import { users as usersTable } from "../shared/schema";

interface TestResult {
  test: string;
  passed: boolean;
  details?: string;
  userRole?: string;
}

class CMSAccessTester {
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

  private addResult(test: string, passed: boolean, details?: string, userRole?: string) {
    this.results.push({ test, passed, details, userRole });
    const status = passed ? "✅" : "❌";
    const roleInfo = userRole ? ` [${userRole}]` : "";
    console.log(`${status} ${test}${roleInfo}: ${details || ""}`);
  }

  async loginAndGetAuthHeaders(username: string, password: string): Promise<any> {
    const loginResponse = await this.apiCall("/api/auth/login", "POST", {
      username,
      password
    });
    
    if (loginResponse.status === 200) {
      // In a real app, this would return JWT token or session cookie
      // For testing, we'll simulate auth headers
      return {
        'Authorization': `Bearer mock-token-for-${username}`,
        'X-User-ID': loginResponse.data.id.toString(),
        'X-User-Role': loginResponse.data.role
      };
    }
    return null;
  }

  async testCMSAccessForRole(roleName: string, username: string, password: string, shouldHaveAccess: boolean) {
    console.log(`\n🔒 Testing CMS Access for ${roleName.toUpperCase()}...`);
    
    const authHeaders = await this.loginAndGetAuthHeaders(username, password);
    
    if (!authHeaders) {
      this.addResult(`${roleName} Login`, false, "Failed to authenticate", roleName);
      return false;
    }

    this.addResult(`${roleName} Login`, true, "Successfully authenticated", roleName);

    // Test CMS health endpoint
    const healthResponse = await this.apiCall("/api/cms/health", "GET", null, authHeaders);
    const healthAccessGranted = healthResponse.status === 200;
    
    if (shouldHaveAccess) {
      this.addResult(`${roleName} CMS Health Access`, healthAccessGranted, 
        healthAccessGranted ? "Access granted as expected" : `Access denied (Status: ${healthResponse.status})`, roleName);
    } else {
      this.addResult(`${roleName} CMS Health Access Denied`, !healthAccessGranted, 
        !healthAccessGranted ? "Access properly restricted" : "Access granted when should be denied", roleName);
    }

    // Test CMS cache clear endpoint
    const cacheResponse = await this.apiCall("/api/cms/clear-cache", "POST", null, authHeaders);
    const cacheAccessGranted = cacheResponse.status === 200;
    
    if (shouldHaveAccess) {
      this.addResult(`${roleName} CMS Cache Control`, cacheAccessGranted, 
        cacheAccessGranted ? "Access granted as expected" : `Access denied (Status: ${cacheResponse.status})`, roleName);
    } else {
      this.addResult(`${roleName} CMS Cache Control Denied`, !cacheAccessGranted, 
        !cacheAccessGranted ? "Access properly restricted" : "Access granted when should be denied", roleName);
    }

    return shouldHaveAccess ? (healthAccessGranted && cacheAccessGranted) : (!healthAccessGranted && !cacheAccessGranted);
  }

  async testPublicEndpointsAccess() {
    console.log("\n🌍 Testing Public Endpoints Access...");
    
    // These endpoints should be accessible to everyone
    const publicEndpoints = [
      "/api/restaurant",
      "/api/categories",
      "/api/menu-items",
      "/api/featured-items"
    ];

    for (const endpoint of publicEndpoints) {
      const response = await this.apiCall(endpoint);
      const accessible = response.status === 200;
      this.addResult(`Public Access: ${endpoint}`, accessible, 
        accessible ? "Accessible to public" : `Status: ${response.status}`, "public");
    }
  }

  async runCMSAccessControlTests() {
    console.log("🛡️ Starting CMS Access Control Tests");
    console.log("====================================");

    // Test user accounts exist
    const allUsers = await db.select().from(usersTable);
    const customer = allUsers.find(u => u.role === "customer");
    const owner = allUsers.find(u => u.role === "owner");
    const admin = allUsers.find(u => u.role === "admin");

    if (!customer || !owner || !admin) {
      console.log("❌ Missing required user accounts. Please run user setup first.");
      return;
    }

    // Test public endpoints
    await this.testPublicEndpointsAccess();

    // Test customer access (should be denied)
    await this.testCMSAccessForRole("customer", "john_customer", "password123", false);

    // Test owner access (should be granted)
    await this.testCMSAccessForRole("owner", "restaurant_owner", "password123", true);

    // Test admin access (should be granted)
    await this.testCMSAccessForRole("admin", "admin1", "password123", true);

    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log("\n📊 CMS Access Control Test Results");
    console.log("==================================");
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Pass Rate: ${passRate}%`);

    // Check specific access patterns
    const customerResults = this.results.filter(r => r.userRole === "customer");
    const ownerResults = this.results.filter(r => r.userRole === "owner");
    const adminResults = this.results.filter(r => r.userRole === "admin");

    const customerDeniedCorrectly = customerResults.filter(r => r.test.includes("Denied")).every(r => r.passed);
    const ownerGrantedCorrectly = ownerResults.filter(r => !r.test.includes("Denied")).every(r => r.passed);
    const adminGrantedCorrectly = adminResults.filter(r => !r.test.includes("Denied")).every(r => r.passed);

    console.log("\n🔐 Access Control Summary:");
    console.log(`Customer CMS Access Properly Restricted: ${customerDeniedCorrectly ? "✅ Yes" : "❌ No"}`);
    console.log(`Owner CMS Access Properly Granted: ${ownerGrantedCorrectly ? "✅ Yes" : "❌ No"}`);
    console.log(`Admin CMS Access Properly Granted: ${adminGrantedCorrectly ? "✅ Yes" : "❌ No"}`);

    const accessControlWorking = customerDeniedCorrectly && ownerGrantedCorrectly && adminGrantedCorrectly;

    if (accessControlWorking) {
      console.log("\n🎉 CMS Access Controls Working Correctly!");
      console.log("- Customers cannot access CMS features");
      console.log("- Restaurant owners can access CMS features");
      console.log("- Administrators can access CMS features");
    } else {
      console.log("\n⚠️ CMS Access Control Issues Detected");
      console.log("Please review the failed tests above.");
    }

    // Return failed tests for debugging
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log("\n❌ Failed Tests Details:");
      failedTests.forEach(test => {
        console.log(`- ${test.test} [${test.userRole}]: ${test.details}`);
      });
    }

    return { 
      passed, 
      total, 
      passRate, 
      failedTests, 
      accessControlWorking,
      customerDeniedCorrectly,
      ownerGrantedCorrectly,
      adminGrantedCorrectly
    };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new CMSAccessTester();
  tester.runCMSAccessControlTests()
    .then((results) => {
      if (results?.accessControlWorking) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("CMS Access Control test failed:", error);
      process.exit(1);
    });
}

export { CMSAccessTester };