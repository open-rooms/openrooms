/**
 * OpenRooms API Server
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { createContainer } from './container';
import { roomRoutes } from './routes/rooms';
import { workflowRoutes } from './routes/workflows';
import { toolRoutes } from './routes/tools';
import { healthRoutes } from './routes/health';

async function main() {
  const container = createContainer();

  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Plugins
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN ?? '*',
  });

  await fastify.register(helmet);

  // Routes
  await fastify.register(healthRoutes, { prefix: '/api' }, container);
  await fastify.register(roomRoutes, { prefix: '/api' }, container);
  await fastify.register(workflowRoutes, { prefix: '/api' }, container);
  await fastify.register(toolRoutes, { prefix: '/api' }, container);

  // Root endpoint
  fastify.get('/', async () => {
    return {
      name: 'OpenRooms API',
      version: '0.1.0',
      status: 'running',
    };
  });

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    
    reply.code(error.statusCode ?? 500).send({
      error: error.name,
      message: error.message,
      statusCode: error.statusCode ?? 500,
    });
  });

  // Start workers
  const worker = container.workerManager.startRoomExecutionWorker();
  fastify.log.info('Background workers started');

  // Graceful shutdown
  const shutdown = async () => {
    fastify.log.info('Shutting down gracefully...');
    
    await worker.close();
    await container.jobQueue.close();
    await container.redis.quit();
    await fastify.close();
    
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start server
  const port = parseInt(process.env.PORT ?? '3001');
  const host = process.env.HOST ?? '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on http://${host}:${port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

main().catch(console.error);
