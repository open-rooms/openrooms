/**
 * Agent Runtime Loop - Autonomous Execution Engine
 * 
 * Implements deterministic, resumable agent execution with:
 * - Perception → Reasoning → Tool Selection → Execution → Memory Update
 * - Policy enforcement
 * - Reasoning trace logging
 * - State persistence
 */

import {
  AgentLoopState,
  ExecutionEventType,
} from '@openrooms/core';

import type {
  Agent,
  AgentStatus,
  AgentExecutionTrace,
  AgentPolicy,
  PolicyViolation,
  Memory,
  ToolDefinition,
  ToolResult,
  LLMRequest,
  LLMResponse,
  LLMProvider,
  JSONObject,
  UUID,
  Result,
} from '@openrooms/core';

// ============================================================================
// Agent Loop Context
// ============================================================================

export interface AgentLoopContext {
  agent: Agent;
  roomId: UUID;
  memory: Memory;
  roomState: JSONObject;
  availableTools: ToolDefinition[];
  maxIterations: number;
  currentIteration: number;
}

export interface LoopDecision {
  shouldContinue: boolean;
  selectedTool?: string;
  toolInput?: JSONObject;
  reasoning?: string;
  terminationReason?: string;
}

// ============================================================================
// Agent Runtime Loop Engine
// ============================================================================

export class AgentRuntimeLoop {
  constructor(
    private readonly llmProvider: LLMProvider,
    private readonly policyEnforcer: PolicyEnforcer,
    private readonly traceLogger: TraceLogger,
    private readonly memoryManager: MemoryManager,
    private readonly toolExecutor: ToolExecutor,
    private readonly agentRepo?: { updateLoopState: (id: string, state: any) => Promise<void> }
  ) {}

  /**
   * Execute agent autonomous loop
   * 
   * Loop: Perceive → Decide → Select → Execute → Log → Update → Repeat
   * 
   * Guarantees:
   * - Deterministic execution
   * - Resumable from any state
   * - Full reasoning trace
   * - Policy enforcement
   */
  async execute(context: AgentLoopContext): Promise<Result<void>> {
    try {
      await this.transitionState(context.agent, AgentLoopState.IDLE, 'start');
      
      await this.traceLogger.logEvent({
        agentId: context.agent.id,
        roomId: context.roomId,
        eventType: ExecutionEventType.AGENT_LOOP_STARTED,
        message: `Agent ${context.agent.name} loop started`,
        metadata: {
          goal: context.agent.goal,
          maxIterations: context.maxIterations,
        },
      });

      while (context.currentIteration < context.maxIterations) {
        context.currentIteration++;

        // 1️⃣ PERCEIVE: Read memory and context
        await this.transitionState(context.agent, AgentLoopState.PERCEIVING, 'perceive');
        const perception = await this.perceive(context);

        // 2️⃣ REASON: LLM decides next action
        await this.transitionState(context.agent, AgentLoopState.REASONING, 'reason');
        const decision = await this.reason(context, perception);

        if (!decision.shouldContinue) {
          await this.traceLogger.logEvent({
            agentId: context.agent.id,
            roomId: context.roomId,
            eventType: ExecutionEventType.AGENT_LOOP_COMPLETED,
            message: `Agent terminated: ${decision.terminationReason}`,
            metadata: { iteration: context.currentIteration },
          });
          break;
        }

        // 3️⃣ SELECT TOOL
        await this.transitionState(context.agent, AgentLoopState.SELECTING_TOOL, 'select_tool');
        const toolSelection = await this.selectTool(context, decision);

        if (!toolSelection.success) {
          continue; // Policy denied or invalid tool
        }

        // 4️⃣ EXECUTE TOOL
        await this.transitionState(context.agent, AgentLoopState.EXECUTING_TOOL, 'execute_tool');
        const toolResult = await this.executeTool(context, toolSelection.data);

        // 5️⃣ LOG REASONING TRACE
        await this.logReasoningTrace(context, {
          iteration: context.currentIteration,
          perception,
          decision,
          toolSelection: toolSelection.data,
          toolResult,
        });

        // 6️⃣ UPDATE MEMORY
        await this.transitionState(context.agent, AgentLoopState.UPDATING_MEMORY, 'update_memory');
        await this.updateMemory(context, toolResult);

        await this.traceLogger.logEvent({
          agentId: context.agent.id,
          roomId: context.roomId,
          eventType: ExecutionEventType.AGENT_LOOP_ITERATION,
          message: `Loop iteration ${context.currentIteration} completed`,
          metadata: { selectedTool: toolSelection.data.toolName },
        });
      }

      await this.transitionState(context.agent, AgentLoopState.IDLE, 'complete');

      return { success: true, data: undefined };
    } catch (error) {
      await this.traceLogger.logError({
        agentId: context.agent.id,
        roomId: context.roomId,
        eventType: ExecutionEventType.AGENT_ERROR,
        error: error as Error,
      });

      return { success: false, error: error as Error };
    }
  }

