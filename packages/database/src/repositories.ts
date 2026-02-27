/**
 * Repository Implementations using Kysely
 * Clean, type-safe, deterministic SQL
 */

import { sql } from 'kysely';
import { getDb } from './db';
import {
  RoomRepository,
  WorkflowRepository,
  AgentRepository,
  ExecutionLogRepository,
  MemoryRepository,
  CreateRoomData,
  UpdateRoomData,
  RoomFilters,
  CreateWorkflowData,
  UpdateWorkflowData,
  CreateAgentData,
  UpdateAgentData,
  CreateLogData,
  LogQueryOptions,
  CreateMemoryData,
  UpdateMemoryData,
  Room,
  Workflow,
  WorkflowNode,
  Agent,
  ExecutionLog,
  Memory,
  MemoryEntry,
  UUID,
  RoomStatus,
  WorkflowStatus,
  AgentRole,
  AgentStatus,
  ExecutionLogLevel,
  MemoryType,
} from '@openrooms/core';

// ============================================================================
// Room Repository
// ============================================================================

export class KyselyRoomRepository implements RoomRepository {
  async create(data: CreateRoomData): Promise<Room> {
    const db = getDb();

    const room = await db
      .insertInto('rooms')
      .values({
        id: sql`gen_random_uuid()`,
        name: data.name,
        description: data.description || null,
        workflowId: data.workflowId,
        config: JSON.stringify(data.config || {}),
        metadata: JSON.stringify(data.metadata || {}),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapRoom(room);
  }

  async findById(id: UUID): Promise<Room | null> {
    const db = getDb();

    const room = await db
      .selectFrom('rooms')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return room ? this.mapRoom(room) : null;
  }

  async findAll(filters?: RoomFilters): Promise<Room[]> {
    const db = getDb();

    let query = db.selectFrom('rooms').selectAll();

    if (filters?.status) {
      query = query.where('status', '=', filters.status);
    }

    if (filters?.workflowId) {
      query = query.where('workflowId', '=', filters.workflowId);
    }

    query = query.orderBy('createdAt', 'desc');

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const rooms = await query.execute();
    return rooms.map((r) => this.mapRoom(r));
  }

  async update(id: UUID, data: UpdateRoomData): Promise<Room> {
    const db = getDb();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.currentNodeId !== undefined)
      updateData.currentNodeId = data.currentNodeId;
    if (data.config !== undefined)
      updateData.config = JSON.stringify(data.config);
    if (data.metadata !== undefined)
      updateData.metadata = JSON.stringify(data.metadata);

    const room = await db
      .updateTable('rooms')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapRoom(room);
  }

  async delete(id: UUID): Promise<void> {
    const db = getDb();
    await db.deleteFrom('rooms').where('id', '=', id).execute();
  }

  async updateStatus(id: UUID, status: RoomStatus): Promise<void> {
    const db = getDb();
    await db
      .updateTable('rooms')
      .set({ status, updatedAt: new Date() })
      .where('id', '=', id)
      .execute();
  }

  async setCurrentNode(id: UUID, nodeId: UUID | null): Promise<void> {
    const db = getDb();
    await db
      .updateTable('rooms')
      .set({ currentNodeId: nodeId, updatedAt: new Date() })
      .where('id', '=', id)
      .execute();
  }

  private mapRoom(row: any): Room {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status as RoomStatus,
      workflowId: row.workflowId,
      currentNodeId: row.currentNodeId,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      metadata:
        typeof row.metadata === 'string'
          ? JSON.parse(row.metadata)
          : row.metadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
    };
  }
}

// ============================================================================
// Workflow Repository
// ============================================================================

