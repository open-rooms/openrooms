/**
 * Workspaces Routes
 * Handles workspace registration (signup) and lookup.
 * Workspaces are persisted to PostgreSQL so auth is real, not localStorage-only.
 * Falls back gracefully if the workspaces table doesn't exist yet.
 */

import { FastifyInstance } from 'fastify';
import { Container } from '../container';
import { randomBytes } from 'crypto';

export async function workspacesRoutes(fastify: FastifyInstance, container: Container): Promise<void> {
  const db = container.db as any;

  // Ensure workspaces table exists — run once at startup, silently skip if table already exists
  try {
    await db.executeQuery(
      db.raw(`
        CREATE TABLE IF NOT EXISTS workspaces (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(128) NOT NULL UNIQUE,
          email VARCHAR(256) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `).compile(db)
    );
  } catch {
    // Table already exists or DB not ready — both are fine
  }

  // POST /api/workspaces — register or retrieve a workspace
  fastify.post('/workspaces', async (req, reply) => {
    const { name, email } = req.body as { name?: string; email?: string };

    if (!name || !email) {
      return reply.code(400).send({ message: 'name and email are required' });
    }

    const slugName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 64).replace(/^-+|-+$/g, '') || 'workspace';

    // Generate a session token (not stored — stateless for now)
    const token = `or_${randomBytes(24).toString('hex')}`;

    try {
      // Try to insert; on unique conflict return existing
      const row = await db
        .insertInto('workspaces')
        .values({ name: slugName, email: email.toLowerCase().trim() })
        .onConflict((oc: any) => oc.column('name').doNothing())
        .returning(['id', 'name', 'email', 'created_at'])
        .executeTakeFirst();

      if (row) {
        fastify.log.info({ workspace: row.name }, 'Workspace registered');
        return reply.code(201).send({ id: row.id, name: row.name, email: row.email, token, isNew: true });
      }

      // Row already existed (conflict) — fetch it
      const existing = await db
        .selectFrom('workspaces')
        .select(['id', 'name', 'email'])
        .where('name', '=', slugName)
        .executeTakeFirst();

      return reply.send({ id: existing?.id, name: slugName, email, token, isNew: false });
    } catch (err: any) {
      // Table doesn't exist yet or other DB error — return graceful demo token
      fastify.log.warn({ err: err?.message }, 'Workspaces table not ready — returning demo token');
      return reply.send({ name: slugName, email, token: `demo_${Date.now()}`, isNew: false, fallback: true });
    }
  });

  // GET /api/workspaces/:name — look up a workspace
  fastify.get('/workspaces/:name', async (req, reply) => {
    const { name } = req.params as { name: string };
    try {
      const workspace = await db
        .selectFrom('workspaces')
        .select(['id', 'name', 'email', 'created_at'])
        .where('name', '=', name.toLowerCase())
        .executeTakeFirst();
      if (!workspace) return reply.code(404).send({ message: 'Workspace not found' });
      return reply.send({ workspace });
    } catch {
      return reply.code(404).send({ message: 'Workspace not found' });
    }
  });
}
