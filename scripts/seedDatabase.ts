import { db } from "../server/db";
import { restaurants, categories, menuItems, users, loyaltyRewards, promotions, modifiers } from "../shared/schema";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create test restaurant
    const [restaurant] = await db.insert(restaurants).values({
      name: "Bella Vista Bistro",
      description: "Fine Italian dining with a modern twist",
      address: "123 Main Street, Downtown",
      phone: "(555) 123-4567",
      email: "info@bellavistabistro.com",
      logoUrl: "https://via.placeholder.com/200x200?text=BVB",
      openingHours: {
        monday: "11:00 AM - 10:00 PM",
        tuesday: "11:00 AM - 10:00 PM",
        wednesday: "11:00 AM - 10:00 PM",
        thursday: "11:00 AM - 10:00 PM",
        friday: "11:00 AM - 11:00 PM",
        saturday: "10:00 AM - 11:00 PM",
        sunday: "10:00 AM - 9:00 PM"
      },
      latitude: 40.7589,
      longitude: -73.9851
    }).returning();

    console.log("✅ Restaurant created:", restaurant.name);

    // Create categories
    const categoriesData = [
      { name: "Appetizers", displayOrder: 1, restaurantId: restaurant.id },
      { name: "Pasta", displayOrder: 2, restaurantId: restaurant.id },
      { name: "Main Courses", displayOrder: 3, restaurantId: restaurant.id },
      { name: "Desserts", displayOrder: 4, restaurantId: restaurant.id },
      { name: "Beverages", displayOrder: 5, restaurantId: restaurant.id }
    ];

    const createdCategories = await db.insert(categories).values(categoriesData).returning();
    console.log("✅ Categories created:", createdCategories.length);

    // Create menu items
    const menuItemsData = [
      // Appetizers
      {
        name: "Bruschetta Trio",
        description: "Three varieties of our signature bruschetta: classic tomato basil, mushroom truffle, and ricotta honey",
        price: 14.99,
        imageUrl: "https://via.placeholder.com/400x300?text=Bruschetta",
        categoryId: createdCategories[0].id,
        restaurantId: restaurant.id,
        isPopular: true,
        isVegetarian: true,
        allergens: ["gluten", "dairy"],
        nutritionInfo: { calories: 320, protein: 8, carbs: 42, fat: 12 }
      },
      {
        name: "Calamari Fritti",
        description: "Golden fried squid rings served with marinara sauce and lemon aioli",
        price: 16.99,
        imageUrl: "https://via.placeholder.com/400x300?text=Calamari",
        categoryId: createdCategories[0].id,
        restaurantId: restaurant.id,
        isSeafood: true,
        allergens: ["gluten", "seafood"],
        nutritionInfo: { calories: 380, protein: 18, carbs: 28, fat: 22 }
      },
      // Pasta
      {
        name: "Spaghetti Carbonara",
        description: "Classic Roman pasta with pancetta, eggs, pecorino cheese, and black pepper",
        price: 22.99,
        imageUrl: "https://via.placeholder.com/400x300?text=Carbonara",
        categoryId: createdCategories[1].id,
        restaurantId: restaurant.id,
        isFeatured: true,
        allergens: ["gluten", "dairy", "eggs"],
        nutritionInfo: { calories: 650, protein: 28, carbs: 75, fat: 28 }
      },
      {
        name: "Penne Arrabbiata",
        description: "Spicy tomato sauce with garlic, red peppers, and fresh basil",
        price: 18.99,
        imageUrl: "https://via.placeholder.com/400x300?text=Arrabbiata",
        categoryId: createdCategories[1].id,
        restaurantId: restaurant.id,
        isVegetarian: true,
        allergens: ["gluten"],
        nutritionInfo: { calories: 520, protein: 16, carbs: 82, fat: 14 }
      },
      // Main Courses
      {
        name: "Osso Buco Milanese",
        description: "Braised veal shanks with saffron risotto and gremolata",
        price: 34.99,
        imageUrl: "https://via.placeholder.com/400x300?text=OssoBuco",
        categoryId: createdCategories[2].id,
        restaurantId: restaurant.id,
        isFeatured: true,
        allergens: ["dairy"],
        nutritionInfo: { calories: 780, protein: 45, carbs: 35, fat: 42 }
      },
      {
        name: "Branzino al Sale",
        description: "Mediterranean sea bass baked in sea salt crust with herbs and lemon",
        price: 28.99,
        imageUrl: "https://via.placeholder.com/400x300?text=Branzino",
        categoryId: createdCategories[2].id,
        restaurantId: restaurant.id,
        isSeafood: true,
        isGlutenFree: true,
        allergens: ["seafood"],
        nutritionInfo: { calories: 420, protein: 38, carbs: 8, fat: 26 }
      },
      // Desserts
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with mascarpone, coffee-soaked ladyfingers, and cocoa",
        price: 9.99,
        imageUrl: "https://via.placeholder.com/400x300?text=Tiramisu",
        categoryId: createdCategories[3].id,
        restaurantId: restaurant.id,
        isPopular: true,
        allergens: ["gluten", "dairy", "eggs"],
        nutritionInfo: { calories: 420, protein: 8, carbs: 35, fat: 28 }
      },
      // Beverages
      {
        name: "Italian Espresso",
        description: "Rich, authentic espresso from premium Italian beans",
        price: 3.99,
        imageUrl: "https://via.placeholder.com/400x300?text=Espresso",
        categoryId: createdCategories[4].id,
        restaurantId: restaurant.id,
        isGlutenFree: true,
        nutritionInfo: { calories: 5, protein: 0, carbs: 1, fat: 0 }
      }
    ];

    const createdMenuItems = await db.insert(menuItems).values(menuItemsData).returning();
    console.log("✅ Menu items created:", createdMenuItems.length);

    // Create modifiers for some menu items
    const modifiersData = [
      // Pasta modifiers
      { name: "Extra Cheese", price: 2.99, menuItemId: createdMenuItems[2].id },
      { name: "Add Chicken", price: 5.99, menuItemId: createdMenuItems[2].id },
      { name: "Gluten-Free Pasta", price: 3.99, menuItemId: createdMenuItems[2].id },
      { name: "Extra Spicy", price: 0, menuItemId: createdMenuItems[3].id },
      { name: "Add Parmesan", price: 1.99, menuItemId: createdMenuItems[3].id },
      // Main course modifiers
      { name: "Extra Vegetables", price: 4.99, menuItemId: createdMenuItems[4].id },
      { name: "Side Salad", price: 6.99, menuItemId: createdMenuItems[5].id }
    ];

    await db.insert(modifiers).values(modifiersData);
    console.log("✅ Modifiers created:", modifiersData.length);

    // Create test users
    const usersData = [
      {
        username: "john_customer",
        password: "password123",
        name: "John Customer",
        email: "john@example.com",
        phone: "(555) 987-6543",
        loyaltyPoints: 150,
        dietaryPreferences: ["vegetarian", "gluten-free"]
      },
      {
        username: "jane_foodie",
        password: "password123",
        name: "Jane Foodie",
        email: "jane@example.com",
        phone: "(555) 456-7890",
        loyaltyPoints: 320,
        dietaryPreferences: ["no-seafood"]
      },
      {
        username: "restaurant_owner",
        password: "admin123",
        name: "Restaurant Owner",
        email: "owner@bellavistabistro.com",
        phone: "(555) 123-4567",
        loyaltyPoints: 0
      }
    ];

    const createdUsers = await db.insert(users).values(usersData).returning();
    console.log("✅ Users created:", createdUsers.length);

    // Create loyalty rewards
    const loyaltyRewardsData = [
      {
        name: "Free Appetizer",
        description: "Get a free appetizer of your choice",
        pointsRequired: 100,
        restaurantId: restaurant.id
      },
      {
        name: "10% Off Next Order",
        description: "Save 10% on your next dining experience",
        pointsRequired: 200,
        restaurantId: restaurant.id
      },
      {
        name: "Free Dessert",
        description: "Complimentary dessert with any main course",
        pointsRequired: 150,
        restaurantId: restaurant.id
      },
      {
        name: "VIP Experience",
        description: "Priority seating and complimentary wine pairing",
        pointsRequired: 500,
        restaurantId: restaurant.id
      }
    ];

    await db.insert(loyaltyRewards).values(loyaltyRewardsData);
    console.log("✅ Loyalty rewards created:", loyaltyRewardsData.length);

    // Create promotions
    const promotionsData = [
      {
        name: "Happy Hour Special",
        description: "20% off all appetizers and beverages",
        discountType: "percentage",
        discountValue: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        code: "HAPPY20",
        restaurantId: restaurant.id
      },
      {
        name: "Weekend Pasta Deal",
        description: "$5 off any pasta dish on weekends",
        discountType: "fixed",
        discountValue: 5,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        code: "PASTA5",
        restaurantId: restaurant.id
      }
    ];

    await db.insert(promotions).values(promotionsData);
    console.log("✅ Promotions created:", promotionsData.length);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Restaurant: ${restaurant.name}`);
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Menu Items: ${createdMenuItems.length}`);
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Loyalty Rewards: ${loyaltyRewardsData.length}`);
    console.log(`- Promotions: ${promotionsData.length}`);
    console.log(`- Modifiers: ${modifiersData.length}`);

    return {
      restaurant,
      categories: createdCategories,
      menuItems: createdMenuItems,
      users: createdUsers
    };

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };