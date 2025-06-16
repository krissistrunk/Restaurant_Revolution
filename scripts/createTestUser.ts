import { db } from '../server/db';
import { sql } from 'drizzle-orm';

// This script creates a test user for login purposes

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if owner test user already exists
    const existingOwner = await db.execute(sql`
      SELECT id FROM users WHERE username = 'owneruser' LIMIT 1
    `);
    // Check if customer test user already exists
    const existingCustomer = await db.execute(sql`
      SELECT id FROM users WHERE username = 'customeruser' LIMIT 1
    `);
    let createdAny = false;
    if (!existingOwner || existingOwner.length === 0) {
      await db.execute(sql`
        INSERT INTO users (username, password, name, email, phone, loyalty_points, dietary_preferences, role)
        VALUES (
          'owneruser',
          'ownerpass',
          'Owner Test',
          'owner@example.com',
          '555-000-1111',
          200,
          '{"vegetarian": false, "glutenFree": false}',
          'owner'
        )
      `);
      createdAny = true;
      console.log('Owner test user created!');
      console.log('Username: owneruser');
      console.log('Password: ownerpass');
    } else {
      console.log('Owner test user already exists, skipping creation...');
    }
    if (!existingCustomer || existingCustomer.length === 0) {
      await db.execute(sql`
        INSERT INTO users (username, password, name, email, phone, loyalty_points, dietary_preferences, role)
        VALUES (
          'customeruser',
          'customerpass',
          'Customer Test',
          'customer@example.com',
          '555-222-3333',
          50,
          '{"vegetarian": true, "glutenFree": true}',
          'customer'
        )
      `);
      createdAny = true;
      console.log('Customer test user created!');
      console.log('Username: customeruser');
      console.log('Password: customerpass');
    } else {
      console.log('Customer test user already exists, skipping creation...');
    }
    if (!createdAny) {
      console.log('No test users created. Both already exist.');
    }
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();