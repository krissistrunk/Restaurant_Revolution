#!/usr/bin/env ts-node
/**
 * Development database setup script
 * Creates the database if it doesn't exist, then runs initialization
 */

import pg from 'pg';
import { log } from '../server/vite';
import { dbInitializer } from '../server/database/init';

const { Pool } = pg;

async function createDatabaseIfNotExists() {
  // Connect to postgres database to create our application database
  const adminPool = new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: 'postgres', // Connect to default postgres database
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
  });

  try {
    // Check if database exists
    const dbName = process.env.DATABASE_NAME || 'restaurant_revolution';
    const checkDb = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length === 0) {
      log(`📊 Creating database: ${dbName}`);
      
      // Create database (cannot use parameters for database name)
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      log(`✅ Database "${dbName}" created successfully`);
    } else {
      log(`📊 Database "${dbName}" already exists`);
    }

  } catch (error) {
    if (error.code === '42P04') {
      // Database already exists
      log('📊 Database already exists');
    } else {
      log(`❌ Error creating database: ${error}`);
      throw error;
    }
  } finally {
    await adminPool.end();
  }
}

async function main() {
  try {
    log('🚀 Setting up development database...');
    
    // Step 1: Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Step 2: Initialize database with schema and data
    await dbInitializer.setupDevelopment();
    
    log('🎉 Development database setup completed!');
    process.exit(0);
    
  } catch (error) {
    log(`❌ Setup failed: ${error}`);
    process.exit(1);
  }
}

main();