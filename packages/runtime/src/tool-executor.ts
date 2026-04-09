/**
 * Tool Executor
 *
 * Executes tools registered in the database by their ID.
 * Supports HTTP API, computation, and generic tool types.
 */


import type { Database } from '@openrooms/database';

export interface ToolExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  durationMs: number;
  toolId: string;
  toolName: string;
}

export class ToolExecutor {
  constructor(private readonly db: any) {}

  async executeTool(
    toolId: string,
    params: Record<string, unknown>
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    const tool = await (this.db as any)
      .selectFrom('tools')
      .selectAll()
      .where('id', '=', toolId)
      .executeTakeFirst();

    if (!tool) {
      return {
        success: false,
        error: `Tool ${toolId} not found`,
        durationMs: Date.now() - startTime,
        toolId,
        toolName: 'unknown',
      };
    }

    try {
      const output = await this.dispatch(tool, params);
      return {
        success: true,
        output,
        durationMs: Date.now() - startTime,
        toolId,
        toolName: tool.name,
      };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message,
        durationMs: Date.now() - startTime,
        toolId,
        toolName: tool.name,
      };
    }
  }

  private async dispatch(tool: any, params: Record<string, unknown>): Promise<unknown> {
    const meta =
      typeof tool.metadata === 'string'
        ? JSON.parse(tool.metadata || '{}')
        : tool.metadata ?? {};

    const category = (tool.category as string).toUpperCase();

    if (category === 'HTTP_API' || category === 'EXTERNAL_API') {
      return this.httpTool(meta, params);
    }

    if (category === 'COMPUTATION') {
      const expr = String(params.expression ?? '').replace(/[^0-9+\-*/.() ]/g, '');
      // eslint-disable-next-line no-new-func
      return { result: new Function(`"use strict"; return (${expr})`)() };
    }

    // Generic: echo tool metadata + params back
    return { tool: tool.name, params, meta };
  }

  private async httpTool(
    meta: Record<string, unknown>,
    params: Record<string, unknown>
  ): Promise<unknown> {
    const url = (meta.endpoint ?? params.url ?? '') as string;
    const method = ((meta.method ?? params.method ?? 'GET') as string).toUpperCase();
    const extraHeaders = (meta.headers ?? {}) as Record<string, string>;

    if (!url) throw new Error('HTTP tool missing endpoint / url parameter');

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body:
        method !== 'GET' && params.body
          ? JSON.stringify(params.body)
          : undefined,
    });

    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }

    return { status: res.status, body: data };
  }
}
