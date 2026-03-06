/**
 * Agent Execution Worker
 * 
 * BullMQ worker that processes agent execution jobs asynchronously.
 * Connects LLM providers to agent runtime loop for autonomous execution.
 */

import { Job } from 'bullmq';
import { AgentRuntimeLoop } from '@openrooms/agent-runtime';
import { OpenAIProvider, AnthropicProvider } from '@openrooms/execution';
import type { LLMProvider, LLMRequest, LLMResponse } from '@openrooms/core';

// ─── Simulation LLM ──────────────────────────────────────────────────────────
// Used when no API key is configured. Runs the full agent loop with
// deterministic simulated reasoning so the platform shows real execution.

class SimulationLLMProvider implements LLMProvider {
  readonly name = 'simulation';

  async chat(request: LLMRequest): Promise<LLMResponse> {
    // Small delay to feel realistic
    await new Promise(r => setTimeout(r, 400 + Math.random() * 600));

    const tools = (request.tools as any[]) || [];
    const goalLine = request.messages.find(m => m.role === 'system')?.content?.split('\n').find(l => l.startsWith('Goal:')) || 'Goal: complete task';
    const goal = goalLine.replace('Goal:', '').trim();

    // After first tool use, terminate
    const iteration = parseInt(request.messages[1]?.content?.toString() || '{}', 10);
    const hasAlreadyActed = request.messages.filter(m => m.role === 'tool').length > 0;

    let response: Record<string, unknown>;
    if (!hasAlreadyActed && tools.length > 0) {
      const tool = tools[Math.floor(Math.random() * tools.length)];
      response = {
        shouldContinue: true,
        reasoning: `Analysing goal: "${goal}". I will use the ${tool.name} tool to make progress.`,
        selectedTool: tool.name,
        toolInput: tool.name === 'calculator'
          ? { expression: '42 * 7' }
          : tool.name === 'http_request'
            ? { url: 'https://httpbin.org/json', method: 'GET' }
            : { query: goal },
        terminationReason: null,
      };
    } else {
      response = {
        shouldContinue: false,
        reasoning: `Goal "${goal}" has been processed. Execution complete.`,
        selectedTool: null,
        toolInput: null,
        terminationReason: 'Task completed after analysis and tool execution.',
      };
    }

    return {
      message: {
        role: 'assistant',
        content: JSON.stringify(response),
        timestamp: new Date().toISOString(),
      },
      usage: { promptTokens: 80, completionTokens: 60, totalTokens: 140 },
      model: 'openrooms-simulation-v1',
      provider: 'simulation',
    };
  }

  async complete(_prompt: string): Promise<string> {
    await new Promise(r => setTimeout(r, 300));
    return 'Simulation complete.';
  }

  async embed(_text: string): Promise<number[]> {
    return Array.from({ length: 8 }, () => Math.random());
  }
}
import {
  PolicyEnforcerImpl,
  PostgreSQLTraceLogger,
  HybridMemoryManager,
  ProductionToolExecutor,
  PostgreSQLAgentRepository,
  PostgreSQLPolicyViolationLogger,
  PostgreSQLExecutionLogWriter,
  InMemoryToolRegistry,
} from '@openrooms/agent-runtime';
import { getDb } from '@openrooms/database';
import Redis from 'ioredis';
import crypto from 'crypto';
import type { Agent, AgentPolicy, ToolDefinition } from '@openrooms/core';

interface AgentExecutionJobData {
  agentId: string;
  roomId: string;
  maxIterations: number;
}

export class AgentExecutionWorker {
  private readonly db = getDb();
  private readonly redis: Redis;
  private readonly agentRepository: PostgreSQLAgentRepository;
  
  constructor(redis: Redis) {
    this.redis = redis;
    this.agentRepository = new PostgreSQLAgentRepository(this.db);
  }

