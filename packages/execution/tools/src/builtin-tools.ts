/**
 * Built-in Tools
 */

import {
  BaseToolExecutor,
} from './registry';
import {
  ToolDefinition,
  ToolCategory,
  ToolParameter,
  Result,
  JSONObject,
  ToolExecutionContext,
  UUID,
} from '@openrooms/core';

// ============================================================================
// Calculator Tool
// ============================================================================

export class CalculatorToolExecutor extends BaseToolExecutor {
  protected validateArgs(args: JSONObject): void {
    this.requireParam(args, 'expression', 'string');
  }

  async execute(
    args: JSONObject,
    context: ToolExecutionContext
  ): Promise<Result<JSONObject>> {
    try {
      const expression = args.expression as string;
      
      // Simple arithmetic evaluation (in production, use a safe math parser)
      const result = this.evaluateExpression(expression);

      return {
        success: true,
        data: { result },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private evaluateExpression(expr: string): number {
    // Basic implementation - use math.js or similar in production
    const sanitized = expr.replace(/[^0-9+\-*/().]/g, '');
    // eslint-disable-next-line no-new-func
    return new Function(`return ${sanitized}`)() as number;
  }
}

export const CalculatorToolDefinition: ToolDefinition = {
  id: '00000000-0000-0000-0000-000000000001' as UUID,
  name: 'calculator',
  description: 'Performs arithmetic calculations',
  category: ToolCategory.COMPUTATION,
  version: '1.0.0',
  parameters: [
    {
      name: 'expression',
      description: 'Mathematical expression to evaluate',
      type: 'string',
      required: true,
    },
  ],
  returnType: {
    type: 'object',
    properties: {
      result: { type: 'number' },
    },
  },
  timeout: 5000,
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================================================
// HTTP Request Tool
// ============================================================================

export class HttpRequestToolExecutor extends BaseToolExecutor {
  protected validateArgs(args: JSONObject): void {
    this.requireParam(args, 'url', 'string');
    this.requireParam(args, 'method', 'string');
  }

  async execute(
    args: JSONObject,
    context: ToolExecutionContext
  ): Promise<Result<JSONObject>> {
    try {
      const url = args.url as string;
      const method = (args.method as string).toUpperCase();
      const headers = (args.headers as JSONObject) ?? {};
      const body = args.body;

      const response = await fetch(url, {
        method,
        headers: headers as HeadersInit,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.text();
      let parsedData: unknown;
      
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }

      return {
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: parsedData,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export const HttpRequestToolDefinition: ToolDefinition = {
  id: '00000000-0000-0000-0000-000000000002' as UUID,
  name: 'http_request',
  description: 'Makes HTTP requests to external APIs',
  category: ToolCategory.EXTERNAL_API,
  version: '1.0.0',
  parameters: [
    {
      name: 'url',
      description: 'URL to request',
      type: 'string',
      required: true,
    },
    {
      name: 'method',
      description: 'HTTP method',
      type: 'string',
      required: true,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    {
      name: 'headers',
      description: 'Request headers',
      type: 'object',
      required: false,
    },
    {
      name: 'body',
      description: 'Request body',
      type: 'object',
      required: false,
    },
  ],
  returnType: {
    type: 'object',
    properties: {
      status: { type: 'number' },
      statusText: { type: 'string' },
      headers: { type: 'object' },
      data: {},
    },
  },
  timeout: 30000,
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================================================
// Memory Query Tool
// ============================================================================

export class MemoryQueryToolExecutor extends BaseToolExecutor {
  protected validateArgs(args: JSONObject): void {
    this.requireParam(args, 'query', 'string');
  }

  async execute(
    args: JSONObject,
    context: ToolExecutionContext
  ): Promise<Result<JSONObject>> {
    try {
      const query = args.query as string;
      const memory = context.memory;

      // Simple keyword search in conversation history
      const results = memory.conversationHistory.filter((msg) => {
        const content = typeof msg === 'object' && msg !== null && 'content' in msg 
          ? String(msg.content)
          : '';
        return content.toLowerCase().includes(query.toLowerCase());
      });

      return {
        success: true,
        data: {
          results,
          count: results.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export const MemoryQueryToolDefinition: ToolDefinition = {
  id: '00000000-0000-0000-0000-000000000003' as UUID,
  name: 'memory_query',
  description: 'Queries the room memory for relevant information',
  category: ToolCategory.SYSTEM,
  version: '1.0.0',
  parameters: [
    {
      name: 'query',
      description: 'Search query',
      type: 'string',
      required: true,
    },
  ],
  returnType: {
    type: 'object',
    properties: {
      results: { type: 'array' },
      count: { type: 'number' },
    },
  },
  timeout: 5000,
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Export all built-in tools
export const BUILTIN_TOOLS = [
  { definition: CalculatorToolDefinition, executor: new CalculatorToolExecutor() },
  { definition: HttpRequestToolDefinition, executor: new HttpRequestToolExecutor() },
  { definition: MemoryQueryToolDefinition, executor: new MemoryQueryToolExecutor() },
];
