/**
 * Workflow Execution Engine
 * 
 * Implements deterministic finite state machine execution for Rooms
 */

import {
  WorkflowEngine,
  StateManager,
  RoomRepository,
  WorkflowRepository,
  LoggingService,
  UUID,
  Result,
  RoomStatus,
  RoomState,
  WorkflowNode,
  NodeType,
  TransitionCondition,
  NodeTransition,
  ExecutionEventType,
  LogLevel,
  ConcurrencyError,
  RoomNotFoundError,
  NodeNotFoundError,
  InvalidStateTransitionError,
  ExecutionTimeoutError,
} from '@openrooms/core';

export interface ExecutionEngineConfig {
  maxExecutionTime: number;
  lockTimeout: number;
}

export class WorkflowExecutionEngine implements WorkflowEngine {
  constructor(
    private readonly stateManager: StateManager,
    private readonly roomRepository: RoomRepository,
    private readonly workflowRepository: WorkflowRepository,
    private readonly loggingService: LoggingService,
    private readonly nodeExecutors: Map<NodeType, NodeExecutor>,
    private readonly config: ExecutionEngineConfig
  ) {}

  async executeRoom(roomId: UUID): Promise<Result<void>> {
    try {
      // Acquire lock to prevent concurrent execution
      const lockAcquired = await this.stateManager.acquireLock(
        roomId,
        this.config.lockTimeout
      );

      if (!lockAcquired) {
        return {
          success: false,
          error: new ConcurrencyError(roomId),
        };
      }

      try {
        // Load room
        const room = await this.roomRepository.findById(roomId);
        if (!room) {
          return { success: false, error: new RoomNotFoundError(roomId) };
        }

        // Validate room can be executed
        if (room.status === RoomStatus.RUNNING) {
          return { success: false, error: new ConcurrencyError(roomId) };
        }

        // Initialize or restore state
        let state = await this.stateManager.getState(roomId);
        
        if (!state) {
          // Initialize new state
          const workflow = await this.workflowRepository.findById(room.workflowId);
          if (!workflow) {
            return { success: false, error: new Error(`Workflow not found: ${room.workflowId}`) };
          }

          state = {
            roomId,
            currentNodeId: workflow.initialNodeId,
            status: RoomStatus.RUNNING,
            variables: {},
            executionStack: [],
            attempts: new Map(),
            startTime: new Date().toISOString(),
            lastUpdateTime: new Date().toISOString(),
          };

          await this.stateManager.setState(roomId, state);
        }

        // Update room status
        await this.roomRepository.updateStatus(roomId, RoomStatus.RUNNING);
        await this.log(roomId, ExecutionEventType.ROOM_STARTED, 'Room execution started', {});

        // Execute workflow
        const result = await this.executeWorkflow(roomId, state);

        if (result.success) {
          await this.roomRepository.updateStatus(roomId, RoomStatus.COMPLETED);
          await this.log(roomId, ExecutionEventType.ROOM_COMPLETED, 'Room execution completed', {});
          await this.stateManager.deleteState(roomId);
        } else {
          await this.roomRepository.updateStatus(roomId, RoomStatus.FAILED);
          await this.log(roomId, ExecutionEventType.ROOM_FAILED, 'Room execution failed', {
            error: result.error.message,
          }, LogLevel.ERROR);
        }

        return result;
      } finally {
        await this.stateManager.releaseLock(roomId);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async executeNode(roomId: UUID, nodeId: UUID): Promise<Result<void>> {
    try {
      const room = await this.roomRepository.findById(roomId);
      if (!room) {
        return { success: false, error: new RoomNotFoundError(roomId) };
      }

      const node = await this.workflowRepository.getNode(nodeId);
      if (!node) {
        return { success: false, error: new NodeNotFoundError(nodeId) };
      }

      await this.log(roomId, ExecutionEventType.NODE_ENTERED, `Entering node: ${node.name}`, {
        nodeId,
        nodeType: node.type,
      });

      const executor = this.nodeExecutors.get(node.type);
      if (!executor) {
        return {
          success: false,
          error: new Error(`No executor found for node type: ${node.type}`),
        };
      }

      const context: NodeExecutionContext = {
        roomId,
        node,
        workflowId: room.workflowId,
      };

      const startTime = Date.now();
      const result = await executor.execute(context);
      const duration = Date.now() - startTime;

      if (result.success) {
        await this.log(roomId, ExecutionEventType.NODE_EXECUTED, `Node executed successfully: ${node.name}`, {
          nodeId,
          duration,
          output: result.data,
        });
      } else {
        await this.log(roomId, ExecutionEventType.NODE_FAILED, `Node execution failed: ${node.name}`, {
          nodeId,
          duration,
          error: result.error.message,
        }, LogLevel.ERROR);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async transition(roomId: UUID, fromNodeId: UUID, toNodeId: UUID): Promise<Result<void>> {
    try {
      const state = await this.stateManager.getState(roomId);
      if (!state) {
        return { success: false, error: new Error(`State not found for room ${roomId}`) };
      }

      if (state.currentNodeId !== fromNodeId) {
        return {
          success: false,
          error: new InvalidStateTransitionError(state.currentNodeId, toNodeId),
        };
      }

      await this.stateManager.updateState(roomId, {
        currentNodeId: toNodeId,
      });

      await this.roomRepository.update(roomId, { currentNodeId: toNodeId });

      await this.log(roomId, ExecutionEventType.TRANSITION, 'State transition', {
        from: fromNodeId,
        to: toNodeId,
      });

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async pauseRoom(roomId: UUID): Promise<Result<void>> {
    try {
      await this.roomRepository.updateStatus(roomId, RoomStatus.PAUSED);
      await this.log(roomId, ExecutionEventType.ROOM_PAUSED, 'Room execution paused', {});
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async resumeRoom(roomId: UUID): Promise<Result<void>> {
    try {
      await this.roomRepository.updateStatus(roomId, RoomStatus.RUNNING);
      await this.log(roomId, ExecutionEventType.ROOM_RESUMED, 'Room execution resumed', {});
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async cancelRoom(roomId: UUID): Promise<Result<void>> {
    try {
      await this.roomRepository.updateStatus(roomId, RoomStatus.CANCELLED);
      await this.stateManager.deleteState(roomId);
      await this.log(roomId, ExecutionEventType.ROOM_FAILED, 'Room execution cancelled', {});
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private async executeWorkflow(roomId: UUID, state: RoomState): Promise<Result<void>> {
    const startTime = Date.now();

    while (state.status === RoomStatus.RUNNING) {
      // Check timeout
      if (Date.now() - startTime > this.config.maxExecutionTime) {
        return {
          success: false,
          error: new ExecutionTimeoutError(roomId, this.config.maxExecutionTime),
        };
      }

      const node = await this.workflowRepository.getNode(state.currentNodeId);
      if (!node) {
        return { success: false, error: new NodeNotFoundError(state.currentNodeId) };
      }

      // Handle END node
      if (node.type === NodeType.END) {
        return { success: true, data: undefined };
      }

      // Execute node
      const result = await this.executeNode(roomId, state.currentNodeId);

      if (!result.success) {
        // Handle retry logic
        const shouldRetry = await this.handleRetry(roomId, node, state);
        if (shouldRetry) {
          continue;
        }
        return result;
      }

      // Determine next node
      const nextNodeId = await this.determineNextNode(node, result, state);
      if (!nextNodeId) {
        return { success: false, error: new Error('No valid transition found') };
      }

      // Transition to next node
      const transitionResult = await this.transition(roomId, state.currentNodeId, nextNodeId);
      if (!transitionResult.success) {
        return transitionResult;
      }

      // Refresh state
      const updatedState = await this.stateManager.getState(roomId);
      if (!updatedState) {
        return { success: false, error: new Error('State lost during execution') };
      }
      state = updatedState;
    }

    return { success: true, data: undefined };
  }

  private async determineNextNode(
    node: WorkflowNode,
    executionResult: Result<void>,
    state: RoomState
  ): Promise<UUID | null> {
    const transitions = node.transitions as unknown as NodeTransition[];

    for (const transition of transitions) {
      if (this.evaluateTransition(transition, executionResult, state)) {
        return transition.targetNodeId;
      }
    }

    return null;
  }

  private evaluateTransition(
    transition: NodeTransition,
    executionResult: Result<void>,
    state: RoomState
  ): boolean {
    switch (transition.condition) {
      case TransitionCondition.ALWAYS:
        return true;
      case TransitionCondition.SUCCESS:
        return executionResult.success;
      case TransitionCondition.FAILURE:
        return !executionResult.success;
      case TransitionCondition.CONDITION_MET:
        // Implement custom condition evaluation (e.g., JSONPath)
        return this.evaluateConditionExpression(transition.conditionExpression, state);
      default:
        return false;
    }
  }

  private evaluateConditionExpression(expression: string | undefined, state: RoomState): boolean {
    if (!expression) return false;
    // Simple implementation - can be extended with JSONPath or other expression languages
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('state', `return ${expression}`);
      return Boolean(fn(state.variables));
    } catch {
      return false;
    }
  }

  private async handleRetry(roomId: UUID, node: WorkflowNode, state: RoomState): Promise<boolean> {
    if (!node.retryPolicy) return false;

    const retryPolicy = node.retryPolicy as unknown as { maxAttempts: number; initialDelay: number; backoffMultiplier: number };
    const attempts = state.attempts.get(node.id) ?? 0;

    if (attempts >= retryPolicy.maxAttempts) {
      return false;
    }

    // Update attempts
    state.attempts.set(node.id, attempts + 1);
    await this.stateManager.setState(roomId, state);

    // Calculate backoff delay
    const delay = retryPolicy.initialDelay * Math.pow(retryPolicy.backoffMultiplier, attempts);
    await new Promise((resolve) => setTimeout(resolve, delay));

    await this.log(roomId, ExecutionEventType.NODE_ENTERED, `Retrying node: ${node.name}`, {
      nodeId: node.id,
      attempt: attempts + 1,
      maxAttempts: retryPolicy.maxAttempts,
    });

    return true;
  }

  private async log(
    roomId: UUID,
    eventType: ExecutionEventType,
    message: string,
    data: Record<string, unknown>,
    level: LogLevel = LogLevel.INFO
  ): Promise<void> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) return;

    await this.loggingService.log({
      roomId,
      workflowId: room.workflowId,
      eventType: eventType as string,
      level: level as string,
      message,
      data,
      metadata: {},
    });
  }
}

// Node Executor Interface
export interface NodeExecutionContext {
  roomId: UUID;
  node: WorkflowNode;
  workflowId: UUID;
}

export interface NodeExecutor {
  execute(context: NodeExecutionContext): Promise<Result<void>>;
}
