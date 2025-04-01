import { db } from '../server/db';
import { sql } from 'drizzle-orm';

// This script creates a test user for login purposes

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if test user already exists
    const existingUser = await db.execute(sql`
      SELECT id FROM users WHERE username = 'testuser' LIMIT 1
    `);
    
    if (existingUser && existingUser.length > 0) {
      console.log('Test user already exists, skipping creation...');
      return;
    }
    
    // Create test user with predefined credentials
    await db.execute(sql`
      INSERT INTO users (username, password, name, email, phone, loyalty_points, dietary_preferences)
      VALUES (
        'testuser', 
        'password123', 
        'Test User',
        'test@example.com',
        '555-123-4567',
        100,
        '{"vegetarian": false, "glutenFree": false}'
      )
    `);
    
    console.log('Test user created successfully!');
    console.log('Login with:');
    console.log('Username: testuser');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();