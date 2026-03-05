/**
 * Agent Repository - Database Operations for Agents
 * 
 * CRUD operations for agent entity with:
 * - Version management
 * - Policy configuration
 * - Status tracking
 */

import type {
  Agent,
  AgentStatus,
  AgentLoopState,
  AgentPolicy,
  UUID,
  JSONObject,
} from '@openrooms/core';

export interface AgentRepository {
  create(params: CreateAgentParams): Promise<Agent>;
  findById(id: UUID): Promise<Agent | null>;
  findByRoomId(roomId: UUID): Promise<Agent[]>;
  update(id: UUID, updates: Partial<Agent>): Promise<Agent>;
  updateStatus(id: UUID, status: AgentStatus): Promise<void>;
  updateLoopState(id: UUID, loopState: AgentLoopState): Promise<void>;
  delete(id: UUID): Promise<void>;
  createVersion(agentId: UUID, changes: Partial<Agent>): Promise<Agent>;
  getVersionHistory(name: string): Promise<Agent[]>;
}

export interface CreateAgentParams {
  name: string;
  description?: string;
  goal: string;
  roomId?: UUID;
  allowedTools: string[];
  policyConfig: AgentPolicy;
  version?: number;
  parentAgentId?: UUID;
}

/**
 * PostgreSQL Agent Repository Implementation
 */
export class PostgreSQLAgentRepository implements AgentRepository {
  constructor(private readonly db: any) {} // Kysely DB instance

  async create(params: CreateAgentParams): Promise<Agent> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const agent: Agent = {
      id,
      name: params.name,
      description: params.description,
      goal: params.goal,
      version: params.version || 1,
      roomId: params.roomId,
      allowedTools: params.allowedTools,
      policyConfig: params.policyConfig,
      status: 'ACTIVE',
      loopState: 'IDLE',
      memoryState: {},
      parentAgentId: params.parentAgentId,
      snapshotData: undefined,
      createdAt: now,
      updatedAt: now,
      lastExecutedAt: undefined,
    };

    await this.db
      .insertInto('agents')
      .values({
        id: agent.id,
        name: agent.name,
        description: agent.description || null,
        goal: agent.goal,
        version: agent.version,
        roomId: agent.roomId || null,
        allowedTools: agent.allowedTools,
        policyConfig: JSON.stringify(agent.policyConfig),
        status: agent.status,
        loopState: agent.loopState,
        memoryState: JSON.stringify(agent.memoryState),
        parentAgentId: agent.parentAgentId || null,
        snapshotData: null,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        lastExecutedAt: null,
      })
      .execute();

