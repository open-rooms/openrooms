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
    const isProduction = process.env.NODE_ENV === 'production';
    const dialect = new PostgresDialect({
      pool: new Pool({
        connectionString:
          connString || 'postgresql://postgres:postgres@127.0.0.1:5432/openrooms',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        // Railway PostgreSQL requires SSL; disable cert verification for managed DBs
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }),
    });

    db = new Kysely<Database>({
      dialect,
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
