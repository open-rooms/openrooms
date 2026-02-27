/**
 * Core domain interfaces for OpenRooms
 * 
 * These interfaces define the contracts for implementing domain services.
 */

import {
  UUID,
  Room,
  RoomStatus,
  RoomConfig,
  Agent,
  Workflow,
  WorkflowNode,
  ExecutionLog,
  Memory,
  MemoryEntry,
  MemoryType,
  ToolDefinition,
  ToolCall,
  ToolResult,
  ToolExecutionContext,
  RoomState,
  LLMRequest,
  LLMResponse,
  Result,
  JSONObject,
} from './types';

// ============================================================================
// Repository Interfaces (Persistence Layer)
// ============================================================================

export interface RoomRepository {
  create(data: CreateRoomData): Promise<Room>;
  findById(id: UUID): Promise<Room | null>;
  findAll(filters?: RoomFilters): Promise<Room[]>;
  update(id: UUID, data: UpdateRoomData): Promise<Room>;
  delete(id: UUID): Promise<void>;
  updateStatus(id: UUID, status: RoomStatus): Promise<void>;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  workflowId: UUID;
  config?: RoomConfig;
  metadata?: JSONObject;
}

export interface UpdateRoomData {
  name?: string;
  description?: string;
  status?: RoomStatus;
  currentNodeId?: UUID;
  config?: RoomConfig;
  metadata?: JSONObject;
}

export interface RoomFilters {
  status?: RoomStatus;
  workflowId?: UUID;
  limit?: number;
  offset?: number;
}

export interface WorkflowRepository {
  create(data: CreateWorkflowData): Promise<Workflow>;
  findById(id: UUID): Promise<Workflow | null>;
  findAll(): Promise<Workflow[]>;
  update(id: UUID, data: UpdateWorkflowData): Promise<Workflow>;
  delete(id: UUID): Promise<void>;
  getNodes(workflowId: UUID): Promise<WorkflowNode[]>;
  getNode(nodeId: UUID): Promise<WorkflowNode | null>;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  initialNodeId: UUID;
  metadata?: JSONObject;
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  metadata?: JSONObject;
}

export interface AgentRepository {
  create(data: CreateAgentData): Promise<Agent>;
  findById(id: UUID): Promise<Agent | null>;
  findByRoomId(roomId: UUID): Promise<Agent[]>;
  update(id: UUID, data: UpdateAgentData): Promise<Agent>;
  delete(id: UUID): Promise<void>;
}

export interface CreateAgentData {
  roomId: UUID;
  name: string;
  description?: string;
  config: JSONObject;
  metadata?: JSONObject;
}

export interface UpdateAgentData {
  name?: string;
  description?: string;
  config?: JSONObject;
  metadata?: JSONObject;
}

export interface ExecutionLogRepository {
  create(data: CreateLogData): Promise<ExecutionLog>;
  findByRoomId(roomId: UUID, options?: LogQueryOptions): Promise<ExecutionLog[]>;
  findByNodeId(nodeId: UUID): Promise<ExecutionLog[]>;
  findByEventType(roomId: UUID, eventType: string): Promise<ExecutionLog[]>;
  deleteByRoomId(roomId: UUID): Promise<void>;
}

export interface CreateLogData {
  roomId: UUID;
  workflowId: UUID;
  nodeId?: UUID;
  agentId?: UUID;
  eventType: string;
  level: string;
  message: string;
  data?: JSONObject;
  error?: JSONObject;
  duration?: number;
  metadata?: JSONObject;
}

export interface LogQueryOptions {
  limit?: number;
  offset?: number;
  startTime?: string;
  endTime?: string;
  level?: string;
}

