#!/usr/bin/env ts-node
/**
 * Quick database test to check our data
 */

import { db } from '../server/database/connection';
import { log } from '../server/vite';

async function testDatabase() {
  try {
    await db.initialize();
    
    // Check restaurants
    const restaurants = await db.query('SELECT * FROM restaurants LIMIT 5');
    console.log('🏪 Restaurants:', restaurants.rows);
    
    // Check users
    const users = await db.query('SELECT id, username, email, role FROM users LIMIT 10');
    console.log('👥 Users:', users.rows);
    
    // Check menu items
    const menuItems = await db.query('SELECT id, name, price, restaurant_id FROM menu_items LIMIT 5');
    console.log('🍽️ Menu Items:', menuItems.rows);
    
    await db.shutdown();
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();