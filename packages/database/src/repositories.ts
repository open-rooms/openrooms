/**
 * Repository Implementations using Prisma
 */

import {
  PrismaClient,
  Room as PrismaRoom,
  Workflow as PrismaWorkflow,
  WorkflowNode as PrismaWorkflowNode,
  Agent as PrismaAgent,
  ExecutionLog as PrismaExecutionLog,
  Memory as PrismaMemory,
} from '@openrooms/database';
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
  MemoryType,
  UUID,
  RoomStatus,
} from '@openrooms/core';

export class PrismaRoomRepository implements RoomRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateRoomData): Promise<Room> {
    const room = await this.prisma.room.create({
      data: {
        name: data.name,
        description: data.description,
        workflowId: data.workflowId,
        config: data.config ?? {},
        metadata: data.metadata ?? {},
      },
    });

    return this.mapRoom(room);
  }

  async findById(id: UUID): Promise<Room | null> {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    return room ? this.mapRoom(room) : null;
  }

  async findAll(filters?: RoomFilters): Promise<Room[]> {
    const rooms = await this.prisma.room.findMany({
      where: {
        status: filters?.status,
        workflowId: filters?.workflowId,
      },
      take: filters?.limit,
      skip: filters?.offset,
      orderBy: { createdAt: 'desc' },
    });

    return rooms.map((r) => this.mapRoom(r));
  }

  async update(id: UUID, data: UpdateRoomData): Promise<Room> {
    const room = await this.prisma.room.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        currentNodeId: data.currentNodeId,
        config: data.config,
        metadata: data.metadata,
      },
    });

    return this.mapRoom(room);
  }

  async delete(id: UUID): Promise<void> {
    await this.prisma.room.delete({
      where: { id },
    });
  }

  async updateStatus(id: UUID, status: RoomStatus): Promise<void> {
    await this.prisma.room.update({
      where: { id },
      data: { status },
    });
  }

  private mapRoom(room: PrismaRoom): Room {
    return {
      id: room.id,
      name: room.name,
      description: room.description ?? undefined,
      status: room.status as RoomStatus,
      workflowId: room.workflowId,
      currentNodeId: room.currentNodeId ?? undefined,
      config: room.config as Room['config'],
      metadata: room.metadata as Room['metadata'],
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      startedAt: room.startedAt?.toISOString(),
      completedAt: room.completedAt?.toISOString(),
    };
  }
}

export class PrismaWorkflowRepository implements WorkflowRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateWorkflowData): Promise<Workflow> {
    const workflow = await this.prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        initialNodeId: data.initialNodeId,
        metadata: data.metadata ?? {},
      },
    });

    return this.mapWorkflow(workflow);
  }

  async findById(id: UUID): Promise<Workflow | null> {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
    });

    return workflow ? this.mapWorkflow(workflow) : null;
  }

  async findAll(): Promise<Workflow[]> {
    const workflows = await this.prisma.workflow.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return workflows.map((w) => this.mapWorkflow(w));
  }

  async update(id: UUID, data: UpdateWorkflowData): Promise<Workflow> {
    const workflow = await this.prisma.workflow.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        metadata: data.metadata,
      },
    });

    return this.mapWorkflow(workflow);
  }

  async delete(id: UUID): Promise<void> {
    await this.prisma.workflow.delete({
      where: { id },
    });
  }

  async getNodes(workflowId: UUID): Promise<WorkflowNode[]> {
    const nodes = await this.prisma.workflowNode.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'asc' },
    });

    return nodes.map((n) => this.mapNode(n));
  }

  async getNode(nodeId: UUID): Promise<WorkflowNode | null> {
    const node = await this.prisma.workflowNode.findUnique({
      where: { id: nodeId },
    });

    return node ? this.mapNode(node) : null;
  }

  private mapWorkflow(workflow: PrismaWorkflow): Workflow {
    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description ?? undefined,
      version: workflow.version,
      status: workflow.status as Workflow['status'],
      initialNodeId: workflow.initialNodeId,
      metadata: workflow.metadata as Workflow['metadata'],
      createdAt: workflow.createdAt.toISOString(),
      updatedAt: workflow.updatedAt.toISOString(),
    };
  }

  private mapNode(node: PrismaWorkflowNode): WorkflowNode {
    return {
      id: node.id,
      workflowId: node.workflowId,
      type: node.type as WorkflowNode['type'],
      name: node.name,
      description: node.description ?? undefined,
      config: node.config as WorkflowNode['config'],
      transitions: node.transitions as WorkflowNode['transitions'],
      retryPolicy: node.retryPolicy as WorkflowNode['retryPolicy'],
      timeout: node.timeout ?? undefined,
      metadata: node.metadata as WorkflowNode['metadata'],
      createdAt: node.createdAt.toISOString(),
      updatedAt: node.updatedAt.toISOString(),
    };
  }
}