export interface MemoryRepository {
  create(data: CreateMemoryData): Promise<Memory>;
  findByRoomId(roomId: UUID): Promise<Memory | null>;
  update(id: UUID, data: UpdateMemoryData): Promise<Memory>;
  addEntry(roomId: UUID, entry: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<MemoryEntry>;
  getEntries(roomId: UUID, type?: MemoryType): Promise<MemoryEntry[]>;
  deleteByRoomId(roomId: UUID): Promise<void>;
}

export interface CreateMemoryData {
  roomId: UUID;
  conversationHistory?: JSONObject[];
  context?: JSONObject;
}

export interface UpdateMemoryData {
  conversationHistory?: JSONObject[];
  context?: JSONObject;
}

// ============================================================================
// Service Interfaces (Domain Logic)
// ============================================================================

export interface WorkflowEngine {
  executeRoom(roomId: UUID): Promise<Result<void>>;
  executeNode(roomId: UUID, nodeId: UUID): Promise<Result<void>>;
  transition(roomId: UUID, fromNodeId: UUID, toNodeId: UUID): Promise<Result<void>>;
  pauseRoom(roomId: UUID): Promise<Result<void>>;
  resumeRoom(roomId: UUID): Promise<Result<void>>;
  cancelRoom(roomId: UUID): Promise<Result<void>>;
}

export interface StateManager {
  getState(roomId: UUID): Promise<RoomState | null>;
  setState(roomId: UUID, state: RoomState): Promise<void>;
  updateState(roomId: UUID, updates: Partial<RoomState>): Promise<void>;
  deleteState(roomId: UUID): Promise<void>;
  acquireLock(roomId: UUID, timeout: number): Promise<boolean>;
  releaseLock(roomId: UUID): Promise<void>;
}

export interface ToolRegistry {
  register(tool: ToolDefinition, executor: ToolExecutor): void;
  unregister(toolId: UUID): void;
  getTool(toolId: UUID): ToolDefinition | null;
  listTools(): ToolDefinition[];
  execute(call: ToolCall, context: ToolExecutionContext): Promise<ToolResult>;
}

export interface ToolExecutor {
  execute(args: JSONObject, context: ToolExecutionContext): Promise<Result<JSONObject>>;
  validate(args: JSONObject): Result<void>;
}

export interface LLMService {
  chat(request: LLMRequest): Promise<LLMResponse>;
  streamChat(request: LLMRequest): AsyncIterableIterator<LLMResponse>;
}

export interface MemoryService {
  getMemory(roomId: UUID): Promise<Memory | null>;
  addMessage(roomId: UUID, message: JSONObject): Promise<void>;
  addEntry(roomId: UUID, entry: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<void>;
  query(roomId: UUID, query: string): Promise<MemoryEntry[]>;
  clear(roomId: UUID): Promise<void>;
}

export interface LoggingService {
  log(data: CreateLogData): Promise<void>;
  getLogs(roomId: UUID, options?: LogQueryOptions): Promise<ExecutionLog[]>;
  getNodeLogs(nodeId: UUID): Promise<ExecutionLog[]>;
}

// ============================================================================
// Queue Interfaces
// ============================================================================

export interface JobQueue {
  addJob<T>(queueName: string, jobName: string, data: T, options?: JobOptions): Promise<string>;
  process<T>(queueName: string, jobName: string, processor: JobProcessor<T>): void;
  getJob(jobId: string): Promise<Job | null>;
  removeJob(jobId: string): Promise<void>;
  pauseQueue(queueName: string): Promise<void>;
  resumeQueue(queueName: string): Promise<void>;
}

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

export interface Job<T = unknown> {
  id: string;
  name: string;
  data: T;
  progress: number;
  attemptsMade: number;
  finishedOn?: number;
  processedOn?: number;
}

export type JobProcessor<T> = (job: Job<T>) => Promise<void>;

// ============================================================================
// Use Case Interfaces
// ============================================================================

export interface CreateRoomUseCase {
  execute(data: CreateRoomData): Promise<Result<Room>>;
}

export interface RunRoomUseCase {
  execute(roomId: UUID): Promise<Result<void>>;
}

export interface GetRoomStatusUseCase {
  execute(roomId: UUID): Promise<Result<{ room: Room; state: RoomState | null }>>;
}

export interface GetRoomLogsUseCase {
  execute(roomId: UUID, options?: LogQueryOptions): Promise<Result<ExecutionLog[]>>;
}
