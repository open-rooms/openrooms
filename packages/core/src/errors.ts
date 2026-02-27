/**
 * Domain-specific errors for OpenRooms
 */

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RoomNotFoundError extends DomainError {
  constructor(roomId: string) {
    super(`Room not found: ${roomId}`, 'ROOM_NOT_FOUND', { roomId });
  }
}

export class WorkflowNotFoundError extends DomainError {
  constructor(workflowId: string) {
    super(`Workflow not found: ${workflowId}`, 'WORKFLOW_NOT_FOUND', { workflowId });
  }
}

export class NodeNotFoundError extends DomainError {
  constructor(nodeId: string) {
    super(`Node not found: ${nodeId}`, 'NODE_NOT_FOUND', { nodeId });
  }
}

export class InvalidStateTransitionError extends DomainError {
  constructor(fromState: string, toState: string) {
    super(
      `Invalid state transition from ${fromState} to ${toState}`,
      'INVALID_STATE_TRANSITION',
      { fromState, toState }
    );
  }
}

export class InvalidWorkflowError extends DomainError {
  constructor(reason: string) {
    super(`Invalid workflow: ${reason}`, 'INVALID_WORKFLOW', { reason });
  }
}

export class ToolNotFoundError extends DomainError {
  constructor(toolId: string) {
    super(`Tool not found: ${toolId}`, 'TOOL_NOT_FOUND', { toolId });
  }
}

export class ToolExecutionError extends DomainError {
  constructor(toolId: string, reason: string) {
    super(`Tool execution failed: ${reason}`, 'TOOL_EXECUTION_ERROR', { toolId, reason });
  }
}

export class LLMProviderError extends DomainError {
  constructor(provider: string, reason: string) {
    super(`LLM provider error (${provider}): ${reason}`, 'LLM_PROVIDER_ERROR', { provider, reason });
  }
}

export class ExecutionTimeoutError extends DomainError {
  constructor(roomId: string, timeout: number) {
    super(`Execution timeout after ${timeout}ms`, 'EXECUTION_TIMEOUT', { roomId, timeout });
  }
}

export class ConcurrencyError extends DomainError {
  constructor(roomId: string) {
    super(`Room is already being executed: ${roomId}`, 'CONCURRENCY_ERROR', { roomId });
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
  }
}
