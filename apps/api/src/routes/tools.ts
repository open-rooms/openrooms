/**
 * Tool Routes
 */

import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { Container } from '../container';

const BUILTIN_IDS = new Set([
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
]);

function mapDbToolToApi(r: any) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category || 'CUSTOM',
    version: r.version || '1.0.0',
    parameters: typeof r.parameters === 'string' ? JSON.parse(r.parameters || '[]') : (r.parameters || []),
    timeout: r.timeout ?? 30000,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function toolRoutes(
  fastify: FastifyInstance,
  container: Container
): Promise<void> {
  // List Tools — merge built-in (registry) + custom (DB)
  fastify.get('/tools', async (_request, reply) => {
    try {
      const builtIn = container.toolRegistry.listTools();
      const builtInMap = new Map(builtIn.map(t => [t.name, t]));

      let dbTools: any[] = [];
      try {
        dbTools = await (container.db as any)
          .selectFrom('tools')
          .selectAll()
          .execute();
      } catch {
        /* DB tools table may not exist in older deploys */
      }

      const dbApi = dbTools
        .filter((t: any) => !builtInMap.has(t.name))
        .map(mapDbToolToApi);

      const builtInApi = builtIn.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        version: t.version,
        parameters: t.parameters || [],
        timeout: t.timeout ?? 30000,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      const tools = [...builtInApi, ...dbApi];
      return reply.send({ tools, count: tools.length });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch tools',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Get Tool — check registry first, then DB
  fastify.get<{
    Params: { id: string };
  }>('/tools/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const fromRegistry = container.toolRegistry.getTool(id as any);
      if (fromRegistry) {
        return reply.send({
          id: fromRegistry.id,
          name: fromRegistry.name,
          description: fromRegistry.description,
          category: fromRegistry.category,
          version: fromRegistry.version,
          parameters: fromRegistry.parameters || [],
          timeout: fromRegistry.timeout ?? 30000,
          createdAt: fromRegistry.createdAt,
          updatedAt: fromRegistry.updatedAt,
        });
      }

      const fromDb = await (container.db as any)
        .selectFrom('tools')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      if (!fromDb) {
        return reply.code(404).send({ error: 'Tool not found' });
      }

      return reply.send(mapDbToolToApi(fromDb));
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch tool',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // POST /tools — Register custom tool (stored in DB, used by runner-worker)
  fastify.post<{
    Body: {
      name: string;
      description: string;
      category: 'API' | 'Webhook' | 'Script' | 'SDK';
      url?: string;
      method?: string;
      parameters?: unknown[];
    };
  }>('/tools', async (request, reply) => {
    const { name, description, category, url, method = 'POST', parameters = [] } = request.body;

    if (!name?.trim()) {
      return reply.code(400).send({ error: 'name is required' });
    }

    const catMap: Record<string, string> = {
      API: 'EXTERNAL_API',
      Webhook: 'EXTERNAL_API',
      Script: 'CUSTOM',
      SDK: 'CUSTOM',
    };
    const dbCategory = catMap[category] || 'CUSTOM';

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const metadata = url ? { url, method: (method || 'POST').toUpperCase() } : {};

    try {
      await (container.db as any)
        .insertInto('tools')
        .values({
          id,
          name: name.trim().toLowerCase().replace(/\s+/g, '_'),
          description: description?.trim() || name,
          category: dbCategory,
          version: '1.0.0',
          parameters: JSON.stringify(parameters),
          returnType: JSON.stringify({ type: 'object' }),
          timeout: 30000,
          metadata: JSON.stringify(metadata),
          createdAt: now,
          updatedAt: now,
        })
        .execute();

      const row = await (container.db as any)
        .selectFrom('tools')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      return reply.code(201).send(mapDbToolToApi(row));
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to register tool',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // DELETE /tools/:id — Remove custom tool (built-in tools cannot be deleted)
  fastify.delete<{
    Params: { id: string };
  }>('/tools/:id', async (request, reply) => {
    const { id } = request.params;

    if (BUILTIN_IDS.has(id)) {
      return reply.code(403).send({ error: 'Cannot delete built-in tool' });
    }

    try {
      await (container.db as any)
        .deleteFrom('tools')
        .where('id', '=', id)
        .execute();
      return reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to delete tool',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
