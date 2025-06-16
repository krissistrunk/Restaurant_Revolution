import { db } from './connection';
import { log } from '../vite';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Migration {
  name: string;
  sql: string;
}

export class DatabaseMigrator {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<void> {
    try {
      log('🔄 Starting database migration...');
      
      // Ensure migrations table exists
      await this.createMigrationsTable();
      
      // Get all migration files
      const migrations = await this.getMigrationFiles();
      
      // Get already executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      
      // Filter pending migrations
      const pendingMigrations = migrations.filter(
        migration => !executedMigrations.includes(migration.name)
      );
      
      if (pendingMigrations.length === 0) {
        log('✅ No pending migrations found');
        return;
      }
      
      log(`📝 Found ${pendingMigrations.length} pending migration(s)`);
      
      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      log('✅ All migrations completed successfully');
      
    } catch (error) {
      log(`❌ Migration failed: ${error}`);
      throw error;
    }
  }

  /**
   * Create the migrations tracking table
   */
  private async createMigrationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await db.query(sql);
  }

  /**
   * Get all migration files from the migrations directory
   */
  private async getMigrationFiles(): Promise<Migration[]> {
    try {
      const files = await fs.readdir(this.migrationsPath);
      const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
      
      const migrations: Migration[] = [];
      
      for (const file of sqlFiles) {
        const filePath = path.join(this.migrationsPath, file);
        const sql = await fs.readFile(filePath, 'utf-8');
        migrations.push({
          name: file.replace('.sql', ''),
          sql
        });
      }
      
      return migrations;
    } catch (error) {
      // If migrations directory doesn't exist, create it and return empty array
      if (error.code === 'ENOENT') {
        await fs.mkdir(this.migrationsPath, { recursive: true });
        return [];
      }
      throw error;
    }
  }

  /**
   * Get list of already executed migrations
   */
  private async getExecutedMigrations(): Promise<string[]> {
    const result = await db.query('SELECT name FROM migrations ORDER BY executed_at');
    return result.rows.map((row: any) => row.name);
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(migration: Migration): Promise<void> {
    log(`🔄 Executing migration: ${migration.name}`);
    
    await db.transaction(async (client) => {
      // Execute migration SQL
      await client.query(migration.sql);
      
      // Record migration as executed
      await client.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [migration.name]
      );
    });
    
    log(`✅ Migration completed: ${migration.name}`);
  }

  /**
   * Initialize database with base schema
   */
  async initializeSchema(): Promise<void> {
    try {
      log('🔄 Initializing database schema...');
      
      // Read and execute the main schema file
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = await fs.readFile(schemaPath, 'utf-8');
      
      await db.transaction(async (client) => {
        await client.query(schemaSql);
      });
      
      log('✅ Database schema initialized successfully');
      
    } catch (error) {
      log(`❌ Schema initialization failed: ${error}`);
      throw error;
    }
  }

  /**
   * Reset database (DROP and recreate all tables)
   */
  async reset(): Promise<void> {
    try {
      log('⚠️ Resetting database - this will delete ALL data!');
      
      const resetSql = `
        -- Drop all tables in reverse dependency order
        DROP TABLE IF EXISTS user_item_interactions CASCADE;
        DROP TABLE IF EXISTS user_preferences CASCADE;
        DROP TABLE IF EXISTS ai_conversations CASCADE;
        DROP TABLE IF EXISTS reviews CASCADE;
        DROP TABLE IF EXISTS promotions CASCADE;
        DROP TABLE IF EXISTS loyalty_rewards CASCADE;
        DROP TABLE IF EXISTS queue_entries CASCADE;
        DROP TABLE IF EXISTS reservations CASCADE;
        DROP TABLE IF EXISTS order_items CASCADE;
        DROP TABLE IF EXISTS orders CASCADE;
        DROP TABLE IF EXISTS modifiers CASCADE;
        DROP TABLE IF EXISTS menu_items CASCADE;
        DROP TABLE IF EXISTS categories CASCADE;
        DROP TABLE IF EXISTS restaurants CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS migrations CASCADE;
        
        -- Drop functions and triggers
        DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
      `;
      
      await db.query(resetSql);
      
      // Reinitialize schema
      await this.initializeSchema();
      
      log('✅ Database reset completed');
      
    } catch (error) {
      log(`❌ Database reset failed: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new migration file
   */
  async createMigration(name: string, sql: string): Promise<void> {
    try {
      // Ensure migrations directory exists
      await fs.mkdir(this.migrationsPath, { recursive: true });
      
      // Generate timestamp prefix
      const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
      const filename = `${timestamp}_${name}.sql`;
      const filepath = path.join(this.migrationsPath, filename);
      
      // Write migration file
      await fs.writeFile(filepath, sql);
      
      log(`✅ Migration file created: ${filename}`);
      
    } catch (error) {
      log(`❌ Failed to create migration: ${error}`);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    total: number;
    executed: number;
    pending: string[];
  }> {
    const migrations = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();
    
    const pendingMigrations = migrations
      .filter(migration => !executedMigrations.includes(migration.name))
      .map(migration => migration.name);
    
    return {
      total: migrations.length,
      executed: executedMigrations.length,
      pending: pendingMigrations
    };
  }

  /**
   * Seed database with sample data
   */
  async seed(): Promise<void> {
    try {
      log('🌱 Seeding database with sample data...');
      
      const seedPath = path.join(__dirname, 'seeds', 'sample_data.sql');
      
      try {
        const seedSql = await fs.readFile(seedPath, 'utf-8');
        
        await db.transaction(async (client) => {
          await client.query(seedSql);
        });
        
        log('✅ Database seeding completed successfully');
      } catch (error) {
        if (error.code === 'ENOENT') {
          log('⚠️ No seed file found, creating sample data programmatically...');
          await this.createSampleData();
        } else {
          throw error;
        }
      }
      
    } catch (error) {
      log(`❌ Database seeding failed: ${error}`);
      throw error;
    }
  }

  /**
   * Create sample data programmatically
   */
  private async createSampleData(): Promise<void> {
    // This will be implemented in the seeding file
    log('📝 Sample data creation will be implemented in seeding module');
  }
}

export const migrator = new DatabaseMigrator();