/**
 * Agent API Routes - Stage 3
 * 
 * Endpoints for agent management, execution, and observability
 */

import type { FastifyInstance } from 'fastify';
import type { Container } from '../container';
import type { AgentPolicy } from '@openrooms/core';

export function agentRoutes(fastify: FastifyInstance, container: Container) {
  /**
   * POST /api/agents - Create new agent
   */
  fastify.post('/agents', async (request, reply) => {
    const body = request.body as {
      name: string;
      description?: string;
      goal: string;
      roomId?: string;
      allowedTools: string[];
      policyConfig: AgentPolicy;
    };

    try {
      const normalizedRoomId = body.roomId && body.roomId.trim() ? body.roomId.trim() : undefined;
      const agent = await container.agentRepository.create({
        name: body.name,
        description: body.description,
        goal: body.goal,
        roomId: normalizedRoomId,
        allowedTools: body.allowedTools,
        policyConfig: body.policyConfig,
      });

      // Execution logs require a valid room/workflow FK. Standalone agents may not have one.
      if (agent.roomId) {
        await container.loggingService.log({
          roomId: agent.roomId,
          workflowId: agent.roomId,
          agentId: agent.id,
          eventType: 'AGENT_INVOKED',
          level: 'INFO',
          message: `Agent "${agent.name}" created`,
          metadata: {
            version: agent.version,
            allowedTools: agent.allowedTools.length,
          },
        });
      }

      return reply.code(201).send(agent);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to create agent',
        message: (error as Error).message,
      });
    }
  });

  /**
   * POST /api/agents/deploy - Create agent and optionally run immediately
   */
  fastify.post('/agents/deploy', async (request, reply) => {
    const body = request.body as {
      name: string;
      description?: string;
      goal: string;
      roomId?: string;
      allowedTools: string[];
      policyConfig?: AgentPolicy;
      runImmediately?: boolean;
      maxIterations?: number;
    };

    try {
      const normalizedRoomId = body.roomId && body.roomId.trim() ? body.roomId.trim() : undefined;
      const agent = await container.agentRepository.create({
        name: body.name,
        description: body.description,
        goal: body.goal,
        roomId: normalizedRoomId,
        allowedTools: body.allowedTools ?? [],
        policyConfig: body.policyConfig ?? {},
      });

      if (body.runImmediately) {
        const result = await container.agentRunner.runAgent(agent.id, {
          roomId: normalizedRoomId,
          maxIterations: body.maxIterations ?? 5,
        });
        return reply.code(202).send({
          agent,
          run: result,
          message: 'Agent deployed and run queued',
        });
      }

      return reply.code(201).send({
        agent,
        message: 'Agent deployed',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to deploy agent',
        message: (error as Error).message,
      });
    }
  });

  /**
   * GET /api/agents/:id - Get agent by ID
   */
  fastify.get<{ Params: { id: string } }>('/agents/:id', async (request, reply) => {
    try {
      const agent = await container.agentRepository.findById(request.params.id);

      if (!agent) {
        return reply.code(404).send({
          error: 'Agent not found',
          message: `Agent ${request.params.id} does not exist`,
        });
      }

      return agent;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to fetch agent',
        message: (error as Error).message,
      });
    }
  });

  /**
   * GET /api/agents - List agents
   */
  fastify.get('/agents', async (request, reply) => {
    const query = request.query as { roomId?: string; status?: string; limit?: string; offset?: string };

    try {
      if (query.roomId) {
        const agents = await container.agentRepository.findByRoomId(query.roomId);
        return { agents, count: agents.length };
      }

      // Global listing via direct DB query
      let q = container.db
        .selectFrom('agents')
        .selectAll()
        .$if(!!query.status, (qb: any) => qb.where('status', '=', query.status!))
        .orderBy('createdAt', 'desc')
        .limit(query.limit ? parseInt(query.limit) : 100)
        .offset(query.offset ? parseInt(query.offset) : 0);

      const records = await q.execute();

      const agents = records.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        goal: r.goal,
        version: r.version,
        status: r.status,
        loopState: r.loopState,
        allowedTools: Array.isArray(r.allowedTools) ? r.allowedTools : JSON.parse(r.allowedTools || '[]'),
        policyConfig: typeof r.policyConfig === 'string' ? JSON.parse(r.policyConfig || '{}') : r.policyConfig,
        memoryState: typeof r.memoryState === 'string' ? JSON.parse(r.memoryState || '{}') : r.memoryState,
        roomId: r.roomId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        lastExecutedAt: r.lastExecutedAt,
      }));

      return { agents, count: agents.length };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to list agents',
        message: (error as Error).message,
      });
    }
  });

  /**
   * PATCH /api/agents/:id - Update agent
   */
  fastify.patch<{ Params: { id: string } }>('/agents/:id', async (request, reply) => {
    const body = request.body as Partial<{
      name: string;
      description: string;
      goal: string;
      roomId: string;
      allowedTools: string[];
      policyConfig: AgentPolicy;
      status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
    }>;

    try {
      const normalizedBody = {
        ...body,
        roomId: body.roomId !== undefined ? (body.roomId && body.roomId.trim() ? body.roomId.trim() : undefined) : undefined,
      };
      const agent = await container.agentRepository.update(request.params.id, normalizedBody as any);

      if (agent.roomId) {
        await container.loggingService.log({
          roomId: agent.roomId,
          workflowId: agent.roomId,
          agentId: agent.id,
          eventType: 'STATE_UPDATED',
          level: 'INFO',
          message: `Agent "${agent.name}" updated`,
          metadata: normalizedBody,
        });
      }

      return agent;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to update agent',
        message: (error as Error).message,
      });
    }
  });

  /**
   * DELETE /api/agents/:id - Delete agent
   */
  fastify.delete<{ Params: { id: string } }>('/agents/:id', async (request, reply) => {
    try {
      await container.agentRepository.delete(request.params.id);

      return reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to delete agent',
        message: (error as Error).message,
      });
    }
  });

  /**
   * POST /api/agents/:id/versions - Create new version
   */
  fastify.post<{ Params: { id: string } }>('/agents/:id/versions', async (request, reply) => {
    const body = request.body as Partial<{
      goal: string;
      allowedTools: string[];
      policyConfig: AgentPolicy;
    }>;

    try {
      const newVersion = await container.agentRepository.createVersion(
        request.params.id,
        body
      );

      if (newVersion.roomId) {
        await container.loggingService.log({
          roomId: newVersion.roomId,
          workflowId: newVersion.roomId,
          agentId: newVersion.id,
          eventType: 'AGENT_INVOKED',
          level: 'INFO',
          message: `Agent version ${newVersion.version} created`,
          metadata: {
            parentId: request.params.id,
            version: newVersion.version,
          },
        });
      }

      return reply.code(201).send(newVersion);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to create agent version',
        message: (error as Error).message,
      });
    }
  });

  /**
   * GET /api/agents/versions/:name - Get version history
   */
  fastify.get<{ Params: { name: string } }>('/agents/versions/:name', async (request, reply) => {
    try {
      const versions = await container.agentRepository.getVersionHistory(request.params.name);

      return {
        name: request.params.name,
        versions,
        count: versions.length,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to fetch version history',
        message: (error as Error).message,
      });
    }
  });

  /**
   * POST /api/agents/:id/run — Stage 4: create a tracked run record + enqueue
   */
  fastify.post<{ Params: { id: string } }>('/agents/:id/run', async (request, reply) => {
    const body = request.body as {
      roomId?: string;
      maxIterations?: number;
      goal?: string;
      context?: Record<string, unknown>;
    };

    try {
      const result = await container.agentRunner.runAgent(request.params.id, {
        roomId: body.roomId,
        maxIterations: body.maxIterations,
        goal: body.goal,
        context: body.context,
      });

      return reply.code(202).send(result);
    } catch (error) {
      fastify.log.error(error);
      const status = (error as Error).message.includes('not found') ? 404 : 500;
      return reply.code(status).send({
        error: 'Failed to start agent run',
        message: (error as Error).message,
      });
    }
  });

  /**
   * POST /api/agents/:id/execute - Start agent execution loop
   */
  fastify.post<{ Params: { id: string } }>('/agents/:id/execute', async (request, reply) => {
    const body = request.body as {
      roomId: string;
      maxIterations?: number;
    };

    try {
      const agent = await container.agentRepository.findById(request.params.id);

      if (!agent) {
        return reply.code(404).send({
          error: 'Agent not found',
        });
      }

      // Enqueue agent execution job
      const jobId = await container.jobQueue.addJob(
        'agent-execution',
        'execute',
        {
          agentId: agent.id,
          roomId: body.roomId,
          maxIterations: body.maxIterations || 10,
        }
      );

      await container.loggingService.log({
        roomId: body.roomId,
        workflowId: body.roomId,
        agentId: agent.id,
        eventType: 'AGENT_LOOP_STARTED',
        level: 'INFO',
        message: `Agent execution queued`,
        metadata: {
          jobId,
          maxIterations: body.maxIterations || 10,
        },
      });

      return {
        executionId: jobId,
        agentId: agent.id,
        roomId: body.roomId,
        status: 'QUEUED',
        message: 'Agent execution queued successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to start agent execution',
        message: (error as Error).message,
      });
    }
  });

  /**
   * GET /api/agents/:id/traces - Get execution traces
   */
  fastify.get<{ Params: { id: string } }>('/agents/:id/traces', async (request, reply) => {
    const query = request.query as { limit?: string; roomId?: string };
    const limit = parseInt(query.limit || '50');

    try {
      // Query traces from database
      const traces = await container.db
        .selectFrom('agent_execution_traces')
        .selectAll()
        .where('agentId', '=', request.params.id)
        .$if(!!query.roomId, (qb) => qb.where('roomId', '=', query.roomId!))
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .execute();

      return {
        agentId: request.params.id,
        traces: traces.map(t => ({
          id: t.id,
          loopIteration: t.loopIteration,
          loopState: t.loopState,
          selectedTool: t.selectedTool,
          toolRationale: t.toolRationale,
          durationMs: t.durationMs,
          timestamp: t.timestamp,
        })),
        count: traces.length,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to fetch execution traces',
        message: (error as Error).message,
      });
    }
  });

  /**
   * GET /api/agents/:id/traces/:traceId - Get detailed trace
   */
  fastify.get<{ Params: { id: string; traceId: string } }>(
    '/agents/:id/traces/:traceId',
    async (request, reply) => {
      try {
        const trace = await container.db
          .selectFrom('agent_execution_traces')
          .selectAll()
          .where('id', '=', request.params.traceId)
          .where('agentId', '=', request.params.id)
          .executeTakeFirst();

        if (!trace) {
          return reply.code(404).send({
            error: 'Trace not found',
          });
        }

        return {
          ...trace,
          toolInput: trace.toolInput ? JSON.parse(trace.toolInput as string) : null,
          toolOutput: trace.toolOutput ? JSON.parse(trace.toolOutput as string) : null,
          toolError: trace.toolError ? JSON.parse(trace.toolError as string) : null,
          stateBefore: trace.stateBefore ? JSON.parse(trace.stateBefore as string) : null,
          stateAfter: trace.stateAfter ? JSON.parse(trace.stateAfter as string) : null,
          stateDiff: trace.stateDiff ? JSON.parse(trace.stateDiff as string) : null,
          metadata: trace.metadata ? JSON.parse(trace.metadata as string) : {},
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: 'Failed to fetch trace details',
          message: (error as Error).message,
        });
      }
    }
  );
}
