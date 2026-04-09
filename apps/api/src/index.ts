/**
 * OpenRooms API Server
 */

// MUST BE FIRST - Load environment variables before any other imports
import './env';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { createContainer } from './container';
import { roomRoutes } from './routes/rooms';
import { workflowRoutes } from './routes/workflows';
import { toolRoutes } from './routes/tools';
import { healthRoutes } from './routes/health';
import { agentRoutes } from './routes/agents';
import { apiKeyRoutes } from './routes/api-keys';
import { runsRoutes } from './routes/runs';
import { runtimeRoutes } from './routes/runtime';
import { settingsRoutes } from './routes/settings';
import { createAPIKeyMiddleware } from './middleware/api-key-auth';
import { createAgentWorker } from './workers/agent-worker';
import { createRunnerWorkers } from './workers/runner-worker';

/**
 * Parse REDIS_URL (e.g. redis://:password@host:port) into {host, port, password}.
 * BullMQ workers need explicit host/port rather than a connection string.
 */
function parseRedisUrl(url?: string): { host: string; port: number; password?: string } {
  if (url) {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port || '6379', 10),
        password: parsed.password || undefined,
      };
    } catch {
      // fall through to defaults
    }
  }
  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  };
}

async function main() {
  const container = createContainer();

  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  });

  // Plugins
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN ?? '*',
  });

  await fastify.register(helmet);

  // API Key Authentication Middleware (optional - can be enabled per route)
  const apiKeyAuth = createAPIKeyMiddleware(container.redis);
  fastify.decorate('apiKeyAuth', apiKeyAuth);

  // Routes
  await fastify.register((instance) => healthRoutes(instance, container), { prefix: '/api' });
  await fastify.register((instance) => roomRoutes(instance, container), { prefix: '/api' });
  await fastify.register((instance) => workflowRoutes(instance, container), { prefix: '/api' });
  await fastify.register((instance) => toolRoutes(instance, container), { prefix: '/api' });
  
  await fastify.register(async (instance) => {
    agentRoutes(instance, container);
  }, { prefix: '/api' });
  
  await fastify.register(async (instance) => {
    apiKeyRoutes(instance, container);
  }, { prefix: '/api' });

  await fastify.register((instance) => runsRoutes(instance, container), { prefix: '/api' });
  await fastify.register((instance) => runtimeRoutes(instance, container), { prefix: '/api' });
  await fastify.register((instance) => settingsRoutes(instance, container), { prefix: '/api' });

  // Root endpoint
  fastify.get('/', async () => {
    return {
      name: 'OpenRooms API',
      version: '0.4.0',
      stage: '4',
      status: 'running',
      features: {
        agents: true,
        apiKeys: true,
        policyEnforcement: true,
        reasoningTraces: true,
        executionRuntime: true,
        agentRuns: true,
        workflowRuns: true,
        eventBus: true,
        runTracking: true,
      },
    };
  });

  // Error handler
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);
    
    reply.code(error.statusCode ?? 500).send({
      error: error.name,
      message: error.message,
      statusCode: error.statusCode ?? 500,
    });
  });

  // Parse REDIS_URL (Railway injects this) or fall back to individual host/port vars
  const redisConnection = parseRedisUrl(process.env.REDIS_URL);

  // Start workers
  const roomWorker = container.workerManager.startRoomExecutionWorker();
  fastify.log.info('Room execution worker started');

  const agentWorker = createAgentWorker(container.redis, redisConnection);
  fastify.log.info('Agent execution worker started');

  // Stage 4: runner workers for agent_runs and workflow_runs queues
  const { agentRunsWorker, workflowRunsWorker } = createRunnerWorkers(
    container.redis,
    redisConnection
  );
  fastify.log.info('Stage 4 runner workers started (agent_runs, workflow_runs)');

  // Graceful shutdown
  const shutdown = async () => {
    fastify.log.info('Shutting down gracefully...');
    
    await roomWorker.close();
    await agentWorker.close();
    await agentRunsWorker.close();
    await workflowRunsWorker.close();
    await container.agentRunner.close();
    await container.workflowRunner.close();
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
