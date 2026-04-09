/**
 * Tool Executor - Governed Tool Invocation
 * 
 * Executes tools with:
 * - Permission validation
 * - Error handling
 * - Timeout enforcement
 * - Result capturing
 */

import type {
  ToolDefinition,
  ToolResult,
  Memory,
  UUID,
  JSONObject,
  Result,
} from '@openrooms/core';

export interface ToolExecutionParams {
  toolName: string;
  input: JSONObject;
  context: {
    roomId: UUID;
    agentId: UUID;
    memory: Memory;
    state: JSONObject;
  };
}

export interface ToolExecutorImpl {
  execute(params: ToolExecutionParams): Promise<Result<any>>;
}

/**
 * Tool Registry - Manages registered tools
 */
export interface ToolRegistry {
  getTool(name: string): Promise<ToolDefinition | null>;
  invokeTool(name: string, input: JSONObject, context: any): Promise<any>;
}

/**
 * Production Tool Executor with Registry Integration
 */
export class ProductionToolExecutor implements ToolExecutorImpl {
  constructor(
    private readonly toolRegistry: ToolRegistry,
    private readonly timeoutMs: number = 30000
  ) {}

  async execute(params: ToolExecutionParams): Promise<Result<any>> {
    const startTime = Date.now();

    try {
      // 1. Get tool definition
      const tool = await this.toolRegistry.getTool(params.toolName);

      if (!tool) {
        return {
          success: false,
          error: new Error(`Tool "${params.toolName}" not found in registry`),
        };
      }

      // 2. Validate input against tool parameters
      const validationError = this.validateInput(params.input, tool);
      if (validationError) {
        return {
          success: false,
          error: new Error(`Invalid input: ${validationError}`),
        };
      }

      // 3. Execute with timeout
      const result = await this.executeWithTimeout(
        () => this.toolRegistry.invokeTool(params.toolName, params.input, params.context),
        tool.timeout || this.timeoutMs
      );

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: {
          result,
          duration,
          toolName: params.toolName,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Validate input against tool parameter schema
   */
  private validateInput(input: JSONObject, tool: ToolDefinition): string | null {
    for (const param of tool.parameters) {
      if (param.required && !(param.name in input)) {
        return `Missing required parameter: ${param.name}`;
      }

      if (param.name in input) {
        const value = input[param.name];
        const valueType = Array.isArray(value) ? 'array' : typeof value;

        if (param.type !== valueType && valueType !== 'undefined') {
          return `Parameter "${param.name}" expected type ${param.type}, got ${valueType}`;
        }

        // Enum validation
        if (param.enum && !param.enum.includes(value as any)) {
          return `Parameter "${param.name}" must be one of: ${param.enum.join(', ')}`;
        }
      }
    }

    return null;
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Tool execution timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }
}

/**
 * Mock Tool Executor (for testing)
 */
export class MockToolExecutor implements ToolExecutorImpl {
  private mockResponses: Map<string, any> = new Map();

  async execute(params: ToolExecutionParams): Promise<Result<any>> {
    const mockResponse = this.mockResponses.get(params.toolName);

    if (mockResponse instanceof Error) {
      return {
        success: false,
        error: mockResponse,
      };
    }

    return {
      success: true,
      data: mockResponse || { executed: true, tool: params.toolName },
    };
  }

  setMockResponse(toolName: string, response: any): void {
    this.mockResponses.set(toolName, response);
  }

  clear(): void {
    this.mockResponses.clear();
  }
}

/**
 * In-Memory Tool Registry (for testing)
 */
export class InMemoryToolRegistry implements ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private handlers: Map<string, (input: JSONObject, context: any) => Promise<any>> = new Map();

  async getTool(name: string): Promise<ToolDefinition | null> {
    return this.tools.get(name) || null;
  }

  async invokeTool(name: string, input: JSONObject, context: any): Promise<any> {
    const handler = this.handlers.get(name);

    if (!handler) {
      throw new Error(`Tool "${name}" has no handler registered`);
    }

    return handler(input, context);
  }

  registerTool(tool: ToolDefinition, handler: (input: JSONObject, context: any) => Promise<any>): void {
    this.tools.set(tool.name, tool);
    this.handlers.set(tool.name, handler);
  }

  clear(): void {
    this.tools.clear();
    this.handlers.clear();
  }
}
