/**
 * Protected Routes Configuration
 * 
 * Routes that require API key authentication
 */

import type { FastifyInstance } from 'fastify';

/**
 * Apply API key authentication to protected routes
 */
export function setupProtectedRoutes(fastify: FastifyInstance) {
  const apiKeyAuth = (fastify as any).apiKeyAuth;

  // Protect agent execution endpoint (high-cost operation)
  fastify.addHook('preHandler', async (request, reply) => {
    // Only protect execution endpoints
    if (
      request.url.includes('/execute') ||
      request.url.includes('/api-keys') && request.method === 'POST'
    ) {
      // Allow for now - can be enabled with: await apiKeyAuth(request, reply);
      // TODO: Enable API key auth when ready
    }
  });
}

/**
 * Example: Protect specific routes
 * 
 * Usage in route:
 * 
 * fastify.post('/agents/:id/execute', {
 *   preHandler: [(fastify as any).apiKeyAuth]
 * }, async (request, reply) => {
 *   // Handler logic
 * });
 */
