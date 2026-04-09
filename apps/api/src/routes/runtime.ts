/**
 * Runtime Engine Routes
 *
 * GET  /runtime/status  — Queue and worker status
 * GET  /runtime/events  — SSE stream of execution events
 */

import type { FastifyInstance } from 'fastify';
import type { Container } from '../container';
import { Queue } from 'bullmq';

function getRedisConnection(redisUrl?: string): { host: string; port: number; password?: string } {
  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port || '6379', 10),
        password: parsed.password || undefined,
      };
    } catch {
      /* fall through */
    }
  }
  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  };
}

export async function runtimeRoutes(
  fastify: FastifyInstance,
  container: Container
): Promise<void> {
  const connection = getRedisConnection(process.env.REDIS_URL);

  // ─── GET /api/runtime/status ─────────────────────────────────────────────

  fastify.get('/runtime/status', async (_request, reply) => {
    try {
      const roomQ = new Queue('room-execution', { connection });
      const agentQ = new Queue('agent_runs', { connection });
      const workflowQ = new Queue('workflow_runs', { connection });

      const [roomQueue, agentRunsQueue, workflowRunsQueue] = await Promise.all([
        roomQ.getJobCounts(),
        agentQ.getJobCounts(),
        workflowQ.getJobCounts(),
      ]);

      await Promise.all([roomQ.close(), agentQ.close(), workflowQ.close()]);

      const redisOk = await container.redis.ping().then(() => 'ok').catch(() => 'error');

      return reply.send({
        status: 'running',
        redis: redisOk,
        queues: {
          'room-execution': {
            waiting: roomQueue.waiting,
            active: roomQueue.active,
            completed: roomQueue.completed,
            failed: roomQueue.failed,
          },
          agent_runs: {
            waiting: agentRunsQueue.waiting,
            active: agentRunsQueue.active,
            completed: agentRunsQueue.completed,
            failed: agentRunsQueue.failed,
          },
          workflow_runs: {
            waiting: workflowRunsQueue.waiting,
            active: workflowRunsQueue.active,
            completed: workflowRunsQueue.completed,
            failed: workflowRunsQueue.failed,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to fetch runtime status',
        message: (error as Error).message,
      });
    }
  });

  // ─── GET /api/runtime/events ──────────────────────────────────────────────
  // SSE stream of runtime events from Redis pub/sub

  fastify.get('/runtime/events', async (request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const subscriber = container.redis.duplicate();
    const channels = [
      'openrooms:runtime:agent.started',
      'openrooms:runtime:agent.step',
      'openrooms:runtime:agent.tool_call',
      'openrooms:runtime:agent.completed',
      'openrooms:runtime:agent.failed',
      'openrooms:runtime:workflow.step',
      'openrooms:runtime:workflow.completed',
      'openrooms:runtime:workflow.failed',
      'openrooms:runtime:run.completed',
      'openrooms:runtime:run.failed',
    ];

    await subscriber.subscribe(...channels);

    subscriber.on('message', (_channel: string, message: string) => {
      try {
        reply.raw.write(`data: ${message}\n\n`);
      } catch {
        /* client disconnected */
      }
    });

    request.raw.on('close', () => {
      subscriber.unsubscribe(...channels).catch(() => {});
      subscriber.disconnect();
    });
  });
}