export class PrismaAgentRepository implements AgentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateAgentData): Promise<Agent> {
    const agent = await this.prisma.agent.create({
      data: {
        roomId: data.roomId,
        name: data.name,
        description: data.description,
        config: data.config,
        metadata: data.metadata ?? {},
      },
    });

    return this.mapAgent(agent);
  }

  async findById(id: UUID): Promise<Agent | null> {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
    });

    return agent ? this.mapAgent(agent) : null;
  }

  async findByRoomId(roomId: UUID): Promise<Agent[]> {
    const agents = await this.prisma.agent.findMany({
      where: { roomId },
    });

    return agents.map((a) => this.mapAgent(a));
  }

  async update(id: UUID, data: UpdateAgentData): Promise<Agent> {
    const agent = await this.prisma.agent.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        config: data.config,
        metadata: data.metadata,
      },
    });

    return this.mapAgent(agent);
  }

  async delete(id: UUID): Promise<void> {
    await this.prisma.agent.delete({
      where: { id },
    });
  }

  private mapAgent(agent: PrismaAgent): Agent {
    return {
      id: agent.id,
      roomId: agent.roomId,
      name: agent.name,
      description: agent.description ?? undefined,
      config: agent.config as Agent['config'],
      metadata: agent.metadata as Agent['metadata'],
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
    };
  }
}

export class PrismaExecutionLogRepository implements ExecutionLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateLogData): Promise<ExecutionLog> {
    const log = await this.prisma.executionLog.create({
      data: {
        roomId: data.roomId,
        workflowId: data.workflowId,
        nodeId: data.nodeId,
        agentId: data.agentId,
        eventType: data.eventType as any,
        level: data.level as any,
        message: data.message,
        data: data.data,
        error: data.error,
        duration: data.duration,
        metadata: data.metadata ?? {},
      },
    });

    return this.mapLog(log);
  }

  async findByRoomId(roomId: UUID, options?: LogQueryOptions): Promise<ExecutionLog[]> {
    const logs = await this.prisma.executionLog.findMany({
      where: {
        roomId,
        level: options?.level as any,
        timestamp: {
          gte: options?.startTime ? new Date(options.startTime) : undefined,
          lte: options?.endTime ? new Date(options.endTime) : undefined,
        },
      },
      take: options?.limit,
      skip: options?.offset,
      orderBy: { timestamp: 'desc' },
    });

    return logs.map((l) => this.mapLog(l));
  }

  async findByNodeId(nodeId: UUID): Promise<ExecutionLog[]> {
    const logs = await this.prisma.executionLog.findMany({
      where: { nodeId },
      orderBy: { timestamp: 'desc' },
    });

    return logs.map((l) => this.mapLog(l));
  }

  async findByEventType(roomId: UUID, eventType: string): Promise<ExecutionLog[]> {
    const logs = await this.prisma.executionLog.findMany({
      where: {
        roomId,
        eventType: eventType as any,
      },
      orderBy: { timestamp: 'desc' },
    });

    return logs.map((l) => this.mapLog(l));
  }

  async deleteByRoomId(roomId: UUID): Promise<void> {
    await this.prisma.executionLog.deleteMany({
      where: { roomId },
    });
  }

  private mapLog(log: PrismaExecutionLog): ExecutionLog {
    return {
      id: log.id,
      roomId: log.roomId,
      workflowId: log.workflowId,
      nodeId: log.nodeId ?? undefined,
      agentId: log.agentId ?? undefined,
      eventType: log.eventType as ExecutionLog['eventType'],
      level: log.level as ExecutionLog['level'],
      message: log.message,
      data: log.data as ExecutionLog['data'],
      error: log.error as ExecutionLog['error'],
      timestamp: log.timestamp.toISOString(),
      duration: log.duration ?? undefined,
      metadata: log.metadata as ExecutionLog['metadata'],
    };
  }
}

