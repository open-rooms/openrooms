/**
 * Workflow Runner
 *
 * Enqueues workflow execution jobs and creates run records.
 * Optionally creates a Room to host the execution.
 * The actual step-by-step execution is done by runner-worker.ts.
 */

import { Queue } from 'bullmq';
import crypto from 'crypto';
import type { Kysely } from 'kysely';
import type { Database } from '@openrooms/database';
import type Redis from 'ioredis';
import { RunManager } from './run-manager';
import { EventBus } from './event-bus';

export interface WorkflowRunInput {
  context?: Record<string, unknown>;
  roomId?: string;
  roomName?: string;
}

export interface WorkflowRunResult {
  runId: string;
  workflowId: string;
  roomId: string;
  status: 'queued';
  message: string;
}

export interface WorkflowRunJobData {
  runId: string;
  workflowId: string;
  roomId: string;
  input: WorkflowRunInput;
}

export class WorkflowRunner {
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
    this.queue = new Queue('workflow_runs', { connection });
  }

  async runWorkflow(workflowId: string, input: WorkflowRunInput): Promise<WorkflowRunResult> {
    const workflow = await (this.db as any)
      .selectFrom('workflows')
      .select(['id', 'name'])
      .where('id', '=', workflowId)
      .executeTakeFirst();

    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    // Use existing room or create a transient one for this execution
    let roomId = input.roomId;

    if (!roomId) {
      const now = new Date().toISOString();
      const newRoomId = crypto.randomUUID();
      await (this.db as any)
        .insertInto('rooms')
        .values({
          id: newRoomId,
          name: input.roomName ?? `Run: ${workflow.name}`,
          description: `Auto-created room for workflow run`,
          status: 'IDLE',
          workflowId,
          config: JSON.stringify({}),
          metadata: JSON.stringify({}),
          createdAt: now,
          updatedAt: now,
        })
        .execute();
      roomId = newRoomId;
    }

    const run = await this.runManager.createRun({
      type: 'workflow',
      targetId: workflowId,
      input: input as Record<string, unknown>,
      roomId,
    });

    const jobData: WorkflowRunJobData = {
      runId: run.id,
      workflowId,
      roomId,
      input,
    };

    await this.queue.add('run-workflow', jobData, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    await this.eventBus.emit('workflow.step', run.id, {
      workflowId,
      workflowName: workflow.name,
      roomId,
      step: 'queued',
    });

    return {
      runId: run.id,
      workflowId,
      roomId,
      status: 'queued',
      message: 'Workflow run queued successfully',
    };
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
