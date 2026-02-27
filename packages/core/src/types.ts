/**
 * Core domain types for OpenRooms
 * 
 * This module defines the fundamental types and interfaces that comprise
 * the OpenRooms control plane domain model.
 */

// ============================================================================
// Base Types
// ============================================================================

export type UUID = string;
export type ISO8601DateTime = string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject { [key: string]: JSONValue }
export interface JSONArray extends Array<JSONValue> {}

// ============================================================================
// Room - Stateful Execution Environment
// ============================================================================

export enum RoomStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface RoomConfig {
  maxExecutionTime?: number; // milliseconds
  maxTokens?: number;
  temperature?: number;
  enableLogging?: boolean;
  enableMemory?: boolean;
}

export interface Room {
  id: UUID;
  name: string;
  description?: string;
  status: RoomStatus;
  workflowId: UUID;
  currentNodeId?: UUID;
  config: RoomConfig;
  metadata: JSONObject;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  startedAt?: ISO8601DateTime;
  completedAt?: ISO8601DateTime;
}

// ============================================================================
// Agent - AI Entity
// ============================================================================

export enum AgentProvider {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  CUSTOM = 'CUSTOM',
}

export interface AgentConfig {
  provider: AgentProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  tools?: string[]; // Tool IDs
  capabilities?: string[];
}

