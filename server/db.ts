import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// PostgreSQL connection string
const connectionString = process.env.DATABASE_URL!;

// Create a PostgreSQL client
const client = postgres(connectionString);

// Create a Drizzle ORM instance
export const db = drizzle(client, { schema });