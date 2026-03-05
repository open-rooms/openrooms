/**
 * Agent Execution Worker
 * 
 * BullMQ worker that processes agent execution jobs asynchronously.
 * Connects LLM providers to agent runtime loop for autonomous execution.
 */

import { Job } from 'bullmq';
import { AgentRuntimeLoop } from '@openrooms/agent-runtime';
import { OpenAIProvider, AnthropicProvider } from '@openrooms/execution';
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

      // 4. Create agent runtime loop
      const agentLoop = new AgentRuntimeLoop(
        llmProvider,
        policyEnforcer,
        traceLogger,
        memoryManager,
        toolExecutor
      );

      // 5. Build execution context
      const memory = await this.fetchMemory(roomId);
      const roomState = await this.fetchRoomState(roomId);
      const availableTools = await this.fetchAvailableTools(agent);

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
      console.log(`[AgentWorker] Executing agent ${agent.name} (v${agent.version})`);
      const result = await agentLoop.execute(context);

      if (!result.success) {
        throw result.error;
      }

      console.log(`[AgentWorker] Completed execution for agent ${agentId}`);

      // 7. Update job progress
      await job.updateProgress(100);

    } catch (error) {
      console.error(`[AgentWorker] Execution failed for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Create LLM provider based on policy config
   */
  private createLLMProvider(policyConfig: AgentPolicy) {
    const provider = (policyConfig as any).provider || 'openai';
    const model = (policyConfig as any).model || 'gpt-4';

    switch (provider.toLowerCase()) {
      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY not configured');
        }
        return new OpenAIProvider({
          apiKey: process.env.OPENAI_API_KEY,
        });

      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY not configured');
        }
        return new AnthropicProvider({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  /**
   * Register built-in tools
   */
  private registerBuiltInTools(registry: InMemoryToolRegistry) {
    // Search tool
    registry.register(
      {
        id: 'search_web',
        name: 'search_web',
        description: 'Search the web for information',
        category: 'EXTERNAL_API',
        parameters: [
          { name: 'query', type: 'string', required: true, description: 'Search query' }
        ],
        timeout: 5000,
        version: '1.0.0',
      },
      async (input) => ({
        success: true,
        data: { results: [`Mock result for: ${input.query}`] },
      })
    );

    // Calculator tool
    registry.register(
      {
        id: 'calculator',
        name: 'calculator',
        description: 'Perform mathematical calculations',
        category: 'COMPUTATION',
        parameters: [
          { name: 'expression', type: 'string', required: true, description: 'Math expression' }
        ],
        timeout: 1000,
        version: '1.0.0',
      },
      async (input) => {
        try {
          // Simple eval for demo - production should use math.js
          const result = eval(input.expression);
          return { success: true, data: { result } };
        } catch (error) {
          return { success: false, error: error as Error };
        }
      }
    );
  }

  /**
   * Fetch memory for room
   */
  private async fetchMemory(roomId: string) {
    const memoryRecord = await this.db
      .selectFrom('memories')
      .selectAll()
      .where('roomId', '=', roomId)
      .executeTakeFirst();

    if (!memoryRecord) {
      // Create empty memory
      const newMemory = await this.db
        .insertInto('memories')
        .values({
          id: crypto.randomUUID(),
          roomId,
          data: JSON.stringify({ messages: [] }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returningAll()
        .executeTakeFirst();

      return newMemory!;
    }

    return memoryRecord;
  }

  /**
   * Fetch room state
   */
  private async fetchRoomState(roomId: string) {
    const room = await this.db
      .selectFrom('rooms')
      .select(['state'])
      .where('id', '=', roomId)
      .executeTakeFirst();

    return room?.state ? JSON.parse(room.state as string) : {};
  }

  /**
   * Fetch available tools for agent
   */
  private async fetchAvailableTools(agent: Agent): Promise<ToolDefinition[]> {
    // For now, return tools based on allowedTools list
    // In production, query from tools registry
    return agent.allowedTools.map(toolName => ({
      id: toolName,
      name: toolName,
      description: `Tool: ${toolName}`,
      category: 'CUSTOM',
      parameters: [],
      timeout: 5000,
      version: '1.0.0',
    }));
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
