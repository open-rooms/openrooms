/**
 * Workflow Routes
 */

import { FastifyInstance } from 'fastify';
import { Container } from '../container';
import crypto from 'crypto';

export async function workflowRoutes(
  fastify: FastifyInstance,
  container: Container
): Promise<void> {
  // Create Workflow
  fastify.post<{
    Body: {
      name: string;
      description?: string;
      initialNodeId?: string;
    };
  }>('/workflows', async (request, reply) => {
    const { name, description, initialNodeId } = request.body;
    const isUuid = (value: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    const resolvedInitialNodeId =
      initialNodeId && isUuid(initialNodeId) ? initialNodeId : crypto.randomUUID();

    try {
      const workflow = await container.workflowRepository.create({
        name,
        description,
        initialNodeId: resolvedInitialNodeId,
        metadata: {},
      });

      // Ensure every new workflow is executable out-of-the-box:
      // START -> END transition graph persisted in workflow_nodes.config.transitions.
      const startNodeId = resolvedInitialNodeId;
      const endNodeId = crypto.randomUUID();
      const now = new Date().toISOString();

      await container.db
        .insertInto('workflow_nodes')
        .values([
          {
            id: crypto.randomUUID(),
            workflowId: workflow.id,
            nodeId: startNodeId,
            type: 'START',
            name: 'Start',
            description: 'Entry point',
            config: JSON.stringify({
              transitions: [
                { condition: 'ALWAYS', targetNodeId: endNodeId },
              ],
            }) as any,
            createdAt: now as any,
            updatedAt: now as any,
          },
          {
            id: crypto.randomUUID(),
            workflowId: workflow.id,
            nodeId: endNodeId,
            type: 'END',
            name: 'End',
            description: 'Exit point',
            config: JSON.stringify({ transitions: [] }) as any,
            createdAt: now as any,
            updatedAt: now as any,
          },
        ])
        .execute();

      return reply.code(201).send(workflow);
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to create workflow',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Get Workflow
  fastify.get<{
    Params: { id: string };
  }>('/workflows/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const workflow = await container.workflowRepository.findById(id);

      if (!workflow) {
        return reply.code(404).send({ error: 'Workflow not found' });
      }

      return reply.send(workflow);
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch workflow',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // List Workflows
  fastify.get('/workflows', async (request, reply) => {
    try {
      const workflows = await container.workflowRepository.findAll();
      return reply.send({ workflows, count: workflows.length });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch workflows',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Get Workflow Nodes
  fastify.get<{
    Params: { id: string };
  }>('/workflows/:id/nodes', async (request, reply) => {
    const { id } = request.params;

    try {
      const nodes = await container.workflowRepository.getNodes(id);
      return reply.send({ nodes, count: nodes.length });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch workflow nodes',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Run Workflow — Stage 4: create a tracked run + enqueue
  fastify.post<{
    Params: { id: string };
    Body: {
      roomId?: string;
      roomName?: string;
      context?: Record<string, unknown>;
    };
  }>('/workflows/:id/run', async (request, reply) => {
    const { id } = request.params;
    const { roomId, roomName, context } = request.body ?? {};

    try {
      const result = await container.workflowRunner.runWorkflow(id, {
        roomId,
        roomName,
        context,
      });

      return reply.code(202).send(result);
    } catch (error) {
      const status = (error as Error).message.includes('not found') ? 404 : 500;
      return reply.code(status).send({
        error: 'Failed to start workflow run',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Delete Workflow
  fastify.delete<{
    Params: { id: string };
  }>('/workflows/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await container.workflowRepository.delete(id);
      return reply.code(204).send();
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to delete workflow',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
