/**
 * Trace Logger - Agent Reasoning Observability
 * 
 * Logs full agent execution traces including:
 * - Model prompts and responses
 * - Tool selection rationale
 * - State changes
 * - Performance metrics
 */

import type {
  AgentExecutionTrace,
  AgentLoopState,
  ExecutionEventType,
  UUID,
  JSONObject,
} from '@openrooms/core';

export interface TraceLoggerImpl {
  logEvent(event: EventLogParams): Promise<void>;
  logTrace(trace: Partial<AgentExecutionTrace>): Promise<void>;
  logError(event: ErrorLogParams): Promise<void>;
}

export interface EventLogParams {
  agentId: UUID;
  roomId: UUID;
  eventType: ExecutionEventType;
  message: string;
  metadata?: JSONObject;
}

export interface ErrorLogParams {
  agentId: UUID;
  roomId: UUID;
  eventType: ExecutionEventType;
  error: Error;
}

/**
 * PostgreSQL Trace Logger Implementation
 */
export class PostgreSQLTraceLogger implements TraceLoggerImpl {
  constructor(
    private readonly db: any, // Kysely DB instance
    private readonly executionLogWriter: ExecutionLogWriter
  ) {}

  /**
   * Log agent event to execution_logs
   */
  async logEvent(event: EventLogParams): Promise<void> {
    await this.executionLogWriter.write({
      id: crypto.randomUUID(),
      roomId: event.roomId,
      workflowId: event.roomId, // For agent loops, workflowId = roomId
      agentId: event.agentId,
      eventType: event.eventType,
      level: 'INFO',
      message: event.message,
      data: event.metadata,
      timestamp: new Date().toISOString(),
      metadata: {},
    });
  }

  /**
   * Log full agent execution trace
   */
  async logTrace(trace: Partial<AgentExecutionTrace>): Promise<void> {
    if (!trace.agentId || !trace.roomId) {
      throw new Error('agentId and roomId are required for trace logging');
    }

    const traceId = trace.id || crypto.randomUUID();

    await this.db
      .insertInto('agent_execution_traces')
      .values({
        id: traceId,
        agentId: trace.agentId,
        roomId: trace.roomId,
        executionLogId: trace.executionLogId || null,
        loopIteration: trace.loopIteration || 0,
        loopState: trace.loopState || 'IDLE',
        modelPrompt: trace.modelPrompt || null,
        modelResponse: trace.modelResponse || null,
        modelName: trace.modelName || null,
        temperature: trace.temperature || null,
        maxTokens: trace.maxTokens || null,
        selectedTool: trace.selectedTool || null,
        toolRationale: trace.toolRationale || null,
        toolInput: trace.toolInput ? JSON.stringify(trace.toolInput) : null,
        toolOutput: trace.toolOutput ? JSON.stringify(trace.toolOutput) : null,
        toolError: trace.toolError ? JSON.stringify(trace.toolError) : null,
        stateBefore: trace.stateBefore ? JSON.stringify(trace.stateBefore) : null,
        stateAfter: trace.stateAfter ? JSON.stringify(trace.stateAfter) : null,
        stateDiff: trace.stateDiff ? this.computeStateDiff(trace.stateBefore, trace.stateAfter) : null,
        durationMs: trace.durationMs || null,
        timestamp: trace.timestamp || new Date().toISOString(),
        metadata: JSON.stringify(trace.metadata || {}),
      })
      .execute();
  }

  /**
   * Log error event
   */
  async logError(event: ErrorLogParams): Promise<void> {
    await this.executionLogWriter.write({
      id: crypto.randomUUID(),
      roomId: event.roomId,
      workflowId: event.roomId,
      agentId: event.agentId,
      eventType: event.eventType,
      level: 'ERROR',
      message: event.error.message,
      error: {
        code: 'AGENT_ERROR',
        message: event.error.message,
        stack: event.error.stack,
      },
      timestamp: new Date().toISOString(),
      metadata: {},
    });
  }

  /**
   * Compute state diff for observability
   */
  private computeStateDiff(
    stateBefore?: JSONObject,
    stateAfter?: JSONObject
  ): string | null {
    if (!stateBefore || !stateAfter) {
      return null;
    }

    const diff: JSONObject = {};
    
    // Find added/changed keys
    for (const key in stateAfter) {
      if (JSON.stringify(stateBefore[key]) !== JSON.stringify(stateAfter[key])) {
        diff[key] = {
          before: stateBefore[key],
          after: stateAfter[key],
        };
      }
    }

    // Find removed keys
    for (const key in stateBefore) {
      if (!(key in stateAfter)) {
        diff[key] = {
          before: stateBefore[key],
          after: undefined,
        };
      }
    }

    return Object.keys(diff).length > 0 ? JSON.stringify(diff) : null;
  }
}

/**
 * Execution Log Writer Interface
 */
export interface ExecutionLogWriter {
  write(log: {
    id: UUID;
    roomId: UUID;
    workflowId: UUID;
    agentId?: UUID;
    eventType: ExecutionEventType;
    level: string;
    message: string;
    data?: JSONObject;
    error?: {
      code: string;
      message: string;
      stack?: string;
    };
    timestamp: string;
    metadata: JSONObject;
  }): Promise<void>;
}

/**
 * PostgreSQL Execution Log Writer
 */
export class PostgreSQLExecutionLogWriter implements ExecutionLogWriter {
  constructor(private readonly db: any) {}

  async write(log: Parameters<ExecutionLogWriter['write']>[0]): Promise<void> {
    await this.db
      .insertInto('execution_logs')
      .values({
        id: log.id,
        roomId: log.roomId,
        workflowId: log.workflowId,
        agentId: log.agentId || null,
        eventType: log.eventType,
        level: log.level,
        message: log.message,
        data: log.data ? JSON.stringify(log.data) : null,
        error: log.error ? JSON.stringify(log.error) : null,
        timestamp: log.timestamp,
        metadata: JSON.stringify(log.metadata),
      })
      .execute();
  }
}

/**
 * In-Memory Trace Logger (for testing)
 */
export class InMemoryTraceLogger implements TraceLoggerImpl {
  private events: EventLogParams[] = [];
  private traces: Partial<AgentExecutionTrace>[] = [];
  private errors: ErrorLogParams[] = [];

  async logEvent(event: EventLogParams): Promise<void> {
    this.events.push(event);
  }

  async logTrace(trace: Partial<AgentExecutionTrace>): Promise<void> {
    this.traces.push(trace);
  }

  async logError(event: ErrorLogParams): Promise<void> {
    this.errors.push(event);
  }

  getEvents(): EventLogParams[] {
    return this.events;
  }

  getTraces(): Partial<AgentExecutionTrace>[] {
    return this.traces;
  }

  getErrors(): ErrorLogParams[] {
    return this.errors;
  }

  clear(): void {
    this.events = [];
    this.traces = [];
    this.errors = [];
  }
}
