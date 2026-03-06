/**
 * API Key Routes - Stage 3
 * 
 * Endpoints for API key management and authentication
 */

import type { FastifyInstance } from 'fastify';
import type { Container } from '../container';
import * as crypto from 'crypto';

/**
 * Generate API key with prefix
 */
function generateAPIKey(): { key: string; hash: string; prefix: string } {
  const key = `sk_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const prefix = key.substring(0, 10);
  
  return { key, hash, prefix };
}

export function apiKeyRoutes(fastify: FastifyInstance, container: Container) {
  /**
   * POST /api/api-keys - Generate new API key
   */
  fastify.post('/api-keys', async (request, reply) => {
    const body = request.body as {
      name: string;
      scopes?: string[];
      rateLimit?: number;
      rateLimitWindow?: number;
      expiresIn?: number; // days
    };

    try {
      const { key, hash, prefix } = generateAPIKey();
      const now = new Date();
      const expiresAt = body.expiresIn
        ? new Date(now.getTime() + body.expiresIn * 24 * 60 * 60 * 1000)
        : null;

      const scopes = body.scopes || ['read'];

      await container.db
        .insertInto('api_keys')
        .values({
          id: crypto.randomUUID(),
          name: body.name,
          keyHash: hash,
          keyPrefix: prefix,
          scopes: scopes as any,
          rateLimit: body.rateLimit || 100,
          rateLimitWindow: body.rateLimitWindow || 60,
          isActive: true,
          expiresAt: expiresAt?.toISOString() || null,
          createdAt: now.toISOString(),
          createdBy: 'system',
          metadata: JSON.stringify({}),
        })
        .execute();

      return reply.code(201).send({
        key, // ONLY time user sees this — not stored in plaintext
        prefix,
        name: body.name,
        scopes,
        rateLimit: body.rateLimit || 100,
        expiresAt: expiresAt?.toISOString() || null,
        message: 'Store this key securely. It will not be shown again.',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to create API key',
        message: (error as Error).message,
      });
    }
  });

  /**
   * GET /api/api-keys - List API keys (without keys)
   */
  fastify.get('/api-keys', async (request, reply) => {
    try {
      const keys = await container.db
        .selectFrom('api_keys')
        .select([
          'id',
          'name',
          'keyPrefix',
          'scopes',
          'rateLimit',
          'rateLimitWindow',
          'isActive',
          'expiresAt',
          'lastUsedAt',
          'createdAt',
        ])
        .where('isActive', '=', true)
        .orderBy('createdAt', 'desc')
        .execute();

      return {
        keys,
        count: keys.length,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to list API keys',
        message: (error as Error).message,
      });
    }
  });

  /**
   * DELETE /api/api-keys/:id - Revoke API key
   */
  fastify.delete<{ Params: { id: string } }>('/api-keys/:id', async (request, reply) => {
    try {
      await container.db
        .updateTable('api_keys')
        .set({
          isActive: false,
          metadata: JSON.stringify({ revokedAt: new Date().toISOString() }),
        })
        .where('id', '=', request.params.id)
        .execute();

      return reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to revoke API key',
        message: (error as Error).message,
      });
    }
  });

  /**
   * GET /api/api-keys/:id/usage - Get usage statistics
   */
  fastify.get<{ Params: { id: string } }>('/api-keys/:id/usage', async (request, reply) => {
    const query = request.query as { hours?: string };
    const hours = parseInt(query.hours || '24');
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    try {
      const usage = await container.db
        .selectFrom('api_key_usage')
        .select([
          'endpoint',
          'method',
          'statusCode',
          'responseTime',
          'timestamp',
        ])
        .where('apiKeyId', '=', request.params.id)
        .where('timestamp', '>=', since)
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .execute();

      const stats = {
        totalRequests: usage.length,
        successRate: usage.filter(u => u.statusCode && u.statusCode < 400).length / usage.length,
        avgResponseTime: usage.reduce((sum, u) => sum + (u.responseTime || 0), 0) / usage.length,
        byEndpoint: {} as Record<string, number>,
        byStatus: {} as Record<number, number>,
      };

      usage.forEach(u => {
        stats.byEndpoint[u.endpoint] = (stats.byEndpoint[u.endpoint] || 0) + 1;
        if (u.statusCode) {
          stats.byStatus[u.statusCode] = (stats.byStatus[u.statusCode] || 0) + 1;
        }
      });

      return {
        apiKeyId: request.params.id,
        period: `Last ${hours} hours`,
        stats,
        recentUsage: usage.slice(0, 20),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to fetch usage statistics',
        message: (error as Error).message,
      });
    }
  });
}