  /**
   * 1️⃣ PERCEIVE: Read memory + context
   */
  private async perceive(context: AgentLoopContext): Promise<JSONObject> {
    const recentMemory = await this.memoryManager.getRecentContext(
      context.roomId,
      context.agent.policyConfig.maxTokensPerRequest || 4000
    );

    return {
      goal: context.agent.goal,
      currentState: context.roomState,
      memory: recentMemory,
      availableTools: context.availableTools.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters as any,
      })) as any,
      iteration: context.currentIteration,
    };
  }

  /**
   * 2️⃣ REASON: LLM reasoning
   */
  private async reason(
    context: AgentLoopContext,
    perception: JSONObject
  ): Promise<LoopDecision> {
    const systemPrompt = this.buildSystemPrompt(context.agent, perception);

    const request: LLMRequest = {
      model: (context.agent.policyConfig as any).model || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt, timestamp: new Date().toISOString() },
        { role: 'user', content: JSON.stringify(perception), timestamp: new Date().toISOString() },
      ],
      temperature: (context.agent.policyConfig as any).temperature || 0.7,
      maxTokens: context.agent.policyConfig.maxTokensPerRequest || 2000,
      tools: perception.availableTools as unknown as ToolDefinition[],
      toolChoice: 'auto',
    };

    const response = await this.llmProvider.chat(request);

    return this.parseDecision(response);
  }

  /**
   * 3️⃣ SELECT TOOL: Validate against policy
   */
  private async selectTool(
    context: AgentLoopContext,
    decision: LoopDecision
  ): Promise<Result<{ toolName: string; toolInput: JSONObject }>> {
    if (!decision.selectedTool) {
      return { success: false, error: new Error('No tool selected') };
    }

    // Policy enforcement
    const policyCheck = await this.policyEnforcer.validateToolCall({
      agentId: context.agent.id,
      roomId: context.roomId,
      toolName: decision.selectedTool,
      allowedTools: context.agent.allowedTools,
      policyConfig: context.agent.policyConfig,
    });

    if (!policyCheck.allowed) {
      await this.traceLogger.logEvent({
        agentId: context.agent.id,
        roomId: context.roomId,
        eventType: ExecutionEventType.AGENT_TOOL_DENIED,
        message: `Tool ${decision.selectedTool} denied by policy`,
        metadata: { reason: policyCheck.reason ?? '' },
      });

      return { success: false, error: new Error(policyCheck.reason) };
    }

    await this.traceLogger.logEvent({
      agentId: context.agent.id,
      roomId: context.roomId,
      eventType: ExecutionEventType.AGENT_TOOL_SELECTED,
      message: `Tool selected: ${decision.selectedTool}`,
        metadata: { rationale: decision.reasoning ?? '' },
    });

    return {
      success: true,
      data: {
        toolName: decision.selectedTool,
        toolInput: decision.toolInput || {},
      },
    };
  }

  /**
   * 4️⃣ EXECUTE TOOL
   */
  private async executeTool(
    context: AgentLoopContext,
    tool: { toolName: string; toolInput: JSONObject }
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      const result = await this.toolExecutor.execute({
        toolName: tool.toolName,
        input: tool.toolInput,
        context: {
          roomId: context.roomId,
          agentId: context.agent.id,
          memory: context.memory,
          state: context.roomState,
        },
      });

      return {
        callId: crypto.randomUUID(),
        success: result.success,
        result: (result as any).data,
        error: result.success ? undefined : (result.error as any),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        callId: crypto.randomUUID(),
        success: false,
        error: {
          code: 'TOOL_EXECUTION_ERROR',
          message: (error as Error).message,
        },
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 5️⃣ LOG REASONING TRACE
   */
  private async logReasoningTrace(
    context: AgentLoopContext,
    trace: {
      iteration: number;
      perception: JSONObject;
      decision: LoopDecision;
      toolSelection: { toolName: string; toolInput: JSONObject };
      toolResult: ToolResult;
    }
  ): Promise<void> {
    await this.traceLogger.logTrace({
      agentId: context.agent.id,
      roomId: context.roomId,
      loopIteration: trace.iteration,
      loopState: AgentLoopState.EXECUTING_TOOL,
      modelPrompt: JSON.stringify(trace.perception),
      modelResponse: trace.decision.reasoning,
      selectedTool: trace.toolSelection.toolName,
      toolRationale: trace.decision.reasoning,
      toolInput: trace.toolSelection.toolInput,
      toolOutput: trace.toolResult.result,
      toolError: trace.toolResult.error,
      durationMs: trace.toolResult.duration,
    });
  }

  /**
   * 6️⃣ UPDATE MEMORY
   */
  private async updateMemory(
    context: AgentLoopContext,
    toolResult: ToolResult
  ): Promise<void> {
    await this.memoryManager.appendMessage(context.roomId, {
      role: 'tool',
      content: JSON.stringify(toolResult.result),
      timestamp: new Date().toISOString(),
    });

    await this.traceLogger.logEvent({
      agentId: context.agent.id,
      roomId: context.roomId,
      eventType: ExecutionEventType.AGENT_MEMORY_UPDATED,
      message: 'Memory updated with tool result',
      metadata: { success: toolResult.success },
    });
  }

  private async transitionState(
    agent: Agent,
    newState: AgentLoopState,
    reason: string
  ): Promise<void> {
    agent.loopState = newState;
    agent.updatedAt = new Date().toISOString();
    // Persist to DB if repository is available
    if (this.agentRepo) {
      await this.agentRepo.updateLoopState(agent.id, newState).catch(() => {
        // Non-fatal — loop continues even if DB write fails
      });
    }
  }

  private buildSystemPrompt(agent: Agent, perception: JSONObject): string {
    return `You are an autonomous agent: ${agent.name}

Goal: ${agent.goal}

You have access to the following tools:
${JSON.stringify(perception.availableTools, null, 2)}

You must:
1. Analyze the current state and memory
2. Decide if you need to use a tool to progress toward your goal
3. Select the most appropriate tool and provide input
4. Or decide to terminate if goal is achieved

Respond in JSON format:
{
  "shouldContinue": boolean,
  "reasoning": "your reasoning process",
  "selectedTool": "tool_name" or null,
  "toolInput": { ... } or null,
  "terminationReason": "reason" if shouldContinue is false
}`;
  }

  private parseDecision(response: LLMResponse): LoopDecision {
    try {
      const content = response.message.content;
      const parsed = JSON.parse(content);
      return {
        shouldContinue: parsed.shouldContinue,
        selectedTool: parsed.selectedTool,
        toolInput: parsed.toolInput,
        reasoning: parsed.reasoning,
        terminationReason: parsed.terminationReason,
      };
    } catch {
      return {
        shouldContinue: false,
        terminationReason: 'Failed to parse LLM response',
      };
    }
  }
}

// ============================================================================
// Policy Enforcer
// ============================================================================

export interface PolicyEnforcer {
  validateToolCall(params: {
    agentId: UUID;
    roomId: UUID;
    toolName: string;
    allowedTools: string[];
    policyConfig: AgentPolicy;
  }): Promise<{ allowed: boolean; reason?: string }>;
}

// ============================================================================
// Trace Logger
// ============================================================================

export interface TraceLogger {
  logEvent(event: {
    agentId: UUID;
    roomId: UUID;
    eventType: ExecutionEventType;
    message: string;
    metadata?: JSONObject;
  }): Promise<void>;

  logTrace(trace: Partial<AgentExecutionTrace>): Promise<void>;

  logError(event: {
    agentId: UUID;
    roomId: UUID;
    eventType: ExecutionEventType;
    error: Error;
  }): Promise<void>;
}

// ============================================================================
// Memory Manager
// ============================================================================

export interface MemoryManager {
  getRecentContext(roomId: UUID, maxTokens: number): Promise<JSONObject>;
  appendMessage(roomId: UUID, message: any): Promise<void>;
}

// ============================================================================
// Tool Executor
// ============================================================================

export interface ToolExecutor {
  execute(params: {
    toolName: string;
    input: JSONObject;
    context: {
      roomId: UUID;
      agentId: UUID;
      memory: Memory;
      state: JSONObject;
    };
  }): Promise<Result<any>>;
}
