/**
 * Kysely Database Types
 * Generated from our PostgreSQL schema
 */

import { ColumnType } from 'kysely';
import {
  RoomStatus,
  WorkflowStatus,
  NodeType,
  AgentRole,
  AgentStatus,
  ExecutionLogLevel,
  ExecutionLogEventType,
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
  role: AgentRole;
  status: Generated<AgentStatus>;
  model: string;
  systemPrompt: string | null;
  config: ColumnType<Record<string, any>, string, string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
}

export interface ExecutionLogTable {
  id: Generated<string>;
  roomId: string;
  workflowId: string;
  nodeId: string | null;
  eventType: ExecutionLogEventType;
  level: Generated<ExecutionLogLevel>;
  message: string;
  data: ColumnType<Record<string, any>, string, string>;
  createdAt: Generated<Timestamp>;
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
// Database Interface
// ============================================================================

export interface Database {
  rooms: RoomTable;
  workflows: WorkflowTable;
  workflow_nodes: WorkflowNodeTable;
  agents: AgentTable;
  execution_logs: ExecutionLogTable;
  memories: MemoryTable;
  memory_entries: MemoryEntryTable;
  tools: ToolTable;
}
