/**
 * Dependency Injection Container
 */

import Redis from 'ioredis';
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
  RedisStateManager,
  createDefaultNodeExecutors,
} from '@openrooms/engine';
import { DefaultToolRegistry, BUILTIN_TOOLS } from '@openrooms/tools';
import { LLMService, OpenAIProvider } from '@openrooms/llm';
import { BullMQJobQueue, WorkerManager } from '@openrooms/worker';

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
  redis: Redis;
  jobQueue: BullMQJobQueue;
  workerManager: WorkerManager;
}

export function createContainer(): Container {
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

  // Workflow Engine
  const nodeExecutors = createDefaultNodeExecutors();
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
    redis,
    jobQueue,
    workerManager,
  };
}
