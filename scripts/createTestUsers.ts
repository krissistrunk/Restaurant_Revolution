import { db } from "../server/db";
import { users, restaurants } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createTestUsers() {
  try {
    console.log("Creating test users...");

    // Check if users already exist
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Users already exist in database:");
      existingUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
      return;
    }

    // Get the restaurant ID to assign to the owner
    const restaurant = await db.select().from(restaurants).limit(1);
    const restaurantId = restaurant[0]?.id || 1;

    // Create test customer
    const testCustomer = await db.insert(users).values({
      username: "customer1",
      password: "password123", // In production, this should be hashed
      name: "John Customer",
      email: "customer@test.com",
      phone: "+1234567890",
      role: "customer",
      loyaltyPoints: 150,
      dietaryPreferences: {
        vegetarian: false,
        vegan: false,
        glutenFree: true,
        allergies: ["nuts"]
      }
    }).returning();

    // Create test restaurant owner
    const testOwner = await db.insert(users).values({
      username: "owner1",
      password: "password123", // In production, this should be hashed
      name: "Maria Owner",
      email: "owner@bellavista.com",
      phone: "+1234567891",
      role: "owner",
      restaurantId: restaurantId,
      loyaltyPoints: 0,
      dietaryPreferences: null
    }).returning();

    // Create test admin
    const testAdmin = await db.insert(users).values({
      username: "admin1",
      password: "password123", // In production, this should be hashed
      name: "Admin User",
      email: "admin@system.com",
      phone: "+1234567892",
      role: "admin",
      loyaltyPoints: 0,
      dietaryPreferences: null
    }).returning();

    console.log("✅ Test users created successfully:");
    console.log(`Customer: ${testCustomer[0].name} (${testCustomer[0].email})`);
    console.log(`  - Username: ${testCustomer[0].username}`);
    console.log(`  - Role: ${testCustomer[0].role}`);
    console.log(`  - Loyalty Points: ${testCustomer[0].loyaltyPoints}`);
    
    console.log(`\nOwner: ${testOwner[0].name} (${testOwner[0].email})`);
    console.log(`  - Username: ${testOwner[0].username}`);
    console.log(`  - Role: ${testOwner[0].role}`);
    console.log(`  - Restaurant ID: ${testOwner[0].restaurantId}`);
    
    console.log(`\nAdmin: ${testAdmin[0].name} (${testAdmin[0].email})`);
    console.log(`  - Username: ${testAdmin[0].username}`);
    console.log(`  - Role: ${testAdmin[0].role}`);

    console.log("\n🔐 Test Credentials:");
    console.log("Customer Login: customer1 / password123");
    console.log("Owner Login: owner1 / password123");
    console.log("Admin Login: admin1 / password123");

  } catch (error) {
    console.error("❌ Error creating test users:", error);
    throw error;
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUsers()
    .then(() => {
      console.log("Test users setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to create test users:", error);
      process.exit(1);
    });
}

export { createTestUsers };