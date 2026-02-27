/**
 * Room Routes
 */

import { FastifyInstance } from 'fastify';
import { Container } from '../container';
import { RoomStatus } from '@openrooms/core';

export async function roomRoutes(
  fastify: FastifyInstance,
  container: Container
): Promise<void> {
  // Create Room
  fastify.post<{
    Body: {
      name: string;
      description?: string;
      workflowId: string;
      config?: Record<string, unknown>;
    };
  }>('/rooms', async (request, reply) => {
    const { name, description, workflowId, config } = request.body;

    try {
      const room = await container.roomRepository.create({
        name,
        description,
        workflowId,
        config,
        metadata: {},
      });

      return reply.code(201).send(room);
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to create room',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Get Room
  fastify.get<{
    Params: { id: string };
  }>('/rooms/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const room = await container.roomRepository.findById(id);

      if (!room) {
        return reply.code(404).send({ error: 'Room not found' });
      }

      return reply.send(room);
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch room',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // List Rooms
  fastify.get<{
    Querystring: {
      status?: RoomStatus;
      workflowId?: string;
      limit?: string;
      offset?: string;
    };
  }>('/rooms', async (request, reply) => {
    const { status, workflowId, limit, offset } = request.query;

    try {
      const rooms = await container.roomRepository.findAll({
        status,
        workflowId,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return reply.send({ rooms, count: rooms.length });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch rooms',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Run Room
  fastify.post<{
    Params: { id: string };
  }>('/rooms/:id/run', async (request, reply) => {
    const { id } = request.params;

    try {
      // Add job to queue for async execution
      await container.jobQueue.addJob('room-execution', 'execute', { roomId: id });

      return reply.send({
        message: 'Room execution started',
        roomId: id,
      });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to start room execution',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Get Room Status
  fastify.get<{
    Params: { id: string };
  }>('/rooms/:id/status', async (request, reply) => {
    const { id } = request.params;

    try {
      const room = await container.roomRepository.findById(id);
      if (!room) {
        return reply.code(404).send({ error: 'Room not found' });
      }

      const state = await container.stateManager.getState(id);

      return reply.send({
        room,
        state,
      });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch room status',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Get Room Logs
  fastify.get<{
    Params: { id: string };
    Querystring: {
      limit?: string;
      offset?: string;
      level?: string;
    };
  }>('/rooms/:id/logs', async (request, reply) => {
    const { id } = request.params;
    const { limit, offset, level } = request.query;

    try {
      const logs = await container.loggingService.getLogs(id, {
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0,
        level,
      });

      return reply.send({ logs, count: logs.length });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch logs',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Pause Room
  fastify.post<{
    Params: { id: string };
  }>('/rooms/:id/pause', async (request, reply) => {
    const { id } = request.params;

    try {
      const result = await container.workflowEngine.pauseRoom(id);

      if (!result.success) {
        return reply.code(400).send({
          error: 'Failed to pause room',
          message: result.error.message,
        });
      }

      return reply.send({ message: 'Room paused' });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to pause room',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Resume Room
  fastify.post<{
    Params: { id: string };
  }>('/rooms/:id/resume', async (request, reply) => {
    const { id } = request.params;

    try {
      const result = await container.workflowEngine.resumeRoom(id);

      if (!result.success) {
        return reply.code(400).send({
          error: 'Failed to resume room',
          message: result.error.message,
        });
      }

      return reply.send({ message: 'Room resumed' });
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to resume room',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Delete Room
  fastify.delete<{
    Params: { id: string };
  }>('/rooms/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await container.roomRepository.delete(id);
      return reply.code(204).send();
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to delete room',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
