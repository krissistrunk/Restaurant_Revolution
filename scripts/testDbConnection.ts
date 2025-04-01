import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Simple query to test the connection
    const result = await db.execute(sql`SELECT NOW() as time`);
    
    console.log('Database connection successful!');
    console.log('Current database time:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

testConnection();