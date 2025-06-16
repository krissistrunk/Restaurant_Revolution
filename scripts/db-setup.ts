#!/usr/bin/env ts-node
/**
 * Database setup script for Restaurant Revolution v3
 * Usage: 
 *   npm run db:setup - Initialize database with sample data
 *   npm run db:reset - Reset and reinitialize database
 *   npm run db:health - Check database health
 *   npm run db:migrate - Run pending migrations
 *   npm run db:seed - Seed database with sample data
 */

import { dbInitializer, checkDatabaseHealth } from '../server/database/init';
import { migrator } from '../server/database/migrator';
import { seeder } from '../server/database/seeder';
import { log } from '../server/vite';

const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'init':
      case 'setup':
        log('🚀 Initializing database...');
        await dbInitializer.setupDevelopment();
        break;

      case 'reset':
        log('⚠️ Resetting database...');
        await migrator.reset();
        await seeder.seedAll();
        log('✅ Database reset completed');
        break;

      case 'health':
      case 'status':
        await checkDatabaseHealth();
        break;

      case 'migrate':
        log('🔄 Running database migrations...');
        await migrator.migrate();
        break;

      case 'seed':
        log('🌱 Seeding database...');
        await seeder.seedAll();
        break;

      case 'clear':
        log('🗑️ Clearing database data...');
        await seeder.clearAll();
        break;

      case 'prod-setup':
        log('🏭 Setting up production database...');
        await dbInitializer.setupProduction();
        break;

      case 'test-setup':
        log('🧪 Setting up test database...');
        await dbInitializer.resetForTesting();
        break;

      default:
        console.log(`
📊 Restaurant Revolution v3 - Database Setup

Available commands:
  setup, init     - Initialize database with schema and sample data
  reset          - Reset database and reinitialize
  health, status - Check database health and migration status
  migrate        - Run pending migrations
  seed           - Seed database with sample data
  clear          - Clear all data from database
  prod-setup     - Setup production database (no sample data)
  test-setup     - Setup test database

Environment variables:
  DATABASE_URL          - PostgreSQL connection string
  USE_MEMORY_STORAGE    - Set to 'true' to use in-memory storage instead
  NODE_ENV              - Environment (development, production, test)

Examples:
  npm run db:setup      - Quick development setup
  npm run db:health     - Check database status
  npm run db:reset      - Fresh start with sample data
`);
        process.exit(0);
    }

    // Graceful shutdown
    await dbInitializer.shutdown();
    process.exit(0);

  } catch (error) {
    log(`❌ Command failed: ${error}`);
    await dbInitializer.shutdown();
    process.exit(1);
  }
}

main();