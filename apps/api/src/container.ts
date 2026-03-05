/**
 * Dependency Injection Container
 */

import Redis from 'ioredis';
import { getDb } from '@openrooms/database';
import type { Kysely } from 'kysely';
import type { Database } from '@openrooms/database';
import {
  WorkflowEngine,
  StateManager,
  RoomRepository,
  WorkflowRepository,
  AgentRepository,
  ExecutionLogRepository,
  MemoryRepository,
  LoggingService,
  ToolRegistry,
} from '@openrooms/core';
import {
  KyselyRoomRepository,
  KyselyWorkflowRepository,
  KyselyAgentRepository,
  KyselyExecutionLogRepository,
  KyselyMemoryRepository,
  DefaultLoggingService,
} from '@openrooms/database';
import {
  WorkflowExecutionEngine,
  createDefaultNodeExecutors,
} from '@openrooms/execution';
import { RedisStateManager } from '@openrooms/infrastructure-redis';
import { DefaultToolRegistry, BUILTIN_TOOLS } from '@openrooms/execution';
import { LLMService, OpenAIProvider } from '@openrooms/execution';
import { BullMQJobQueue } from '@openrooms/infrastructure-queue';
import { WorkerManager } from '@openrooms/execution';
import { NodeType } from '@openrooms/core';

export interface Container {
  // Repositories
  roomRepository: RoomRepository;
  workflowRepository: WorkflowRepository;
  agentRepository: AgentRepository;
  executionLogRepository: ExecutionLogRepository;
  memoryRepository: MemoryRepository;

  // Services
  loggingService: LoggingService;
  stateManager: StateManager;
  toolRegistry: ToolRegistry;
  llmService: LLMService;
  workflowEngine: WorkflowEngine;
  
  // Infrastructure
  db: Kysely<Database>;
  redis: Redis;
  jobQueue: BullMQJobQueue;
  workerManager: WorkerManager;
}

export function createContainer(): Container {
  // Database
  const db = getDb();

  // Redis
  const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  // Repositories
  const roomRepository = new KyselyRoomRepository();
  const workflowRepository = new KyselyWorkflowRepository();
  const agentRepository = new KyselyAgentRepository();
  const executionLogRepository = new KyselyExecutionLogRepository();
  const memoryRepository = new KyselyMemoryRepository();

  // Services
  const loggingService = new DefaultLoggingService(executionLogRepository);
  const stateManager = new RedisStateManager(redis);
  const toolRegistry = new DefaultToolRegistry();

  // Register built-in tools
  BUILTIN_TOOLS.forEach(({ definition, executor }) => {
    toolRegistry.register(definition, executor);
  });

  // LLM Service
  const llmService = new LLMService();
  if (process.env.OPENAI_API_KEY) {
    llmService.registerProvider(
      new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY })
    );
  }

  // Workflow Engine with proper node executor dependencies
  const nodeExecutors = createDefaultNodeExecutors({
    llmService,
    toolRegistry,
    memoryRepository,
    stateManager,
    workflowEngine: null as any, // Will be set after creation to avoid circular dependency
  });
  
  const workflowEngine = new WorkflowExecutionEngine(
    stateManager,
    roomRepository,
    workflowRepository,
    loggingService,
    nodeExecutors,
    {
      maxExecutionTime: 300000, // 5 minutes
      lockTimeout: 30000, // 30 seconds
    }
  );

  // Set circular reference for parallel node executor
  const parallelExecutor = nodeExecutors.get(NodeType.PARALLEL);
  if (parallelExecutor && 'workflowEngine' in parallelExecutor) {
    (parallelExecutor as any).workflowEngine = workflowEngine;
  }

  // Job Queue
  const jobQueue = new BullMQJobQueue({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
  });

  // Worker Manager
  const workerManager = new WorkerManager(workflowEngine, {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
  });

  return {
    roomRepository,
    workflowRepository,
    agentRepository,
    executionLogRepository,
    memoryRepository,
    loggingService,
    stateManager,
    toolRegistry,
    llmService,
    workflowEngine,
    db,
    redis,
    jobQueue,
    workerManager,
  };
}
