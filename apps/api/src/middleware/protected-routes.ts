/**
 * Protected Routes Configuration
 */

import type { FastifyInstance } from 'fastify';

export function setupProtectedRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request, _reply) => {
    // Execution endpoints can be gated with API key auth when ready:
    // if (request.url.includes('/execute')) { await (fastify as any).apiKeyAuth(request, _reply); }
    void request;
  });
}
