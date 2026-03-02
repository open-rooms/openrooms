/**
 * Repository interface contracts
 * 
 * These interfaces define the persistence layer contracts.
 * Implementations must be provided by the infrastructure layer.
 */

import {
  UUID,
  Room,
  RoomStatus,
  RoomConfig,
  Workflow,
  WorkflowNode,
  ExecutionLog,
  Memory,
  MemoryEntry,
  MemoryType,
  JSONObject,
} from '../types';

// ============================================================================
// Room Repository
// ============================================================================

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
  startedAt?: string;
  completedAt?: string;
}

export interface RoomFilters {
  status?: RoomStatus;
  workflowId?: UUID;
  limit?: number;
  offset?: number;
}

export interface RoomRepository {
  create(data: CreateRoomData): Promise<Room>;
  findById(id: UUID): Promise<Room | null>;
  findAll(filters?: RoomFilters): Promise<Room[]>;
  update(id: UUID, data: UpdateRoomData): Promise<Room>;
  delete(id: UUID): Promise<void>;
  updateStatus(id: UUID, status: RoomStatus): Promise<void>;
  count(filters?: RoomFilters): Promise<number>;
}

// ============================================================================
// Workflow Repository
// ============================================================================

export interface CreateWorkflowData {
  name: string;
  description?: string;
  version: number;
  initialNodeId: UUID;
  metadata?: JSONObject;
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  status?: string;
  metadata?: JSONObject;
}

export interface CreateWorkflowNodeData {
  workflowId: UUID;
  type: string;
  name: string;
  description?: string;
  config: JSONObject;
  transitions: JSONObject[];
  timeout?: number;
  metadata?: JSONObject;
}

export interface WorkflowRepository {
  create(data: CreateWorkflowData): Promise<Workflow>;
  findById(id: UUID): Promise<Workflow | null>;
  findAll(): Promise<Workflow[]>;
  update(id: UUID, data: UpdateWorkflowData): Promise<Workflow>;
  delete(id: UUID): Promise<void>;
  
  // Node operations
  createNode(data: CreateWorkflowNodeData): Promise<WorkflowNode>;
  getNodes(workflowId: UUID): Promise<WorkflowNode[]>;
  getNode(nodeId: UUID): Promise<WorkflowNode | null>;
  updateNode(nodeId: UUID, data: Partial<WorkflowNode>): Promise<WorkflowNode>;
  deleteNode(nodeId: UUID): Promise<void>;
}

// ============================================================================
// Execution Log Repository
// ============================================================================

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
  eventType?: string;
  nodeId?: UUID;
}

export interface ExecutionLogRepository {
  create(data: CreateLogData): Promise<ExecutionLog>;
  findByRoomId(roomId: UUID, options?: LogQueryOptions): Promise<ExecutionLog[]>;
  findByNodeId(nodeId: UUID, options?: LogQueryOptions): Promise<ExecutionLog[]>;
  findByEventType(roomId: UUID, eventType: string): Promise<ExecutionLog[]>;
  count(roomId: UUID, options?: LogQueryOptions): Promise<number>;
  deleteByRoomId(roomId: UUID): Promise<void>;
}

// ============================================================================
// Memory Repository
// ============================================================================

export interface CreateMemoryData {
  roomId: UUID;
  conversationHistory?: JSONObject[];
  context?: JSONObject;
}

export interface UpdateMemoryData {
  conversationHistory?: JSONObject[];
  context?: JSONObject;
}

export interface CreateMemoryEntryData {
  roomId: UUID;
  type: MemoryType;
  key: string;
  value: JSONObject;
  embedding?: number[];
  ttl?: number;
  metadata?: JSONObject;
}

export interface MemoryRepository {
  create(data: CreateMemoryData): Promise<Memory>;
  findByRoomId(roomId: UUID): Promise<Memory | null>;
  update(id: UUID, data: UpdateMemoryData): Promise<Memory>;
  delete(id: UUID): Promise<void>;
  
  // Memory entry operations
  createEntry(data: CreateMemoryEntryData): Promise<MemoryEntry>;
  getEntries(roomId: UUID, type?: MemoryType): Promise<MemoryEntry[]>;
  deleteEntry(id: UUID): Promise<void>;
  deleteEntriesByRoomId(roomId: UUID): Promise<void>;
}

// ============================================================================
// State Repository (Redis-based)
// ============================================================================

export interface RoomState {
  roomId: UUID;
  currentNodeId: UUID;
  status: RoomStatus;
  variables: JSONObject;
  executionStack: UUID[];
  attempts: Record<string, number>;
  startTime: string;
  lastUpdateTime: string;
  version: number; // For optimistic locking
}

export interface StateRepository {
  get(roomId: UUID): Promise<RoomState | null>;
  set(roomId: UUID, state: RoomState): Promise<void>;
  update(roomId: UUID, updates: Partial<RoomState>): Promise<void>;
  delete(roomId: UUID): Promise<void>;
  exists(roomId: UUID): Promise<boolean>;
  
  // Locking for concurrent access
  acquireLock(roomId: UUID, timeoutMs: number): Promise<boolean>;
  releaseLock(roomId: UUID): Promise<void>;
  
  // Atomic compare-and-set
  compareAndSet(roomId: UUID, expectedVersion: number, newState: RoomState): Promise<boolean>;
}

// ============================================================================
// Execution Step Repository (for idempotency)
// ============================================================================

export interface ExecutionStep {
  id: UUID;
  roomId: UUID;
  nodeId: UUID;
  attemptNumber: number;
  idempotencyKey: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  input?: JSONObject;
  result?: JSONObject;
  error?: JSONObject;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface CreateExecutionStepData {
  roomId: UUID;
  nodeId: UUID;
  attemptNumber: number;
  idempotencyKey: string;
  input?: JSONObject;
}

export interface ExecutionStepRepository {
  create(data: CreateExecutionStepData): Promise<ExecutionStep>;
  findByIdempotencyKey(key: string): Promise<ExecutionStep | null>;
  findByRoomId(roomId: UUID): Promise<ExecutionStep[]>;
  updateStatus(id: UUID, status: ExecutionStep['status'], result?: JSONObject, error?: JSONObject): Promise<void>;
  getLastStep(roomId: UUID): Promise<ExecutionStep | null>;
}