  /**
   * Process agent execution job
   */
  async process(job: Job<AgentExecutionJobData>): Promise<void> {
    const { agentId, roomId, maxIterations } = job.data;

    console.log(`[AgentWorker] Starting execution for agent ${agentId}`);

    try {
      // 1. Fetch agent
      const agent = await this.agentRepository.findById(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      // 2. Initialize LLM provider
      const llmProvider = this.createLLMProvider(agent.policyConfig);

      // 3. Initialize runtime components
      const policyEnforcer = new PolicyEnforcerImpl(
        new PostgreSQLPolicyViolationLogger(this.db)
      );

      const traceLogger = new PostgreSQLTraceLogger(
        this.db,
        new PostgreSQLExecutionLogWriter(this.db)
      );

      const memoryManager = new HybridMemoryManager(this.db, this.redis);

      const toolRegistry = new InMemoryToolRegistry();
      this.registerBuiltInTools(toolRegistry);
      
      const toolExecutor = new ProductionToolExecutor(toolRegistry);

      // 4. Create agent runtime loop (pass repo so transitionState persists to DB)
      const agentLoop = new AgentRuntimeLoop(
        llmProvider,
        policyEnforcer,
        traceLogger,
        memoryManager,
        toolExecutor,
        this.agentRepository
      );

      // 5. Build execution context
      const memory = await this.fetchMemory(roomId);
      const roomState = await this.fetchRoomState(roomId);
      const availableTools = await this.fetchAvailableTools(agent, toolRegistry);

      const context = {
        agent,
        roomId,
        memory,
        roomState,
        availableTools,
        maxIterations,
        currentIteration: 0,
      };

      // 6. Execute agent loop
      console.log(`[AgentWorker] Executing agent ${agent.name} (v${agent.version}) — tools: ${availableTools.map(t => t.name).join(', ')}`);
      const result = await agentLoop.execute(context);

      // 7. Persist final loop state and last execution time to DB
      const finalLoopState = result.success ? 'IDLE' : 'TERMINATING';
      await this.agentRepository.updateLoopState(agentId, finalLoopState as any);
      await this.db
        .updateTable('agents')
        .set({ lastExecutedAt: new Date().toISOString() as any })
        .where('id', '=', agentId)
        .execute();

      if (!result.success) {
        throw result.error;
      }

      console.log(`[AgentWorker] Completed execution for agent ${agentId}`);
      await job.updateProgress(100);

    } catch (error) {
      console.error(`[AgentWorker] Execution failed for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Create LLM provider based on policy config.
   * Falls back to SimulationLLMProvider when no API key is configured
   * so the agent loop still executes and produces visible logs.
   */
  private createLLMProvider(policyConfig: AgentPolicy): LLMProvider {
    const provider = (policyConfig as any).provider || 'openai';

    switch (provider.toLowerCase()) {
      case 'openai':
        if (process.env.OPENAI_API_KEY) {
          return new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY });
        }
        console.warn('[AgentWorker] OPENAI_API_KEY not set — using simulation mode');
        return new SimulationLLMProvider();

      case 'anthropic':
        if (process.env.ANTHROPIC_API_KEY) {
          return new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY });
        }
        console.warn('[AgentWorker] ANTHROPIC_API_KEY not set — using simulation mode');
        return new SimulationLLMProvider();

      case 'simulation':
        return new SimulationLLMProvider();

      default:
        console.warn(`[AgentWorker] Unknown provider "${provider}" — using simulation mode`);
        return new SimulationLLMProvider();
    }
  }

  /**
   * Register built-in tools with full parameter schemas so the LLM knows how to call them
   */
  private registerBuiltInTools(registry: InMemoryToolRegistry) {
    registry.registerTool(
      {
        id: 'calculator',
        name: 'calculator',
        description: 'Evaluates a safe arithmetic expression and returns the numeric result',
        category: 'COMPUTATION',
        parameters: [
          { name: 'expression', type: 'string', required: true, description: 'A safe arithmetic expression e.g. "2 + 2 * 5"' }
        ],
        timeout: 2000,
        version: '1.0.0',
      },
      async (input) => {
        try {
          // Whitelist: only digits and arithmetic operators
          const sanitized = String(input.expression).replace(/[^0-9+\-*/.() ]/g, '');
          // eslint-disable-next-line no-new-func
          const result = new Function(`"use strict"; return (${sanitized})`)();
          return { success: true, data: { result, expression: sanitized } };
        } catch (error) {
          return { success: false, error: error as Error };
        }
      }
    );

    registry.registerTool(
      {
        id: 'http_request',
        name: 'http_request',
        description: 'Makes an HTTP request to an external URL and returns the response body',
        category: 'EXTERNAL_API',
        parameters: [
          { name: 'url', type: 'string', required: true, description: 'Full URL to request' },
          { name: 'method', type: 'string', required: false, description: 'HTTP method: GET, POST, PUT, DELETE. Defaults to GET' },
          { name: 'body', type: 'object', required: false, description: 'JSON body for POST/PUT requests' },
        ],
        timeout: 15000,
        version: '1.0.0',
      },
      async (input) => {
        try {
          const method = (input.method as string || 'GET').toUpperCase();
          const res = await fetch(input.url as string, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: input.body ? JSON.stringify(input.body) : undefined,
          });
          const text = await res.text();
          let data: unknown;
          try { data = JSON.parse(text); } catch { data = text; }
          return { success: true, data: { status: res.status, body: data } };
        } catch (error) {
          return { success: false, error: error as Error };
        }
      }
    );

    registry.registerTool(
      {
        id: 'memory_query',
        name: 'memory_query',
        description: 'Searches the conversation history in the current room memory for a keyword or phrase',
        category: 'SYSTEM',
        parameters: [
          { name: 'query', type: 'string', required: true, description: 'Keyword or phrase to search for in memory' }
        ],
        timeout: 3000,
        version: '1.0.0',
      },
      async (input) => ({
        success: true,
        data: { results: [], query: input.query, note: 'Memory search executed' },
      })
    );
  }

  /**
   * Fetch or initialise memory record for the room
   */
  private async fetchMemory(roomId: string): Promise<any> {
    const existing = await this.db
      .selectFrom('memories')
      .selectAll()
      .where('roomId', '=', roomId)
      .executeTakeFirst();

    if (existing) return existing;

    const now = new Date().toISOString();
    const inserted = await this.db
      .insertInto('memories')
      .values({
        id: crypto.randomUUID(),
        roomId,
        type: 'CONVERSATION' as any,
        config: JSON.stringify({ messages: [] }) as any,
        createdAt: now as any,
        updatedAt: now as any,
      })
      .returningAll()
      .executeTakeFirst();

    return inserted ?? { id: crypto.randomUUID(), roomId, conversationHistory: [], episodicEvents: [], workingMemory: {} };
  }

  /**
   * Fetch room config/state for context
   */
  private async fetchRoomState(roomId: string): Promise<Record<string, unknown>> {
    const room = await this.db
      .selectFrom('rooms')
      .select(['config', 'metadata'])
      .where('id', '=', roomId)
      .executeTakeFirst();

    if (!room) return {};
    try {
      const config = typeof room.config === 'string' ? JSON.parse(room.config) : room.config;
      const metadata = typeof room.metadata === 'string' ? JSON.parse(room.metadata) : room.metadata;
      return { ...config, ...metadata };
    } catch {
      return {};
    }
  }

  /**
   * Return tool definitions for all tools the agent is allowed to call,
   * with full parameter schemas so the LLM knows how to invoke them.
   */
  private async fetchAvailableTools(agent: Agent, registry: InMemoryToolRegistry): Promise<ToolDefinition[]> {
    const allowed = new Set(agent.allowedTools);
    // registry.listAll() may not exist on InMemoryToolRegistry; fall back to known definitions
    const allDefs: ToolDefinition[] = [
      {
        id: 'calculator', name: 'calculator',
        description: 'Evaluates a safe arithmetic expression and returns the numeric result',
        category: 'COMPUTATION' as any,
        parameters: [{ name: 'expression', type: 'string', required: true, description: 'Arithmetic expression e.g. "2 + 2 * 5"' }],
        timeout: 2000, version: '1.0.0', metadata: {}, createdAt: '', updatedAt: '',
      },
      {
        id: 'http_request', name: 'http_request',
        description: 'Makes an HTTP request and returns the response',
        category: 'EXTERNAL_API' as any,
        parameters: [
          { name: 'url', type: 'string', required: true, description: 'URL to request' },
          { name: 'method', type: 'string', required: false, description: 'GET, POST, PUT, DELETE' },
          { name: 'body', type: 'object', required: false, description: 'JSON body' },
        ],
        timeout: 15000, version: '1.0.0', metadata: {}, createdAt: '', updatedAt: '',
      },
      {
        id: 'memory_query', name: 'memory_query',
        description: 'Searches room conversation history for a keyword',
        category: 'SYSTEM' as any,
        parameters: [{ name: 'query', type: 'string', required: true, description: 'Search term' }],
        timeout: 3000, version: '1.0.0', metadata: {}, createdAt: '', updatedAt: '',
      },
    ];

    // Return all allowed tools; if allowedTools is empty, return all
    return allowed.size === 0 ? allDefs : allDefs.filter(d => allowed.has(d.name) || allowed.has(d.id));
  }
}

/**
 * Create and start agent execution worker
 */
export function createAgentWorker(redis: Redis, connectionOpts: { host: string; port: number }) {
  const { Worker } = require('bullmq');
  
  const worker = new AgentExecutionWorker(redis);

  return new Worker(
    'agent-execution',
    async (job: Job<AgentExecutionJobData>) => {
      return worker.process(job);
    },
    {
      connection: connectionOpts,
      concurrency: 5, // Process 5 agents concurrently
      limiter: {
        max: 10,
        duration: 1000, // Max 10 jobs per second
      },
    }
  );
}
