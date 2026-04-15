/**
 * Kysely Database Connection
 */

import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './types';

let db: Kysely<Database> | null = null;

export function getDb(): Kysely<Database> {
  if (!db) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Railway provides DATABASE_URL automatically when a PostgreSQL plugin is linked.
    // If the service variable isn't set, fall back to individual PG* vars that Railway
    // also injects, then finally to the local dev default.
    const connString =
      process.env.DATABASE_URL ||
      (process.env.PGHOST
        ? `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'openrooms'}`
        : 'postgresql://postgres:postgres@127.0.0.1:5432/openrooms');

    console.log(`[db] connecting to ${connString.replace(/:\/\/[^@]+@/, '://<credentials>@')}`);

    const dialect = new PostgresDialect({
      pool: new Pool({
        connectionString: connString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        // Railway PostgreSQL requires SSL; skip cert verification for managed DBs
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
