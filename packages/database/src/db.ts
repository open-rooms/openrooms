/**
 * Kysely Database Connection
 */

import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './types';

let db: Kysely<Database> | null = null;

export function getDb(): Kysely<Database> {
  if (!db) {
    const connString = process.env.DATABASE_URL;
    console.log('[DB] DATABASE_URL:', connString);
    
    if (!connString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Parse connection string manually to avoid pg parsing issues
    const dialect = new PostgresDialect({
      pool: new Pool({
        host: '127.0.0.1',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'openrooms',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }),
    });

    db = new Kysely<Database>({
      dialect,
      // Remove logging for cleaner output
    });
  }

  return db;
}

export async function disconnect(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}

// Graceful shutdown
process.on('beforeExit', () => {
  disconnect().catch(console.error);
});
