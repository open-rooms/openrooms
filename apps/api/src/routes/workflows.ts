/**
 * Workflow Routes
 */

import { FastifyInstance } from 'fastify';
import { Container } from '../container';

export async function workflowRoutes(
  fastify: FastifyInstance,
  container: Container
): Promise<void> {
  // Create Workflow
  fastify.post<{
    Body: {
      name: string;
      description?: string;
      initialNodeId: string;
    };
  }>('/workflows', async (request, reply) => {
    const { name, description, initialNodeId } = request.body;

    try {
      const workflow = await container.workflowRepository.create({
        name,
        description,
        initialNodeId,
        metadata: {},
      });

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
