import { db } from './connection';
import { log } from '../vite';
import bcrypt from 'bcryptjs';

export class DatabaseSeeder {
  
  /**
   * Seed database with comprehensive sample data
   */
  async seedAll(): Promise<void> {
    try {
      log('🌱 Starting database seeding process...');
      
      // Check if data already exists
      const existingUsers = await db.query('SELECT COUNT(*) FROM users');
      if (parseInt(existingUsers.rows[0].count) > 0) {
        log('📊 Database already contains data, skipping seeding');
        return;
      }
      
      await db.transaction(async (client) => {
        // 1. Create restaurants
        await this.seedRestaurants(client);
        
        // 2. Create users
        await this.seedUsers(client);
        
        // 3. Create categories
        await this.seedCategories(client);
        
        // 4. Create menu items
        await this.seedMenuItems(client);
        
        // 5. Create modifiers
        await this.seedModifiers(client);
        
        // 6. Create loyalty rewards
        await this.seedLoyaltyRewards(client);
        
        // 7. Create promotions
        await this.seedPromotions(client);
        
        // 8. Create sample orders
        await this.seedOrders(client);
        
        // 9. Create sample reservations
        await this.seedReservations(client);
        
        // 10. Create sample reviews
        await this.seedReviews(client);
        
        // 11. Create user preferences
        await this.seedUserPreferences(client);
        
        // 12. Create user interactions
        await this.seedUserInteractions(client);
      });
      
      log('✅ Database seeding completed successfully');
      
    } catch (error) {
      log(`❌ Database seeding failed: ${error}`);
      throw error;
    }
  }
  
  /**
   * Seed restaurants
   */
  private async seedRestaurants(client: any): Promise<void> {
    log('📍 Seeding restaurants...');
    
    const restaurants = [
      {
        name: 'Bistro Revolution',
        description: 'A modern bistro featuring farm-to-table cuisine with innovative twists on classic dishes',
        address: '123 Culinary Street, Downtown, CA 90210',
        phone: '(555) 123-4567',
        email: 'info@bistrorevolution.com',
        logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop',
        opening_hours: JSON.stringify({
          monday: '11:00 AM - 10:00 PM',
          tuesday: '11:00 AM - 10:00 PM',
          wednesday: '11:00 AM - 10:00 PM',
          thursday: '11:00 AM - 10:00 PM',
          friday: '11:00 AM - 11:00 PM',
          saturday: '10:00 AM - 11:00 PM',
          sunday: '10:00 AM - 9:00 PM'
        }),
        latitude: 34.0522,
        longitude: -118.2437
      },
      {
        name: 'Coastal Kitchen',
        description: 'Fresh seafood and coastal cuisine with stunning ocean views',
        address: '456 Ocean Boulevard, Seaside, CA 90401',
        phone: '(555) 987-6543',
        email: 'hello@coastalkitchen.com',
        logo_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop',
        opening_hours: JSON.stringify({
          monday: 'Closed',
          tuesday: '12:00 PM - 9:00 PM',
          wednesday: '12:00 PM - 9:00 PM',
          thursday: '12:00 PM - 9:00 PM',
          friday: '12:00 PM - 10:00 PM',
          saturday: '11:00 AM - 10:00 PM',
          sunday: '11:00 AM - 9:00 PM'
        }),
        latitude: 34.0195,
        longitude: -118.4912
      }
    ];
    
    for (const restaurant of restaurants) {
      await client.query(
        `INSERT INTO restaurants (name, description, address, phone, email, logo_url, opening_hours, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          restaurant.name, restaurant.description, restaurant.address, restaurant.phone,
          restaurant.email, restaurant.logo_url, restaurant.opening_hours,
          restaurant.latitude, restaurant.longitude
        ]
      );
    }
    
    log('✅ Restaurants seeded');
  }
  
  /**
   * Seed users
   */
  private async seedUsers(client: any): Promise<void> {
    log('👥 Seeding users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        username: 'admin',
        email: 'admin@restaurantrevolution.com',
        password: hashedPassword,
        name: 'System Administrator',
        phone: '(555) 000-0001',
        role: 'admin',
        restaurant_id: null,
        loyalty_points: 0,
        email_verified: true
      },
      {
        username: 'owner1',
        email: 'owner@bistrorevolution.com',
        password: hashedPassword,
        name: 'John Restaurant',
        phone: '(555) 123-4567',
        role: 'owner',
        restaurant_id: 1,
        loyalty_points: 0,
        email_verified: true
      },
      {
        username: 'owner2',
        email: 'owner@coastalkitchen.com',
        password: hashedPassword,
        name: 'Sarah Ocean',
        phone: '(555) 987-6543',
        role: 'owner',
        restaurant_id: 2,
        loyalty_points: 0,
        email_verified: true
      },
      {
        username: 'customer1',
        email: 'alice@example.com',
        password: hashedPassword,
        name: 'Alice Johnson',
        phone: '(555) 111-2222',
        role: 'customer',
        restaurant_id: null,
        loyalty_points: 150,
        email_verified: true,
        dietary_preferences: JSON.stringify(['vegetarian'])
      },
      {
        username: 'customer2',
        email: 'bob@example.com',
        password: hashedPassword,
        name: 'Bob Smith',
        phone: '(555) 333-4444',
        role: 'customer',
        restaurant_id: null,
        loyalty_points: 75,
        email_verified: true
      },
      {
        username: 'customer3',
        email: 'carol@example.com',
        password: hashedPassword,
        name: 'Carol Williams',
        phone: '(555) 555-6666',
        role: 'customer',
        restaurant_id: null,
        loyalty_points: 220,
        email_verified: true,
        dietary_preferences: JSON.stringify(['gluten-free'])
      }
    ];
    
    for (const user of users) {
      await client.query(
        `INSERT INTO users (username, email, password, name, phone, role, restaurant_id, loyalty_points, email_verified, dietary_preferences)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          user.username, user.email, user.password, user.name, user.phone,
          user.role, user.restaurant_id, user.loyalty_points, user.email_verified,
          user.dietary_preferences || null
        ]
      );
    }
    
