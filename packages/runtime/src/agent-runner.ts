/**
 * Agent Runner
 *
 * Enqueues agent execution jobs and creates run records.
 * The actual LLM loop is processed by runner-worker.ts.
 */

import { Queue } from 'bullmq';
import type { Kysely } from 'kysely';
import type { Database } from '@openrooms/database';
import type Redis from 'ioredis';
import { RunManager } from './run-manager';
import { EventBus } from './event-bus';

export interface AgentRunInput {
  goal?: string;
  context?: Record<string, unknown>;
  maxIterations?: number;
  roomId?: string;
}

export interface AgentRunResult {
  runId: string;
  agentId: string;
  roomId?: string | null;
  status: 'queued';
  message: string;
}

export interface AgentRunJobData {
  runId: string;
  agentId: string;
  roomId?: string | null;
  maxIterations: number;
  input: AgentRunInput;
}

export class AgentRunner {
  private readonly runManager: RunManager;
  private readonly eventBus: EventBus;
  private readonly queue: Queue;

  constructor(
    private readonly db: Kysely<Database>,
    redis: Redis,
    connection: { host: string; port: number }
  ) {
    this.runManager = new RunManager(db);
    this.eventBus = new EventBus(redis);
    this.queue = new Queue('agent_runs', { connection });
  }

  async runAgent(agentId: string, input: AgentRunInput): Promise<AgentRunResult> {
    const agent = await (this.db as any)
      .selectFrom('agents')
      .select(['id', 'name', 'roomId'])
      .where('id', '=', agentId)
      .executeTakeFirst();

    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const effectiveRoomId: string | null =
      input.roomId ?? (agent.roomId as string | null) ?? null;

    const run = await this.runManager.createRun({
      type: 'agent',
      targetId: agentId,
      input: input as Record<string, unknown>,
      roomId: effectiveRoomId,
    });

    const jobData: AgentRunJobData = {
      runId: run.id,
      agentId,
      roomId: effectiveRoomId,
      maxIterations: input.maxIterations ?? 10,
      input,
    };

    await this.queue.add('run-agent', jobData, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    await this.eventBus.emit('agent.started', run.id, {
      agentId,
      agentName: agent.name,
      roomId: effectiveRoomId,
      input,
    });

    return {
      runId: run.id,
      agentId,
      roomId: effectiveRoomId,
      status: 'queued',
      message: 'Agent run queued successfully',
    };
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
