/**
 * Tool Routes
 */

import { FastifyInstance } from 'fastify';
import { Container } from '../container';

export async function toolRoutes(
  fastify: FastifyInstance,
  container: Container
): Promise<void> {
  // List Tools
  fastify.get('/tools', async (request, reply) => {
    try {
      const tools = container.toolRegistry.listTools();
      return reply.send({ tools, count: tools.length });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch tools',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Get Tool
  fastify.get<{
    Params: { id: string };
  }>('/tools/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const tool = container.toolRegistry.getTool(id);

      if (!tool) {
        return reply.code(404).send({ error: 'Tool not found' });
      }

      return reply.send(tool);
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch tool',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
