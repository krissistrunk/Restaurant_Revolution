#!/usr/bin/env ts-node
/**
 * Test storage functionality directly
 */

import { storage } from './server/storage';
import { log } from './server/vite';

async function testStorage() {
  try {
    console.log('🧪 Testing storage interface...\n');
    
    // Test restaurant
    console.log('Testing getRestaurant(1)...');
    const restaurant = await storage.getRestaurant(1);
    console.log('Restaurant:', restaurant ? 'Found' : 'Not found');
    if (restaurant) {
      console.log('  Name:', restaurant.name);
      console.log('  Address:', restaurant.address);
    }
    
    // Test categories
    console.log('\nTesting getCategories(1)...');
    const categories = await storage.getCategories(1);
    console.log('Categories:', categories.length, 'found');
    if (categories.length > 0) {
      console.log('  First category:', categories[0].name);
    }
    
    // Test menu items
    console.log('\nTesting getMenuItems(1)...');
    const menuItems = await storage.getMenuItems(1);
    console.log('Menu items:', menuItems.length, 'found');
    if (menuItems.length > 0) {
      console.log('  First item:', menuItems[0].name);
    }
    
    console.log('\n✅ Storage test completed successfully!');
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

testStorage();