/**
 * Run Manager
 *
 * Creates and manages execution run records in the database.
 * Runs track the lifecycle of agent and workflow executions.
 */

import crypto from 'crypto';

import type { Database } from '@openrooms/database';

export type RunStatus = 'pending' | 'running' | 'completed' | 'failed';
export type RunType = 'agent' | 'workflow';

export interface Run {
  id: string;
  type: RunType;
  targetId: string;
  status: RunStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  error?: string | null;
  roomId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class RunManager {
  constructor(private readonly db: any) {}

  async createRun(params: {
    type: RunType;
    targetId: string;
    input?: Record<string, unknown>;
    roomId?: string | null;
  }): Promise<Run> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await (this.db as any)
      .insertInto('runs')
      .values({
        id,
        type: params.type,
        targetId: params.targetId,
        status: 'pending',
        input: JSON.stringify(params.input ?? {}),
        roomId: params.roomId ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .execute();

    return {
      id,
      type: params.type,
      targetId: params.targetId,
      status: 'pending',
      input: params.input ?? {},
      output: null,
      error: null,
      roomId: params.roomId ?? null,
      startedAt: null,
      endedAt: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateRunStatus(
    id: string,
    status: RunStatus,
    extra?: {
      output?: Record<string, unknown>;
      error?: string;
      startedAt?: string;
      endedAt?: string;
    }
  ): Promise<void> {
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { status, updatedAt: now };

    if (extra?.output) updates['output'] = JSON.stringify(extra.output);
    if (extra?.error) updates['error'] = extra.error;
    if (extra?.startedAt) updates['startedAt'] = extra.startedAt;
    if (extra?.endedAt) updates['endedAt'] = extra.endedAt;

    await (this.db as any)
      .updateTable('runs')
      .set(updates)
      .where('id', '=', id)
      .execute();
  }

  async getRun(id: string): Promise<Run | null> {
    const row = await (this.db as any)
      .selectFrom('runs')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return row ? this.mapRow(row) : null;
  }

  async listRuns(params?: {
    type?: RunType;
    targetId?: string;
    status?: RunStatus;
    limit?: number;
    offset?: number;
  }): Promise<Run[]> {
    let q = (this.db as any).selectFrom('runs').selectAll();

    if (params?.type) q = q.where('type', '=', params.type);
    if (params?.targetId) q = q.where('targetId', '=', params.targetId);
    if (params?.status) q = q.where('status', '=', params.status);

    q = q
      .orderBy('createdAt', 'desc')
      .limit(params?.limit ?? 100)
      .offset(params?.offset ?? 0);

    const rows = await q.execute();
    return rows.map((r: any) => this.mapRow(r));
  }

  private mapRow(row: any): Run {
    const parse = (v: unknown) => {
      if (!v) return null;
      if (typeof v === 'string') { try { return JSON.parse(v); } catch { return null; } }
      return v;
    };

    return {
      id: row.id,
      type: row.type,
      targetId: row.targetId,
      status: row.status,
      input: parse(row.input) ?? {},
      output: parse(row.output),
      error: row.error ?? null,
      roomId: row.roomId ?? null,
      startedAt: row.startedAt ? new Date(row.startedAt).toISOString() : null,
      endedAt: row.endedAt ? new Date(row.endedAt).toISOString() : null,
      createdAt: new Date(row.createdAt).toISOString(),
      updatedAt: new Date(row.updatedAt).toISOString(),
    };
  }
}
