/**
 * Health Check Routes
 */

import { FastifyInstance } from 'fastify';
import { Container } from '../container';

export async function healthRoutes(
  fastify: FastifyInstance,
  container: Container
): Promise<void> {
  fastify.get('/health', async (request, reply) => {
    try {
      // Check Redis
      const redisHealth = await container.stateManager.healthCheck();

      // Check Database
      let dbHealth = false;
      try {
        await container.roomRepository.findAll({ limit: 1 });
        dbHealth = true;
      } catch {
        dbHealth = false;
      }

      const healthy = redisHealth && dbHealth;

      return reply.code(healthy ? 200 : 503).send({
        status: healthy ? 'healthy' : 'unhealthy',
        redis: redisHealth ? 'up' : 'down',
        database: dbHealth ? 'up' : 'down',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return reply.code(503).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  });
}
