/**
 * Room Repository Implementation with Kysely
 */

import { Kysely } from 'kysely';
import {
  RoomRepository,
  CreateRoomData,
  UpdateRoomData,
  RoomFilters,
  Room,
  RoomStatus,
  UUID,
} from '@openrooms/core';
import { Database } from '../kysely/types';

export class KyselyRoomRepository implements RoomRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: CreateRoomData): Promise<Room> {
    const result = await this.db
      .insertInto('rooms')
      .values({
        name: data.name,
        description: data.description || null,
        workflowId: data.workflowId,
        status: 'IDLE' as RoomStatus,
        config: JSON.stringify(data.config || {}),
        metadata: JSON.stringify(data.metadata || {}),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToRoom(result);
  }

  async findById(id: UUID): Promise<Room | null> {
    const result = await this.db
      .selectFrom('rooms')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToRoom(result) : null;
  }

  async findAll(filters?: RoomFilters): Promise<Room[]> {
    let query = this.db.selectFrom('rooms').selectAll();

    if (filters?.status) {
      query = query.where('status', '=', filters.status);
    }

    if (filters?.workflowId) {
      query = query.where('workflowId', '=', filters.workflowId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    query = query.orderBy('createdAt', 'desc');

    const results = await query.execute();
    return results.map(r => this.mapToRoom(r));
  }

  async update(id: UUID, data: UpdateRoomData): Promise<Room> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.currentNodeId !== undefined) updateData.currentNodeId = data.currentNodeId;
    if (data.config !== undefined) updateData.config = JSON.stringify(data.config);
    if (data.metadata !== undefined) updateData.metadata = JSON.stringify(data.metadata);
    if (data.startedAt !== undefined) updateData.startedAt = new Date(data.startedAt);
    if (data.completedAt !== undefined) updateData.completedAt = new Date(data.completedAt);

    const result = await this.db
      .updateTable('rooms')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToRoom(result);
  }

  async delete(id: UUID): Promise<void> {
    await this.db
      .deleteFrom('rooms')
      .where('id', '=', id)
      .execute();
  }

  async updateStatus(id: UUID, status: RoomStatus): Promise<void> {
    await this.db
      .updateTable('rooms')
      .set({
        status,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  async count(filters?: RoomFilters): Promise<number> {
    let query = this.db
      .selectFrom('rooms')
      .select(({ fn }) => fn.countAll<number>().as('count'));

    if (filters?.status) {
      query = query.where('status', '=', filters.status);
    }

    if (filters?.workflowId) {
      query = query.where('workflowId', '=', filters.workflowId);
    }

    const result = await query.executeTakeFirstOrThrow();
    return Number(result.count);
  }

  private mapToRoom(row: any): Room {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      status: row.status,
      workflowId: row.workflowId,
      currentNodeId: row.currentNodeId || undefined,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
      startedAt: row.startedAt ? (row.startedAt instanceof Date ? row.startedAt.toISOString() : row.startedAt) : undefined,
      completedAt: row.completedAt ? (row.completedAt instanceof Date ? row.completedAt.toISOString() : row.completedAt) : undefined,
    };
  }
}
