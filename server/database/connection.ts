import pg from 'pg';
import { log } from '../vite';

const { Pool } = pg;
type PoolClient = pg.PoolClient;
type PoolConfig = pg.PoolConfig;

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

class DatabaseConnection {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.config = this.getConfig();
  }

  /**
   * Initialize the database connection pool
   */
  async initialize(): Promise<void> {
    try {
      const poolConfig: PoolConfig = {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        max: this.config.max || 20, // Maximum number of clients in the pool
        idleTimeoutMillis: this.config.idleTimeoutMillis || 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: this.config.connectionTimeoutMillis || 10000, // Return an error after 10 seconds if connection could not be established
      };

      this.pool = new Pool(poolConfig);

      // Test the connection
      await this.testConnection();
      
      // Set up connection event handlers
      this.setupEventHandlers();
      
      // Start health check monitoring
      this.startHealthCheck();
      
      this.isConnected = true;
      log('✅ PostgreSQL database connection established successfully');
      
    } catch (error) {
      log(`❌ Failed to initialize database connection: ${error}`);
      throw error;
    }
  }

  /**
   * Get a client from the connection pool
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database connection not initialized');
    }
    
    try {
      return await this.pool.connect();
    } catch (error) {
      log(`Error getting database client: ${error}`);
      throw error;
    }
  }

  /**
   * Execute a query with automatic client management
   */
  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database connection not initialized');
    }

    const client = await this.getClient();
    try {
      const start = Date.now();
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries (>1000ms)
      if (duration > 1000) {
        log(`🐌 Slow query detected (${duration}ms): ${text.substring(0, 100)}...`);
      }
      
      return result;
    } catch (error) {
      log(`Database query error: ${error}`);
      log(`Query: ${text}`);
      log(`Params: ${JSON.stringify(params)}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database connection not initialized');
    }

    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      log(`Transaction rolled back due to error: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get connection pool status
   */
  getPoolStatus(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
    isConnected: boolean;
  } {
    if (!this.pool) {
      return {
        totalCount: 0,
        idleCount: 0,
        waitingCount: 0,
        isConnected: false
      };
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      isConnected: this.isConnected
    };
  }

  /**
   * Close the database connection pool
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      log('🔌 Database connection pool closed');
    }
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      client.release();
      
      log(`📊 Database connection test successful`);
      log(`   Time: ${result.rows[0].current_time}`);
      log(`   Version: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
    } catch (error) {
      throw new Error(`Database connection test failed: ${error}`);
    }
  }

  /**
   * Set up connection pool event handlers
   */
  private setupEventHandlers(): void {
    if (!this.pool) return;

    this.pool.on('connect', (client) => {
      log('🔗 New database client connected');
    });

    this.pool.on('acquire', (client) => {
      // Client acquired from pool
    });

    this.pool.on('remove', (client) => {
      log('🗑️ Database client removed from pool');
    });

    this.pool.on('error', (err, client) => {
      log(`❌ Database pool error: ${err}`);
      this.isConnected = false;
    });
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.testConnection();
        if (!this.isConnected) {
          this.isConnected = true;
          log('✅ Database connection restored');
        }
      } catch (error) {
        if (this.isConnected) {
          this.isConnected = false;
          log(`❌ Database health check failed: ${error}`);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get database configuration from environment variables
   */
  private getConfig(): DatabaseConfig {
    const config: DatabaseConfig = {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'restaurant_revolution',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'password',
      ssl: process.env.DATABASE_SSL === 'true',
      max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
      idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10000')
    };

    // For development, use DATABASE_URL if provided (common in cloud deployments)
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      config.host = url.hostname;
      config.port = parseInt(url.port) || 5432;
      config.database = url.pathname.slice(1); // Remove leading slash
      config.user = url.username;
      config.password = url.password;
      config.ssl = url.searchParams.get('sslmode') !== 'disable';
    }

    return config;
  }

  /**
   * Check if database is connected
   */
  isHealthy(): boolean {
    return this.isConnected && this.pool !== null;
  }
}

// Export singleton instance
export const db = new DatabaseConnection();

// Export types for use in other modules
export type { DatabaseConfig };
export { DatabaseConnection };