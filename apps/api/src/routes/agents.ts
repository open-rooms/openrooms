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
      const agent = await container.agentRepository.create({
        name: body.name,
        description: body.description,
        goal: body.goal,
        roomId: body.roomId,
        allowedTools: body.allowedTools,
        policyConfig: body.policyConfig,
      });

      await container.loggingService.log({
        roomId: agent.roomId || agent.id,
        workflowId: agent.roomId || agent.id,
        agentId: agent.id,
        eventType: 'AGENT_INVOKED',
        level: 'INFO',
        message: `Agent "${agent.name}" created`,
        metadata: {
          version: agent.version,
          allowedTools: agent.allowedTools.length,
        },
      });

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
    const query = request.query as { roomId?: string };

    try {
      if (query.roomId) {
        const agents = await container.agentRepository.findByRoomId(query.roomId);
        return { agents, count: agents.length };
      }

      // For now, return empty list if no roomId filter
      // TODO: Add pagination and global agent listing
      return { agents: [], count: 0 };
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
      const agent = await container.agentRepository.update(request.params.id, body);

      await container.loggingService.log({
        roomId: agent.roomId || agent.id,
        workflowId: agent.roomId || agent.id,
        agentId: agent.id,
        eventType: 'STATE_UPDATED',
        level: 'INFO',
        message: `Agent "${agent.name}" updated`,
        metadata: body,
      });

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

      await container.loggingService.log({
        roomId: newVersion.roomId || newVersion.id,
        workflowId: newVersion.roomId || newVersion.id,
        agentId: newVersion.id,
        eventType: 'AGENT_INVOKED',
        level: 'INFO',
        message: `Agent version ${newVersion.version} created`,
        metadata: {
          parentId: request.params.id,
          version: newVersion.version,
        },
      });

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
