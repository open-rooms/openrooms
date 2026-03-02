/**
 * Execution Log Repository Implementation with Kysely
 */

import { Kysely } from 'kysely';
import {
  ExecutionLogRepository,
  CreateLogData,
  LogQueryOptions,
  ExecutionLog,
  UUID,
} from '@openrooms/core';
import { Database } from '../kysely/types';

export class KyselyExecutionLogRepository implements ExecutionLogRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: CreateLogData): Promise<ExecutionLog> {
    const result = await this.db
      .insertInto('execution_logs')
      .values({
        roomId: data.roomId,
        workflowId: data.workflowId,
        nodeId: data.nodeId || null,
        eventType: data.eventType,
        level: data.level,
        message: data.message,
        data: JSON.stringify({
          ...data.data,
          error: data.error,
          duration: data.duration,
          metadata: data.metadata,
        }),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToLog(result);
  }

  async findByRoomId(roomId: UUID, options?: LogQueryOptions): Promise<ExecutionLog[]> {
    let query = this.db
      .selectFrom('execution_logs')
      .selectAll()
      .where('roomId', '=', roomId);

    if (options?.level) {
      query = query.where('level', '=', options.level);
    }

    if (options?.eventType) {
      query = query.where('eventType', '=', options.eventType);
    }

    if (options?.nodeId) {
      query = query.where('nodeId', '=', options.nodeId);
    }

    if (options?.startTime) {
      query = query.where('createdAt', '>=', new Date(options.startTime));
    }

    if (options?.endTime) {
      query = query.where('createdAt', '<=', new Date(options.endTime));
    }

    query = query.orderBy('createdAt', 'desc');

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const results = await query.execute();
    return results.map(r => this.mapToLog(r));
  }

  async findByNodeId(nodeId: UUID, options?: LogQueryOptions): Promise<ExecutionLog[]> {
    let query = this.db
      .selectFrom('execution_logs')
      .selectAll()
      .where('nodeId', '=', nodeId);

    if (options?.level) {
      query = query.where('level', '=', options.level);
    }

    query = query.orderBy('createdAt', 'desc');

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const results = await query.execute();
    return results.map(r => this.mapToLog(r));
  }

  async findByEventType(roomId: UUID, eventType: string): Promise<ExecutionLog[]> {
    const results = await this.db
      .selectFrom('execution_logs')
      .selectAll()
      .where('roomId', '=', roomId)
      .where('eventType', '=', eventType)
      .orderBy('createdAt', 'desc')
      .execute();

    return results.map(r => this.mapToLog(r));
  }

  async count(roomId: UUID, options?: LogQueryOptions): Promise<number> {
    let query = this.db
      .selectFrom('execution_logs')
      .select(({ fn }) => fn.countAll<number>().as('count'))
      .where('roomId', '=', roomId);

    if (options?.level) {
      query = query.where('level', '=', options.level);
    }

    if (options?.eventType) {
      query = query.where('eventType', '=', options.eventType);
    }

    const result = await query.executeTakeFirstOrThrow();
    return Number(result.count);
  }

  async deleteByRoomId(roomId: UUID): Promise<void> {
    await this.db
      .deleteFrom('execution_logs')
      .where('roomId', '=', roomId)
      .execute();
  }

  private mapToLog(row: any): ExecutionLog {
    const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    const { error, duration, metadata, ...restData } = data;

    return {
      id: row.id,
      roomId: row.roomId,
      workflowId: row.workflowId,
      nodeId: row.nodeId || undefined,
      agentId: undefined,
      eventType: row.eventType,
      level: row.level,
      message: row.message,
      data: restData,
      error,
      duration,
      metadata: metadata || {},
      timestamp: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    };
  }
}