export interface Agent {
  id: UUID;
  roomId: UUID;
  name: string;
  description?: string;
  config: AgentConfig;
  metadata: JSONObject;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// ============================================================================
// Workflow - Deterministic State Machine
// ============================================================================

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface Workflow {
  id: UUID;
  name: string;
  description?: string;
  version: number;
  status: WorkflowStatus;
  initialNodeId: UUID;
  metadata: JSONObject;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// ============================================================================
// WorkflowNode - State in FSM
// ============================================================================

export enum NodeType {
  START = 'START',
  AGENT_TASK = 'AGENT_TASK',
  TOOL_EXECUTION = 'TOOL_EXECUTION',
  DECISION = 'DECISION',
  PARALLEL = 'PARALLEL',
  WAIT = 'WAIT',
  END = 'END',
}

export enum TransitionCondition {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  TIMEOUT = 'TIMEOUT',
  CONDITION_MET = 'CONDITION_MET',
  ALWAYS = 'ALWAYS',
}

export interface NodeTransition {
  condition: TransitionCondition;
  targetNodeId: UUID;
  conditionExpression?: string; // JSONPath or custom expression
  metadata?: JSONObject;
}

export interface WorkflowNode {
  id: UUID;
  workflowId: UUID;
  type: NodeType;
  name: string;
  description?: string;
  config: JSONObject; // Node-specific configuration
  transitions: NodeTransition[];
  retryPolicy?: RetryPolicy;
  timeout?: number; // milliseconds
  metadata: JSONObject;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMultiplier: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
}

// ============================================================================
// ExecutionLog - Observability
// ============================================================================

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export enum ExecutionEventType {
  ROOM_CREATED = 'ROOM_CREATED',
  ROOM_STARTED = 'ROOM_STARTED',
  ROOM_PAUSED = 'ROOM_PAUSED',
  ROOM_RESUMED = 'ROOM_RESUMED',
  ROOM_COMPLETED = 'ROOM_COMPLETED',
  ROOM_FAILED = 'ROOM_FAILED',
  NODE_ENTERED = 'NODE_ENTERED',
  NODE_EXECUTED = 'NODE_EXECUTED',
  NODE_EXITED = 'NODE_EXITED',
  NODE_FAILED = 'NODE_FAILED',
  TOOL_INVOKED = 'TOOL_INVOKED',
  TOOL_COMPLETED = 'TOOL_COMPLETED',
  TOOL_FAILED = 'TOOL_FAILED',
  AGENT_INVOKED = 'AGENT_INVOKED',
  AGENT_RESPONSE = 'AGENT_RESPONSE',
  AGENT_ERROR = 'AGENT_ERROR',
  TRANSITION = 'TRANSITION',
  STATE_UPDATED = 'STATE_UPDATED',
  MEMORY_UPDATED = 'MEMORY_UPDATED',
}

export interface ExecutionLog {
  id: UUID;
  roomId: UUID;
  workflowId: UUID;
  nodeId?: UUID;
  agentId?: UUID;
  eventType: ExecutionEventType;
  level: LogLevel;
  message: string;
  data?: JSONObject;
  error?: ErrorDetails;
  timestamp: ISO8601DateTime;
  duration?: number; // milliseconds
  metadata: JSONObject;
}

export interface ErrorDetails {
  code: string;
  message: string;
  stack?: string;
  cause?: JSONObject;
}

// ============================================================================
// Memory - Persistent Context
// ============================================================================

export enum MemoryType {
  SHORT_TERM = 'SHORT_TERM', // Cleared after room completion
  LONG_TERM = 'LONG_TERM',   // Persisted across rooms
  SEMANTIC = 'SEMANTIC',     // Vector embeddings
}

export interface MemoryEntry {
  id: UUID;
  roomId: UUID;
  type: MemoryType;
  key: string;
  value: JSONValue;
  embedding?: number[]; // For semantic memory
  ttl?: number; // seconds
  metadata: JSONObject;
  createdAt: ISO8601DateTime;
  expiresAt?: ISO8601DateTime;
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  timestamp: ISO8601DateTime;
}

export interface Memory {
  id: UUID;
  roomId: UUID;
  conversationHistory: ConversationMessage[];
  context: JSONObject;
  entries: MemoryEntry[];
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// ============================================================================
// Tool - Extensible Plugin System
// ============================================================================

export enum ToolCategory {
  COMPUTATION = 'COMPUTATION',
  DATA_ACCESS = 'DATA_ACCESS',
  EXTERNAL_API = 'EXTERNAL_API',
  SYSTEM = 'SYSTEM',
  CUSTOM = 'CUSTOM',
}

export interface ToolParameter {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  default?: JSONValue;
  enum?: JSONValue[];
  schema?: JSONObject; // JSON Schema for complex types
}

export interface ToolDefinition {
  id: UUID;
  name: string;
  description: string;
  category: ToolCategory;
  version: string;
  parameters: ToolParameter[];
  returnType: JSONObject; // JSON Schema
  requiresAuth?: boolean;
  rateLimit?: number; // requests per minute
  timeout?: number; // milliseconds
  metadata: JSONObject;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface ToolCall {
  id: UUID;
  toolId: UUID;
  toolName: string;
  arguments: JSONObject;
  timestamp: ISO8601DateTime;
}

export interface ToolResult {
  callId: UUID;
  success: boolean;
  result?: JSONValue;
  error?: ErrorDetails;
  duration: number; // milliseconds
  timestamp: ISO8601DateTime;
}

export interface ToolExecutionContext {
  roomId: UUID;
  nodeId: UUID;
  agentId?: UUID;
  memory: Memory;
  state: JSONObject;
}

// ============================================================================
// State Management
// ============================================================================

export interface RoomState {
  roomId: UUID;
  currentNodeId: UUID;
  status: RoomStatus;
  variables: JSONObject;
  executionStack: UUID[]; // Node execution stack for nested states
  attempts: Map<UUID, number>; // Retry attempts per node
  startTime: ISO8601DateTime;
  lastUpdateTime: ISO8601DateTime;
}

// ============================================================================
// LLM Provider Abstraction
// ============================================================================

export interface LLMRequest {
  model: string;
  messages: ConversationMessage[];
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  stream?: boolean;
}

export interface LLMResponse {
  id: string;
  model: string;
  message: ConversationMessage;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error';
}

export interface LLMProvider {
  name: string;
  type: AgentProvider;
  chat(request: LLMRequest): Promise<LLMResponse>;
  validateConfig(config: AgentConfig): boolean;
}

// ============================================================================
// Result Types
// ============================================================================

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// ============================================================================
// Events for Event-Driven Architecture
// ============================================================================

export interface DomainEvent<T = JSONObject> {
  id: UUID;
  type: string;
  aggregateId: UUID;
  aggregateType: 'Room' | 'Workflow' | 'Agent' | 'Memory';
  payload: T;
  timestamp: ISO8601DateTime;
  version: number;
}