export class PrismaMemoryRepository implements MemoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateMemoryData): Promise<Memory> {
    const memory = await this.prisma.memory.create({
      data: {
        roomId: data.roomId,
        conversationHistory: data.conversationHistory ?? [],
        context: data.context ?? {},
      },
    });

    return this.mapMemory(memory);
  }

  async findByRoomId(roomId: UUID): Promise<Memory | null> {
    const memory = await this.prisma.memory.findUnique({
      where: { roomId },
      include: { entries: true },
    });

    return memory ? this.mapMemory(memory) : null;
  }

  async update(id: UUID, data: UpdateMemoryData): Promise<Memory> {
    const memory = await this.prisma.memory.update({
      where: { id },
      data: {
        conversationHistory: data.conversationHistory,
        context: data.context,
      },
    });

    return this.mapMemory(memory);
  }

  async addEntry(
    roomId: UUID,
    entry: Omit<MemoryEntry, 'id' | 'createdAt'>
  ): Promise<MemoryEntry> {
    // Ensure memory exists
    let memory = await this.prisma.memory.findUnique({
      where: { roomId },
    });

    if (!memory) {
      memory = await this.prisma.memory.create({
        data: {
          roomId,
          conversationHistory: [],
          context: {},
        },
      });
    }

    const memoryEntry = await this.prisma.memoryEntry.create({
      data: {
        memoryId: memory.id,
        roomId: entry.roomId,
        type: entry.type as any,
        key: entry.key,
        value: entry.value,
        embedding: entry.embedding,
        ttl: entry.ttl,
        metadata: entry.metadata,
        expiresAt: entry.expiresAt ? new Date(entry.expiresAt) : undefined,
      },
    });

    return {
      id: memoryEntry.id,
      roomId: memoryEntry.roomId,
      type: memoryEntry.type as MemoryType,
      key: memoryEntry.key,
      value: memoryEntry.value,
      embedding: memoryEntry.embedding,
      ttl: memoryEntry.ttl ?? undefined,
      metadata: memoryEntry.metadata as MemoryEntry['metadata'],
      createdAt: memoryEntry.createdAt.toISOString(),
      expiresAt: memoryEntry.expiresAt?.toISOString(),
    };
  }

  async getEntries(roomId: UUID, type?: MemoryType): Promise<MemoryEntry[]> {
    const entries = await this.prisma.memoryEntry.findMany({
      where: {
        roomId,
        type: type as any,
      },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((e) => ({
      id: e.id,
      roomId: e.roomId,
      type: e.type as MemoryType,
      key: e.key,
      value: e.value,
      embedding: e.embedding,
      ttl: e.ttl ?? undefined,
      metadata: e.metadata as MemoryEntry['metadata'],
      createdAt: e.createdAt.toISOString(),
      expiresAt: e.expiresAt?.toISOString(),
    }));
  }

  async deleteByRoomId(roomId: UUID): Promise<void> {
    await this.prisma.memory.delete({
      where: { roomId },
    });
  }

  private mapMemory(memory: PrismaMemory & { entries?: any[] }): Memory {
    return {
      id: memory.id,
      roomId: memory.roomId,
      conversationHistory: memory.conversationHistory as Memory['conversationHistory'],
      context: memory.context as Memory['context'],
      entries: (memory.entries ?? []).map((e: any) => ({
        id: e.id,
        roomId: e.roomId,
        type: e.type,
        key: e.key,
        value: e.value,
        embedding: e.embedding,
        ttl: e.ttl ?? undefined,
        metadata: e.metadata,
        createdAt: e.createdAt.toISOString(),
        expiresAt: e.expiresAt?.toISOString(),
      })),
      createdAt: memory.createdAt.toISOString(),
      updatedAt: memory.updatedAt.toISOString(),
    };
  }
}
