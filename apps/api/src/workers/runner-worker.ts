/**
 * Runner Worker — Stage 4
 *
 * Consumes agent_runs and workflow_runs BullMQ queues.
 * Delegates to the existing AgentExecutionWorker and WorkflowExecutionEngine.
 * Updates run status in the runs table and emits events on the EventBus.
 */

import { Worker, Job } from 'bullmq';
import type Redis from 'ioredis';
import { getDb } from '@openrooms/database';
import { RunManager } from '@openrooms/runtime';
import { EventBus } from '@openrooms/runtime';
import type { AgentRunJobData } from '@openrooms/runtime';
import type { WorkflowRunJobData } from '@openrooms/runtime';
import { AgentExecutionWorker } from './agent-worker';

interface ConnectionOpts {
  host: string;
  port: number;
}

export function createRunnerWorkers(redis: Redis, connection: ConnectionOpts) {
  const db = getDb();
  const runManager = new RunManager(db);
  const eventBus = new EventBus(redis);
  const agentWorker = new AgentExecutionWorker(redis);

  // ─── Agent Runs Worker ────────────────────────────────────────────────────

  const agentRunsWorker = new Worker<AgentRunJobData>(
    'agent_runs',
    async (job: Job<AgentRunJobData>) => {
      const { runId, agentId, roomId, maxIterations, input } = job.data;

      console.log(`[RunnerWorker] Starting agent run ${runId} (agent: ${agentId})`);

      await runManager.updateRunStatus(runId, 'running', {
        startedAt: new Date().toISOString(),
      });

      await eventBus.emit('agent.started', runId, { agentId, roomId, input });

      try {
        // Delegate to existing AgentExecutionWorker which handles the full loop
        if (!roomId) {
          throw new Error('Agent run requires a roomId');
        }

        // Build a synthetic BullMQ Job-like object for the existing worker
        const syntheticJob = {
          data: { agentId, roomId, maxIterations: maxIterations ?? 10 },
          updateProgress: async (_p: number) => {},
        } as unknown as Job;

        await agentWorker.process(syntheticJob);

        await runManager.updateRunStatus(runId, 'completed', {
          endedAt: new Date().toISOString(),
          output: { message: 'Agent loop completed' },
        });

        await eventBus.emit('agent.completed', runId, { agentId, roomId });
        await eventBus.emit('run.completed', runId, { type: 'agent', agentId });

        console.log(`[RunnerWorker] Agent run ${runId} completed`);
      } catch (error) {
        const errMsg = (error as Error).message;
        console.error(`[RunnerWorker] Agent run ${runId} failed:`, errMsg);

        await runManager.updateRunStatus(runId, 'failed', {
          endedAt: new Date().toISOString(),
          error: errMsg,
        });

        await eventBus.emit('agent.failed', runId, { agentId, error: errMsg });
        await eventBus.emit('run.failed', runId, { type: 'agent', agentId, error: errMsg });

        throw error; // BullMQ will retry per job config
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );

  // ─── Workflow Runs Worker ─────────────────────────────────────────────────

  const workflowRunsWorker = new Worker<WorkflowRunJobData>(
    'workflow_runs',
    async (job: Job<WorkflowRunJobData>) => {
      const { runId, workflowId, roomId } = job.data;

      console.log(`[RunnerWorker] Starting workflow run ${runId} (workflow: ${workflowId})`);

      await runManager.updateRunStatus(runId, 'running', {
        startedAt: new Date().toISOString(),
      });

      await eventBus.emit('workflow.step', runId, { workflowId, roomId, step: 'started' });

      try {
        // Delegate to existing room-execution queue which runs the WorkflowExecutionEngine
        const { Queue } = await import('bullmq');
        const roomQueue = new Queue('room-execution', { connection });

        await roomQueue.add('execute', { roomId });
        await roomQueue.close();

        // Poll for room completion (up to 5 min)
        const deadline = Date.now() + 5 * 60 * 1000;
        let finalStatus = 'RUNNING';

        while (Date.now() < deadline) {
          const room = await (db as any)
            .selectFrom('rooms')
            .select(['status'])
            .where('id', '=', roomId)
            .executeTakeFirst();

          finalStatus = room?.status ?? 'FAILED';

          if (finalStatus === 'COMPLETED' || finalStatus === 'FAILED' || finalStatus === 'CANCELLED') {
            break;
          }

          await new Promise(r => setTimeout(r, 2000));
        }

        const succeeded = finalStatus === 'COMPLETED';

        await runManager.updateRunStatus(runId, succeeded ? 'completed' : 'failed', {
          endedAt: new Date().toISOString(),
          ...(succeeded
            ? { output: { roomId, finalStatus } }
            : { error: `Room ended with status: ${finalStatus}` }),
        });

        const completionEvent = succeeded ? 'workflow.completed' : 'workflow.failed';
        await eventBus.emit(completionEvent, runId, { workflowId, roomId, finalStatus });
        await eventBus.emit(succeeded ? 'run.completed' : 'run.failed', runId, {
          type: 'workflow',
          workflowId,
        });

        if (!succeeded) throw new Error(`Workflow room ended with status: ${finalStatus}`);

        console.log(`[RunnerWorker] Workflow run ${runId} completed`);
      } catch (error) {
        const errMsg = (error as Error).message;
        console.error(`[RunnerWorker] Workflow run ${runId} failed:`, errMsg);

        await runManager.updateRunStatus(runId, 'failed', {
          endedAt: new Date().toISOString(),
          error: errMsg,
        });

        await eventBus.emit('workflow.failed', runId, { workflowId, error: errMsg });
        await eventBus.emit('run.failed', runId, { type: 'workflow', workflowId, error: errMsg });

        throw error;
      }
    },
    {
      connection,
      concurrency: 3,
    }
  );

  agentRunsWorker.on('error', err => console.error('[AgentRunsWorker] error:', err.message));
  workflowRunsWorker.on('error', err => console.error('[WorkflowRunsWorker] error:', err.message));

  return { agentRunsWorker, workflowRunsWorker };
}
