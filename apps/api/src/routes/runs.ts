/**
 * Runs API Routes — Stage 4
 *
 * GET  /api/runs              — list all runs
 * GET  /api/runs/:id          — get a single run
 * GET  /api/logs/:runId       — get execution logs for a run
 */

import type { FastifyInstance } from 'fastify';
import type { Container } from '../container';

export async function runsRoutes(
  fastify: FastifyInstance,
  container: Container
): Promise<void> {

  // ─── GET /api/runs ────────────────────────────────────────────────────────

  fastify.get<{
    Querystring: {
      type?: string;
      targetId?: string;
      status?: string;
      limit?: string;
      offset?: string;
    };
  }>('/runs', async (request, reply) => {
    const { type, targetId, status, limit, offset } = request.query;

    try {
      const runs = await container.runManager.listRuns({
        type: type as any,
        targetId,
        status: status as any,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
      });

      return reply.send({ runs, count: runs.length });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to list runs',
        message: (error as Error).message,
      });
    }
  });

  // ─── GET /api/runs/:id ────────────────────────────────────────────────────

  fastify.get<{
    Params: { id: string };
  }>('/runs/:id', async (request, reply) => {
    try {
      const run = await container.runManager.getRun(request.params.id);

      if (!run) {
        return reply.code(404).send({ error: 'Run not found' });
      }

      return reply.send(run);
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch run',
        message: (error as Error).message,
      });
    }
  });

  // ─── GET /api/logs/:runId ─────────────────────────────────────────────────
  // Returns execution_logs associated with a run.
  // For agent runs  → logs where agentId = run.targetId
  // For workflow runs → logs where roomId = run.roomId

  fastify.get<{
    Params: { runId: string };
    Querystring: { limit?: string; offset?: string };
  }>('/logs/:runId', async (request, reply) => {
    const { runId } = request.params;
    const limit = parseInt(request.query.limit ?? '100');
    const offset = parseInt(request.query.offset ?? '0');

    try {
      const run = await container.runManager.getRun(runId);

      if (!run) {
        return reply.code(404).send({ error: 'Run not found' });
      }

      let logs: any[];

      if (run.roomId) {
        // For both agent and workflow runs, fetch by roomId (most accurate)
        logs = await container.loggingService.getLogs(run.roomId, { limit, offset });
      } else if (run.type === 'agent') {
        // Fallback: match by agentId if no room exists
        logs = await (container.db as any)
          .selectFrom('execution_logs')
          .selectAll()
          .where('agentId', '=', run.targetId)
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .offset(offset)
          .execute();
      } else {
        logs = [];
      }

      return reply.send({ logs, runId, count: logs.length });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch logs for run',
        message: (error as Error).message,
      });
    }
  });
}
