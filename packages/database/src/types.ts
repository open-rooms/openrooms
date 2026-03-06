/**
 * Kysely Database Types
 * Generated from our PostgreSQL schema
 */

import { ColumnType } from 'kysely';
import {
  RoomStatus,
  WorkflowStatus,
  NodeType,
  MemoryType,
  ToolCategory,
} from '@openrooms/core';

// Helper for timestamps
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

// ============================================================================
// Table Types
// ============================================================================

export interface RoomTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  status: RoomStatus;
  workflowId: string;
  currentNodeId: string | null;
  config: ColumnType<Record<string, any>, string, string>;
  metadata: ColumnType<Record<string, any>, string, string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
}

export interface WorkflowTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  version: Generated<number>;
  status: Generated<WorkflowStatus>;
  initialNodeId: string;
  metadata: ColumnType<Record<string, any>, string, string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
}

export interface WorkflowNodeTable {
  id: Generated<string>;
  workflowId: string;
  nodeId: string;
  type: NodeType;
  name: string;
  description: string | null;
  config: ColumnType<Record<string, any>, string, string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
}

export interface AgentTable {
  id: Generated<string>;
  roomId: string;
  name: string;
  description: string | null;
  config: ColumnType<Record<string, any>, string, string>;
  metadata: ColumnType<Record<string, any>, string, string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
}

export interface ExecutionLogTable {
  id: Generated<string>;
  roomId: string;
  workflowId: string;
  nodeId: string | null;
  agentId: string | null;
  eventType: string;
  level: string;
  message: string;
  data: ColumnType<Record<string, any>, string, string>;
  error: ColumnType<Record<string, any> | null, string | null, string | null>;
  timestamp: Generated<Timestamp>;
  duration: number | null;
  metadata: ColumnType<Record<string, any>, string, string>;
}

export interface MemoryTable {
  id: Generated<string>;
  roomId: string;
  type: MemoryType;
  config: ColumnType<Record<string, any>, string, string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
}

export interface MemoryEntryTable {
  id: Generated<string>;
  memoryId: string;
  key: string;
  value: ColumnType<Record<string, any>, string, string>;
  embedding: number[];
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
}

export interface ToolTable {
  id: Generated<string>;
  name: string;
  description: string;
  category: ToolCategory;
  version: string;
  parameters: ColumnType<any[], string, string>;
  returnType: ColumnType<Record<string, any>, string, string>;
  timeout: number;
  metadata: ColumnType<Record<string, any>, string, string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
}

// ============================================================================
// Stage 3 Agent Table (first-class primitive with goal/policyConfig)
// ============================================================================

export interface AgentStage3Table {
  id: Generated<string>;
  name: string;
  description: string | null;
  goal: string;
  version: Generated<number>;
  roomId: string | null;
  allowedTools: ColumnType<string[], string, string>;
  policyConfig: ColumnType<Record<string, any>, string, string>;
  status: Generated<string>;
  loopState: Generated<string>;
  memoryState: ColumnType<Record<string, any>, string, string>;
  parentAgentId: string | null;
  snapshotData: ColumnType<Record<string, any> | null, string | null, string | null>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  lastExecutedAt: Timestamp | null;
}

export interface AgentExecutionTraceTable {
  id: Generated<string>;
  agentId: string;
  roomId: string;
  executionLogId: string | null;
  loopIteration: number;
  loopState: string;
  modelPrompt: string | null;
  modelResponse: string | null;
  modelName: string | null;
  temperature: number | null;
  maxTokens: number | null;
  selectedTool: string | null;
  toolRationale: string | null;
  toolInput: ColumnType<Record<string, any> | null, string | null, string | null>;
  toolOutput: ColumnType<Record<string, any> | null, string | null, string | null>;
  toolError: ColumnType<Record<string, any> | null, string | null, string | null>;
  stateBefore: ColumnType<Record<string, any> | null, string | null, string | null>;
  stateAfter: ColumnType<Record<string, any> | null, string | null, string | null>;
  stateDiff: ColumnType<Record<string, any> | null, string | null, string | null>;
  durationMs: number | null;
  timestamp: Generated<Timestamp>;
  metadata: ColumnType<Record<string, any>, string, string>;
}

export interface APIKeyTable {
  id: Generated<string>;
  name: string;
  keyHash: string;
  keyPrefix: string;
  userId: string | null;
  scopes: ColumnType<string[], string, string>;
  rateLimit: Generated<number>;
  rateLimitWindow: Generated<number>;
  isActive: Generated<boolean>;
  expiresAt: Timestamp | null;
  lastUsedAt: Timestamp | null;
  createdAt: Generated<Timestamp>;
  createdBy: string | null;
  metadata: ColumnType<Record<string, any>, string, string>;
}

export interface APIKeyUsageTable {
  id: Generated<string>;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number | null;
  responseTime: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Generated<Timestamp>;
}

export interface PolicyViolationTable {
  id: Generated<string>;
  agentId: string;
  roomId: string;
  violationType: string;
  attemptedTool: string | null;
  policyRule: string;
  denialReason: string;
  severity: string;
  timestamp: Generated<Timestamp>;
  metadata: ColumnType<Record<string, any>, string, string>;
}

// ============================================================================
// Stage 4 — Execution Runtime
// ============================================================================

export interface RunTable {
  id: Generated<string>;
  type: string; // 'agent' | 'workflow'
  targetId: string;
  status: string; // 'pending' | 'running' | 'completed' | 'failed'
  input: ColumnType<Record<string, any>, string, string>;
  output: ColumnType<Record<string, any> | null, string | null, string | null>;
  error: string | null;
  roomId: string | null;
  startedAt: Timestamp | null;
  endedAt: Timestamp | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
}

// ============================================================================
// Database Interface
// ============================================================================

export interface Database {
  rooms: RoomTable;
  workflows: WorkflowTable;
  workflow_nodes: WorkflowNodeTable;
  agents: AgentStage3Table;
  execution_logs: ExecutionLogTable;
  memories: MemoryTable;
  memory_entries: MemoryEntryTable;
  tools: ToolTable;
  // Stage 3
  agent_execution_traces: AgentExecutionTraceTable;
  api_keys: APIKeyTable;
  api_key_usage: APIKeyUsageTable;
  policy_violations: PolicyViolationTable;
  // Stage 4
  runs: RunTable;
}
