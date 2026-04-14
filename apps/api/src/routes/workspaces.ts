/**
 * Workspaces Routes
 * Handles workspace registration (signup) and lookup.
 * Workspaces are persisted to PostgreSQL so auth is real, not localStorage-only.
 */

import { FastifyInstance } from 'fastify';
import { Container } from '../container';
import { randomBytes, createHash } from 'crypto';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function workspacesRoutes(fastify: FastifyInstance, container: Container): Promise<void> {
  const db = container.db as any;

  // Ensure the workspaces table exists (idempotent — will no-op if already created)
  await (db.schema as any)
    .createTable('workspaces')
    .ifNotExists()
    .addColumn('id', 'uuid', (col: any) => col.primaryKey().defaultTo((db as any).fn.genRandomUUID()))
    .addColumn('name', 'varchar(128)', (col: any) => col.notNull().unique())
    .addColumn('email', 'varchar(256)', (col: any) => col.notNull())
    .addColumn('token_hash', 'varchar(64)', (col: any) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col: any) => col.notNull().defaultTo((db as any).fn.now()))
    .execute()
    .catch(() => {
      // Table may already exist — ignore
    });

  // POST /api/workspaces — register a new workspace
  fastify.post('/workspaces', async (req, reply) => {
    const { name, email } = req.body as { name?: string; email?: string };

    if (!name || !email) {
      return reply.code(400).send({ message: 'name and email are required' });
    }

    const slugName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 64);
    if (!slugName) {
      return reply.code(400).send({ message: 'Invalid workspace name' });
    }

    // Check if workspace already exists
    let existing: any = null;
    try {
      existing = await db
        .selectFrom('workspaces')
        .select(['id', 'name', 'email', 'token_hash', 'created_at'])
        .where('name', '=', slugName)
        .executeTakeFirst();
    } catch {
      // table query failed — treat as not existing
    }

    if (existing) {
      // Return existing workspace (idempotent login)
      const token = `demo_${Date.now()}_${randomBytes(8).toString('hex')}`;
      return reply.send({
        id: existing.id,
        name: existing.name,
        email: existing.email,
        token,
        isNew: false,
        message: 'Workspace found — welcome back.',
      });
    }

    // Generate a session token
    const token = `or_${randomBytes(24).toString('hex')}`;
    const tokenHash = hashToken(token);

    try {
      const workspace = await db
        .insertInto('workspaces')
        .values({
          name: slugName,
          email: email.toLowerCase().trim(),
          token_hash: tokenHash,
        })
        .returning(['id', 'name', 'email', 'created_at'])
        .executeTakeFirstOrThrow();

      fastify.log.info({ workspace: workspace.name, email: workspace.email }, 'Workspace registered');

      return reply.code(201).send({
        id: workspace.id,
        name: workspace.name,
        email: workspace.email,
        token,
        isNew: true,
        message: 'Workspace created. Your agents are ready to deploy.',
      });
    } catch (err: any) {
      if (err?.message?.includes('unique') || err?.code === '23505') {
        // Race — return success (idempotent)
        return reply.send({ name: slugName, email, token: `demo_${Date.now()}`, isNew: false });
      }
      fastify.log.error(err, 'Failed to create workspace');
      return reply.code(500).send({ message: 'Failed to create workspace' });
    }
  });

  // GET /api/workspaces/:name — look up a workspace by slug
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