    return agent;
  }

  async findById(id: UUID): Promise<Agent | null> {
    const record = await this.db
      .selectFrom('agents')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return record ? this.mapToAgent(record) : null;
  }

  async findByRoomId(roomId: UUID): Promise<Agent[]> {
    const records = await this.db
      .selectFrom('agents')
      .selectAll()
      .where('roomId', '=', roomId)
      .execute();

    return records.map(this.mapToAgent);
  }

  async update(id: UUID, updates: Partial<Agent>): Promise<Agent> {
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.goal !== undefined) updateData.goal = updates.goal;
    if (updates.roomId !== undefined) updateData.roomId = updates.roomId;
    if (updates.allowedTools !== undefined) updateData.allowedTools = updates.allowedTools;
    if (updates.policyConfig !== undefined) updateData.policyConfig = JSON.stringify(updates.policyConfig);
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.loopState !== undefined) updateData.loopState = updates.loopState;
    if (updates.memoryState !== undefined) updateData.memoryState = JSON.stringify(updates.memoryState);
    if (updates.lastExecutedAt !== undefined) updateData.lastExecutedAt = updates.lastExecutedAt;

    await this.db
      .updateTable('agents')
      .set(updateData)
      .where('id', '=', id)
      .execute();

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Agent ${id} not found after update`);
    }

    return updated;
  }

  async updateStatus(id: UUID, status: AgentStatus): Promise<void> {
    await this.db
      .updateTable('agents')
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where('id', '=', id)
      .execute();
  }

  async updateLoopState(id: UUID, loopState: AgentLoopState): Promise<void> {
    await this.db
      .updateTable('agents')
      .set({
        loopState,
        updatedAt: new Date().toISOString(),
      })
      .where('id', '=', id)
      .execute();
  }

  async delete(id: UUID): Promise<void> {
    await this.db
      .deleteFrom('agents')
      .where('id', '=', id)
      .execute();
  }

  /**
   * Create new version of agent
   */
  async createVersion(agentId: UUID, changes: Partial<Agent>): Promise<Agent> {
    const parent = await this.findById(agentId);
    if (!parent) {
      throw new Error(`Parent agent ${agentId} not found`);
    }

    // Create snapshot of parent
    const snapshot = {
      ...parent,
      snapshotData: JSON.stringify(parent),
    };

    return this.create({
      name: parent.name,
      description: changes.description || parent.description,
      goal: changes.goal || parent.goal,
      roomId: changes.roomId || parent.roomId,
      allowedTools: changes.allowedTools || parent.allowedTools,
      policyConfig: changes.policyConfig || parent.policyConfig,
      version: parent.version + 1,
      parentAgentId: agentId,
    });
  }

  /**
   * Get all versions of an agent by name
   */
  async getVersionHistory(name: string): Promise<Agent[]> {
    const records = await this.db
      .selectFrom('agents')
      .selectAll()
      .where('name', '=', name)
      .orderBy('version', 'desc')
      .execute();

    return records.map(this.mapToAgent);
  }

  /**
   * Map database record to Agent type
   */
  private mapToAgent(record: any): Agent {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      goal: record.goal,
      version: record.version,
      roomId: record.roomId,
      allowedTools: record.allowedTools,
      policyConfig: JSON.parse(record.policyConfig),
      status: record.status,
      loopState: record.loopState,
      memoryState: JSON.parse(record.memoryState),
      parentAgentId: record.parentAgentId,
      snapshotData: record.snapshotData ? JSON.parse(record.snapshotData) : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      lastExecutedAt: record.lastExecutedAt,
    };
  }
}

/**
 * In-Memory Agent Repository (for testing)
 */
export class InMemoryAgentRepository implements AgentRepository {
  private agents: Map<UUID, Agent> = new Map();

  async create(params: CreateAgentParams): Promise<Agent> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const agent: Agent = {
      id,
      name: params.name,
      description: params.description,
      goal: params.goal,
      version: params.version || 1,
      roomId: params.roomId,
      allowedTools: params.allowedTools,
      policyConfig: params.policyConfig,
      status: 'ACTIVE',
      loopState: 'IDLE',
      memoryState: {},
      parentAgentId: params.parentAgentId,
      snapshotData: undefined,
      createdAt: now,
      updatedAt: now,
      lastExecutedAt: undefined,
    };

    this.agents.set(id, agent);
    return agent;
  }

  async findById(id: UUID): Promise<Agent | null> {
    return this.agents.get(id) || null;
  }

  async findByRoomId(roomId: UUID): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(a => a.roomId === roomId);
  }

  async update(id: UUID, updates: Partial<Agent>): Promise<Agent> {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new Error(`Agent ${id} not found`);
    }

    Object.assign(agent, updates, { updatedAt: new Date().toISOString() });
    return agent;
  }

  async updateStatus(id: UUID, status: AgentStatus): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = status;
      agent.updatedAt = new Date().toISOString();
    }
  }

  async updateLoopState(id: UUID, loopState: AgentLoopState): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      agent.loopState = loopState;
      agent.updatedAt = new Date().toISOString();
    }
  }

  async delete(id: UUID): Promise<void> {
    this.agents.delete(id);
  }

  async createVersion(agentId: UUID, changes: Partial<Agent>): Promise<Agent> {
    const parent = await this.findById(agentId);
    if (!parent) {
      throw new Error(`Parent agent ${agentId} not found`);
    }

    return this.create({
      name: parent.name,
      description: changes.description || parent.description,
      goal: changes.goal || parent.goal,
      roomId: changes.roomId || parent.roomId,
      allowedTools: changes.allowedTools || parent.allowedTools,
      policyConfig: changes.policyConfig || parent.policyConfig,
      version: parent.version + 1,
      parentAgentId: agentId,
    });
  }

  async getVersionHistory(name: string): Promise<Agent[]> {
    return Array.from(this.agents.values())
      .filter(a => a.name === name)
      .sort((a, b) => b.version - a.version);
  }

  clear(): void {
    this.agents.clear();
  }
}
