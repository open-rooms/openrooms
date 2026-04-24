/**
 * Memory Routes
 *
 * Per-room persistent key-value memory. Agents read and write here
 * across runs so context survives between executions.
 *
 * GET    /api/rooms/:id/memory          — list all entries
 * POST   /api/rooms/:id/memory          — write a key (upsert)
 * GET    /api/rooms/:id/memory/:key     — read one entry
 * DELETE /api/rooms/:id/memory/:key     — remove an entry
 */

import type { FastifyInstance } from 'fastify'
import type { Container } from '../container'
import * as crypto from 'crypto'

export async function memoryRoutes(fastify: FastifyInstance, container: Container) {
  const db = container.db as any

  // ── Ensure memories + memory_entries tables exist ────────────────────────
  async function getOrCreateMemory(roomId: string): Promise<string> {
    const existing = await db
      .selectFrom('memories')
      .select('id')
      .where('roomId', '=', roomId)
      .executeTakeFirst()

    if (existing) return existing.id

    const id = crypto.randomUUID()
    await db
      .insertInto('memories')
      .values({ id, roomId, type: 'key_value', config: JSON.stringify({}) })
      .execute()

    return id
  }

  // GET /api/rooms/:id/memory
  fastify.get<{ Params: { id: string } }>('/rooms/:id/memory', async (req, reply) => {
    try {
      const memId = await getOrCreateMemory(req.params.id)
      const entries = await db
        .selectFrom('memory_entries')
        .select(['id', 'key', 'value', 'createdAt', 'updatedAt'])
        .where('memoryId', '=', memId)
        .orderBy('updatedAt', 'desc')
        .limit(200)
        .execute()

      return reply.send({ entries, count: entries.length, memoryId: memId })
    } catch (err) {
      return reply.code(500).send({ error: 'Failed to list memory', message: (err as Error).message })
    }
  })

  // POST /api/rooms/:id/memory  { key, value }
  fastify.post<{ Params: { id: string } }>('/rooms/:id/memory', async (req, reply) => {
    const { key, value } = req.body as { key: string; value: unknown }
    if (!key) return reply.code(400).send({ error: 'key is required' })

    try {
      const memId = await getOrCreateMemory(req.params.id)
      const now = new Date().toISOString()

      // Upsert — update if key exists, insert otherwise
      const existing = await db
        .selectFrom('memory_entries')
        .select('id')
        .where('memoryId', '=', memId)
        .where('key', '=', key)
        .executeTakeFirst()

      if (existing) {
        await db
          .updateTable('memory_entries')
          .set({ value: JSON.stringify(value), updatedAt: now })
          .where('id', '=', existing.id)
          .execute()
      } else {
        await db
          .insertInto('memory_entries')
          .values({
            id: crypto.randomUUID(),
            memoryId: memId,
            key,
            value: JSON.stringify(value),
            createdAt: now,
            updatedAt: now,
          })
          .execute()
      }

      return reply.code(201).send({ key, value, memoryId: memId, updated: !!existing })
    } catch (err) {
      return reply.code(500).send({ error: 'Failed to write memory', message: (err as Error).message })
    }
  })

  // GET /api/rooms/:id/memory/:key
  fastify.get<{ Params: { id: string; key: string } }>('/rooms/:id/memory/:key', async (req, reply) => {
    try {
      const memId = await getOrCreateMemory(req.params.id)
      const entry = await db
        .selectFrom('memory_entries')
        .select(['id', 'key', 'value', 'updatedAt'])
        .where('memoryId', '=', memId)
        .where('key', '=', decodeURIComponent(req.params.key))
        .executeTakeFirst()

      if (!entry) return reply.code(404).send({ error: 'Key not found' })
      return reply.send(entry)
    } catch (err) {
      return reply.code(500).send({ error: 'Failed to read memory key', message: (err as Error).message })
    }
  })

  // DELETE /api/rooms/:id/memory/:key
  fastify.delete<{ Params: { id: string; key: string } }>('/rooms/:id/memory/:key', async (req, reply) => {
    try {
      const memId = await getOrCreateMemory(req.params.id)
      await db
        .deleteFrom('memory_entries')
        .where('memoryId', '=', memId)
        .where('key', '=', decodeURIComponent(req.params.key))
        .execute()

      return reply.code(204).send()
    } catch (err) {
      return reply.code(500).send({ error: 'Failed to delete memory key', message: (err as Error).message })
    }
  })
}
