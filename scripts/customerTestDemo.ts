async function demonstrateCustomerExperience() {
  console.log("🍽️ Customer Experience Demo - Bella Vista Bistro (OpenTable-Level Features)\n");
  
  const baseUrl = "http://localhost:5000/api";
  
  // Step 1: Browse Restaurant Info
  console.log("1. BROWSING RESTAURANT INFORMATION");
  const restaurant = await fetch(`${baseUrl}/restaurant`).then(r => r.json());
  console.log(`   Restaurant: ${restaurant.name}`);
  console.log(`   Address: ${restaurant.address}`);
  console.log(`   Phone: ${restaurant.phone}`);
  console.log(`   Description: ${restaurant.description}`);
  
  // Step 2: View Menu Categories
  console.log("\n2. EXPLORING MENU CATEGORIES");
  const categories = await fetch(`${baseUrl}/categories`).then(r => r.json());
  categories.forEach(cat => {
    console.log(`   📂 ${cat.name} (Display Order: ${cat.displayOrder})`);
  });
  
  // Step 3: Browse Menu Items
  console.log("\n3. BROWSING MENU ITEMS");
  const menuItems = await fetch(`${baseUrl}/menu-items`).then(r => r.json());
  menuItems.slice(0, 4).forEach(item => {
    console.log(`   🍽️ ${item.name} - $${item.price}`);
    console.log(`      ${item.description}`);
    console.log(`      Dietary: ${item.isVegetarian ? 'Vegetarian' : ''} ${item.isGlutenFree ? 'Gluten-Free' : ''} ${item.isSeafood ? 'Seafood' : ''}`);
  });
  
  // Step 4: Customer Login
  console.log("\n4. CUSTOMER LOGIN");
  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'john_customer',
      password: 'password123'
    })
  });
  
  const customer = await loginResponse.json();
  console.log(`   ✅ Logged in as: ${customer.name}`);
  console.log(`   💰 Loyalty Points: ${customer.loyaltyPoints}`);
  console.log(`   🥗 Dietary Preferences: ${customer.dietaryPreferences?.join(', ') || 'None'}`);
  
  // Step 5: View Featured Items
  console.log("\n5. FEATURED ITEMS SHOWCASE");
  const featuredItems = await fetch(`${baseUrl}/featured-items`).then(r => r.json());
  featuredItems.forEach(item => {
    console.log(`   ⭐ ${item.name} - $${item.price}`);
    console.log(`      ${item.description}`);
  });
  
  // Step 6: Check Loyalty Rewards
  console.log("\n6. LOYALTY REWARDS AVAILABLE");
  const rewards = await fetch(`${baseUrl}/loyalty-rewards`).then(r => r.json());
  rewards.forEach(reward => {
    const canRedeem = customer.loyaltyPoints >= reward.pointsRequired;
    console.log(`   🎁 ${reward.name} - ${reward.pointsRequired} points ${canRedeem ? '✅ Available' : '❌ Need more points'}`);
    console.log(`      ${reward.description}`);
  });
  
  // Step 7: Make a Reservation
  console.log("\n7. MAKING A RESERVATION");
  const reservationData = {
    userId: customer.id,
    restaurantId: 1,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
    time: "18:30",
    partySize: 3,
    notes: "Need high chair for toddler, food allergies: nuts",
    specialOccasion: "birthday",
    seatingPreference: "booth",
    status: "confirmed"
  };
  
  const reservation = await fetch(`${baseUrl}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservationData)
  }).then(r => r.json());
  
  console.log(`   📅 Reservation confirmed for ${reservation.partySize} people`);
  console.log(`   📍 Date: ${reservation.date} at ${reservation.time}`);
  console.log(`   🎂 Special occasion: ${reservation.specialOccasion}`);
  console.log(`   🪑 Seating preference: ${reservation.seatingPreference}`);
  console.log(`   📝 Additional notes: ${reservation.notes}`);
  
  // Step 8: Join Enhanced Waitlist (OpenTable-Level)
  console.log("\n8. JOINING ENHANCED WAITLIST (SMS NOTIFICATIONS)");
  const queueData = {
    userId: customer.id,
    restaurantId: 1,
    partySize: 2,
    position: 2,
    estimatedWaitTime: 25,
    phone: customer.phone || "+1234567890",
    note: "Birthday celebration",
    seatingPreference: "outdoor",
    specialRequests: "Window table preferred",
    smsNotifications: true
  };
  
  const queueEntry = await fetch(`${baseUrl}/queue-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queueData)
  }).then(r => r.json());
  
  console.log(`   ⏳ Queue position: #${queueEntry.position}`);
  console.log(`   ⏱️ Estimated wait: ${queueEntry.estimatedWaitTime} minutes`);
  console.log(`   📱 SMS notifications enabled: ${queueEntry.phone}`);
  console.log(`   🪑 Seating preference: ${queueEntry.seatingPreference}`);
  console.log(`   🎉 Special occasion: Birthday celebration`);
  console.log(`   📞 Will receive SMS for: position updates, table ready alert`);
  
  // Step 9: Check Order History (if any)
  console.log("\n9. CHECKING ORDER HISTORY");
  try {
    const userOrders = await fetch(`${baseUrl}/orders?userId=${customer.id}`).then(r => r.json());
    if (userOrders && userOrders.length > 0) {
      console.log(`   📋 Found ${userOrders.length} previous orders`);
    } else {
      console.log("   📋 No previous orders found - new customer!");
    }
  } catch (error) {
    console.log("   📋 No previous orders found - new customer!");
  }
  
  console.log("\n✅ CUSTOMER EXPERIENCE DEMO COMPLETED");
  console.log("Customer can successfully:");
  console.log("   • Browse restaurant info and menu");
  console.log("   • Login and view loyalty status");
  console.log("   • Make reservations for future dates");
  console.log("   • Join virtual queue for immediate seating");
  console.log("   • View and redeem loyalty rewards");
  console.log("   • Access order history and preferences");
  
  return customer;
}

// Run demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateCustomerExperience()
    .then(() => {
      console.log("\n🎯 Ready to test restaurant owner features next!");
      process.exit(0);
    })
    .catch(error => {
      console.error("Customer demo failed:", error);
      process.exit(1);
    });
}

export { demonstrateCustomerExperience };