export class KyselyWorkflowRepository implements WorkflowRepository {
  async create(data: CreateWorkflowData): Promise<Workflow> {
    const db = getDb();

    const workflow = await db
      .insertInto('workflows')
      .values({
        id: sql`gen_random_uuid()`,
        name: data.name,
        description: data.description || null,
        version: 1,
        status: 'DRAFT',
        initialNodeId: data.initialNodeId,
        metadata: JSON.stringify(data.metadata || {}),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapWorkflow(workflow);
  }

  async findById(id: UUID): Promise<Workflow | null> {
    const db = getDb();

    const workflow = await db
      .selectFrom('workflows')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return workflow ? this.mapWorkflow(workflow) : null;
  }

  async findAll(): Promise<Workflow[]> {
    const db = getDb();

    const workflows = await db
      .selectFrom('workflows')
      .selectAll()
      .orderBy('createdAt', 'desc')
      .execute();

    return workflows.map((w) => this.mapWorkflow(w));
  }

  async update(id: UUID, data: UpdateWorkflowData): Promise<Workflow> {
    const db = getDb();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.metadata !== undefined)
      updateData.metadata = JSON.stringify(data.metadata);

    const workflow = await db
      .updateTable('workflows')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapWorkflow(workflow);
  }

  async delete(id: UUID): Promise<void> {
    const db = getDb();
    await db.deleteFrom('workflows').where('id', '=', id).execute();
  }

  async getNodes(workflowId: UUID): Promise<WorkflowNode[]> {
    const db = getDb();

    const nodes = await db
      .selectFrom('workflow_nodes')
      .selectAll()
      .where('workflowId', '=', workflowId)
      .orderBy('createdAt')
      .execute();

    return nodes.map((n) => this.mapNode(n, workflowId));
  }

  async getNode(nodeId: UUID): Promise<WorkflowNode | null> {
    const db = getDb();

    const node = await db
      .selectFrom('workflow_nodes')
      .selectAll()
      .where('nodeId', '=', nodeId)
      .executeTakeFirst();

    return node ? this.mapNode(node, node.workflowId) : null;
  }

  private mapWorkflow(row: any): Workflow {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      version: row.version,
      status: row.status as WorkflowStatus,
      initialNodeId: row.initialNodeId,
      metadata:
        typeof row.metadata === 'string'
          ? JSON.parse(row.metadata)
          : row.metadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapNode(row: any, workflowId: string): WorkflowNode {
    return {
      id: row.nodeId,
      workflowId,
      type: row.type,
      name: row.name,
      description: row.description,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      transitions: [],
      metadata: {},
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ============================================================================
// Agent Repository
// ============================================================================

export class KyselyAgentRepository implements AgentRepository {
  async create(data: CreateAgentData): Promise<Agent> {
    const db = getDb();

    const agent = await db
      .insertInto('agents')
      .values({
        id: sql`gen_random_uuid()`,
        roomId: data.roomId,
        name: data.name,
        role: data.role,
        status: (data.status as AgentStatus) || 'IDLE',
        model: data.model,
        systemPrompt: data.systemPrompt || null,
        config: JSON.stringify(data.config || {}),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapAgent(agent);
  }

  async findById(id: UUID): Promise<Agent | null> {
    const db = getDb();

    const agent = await db
      .selectFrom('agents')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return agent ? this.mapAgent(agent) : null;
  }

  async findByRoomId(roomId: UUID): Promise<Agent[]> {
    const db = getDb();

    const agents = await db
      .selectFrom('agents')
      .selectAll()
      .where('roomId', '=', roomId)
      .orderBy('createdAt')
      .execute();

    return agents.map((a) => this.mapAgent(a));
  }

  async update(id: UUID, data: UpdateAgentData): Promise<Agent> {
    const db = getDb();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.systemPrompt !== undefined)
      updateData.systemPrompt = data.systemPrompt;
    if (data.config !== undefined)
      updateData.config = JSON.stringify(data.config);

    const agent = await db
      .updateTable('agents')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapAgent(agent);
  }

  async delete(id: UUID): Promise<void> {
    const db = getDb();
    await db.deleteFrom('agents').where('id', '=', id).execute();
  }

  private mapAgent(row: any): Agent {
    return {
      id: row.id,
      roomId: row.roomId,
      name: row.name,
      role: row.role as AgentRole,
      status: row.status as AgentStatus,
      model: row.model,
      systemPrompt: row.systemPrompt,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ============================================================================
// Execution Log Repository
// ============================================================================

export class KyselyExecutionLogRepository implements ExecutionLogRepository {
  async create(data: CreateLogData): Promise<ExecutionLog> {
    const db = getDb();

    const log = await db
      .insertInto('execution_logs')
      .values({
        id: sql`gen_random_uuid()`,
        roomId: data.roomId,
        workflowId: data.workflowId,
        nodeId: data.nodeId || null,
        eventType: data.eventType,
        level: (data.level as ExecutionLogLevel) || 'INFO',
        message: data.message,
        data: JSON.stringify(data.data || {}),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapLog(log);
  }

  async findByRoom(
    roomId: UUID,
    options?: LogQueryOptions
  ): Promise<ExecutionLog[]> {
    const db = getDb();

    let query = db
      .selectFrom('execution_logs')
      .selectAll()
      .where('roomId', '=', roomId);

    if (options?.level) {
      query = query.where('level', '=', options.level);
    }

    if (options?.eventType) {
      query = query.where('eventType', '=', options.eventType);
    }

    query = query.orderBy('createdAt', 'desc');

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const logs = await query.execute();
    return logs.map((l) => this.mapLog(l));
  }

  async findByWorkflow(
    workflowId: UUID,
    options?: LogQueryOptions
  ): Promise<ExecutionLog[]> {
    const db = getDb();

    let query = db
      .selectFrom('execution_logs')
      .selectAll()
      .where('workflowId', '=', workflowId);

    if (options?.level) {
      query = query.where('level', '=', options.level);
    }

    if (options?.eventType) {
      query = query.where('eventType', '=', options.eventType);
    }

    query = query.orderBy('createdAt', 'desc');

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const logs = await query.execute();
    return logs.map((l) => this.mapLog(l));
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const db = getDb();

    const result = await db
      .deleteFrom('execution_logs')
      .where('createdAt', '<', date)
      .executeTakeFirst();

    return Number(result.numDeletedRows);
  }

  private mapLog(row: any): ExecutionLog {
    return {
      id: row.id,
      roomId: row.roomId,
      workflowId: row.workflowId,
      nodeId: row.nodeId,
      eventType: row.eventType,
      level: row.level as ExecutionLogLevel,
      message: row.message,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      createdAt: row.createdAt,
    };
  }
}

// ============================================================================
// Memory Repository
// ============================================================================

export class KyselyMemoryRepository implements MemoryRepository {
  async create(data: CreateMemoryData): Promise<Memory> {
    const db = getDb();

    const memory = await db
      .insertInto('memories')
      .values({
        id: sql`gen_random_uuid()`,
        roomId: data.roomId,
        type: data.type,
        config: JSON.stringify(data.config || {}),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapMemory(memory, []);
  }

  async findByRoomId(roomId: UUID): Promise<Memory | null> {
    const db = getDb();

    const memory = await db
      .selectFrom('memories')
      .selectAll()
      .where('roomId', '=', roomId)
      .executeTakeFirst();

    if (!memory) return null;

    const entries = await db
      .selectFrom('memory_entries')
      .selectAll()
      .where('memoryId', '=', memory.id)
      .orderBy('createdAt')
      .execute();

    return this.mapMemory(memory, entries);
  }

  async update(id: UUID, data: UpdateMemoryData): Promise<Memory> {
    const db = getDb();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.config !== undefined) {
      updateData.config = JSON.stringify(data.config);
    }

    await db.updateTable('memories').set(updateData).where('id', '=', id).execute();

    const memory = await db
      .selectFrom('memories')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirstOrThrow();

    const entries = await db
      .selectFrom('memory_entries')
      .selectAll()
      .where('memoryId', '=', id)
      .orderBy('createdAt')
      .execute();

    return this.mapMemory(memory, entries);
  }

  async delete(id: UUID): Promise<void> {
    const db = getDb();
    await db.deleteFrom('memories').where('id', '=', id).execute();
  }

  async addEntry(
    memoryId: UUID,
    key: string,
    value: any,
    embedding?: number[]
  ): Promise<MemoryEntry> {
    const db = getDb();

    const entry = await db
      .insertInto('memory_entries')
      .values({
        id: sql`gen_random_uuid()`,
        memoryId,
        key,
        value: JSON.stringify(value),
        embedding: embedding || [],
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapEntry(entry);
  }

  async getEntry(memoryId: UUID, key: string): Promise<MemoryEntry | null> {
    const db = getDb();

    const entry = await db
      .selectFrom('memory_entries')
      .selectAll()
      .where('memoryId', '=', memoryId)
      .where('key', '=', key)
      .executeTakeFirst();

    return entry ? this.mapEntry(entry) : null;
  }

  async removeEntry(memoryId: UUID, key: string): Promise<void> {
    const db = getDb();
    await db
      .deleteFrom('memory_entries')
      .where('memoryId', '=', memoryId)
      .where('key', '=', key)
      .execute();
  }

  async searchEntries(
    memoryId: UUID,
    searchQuery: string,
    limit?: number
  ): Promise<MemoryEntry[]> {
    const db = getDb();

    const entries = await db
      .selectFrom('memory_entries')
      .selectAll()
      .where('memoryId', '=', memoryId)
      .where((eb) =>
        eb.or([
          eb('key', 'ilike', `%${searchQuery}%`),
          sql`value::text ilike ${`%${searchQuery}%`}`,
        ])
      )
      .orderBy('createdAt', 'desc')
      .limit(limit || 10)
      .execute();

    return entries.map((e) => this.mapEntry(e));
  }

  private mapMemory(memoryRow: any, entryRows: any[]): Memory {
    return {
      id: memoryRow.id,
      roomId: memoryRow.roomId,
      type: memoryRow.type as MemoryType,
      entries: entryRows.map((e) => this.mapEntry(e)),
      config:
        typeof memoryRow.config === 'string'
          ? JSON.parse(memoryRow.config)
          : memoryRow.config,
      createdAt: memoryRow.createdAt,
      updatedAt: memoryRow.updatedAt,
    };
  }

  private mapEntry(row: any): MemoryEntry {
    return {
      id: row.id,
      memoryId: row.memoryId,
      key: row.key,
      value: typeof row.value === 'string' ? JSON.parse(row.value) : row.value,
      embedding: row.embedding,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
