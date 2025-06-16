import { db } from './connection';
import { DatabaseMigrator } from './migrator';
import { DatabaseSeeder } from './seeder';
import { log } from '../vite';

/**
 * Database initialization and setup utilities
 */
export class DatabaseInitializer {
  private connection = db;
  private migrator: DatabaseMigrator;
  private seeder: DatabaseSeeder;

  constructor() {
    this.migrator = new DatabaseMigrator();
    this.seeder = new DatabaseSeeder();
  }

  /**
   * Complete database initialization for fresh setup
   */
  async initializeDatabase(seedData: boolean = true): Promise<void> {
    try {
      log('🚀 Starting complete database initialization...');

      // 1. Initialize database connection
      await this.connection.initialize();
      log('✅ Database connection established');

      // 2. Initialize schema
      await this.migrator.initializeSchema();
      log('✅ Database schema initialized');

      // 3. Run any pending migrations
      await this.migrator.migrate();
      log('✅ Database migrations completed');

      // 4. Seed with sample data if requested
      if (seedData) {
        await this.seeder.seedAll();
        log('✅ Database seeded with sample data');
      }

      log('🎉 Database initialization completed successfully!');

    } catch (error) {
      log(`❌ Database initialization failed: ${error}`);
      throw error;
    }
  }

  /**
   * Quick setup for development environment
   */
  async setupDevelopment(): Promise<void> {
    try {
      log('🛠️ Setting up development database...');
      
      await this.initializeDatabase(true);
      
      log('🎯 Development database ready!');
      
    } catch (error) {
      log(`❌ Development setup failed: ${error}`);
      throw error;
    }
  }

  /**
   * Production-ready initialization
   */
  async setupProduction(): Promise<void> {
    try {
      log('🏭 Setting up production database...');
      
      // For production, we typically don't seed with sample data
      await this.initializeDatabase(false);
      
      log('🚀 Production database ready!');
      
    } catch (error) {
      log(`❌ Production setup failed: ${error}`);
      throw error;
    }
  }

  /**
   * Reset database for testing
   */
  async resetForTesting(): Promise<void> {
    try {
      log('🧪 Resetting database for testing...');
      
      await this.connection.initialize();
      await this.migrator.reset();
      await this.seeder.seedAll();
      
      log('✅ Test database ready!');
      
    } catch (error) {
      log(`❌ Test database reset failed: ${error}`);
      throw error;
    }
  }

  /**
   * Check database health and connectivity
   */
  async healthCheck(): Promise<{
    connected: boolean;
    schemaInitialized: boolean;
    migrationStatus: any;
    error?: string;
  }> {
    try {
      // Test connection
      await this.connection.initialize();
      const connected = await this.connection.isHealthy();

      if (!connected) {
        return {
          connected: false,
          schemaInitialized: false,
          migrationStatus: null,
          error: 'Database connection failed'
        };
      }

      // Check migration status
      const migrationStatus = await this.migrator.getStatus();

      return {
        connected: true,
        schemaInitialized: migrationStatus.executed > 0,
        migrationStatus
      };

    } catch (error) {
      return {
        connected: false,
        schemaInitialized: false,
        migrationStatus: null,
        error: error.message
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      await this.connection.shutdown();
      log('✅ Database connection closed gracefully');
    } catch (error) {
      log(`⚠️ Error during database shutdown: ${error}`);
    }
  }
}

export const dbInitializer = new DatabaseInitializer();

// Environment-specific initialization functions
export const setupDatabase = async () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      await dbInitializer.setupProduction();
      break;
    case 'test':
      await dbInitializer.resetForTesting();
      break;
    default:
      await dbInitializer.setupDevelopment();
      break;
  }
};

// CLI-friendly health check
export const checkDatabaseHealth = async () => {
  const health = await dbInitializer.healthCheck();
  
  console.log('🏥 Database Health Check:');
  console.log(`  Connected: ${health.connected ? '✅' : '❌'}`);
  console.log(`  Schema Initialized: ${health.schemaInitialized ? '✅' : '❌'}`);
  
  if (health.migrationStatus) {
    console.log(`  Migrations: ${health.migrationStatus.executed}/${health.migrationStatus.total} executed`);
    if (health.migrationStatus.pending.length > 0) {
      console.log(`  Pending: ${health.migrationStatus.pending.join(', ')}`);
    }
  }
  
  if (health.error) {
    console.log(`  Error: ${health.error}`);
  }
  
  return health;
};