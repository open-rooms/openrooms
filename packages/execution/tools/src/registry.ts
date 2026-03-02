/**
 * Tool Registry - Extensible plugin system for agent tools
 */

import {
  ToolRegistry,
  ToolDefinition,
  ToolExecutor,
  ToolCall,
  ToolResult,
  ToolExecutionContext,
  UUID,
  JSONObject,
  ToolNotFoundError,
  ToolExecutionError,
  Result,
} from '@openrooms/core';

export class DefaultToolRegistry implements ToolRegistry {
  private readonly tools: Map<UUID, ToolDefinition> = new Map();
  private readonly executors: Map<UUID, ToolExecutor> = new Map();

  register(tool: ToolDefinition, executor: ToolExecutor): void {
    this.tools.set(tool.id, tool);
    this.executors.set(tool.id, executor);
  }

  unregister(toolId: UUID): void {
    this.tools.delete(toolId);
    this.executors.delete(toolId);
  }

  getTool(toolId: UUID): ToolDefinition | null {
    return this.tools.get(toolId) ?? null;
  }

  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  async execute(call: ToolCall, context: ToolExecutionContext): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      const executor = this.executors.get(call.toolId);
      if (!executor) {
        throw new ToolNotFoundError(call.toolId);
      }

      const tool = this.tools.get(call.toolId);
      if (!tool) {
        throw new ToolNotFoundError(call.toolId);
      }

      // Validate arguments
      const validationResult = executor.validate(call.arguments);
      if (!validationResult.success) {
        throw new ToolExecutionError(
          call.toolId,
          validationResult.error.message
        );
      }

      // Apply timeout if specified
      const timeoutMs = tool.timeout ?? 30000;
      const executionPromise = executor.execute(call.arguments, context);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Tool execution timeout')), timeoutMs);
      });

      const result = await Promise.race([executionPromise, timeoutPromise]);

      const duration = Date.now() - startTime;

      if (result.success) {
        return {
          callId: call.id,
          success: true,
          result: result.data,
          duration,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          callId: call.id,
          success: false,
          error: {
            code: 'TOOL_EXECUTION_ERROR',
            message: result.error.message,
          },
          duration,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        callId: call.id,
        success: false,
        error: {
          code: 'TOOL_EXECUTION_ERROR',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        duration,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

/**
 * Base class for tool executors with common validation logic
 */
export abstract class BaseToolExecutor implements ToolExecutor {
  abstract execute(
    args: JSONObject,
    context: ToolExecutionContext
  ): Promise<Result<JSONObject>>;

  validate(args: JSONObject): Result<void> {
    try {
      this.validateArgs(args);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  protected abstract validateArgs(args: JSONObject): void;

  protected requireParam(args: JSONObject, param: string, type: string): void {
    if (!(param in args)) {
      throw new Error(`Missing required parameter: ${param}`);
    }

    const value = args[param];
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (actualType !== type) {
      throw new Error(
        `Invalid type for parameter ${param}: expected ${type}, got ${actualType}`
      );
    }
  }
}