    log('✅ Users seeded');
  }
  
  /**
   * Seed categories
   */
  private async seedCategories(client: any): Promise<void> {
    log('📋 Seeding categories...');
    
    const categories = [
      // Bistro Revolution categories
      { name: 'Appetizers', restaurant_id: 1, display_order: 1 },
      { name: 'Soups & Salads', restaurant_id: 1, display_order: 2 },
      { name: 'Main Courses', restaurant_id: 1, display_order: 3 },
      { name: 'Pasta & Risotto', restaurant_id: 1, display_order: 4 },
      { name: 'Desserts', restaurant_id: 1, display_order: 5 },
      { name: 'Beverages', restaurant_id: 1, display_order: 6 },
      
      // Coastal Kitchen categories
      { name: 'Raw Bar', restaurant_id: 2, display_order: 1 },
      { name: 'Appetizers', restaurant_id: 2, display_order: 2 },
      { name: 'Fresh Catch', restaurant_id: 2, display_order: 3 },
      { name: 'Land & Sea', restaurant_id: 2, display_order: 4 },
      { name: 'Sides', restaurant_id: 2, display_order: 5 },
      { name: 'Desserts', restaurant_id: 2, display_order: 6 }
    ];
    
    for (const category of categories) {
      await client.query(
        'INSERT INTO categories (name, restaurant_id, display_order) VALUES ($1, $2, $3)',
        [category.name, category.restaurant_id, category.display_order]
      );
    }
    
    log('✅ Categories seeded');
  }
  
  /**
   * Seed menu items
   */
  private async seedMenuItems(client: any): Promise<void> {
    log('🍽️ Seeding menu items...');
    
    const menuItems = [
      // Bistro Revolution - Appetizers
      {
        name: 'Truffle Arancini',
        description: 'Crispy risotto balls with truffle oil, parmesan, and roasted garlic aioli',
        price: 16.00,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        category_id: 1,
        restaurant_id: 1,
        is_featured: true,
        is_vegetarian: true
      },
      {
        name: 'Charcuterie Board',
        description: 'Artisanal meats, aged cheeses, seasonal fruits, nuts, and house-made preserves',
        price: 22.00,
        image_url: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=300&fit=crop',
        category_id: 1,
        restaurant_id: 1,
        is_popular: true
      },
      {
        name: 'Burrata Caprese',
        description: 'Creamy burrata with heirloom tomatoes, basil oil, and aged balsamic',
        price: 18.00,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        category_id: 1,
        restaurant_id: 1,
        is_vegetarian: true
      },
      
      // Bistro Revolution - Main Courses
      {
        name: 'Herb-Crusted Lamb',
        description: 'Australian lamb rack with rosemary crust, roasted vegetables, and red wine jus',
        price: 42.00,
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
        category_id: 3,
        restaurant_id: 1,
        is_featured: true
      },
      {
        name: 'Duck Confit',
        description: 'Slow-cooked duck leg with cherry gastrique, quinoa pilaf, and seasonal greens',
        price: 38.00,
        image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
        category_id: 3,
        restaurant_id: 1,
        is_popular: true
      },
      {
        name: 'Mushroom Wellington',
        description: 'Wild mushroom duxelles in puff pastry with roasted root vegetables',
        price: 32.00,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        category_id: 3,
        restaurant_id: 1,
        is_vegetarian: true,
        is_featured: true
      },
      
      // Coastal Kitchen - Raw Bar
      {
        name: 'Oyster Selection',
        description: 'Daily selection of East and West Coast oysters served with mignonette',
        price: 3.50,
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
        category_id: 7,
        restaurant_id: 2,
        is_seafood: true,
        is_popular: true
      },
      {
        name: 'Seafood Tower',
        description: 'Lobster, crab, shrimp, oysters, and clams with cocktail sauce and mignonette',
        price: 85.00,
        image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        category_id: 7,
        restaurant_id: 2,
        is_seafood: true,
        is_featured: true
      },
      
      // Coastal Kitchen - Fresh Catch
      {
        name: 'Grilled Salmon',
        description: 'Wild Pacific salmon with lemon herb butter and seasonal vegetables',
        price: 34.00,
        image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&h=300&fit=crop',
        category_id: 9,
        restaurant_id: 2,
        is_seafood: true,
        is_gluten_free: true,
        is_popular: true
      },
      {
        name: 'Cioppino',
        description: 'San Francisco-style seafood stew with sourdough bread',
        price: 36.00,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        category_id: 9,
        restaurant_id: 2,
        is_seafood: true,
        is_featured: true
      }
    ];
    
    for (const item of menuItems) {
      await client.query(
        `INSERT INTO menu_items (name, description, price, image_url, category_id, restaurant_id, 
                               is_available, is_popular, is_featured, is_vegetarian, is_gluten_free, is_seafood)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          item.name, item.description, item.price, item.image_url, item.category_id,
          item.restaurant_id, true, item.is_popular || false, item.is_featured || false,
          item.is_vegetarian || false, item.is_gluten_free || false, item.is_seafood || false
        ]
      );
    }
    
    log('✅ Menu items seeded');
  }
  
  /**
   * Seed modifiers
   */
  private async seedModifiers(client: any): Promise<void> {
    log('🔧 Seeding modifiers...');
    
    const modifiers = [
      // Lamb modifiers
      { name: 'Extra Herb Crust', menu_item_id: 4, price: 3.00 },
      { name: 'Add Roasted Garlic', menu_item_id: 4, price: 2.00 },
      
      // Duck modifiers
      { name: 'Extra Cherry Gastrique', menu_item_id: 5, price: 2.50 },
      
      // Salmon modifiers
      { name: 'Blackened Seasoning', menu_item_id: 9, price: 0.00 },
      { name: 'Cedar Plank Style', menu_item_id: 9, price: 4.00 },
      
      // Oyster modifiers
      { name: 'Champagne Mignonette', menu_item_id: 7, price: 1.00 }
    ];
    
    for (const modifier of modifiers) {
      await client.query(
        'INSERT INTO modifiers (name, menu_item_id, price) VALUES ($1, $2, $3)',
        [modifier.name, modifier.menu_item_id, modifier.price]
      );
    }
    
    log('✅ Modifiers seeded');
  }
  
  /**
   * Seed loyalty rewards
   */
  private async seedLoyaltyRewards(client: any): Promise<void> {
    log('🎁 Seeding loyalty rewards...');
    
    const rewards = [
      {
        name: 'Free Appetizer',
        description: 'Enjoy any appetizer on the house',
        points_required: 100,
        restaurant_id: 1
      },
      {
        name: 'Free Dessert',
        description: 'Complimentary dessert with any entrée',
        points_required: 150,
        restaurant_id: 1
      },
      {
        name: '15% Off Entire Bill',
        description: '15% discount on your total order',
        points_required: 300,
        restaurant_id: 1
      },
      {
        name: 'Raw Bar Sampler',
        description: 'Free selection of 6 oysters',
        points_required: 200,
        restaurant_id: 2
      },
      {
        name: 'Chef\'s Special',
        description: 'Complimentary chef\'s daily special',
        points_required: 400,
        restaurant_id: 2
      }
    ];
    
    for (const reward of rewards) {
      await client.query(
        'INSERT INTO loyalty_rewards (name, description, points_required, restaurant_id, is_active) VALUES ($1, $2, $3, $4, $5)',
        [reward.name, reward.description, reward.points_required, reward.restaurant_id, true]
      );
    }
    
    log('✅ Loyalty rewards seeded');
  }
  
  /**
   * Seed promotions
   */
  private async seedPromotions(client: any): Promise<void> {
    log('🎉 Seeding promotions...');
    
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const promotions = [
      {
        name: 'Happy Hour',
        description: '25% off appetizers and drinks from 4-6 PM',
        discount_type: 'percentage',
        discount_value: 25.00,
        start_date: now.toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0],
        code: 'HAPPYHOUR',
        restaurant_id: 1
      },
      {
        name: 'Weekend Special',
        description: '$10 off orders over $50',
        discount_type: 'fixed',
        discount_value: 10.00,
        start_date: now.toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0],
        code: 'WEEKEND10',
        restaurant_id: 2
      }
    ];
    
    for (const promotion of promotions) {
      await client.query(
        'INSERT INTO promotions (name, description, discount_type, discount_value, start_date, end_date, code, restaurant_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          promotion.name, promotion.description, promotion.discount_type,
          promotion.discount_value, promotion.start_date, promotion.end_date,
          promotion.code, promotion.restaurant_id, true
        ]
      );
    }
    
    log('✅ Promotions seeded');
  }
  
  /**
   * Seed sample orders
   */
  private async seedOrders(client: any): Promise<void> {
    log('📦 Seeding sample orders...');
    
    const orders = [
      {
        user_id: 4, // Alice
        restaurant_id: 1,
        order_type: 'dine-in',
        status: 'completed',
        total_price: 58.00,
        subtotal: 54.00,
        tax: 4.32,
        discount: 0,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        user_id: 5, // Bob
        restaurant_id: 2,
        order_type: 'takeout',
        status: 'completed',
        total_price: 42.50,
        subtotal: 39.50,
        tax: 3.16,
        discount: 0,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        user_id: 6, // Carol
        restaurant_id: 1,
        order_type: 'delivery',
        status: 'preparing',
        total_price: 45.00,
        subtotal: 40.00,
        tax: 3.20,
        delivery_fee: 1.80,
        discount: 0,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      }
    ];
    
    for (const order of orders) {
      await client.query(
        `INSERT INTO orders (user_id, restaurant_id, order_type, status, total_price, subtotal, tax, 
                           discount, loyalty_discount, delivery_fee, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          order.user_id, order.restaurant_id, order.order_type, order.status,
          order.total_price, order.subtotal, order.tax, order.discount,
          0, order.delivery_fee || 0, order.created_at
        ]
      );
    }
    
    // Add order items
    const orderItems = [
      { order_id: 1, menu_item_id: 1, quantity: 1, price: 16.00 },
      { order_id: 1, menu_item_id: 4, quantity: 1, price: 42.00 },
      { order_id: 2, menu_item_id: 9, quantity: 1, price: 34.00 },
      { order_id: 2, menu_item_id: 7, quantity: 2, price: 3.50 },
      { order_id: 3, menu_item_id: 6, quantity: 1, price: 32.00 },
      { order_id: 3, menu_item_id: 1, quantity: 1, price: 16.00 }
    ];
    
    for (const item of orderItems) {
      await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [item.order_id, item.menu_item_id, item.quantity, item.price]
      );
    }
    
    log('✅ Sample orders seeded');
  }
  
  /**
   * Seed sample reservations
   */
  private async seedReservations(client: any): Promise<void> {
    log('📅 Seeding sample reservations...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const reservations = [
      {
        user_id: 4,
        restaurant_id: 1,
        date: tomorrow.toISOString().split('T')[0],
        time: '19:00:00',
        party_size: 2,
        status: 'confirmed'
      },
      {
        user_id: 5,
        restaurant_id: 2,
        date: tomorrow.toISOString().split('T')[0],
        time: '18:30:00',
        party_size: 4,
        status: 'pending'
      }
    ];
    
    for (const reservation of reservations) {
      await client.query(
        'INSERT INTO reservations (user_id, restaurant_id, date, time, party_size, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [reservation.user_id, reservation.restaurant_id, reservation.date, reservation.time, reservation.party_size, reservation.status]
      );
    }
    
    log('✅ Sample reservations seeded');
  }
  
  /**
   * Seed sample reviews
   */
  private async seedReviews(client: any): Promise<void> {
    log('⭐ Seeding sample reviews...');
    
    const reviews = [
      {
        user_id: 4,
        restaurant_id: 1,
        order_id: 1,
        rating: 5,
        comment: 'Absolutely incredible dining experience! The truffle arancini was divine and the lamb was cooked to perfection.'
      },
      {
        user_id: 5,
        restaurant_id: 2,
        order_id: 2,
        rating: 4,
        comment: 'Fresh seafood and great ocean views. The salmon was excellent, though service was a bit slow.'
      },
      {
        user_id: 6,
        restaurant_id: 1,
        rating: 5,
        comment: 'Best vegetarian options in the city! The mushroom wellington is a masterpiece.'
      }
    ];
    
    for (const review of reviews) {
      await client.query(
        'INSERT INTO reviews (user_id, restaurant_id, order_id, rating, comment) VALUES ($1, $2, $3, $4, $5)',
        [review.user_id, review.restaurant_id, review.order_id, review.rating, review.comment]
      );
    }
    
    log('✅ Sample reviews seeded');
  }
  
  /**
   * Seed user preferences
   */
  private async seedUserPreferences(client: any): Promise<void> {
    log('⚙️ Seeding user preferences...');
    
    const preferences = [
      {
        user_id: 4, // Alice - vegetarian
        dietary_preferences: JSON.stringify({ vegetarian: true, glutenFree: false }),
        allergens: JSON.stringify({ nuts: false, dairy: false, shellfish: false }),
        favorite_categories: JSON.stringify([1, 3]) // Appetizers, Main Courses
      },
      {
        user_id: 6, // Carol - gluten-free
        dietary_preferences: JSON.stringify({ vegetarian: false, glutenFree: true }),
        allergens: JSON.stringify({ nuts: false, dairy: false, shellfish: false, gluten: true }),
        favorite_categories: JSON.stringify([9, 10]) // Fresh Catch, Land & Sea
      }
    ];
    
    for (const pref of preferences) {
      await client.query(
        'INSERT INTO user_preferences (user_id, dietary_preferences, allergens, favorite_categories) VALUES ($1, $2, $3, $4)',
        [pref.user_id, pref.dietary_preferences, pref.allergens, pref.favorite_categories]
      );
    }
    
    log('✅ User preferences seeded');
  }
  
  /**
   * Seed user interactions for AI recommendations
   */
  private async seedUserInteractions(client: any): Promise<void> {
    log('👆 Seeding user interactions...');
    
    const interactions = [
      // Alice's interactions
      { user_id: 4, menu_item_id: 1, interaction: 'ordered' },
      { user_id: 4, menu_item_id: 4, interaction: 'ordered' },
      { user_id: 4, menu_item_id: 6, interaction: 'liked' },
      { user_id: 4, menu_item_id: 3, interaction: 'viewed' },
      
      // Bob's interactions
      { user_id: 5, menu_item_id: 9, interaction: 'ordered' },
      { user_id: 5, menu_item_id: 7, interaction: 'ordered' },
      { user_id: 5, menu_item_id: 8, interaction: 'viewed' },
      
      // Carol's interactions
      { user_id: 6, menu_item_id: 6, interaction: 'ordered' },
      { user_id: 6, menu_item_id: 1, interaction: 'viewed' },
      { user_id: 6, menu_item_id: 9, interaction: 'liked' }
    ];
    
    for (const interaction of interactions) {
      await client.query(
        'INSERT INTO user_item_interactions (user_id, menu_item_id, interaction) VALUES ($1, $2, $3)',
        [interaction.user_id, interaction.menu_item_id, interaction.interaction]
      );
    }
    
    log('✅ User interactions seeded');
  }
  
  /**
   * Clear all data from database
   */
  async clearAll(): Promise<void> {
    try {
      log('🗑️ Clearing all database data...');
      
      await db.transaction(async (client) => {
        const tables = [
          'user_item_interactions',
          'user_preferences', 
          'ai_conversations',
          'reviews',
          'promotions',
          'loyalty_rewards',
          'queue_entries',
          'reservations',
          'order_items',
          'orders',
          'modifiers',
          'menu_items',
          'categories',
          'restaurants',
          'users'
        ];
        
        for (const table of tables) {
          await client.query(`DELETE FROM ${table}`);
          await client.query(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`);
        }
      });
      
      log('✅ Database cleared successfully');
      
    } catch (error) {
      log(`❌ Database clearing failed: ${error}`);
      throw error;
    }
  }
}

export const seeder = new DatabaseSeeder();