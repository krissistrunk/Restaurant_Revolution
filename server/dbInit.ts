import { db } from './db';
import { sql } from 'drizzle-orm';
import { MemStorage } from './storage';

// This file is used to initialize the database with seed data
// from the in-memory storage implementation

async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Create tables if they don't exist
    console.log('Creating tables...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        loyalty_points INTEGER DEFAULT 0,
        dietary_preferences JSONB
      );

      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        logo_url TEXT,
        opening_hours JSONB NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        display_order INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      );

      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        image_url TEXT,
        category_id INTEGER NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        is_popular BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        is_vegetarian BOOLEAN DEFAULT FALSE,
        is_gluten_free BOOLEAN DEFAULT FALSE,
        is_seafood BOOLEAN DEFAULT FALSE,
        nutrition_info JSONB,
        allergens TEXT[],
        restaurant_id INTEGER NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      );

      CREATE TABLE IF NOT EXISTS modifiers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        menu_item_id INTEGER NOT NULL,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        party_size INTEGER NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        restaurant_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        status TEXT,
        total_price NUMERIC(10, 2) NOT NULL,
        pickup_time TIMESTAMP WITH TIME ZONE,
        restaurant_id INTEGER NOT NULL,
        order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        notes TEXT,
        modifiers JSONB,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      );

      CREATE TABLE IF NOT EXISTS loyalty_rewards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        points_required INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        restaurant_id INTEGER NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      );

      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        discount_type TEXT NOT NULL,
        discount_value NUMERIC(10, 2) NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        code TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        restaurant_id INTEGER NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      );
    `);
    
    console.log('Tables created successfully!');

    // Seed the database with initial data from our MemStorage
    const memStorage = new MemStorage();
    
    // Check if we already have data in the database
    const usersCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    
    // Extract count value safely from the result (format may vary)
    let count = 0;
    if (Array.isArray(usersCount) && usersCount.length > 0 && 'count' in usersCount[0]) {
      count = Number(usersCount[0].count);
    } else if (usersCount && typeof usersCount === 'object' && 'rows' in usersCount && 
               Array.isArray(usersCount.rows) && usersCount.rows.length > 0 && 
               'count' in usersCount.rows[0]) {
      count = Number(usersCount.rows[0].count);
    }
    
    if (count > 0) {
      console.log('Database already contains data, skipping seed...');
      return;
    }

    console.log('Seeding database...');

    // Start with restaurant
    const restaurant = await memStorage.getRestaurant(1);
    if (restaurant) {
      await db.execute(sql`
        INSERT INTO restaurants (id, name, description, address, phone, email, logo_url, opening_hours, latitude, longitude)
        VALUES (
          ${restaurant.id}, 
          ${restaurant.name}, 
          ${restaurant.description}, 
          ${restaurant.address}, 
          ${restaurant.phone}, 
          ${restaurant.email}, 
          ${restaurant.logoUrl}, 
          ${JSON.stringify(restaurant.openingHours)}, 
          ${restaurant.latitude}, 
          ${restaurant.longitude}
        )
      `);
      console.log('Restaurant data inserted');
    }

    // Add categories
    const categories = await memStorage.getCategories(1);
    for (const category of categories) {
      await db.execute(sql`
        INSERT INTO categories (id, name, display_order, restaurant_id)
        VALUES (${category.id}, ${category.name}, ${category.displayOrder}, ${category.restaurantId})
      `);
    }
    console.log('Categories data inserted');

    // Add menu items
    const menuItems = await memStorage.getMenuItems(1);
    for (const menuItem of menuItems) {
      // Handle optional properties with default values
      const isAvailable = menuItem.isAvailable === undefined ? true : menuItem.isAvailable;
      const isPopular = menuItem.isPopular === undefined ? false : menuItem.isPopular;
      const isFeatured = menuItem.isFeatured === undefined ? false : menuItem.isFeatured;
      const isVegetarian = menuItem.isVegetarian === undefined ? false : menuItem.isVegetarian;
      const isGlutenFree = menuItem.isGlutenFree === undefined ? false : menuItem.isGlutenFree;
      const isSeafood = menuItem.isSeafood === undefined ? false : menuItem.isSeafood;
      const nutritionInfo = menuItem.nutritionInfo ? JSON.stringify(menuItem.nutritionInfo) : null;
      const allergens = menuItem.allergens ? JSON.stringify(menuItem.allergens) : null;
      
      await db.execute(sql`
        INSERT INTO menu_items (
          id, name, description, price, image_url, category_id, 
          is_available, is_popular, is_featured, is_vegetarian, 
          is_gluten_free, is_seafood, nutrition_info, allergens, restaurant_id
        )
        VALUES (
          ${menuItem.id}, 
          ${menuItem.name}, 
          ${menuItem.description}, 
          ${menuItem.price}, 
          ${menuItem.imageUrl}, 
          ${menuItem.categoryId}, 
          ${isAvailable}, 
          ${isPopular}, 
          ${isFeatured}, 
          ${isVegetarian}, 
          ${isGlutenFree}, 
          ${isSeafood}, 
          ${nutritionInfo}, 
          ${allergens}, 
          ${menuItem.restaurantId}
        )
      `);

      // Add modifiers for this menu item
      if (menuItem.modifiers && menuItem.modifiers.length > 0) {
        for (const modifier of menuItem.modifiers) {
          await db.execute(sql`
            INSERT INTO modifiers (id, name, price, menu_item_id)
            VALUES (${modifier.id}, ${modifier.name}, ${modifier.price}, ${modifier.menuItemId})
          `);
        }
      }
    }
    console.log('Menu items and modifiers data inserted');

    // Add loyalty rewards
    const loyaltyRewards = await memStorage.getLoyaltyRewards(1);
    for (const reward of loyaltyRewards) {
      await db.execute(sql`
        INSERT INTO loyalty_rewards (id, name, description, points_required, is_active, restaurant_id)
        VALUES (
          ${reward.id}, 
          ${reward.name}, 
          ${reward.description}, 
          ${reward.pointsRequired}, 
          ${reward.isActive}, 
          ${reward.restaurantId}
        )
      `);
    }
    console.log('Loyalty rewards data inserted');

    // Add promotions
    const promotions = await memStorage.getPromotions(1);
    for (const promotion of promotions) {
      const discountType = promotion.discountType || 'percentage';
      const discountValue = promotion.discountValue || 10;
      const code = promotion.code || null;
      const isActive = promotion.isActive === undefined ? true : promotion.isActive;
      
      await db.execute(sql`
        INSERT INTO promotions (
          id, name, description, discount_type, discount_value, 
          start_date, end_date, code, is_active, restaurant_id
        )
        VALUES (
          ${promotion.id}, 
          ${promotion.name}, 
          ${promotion.description}, 
          ${discountType}, 
          ${discountValue}, 
          ${promotion.startDate}, 
          ${promotion.endDate}, 
          ${code}, 
          ${isActive}, 
          ${promotion.restaurantId}
        )
      `);
    }
    console.log('Promotions data inserted');

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export { initializeDatabase };