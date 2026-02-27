/**
 * Background Workers for Room Execution
 */

import { Worker, Job, ConnectionOptions } from 'bullmq';
import { UUID, WorkflowEngine } from '@openrooms/core';

export interface RoomExecutionJobData {
  roomId: UUID;
}

export class RoomExecutionWorker {
  private readonly worker: Worker;

  constructor(
    private readonly workflowEngine: WorkflowEngine,
    connection: ConnectionOptions
  ) {
    this.worker = new Worker(
      'room-execution',
      async (job: Job<RoomExecutionJobData>) => {
        return this.processJob(job);
      },
      {
        connection,
        concurrency: 5,
        limiter: {
          max: 10,
          duration: 1000,
        },
      }
    );

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed for room ${job.data.roomId}`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed for room ${job?.data.roomId}:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Worker error:', err);
    });
  }

  private async processJob(job: Job<RoomExecutionJobData>): Promise<void> {
    const { roomId } = job.data;

    console.log(`Processing room execution: ${roomId}`);

    // Update job progress
    await job.updateProgress(10);

    // Execute the room
    const result = await this.workflowEngine.executeRoom(roomId);

    if (!result.success) {
      throw result.error;
    }

    await job.updateProgress(100);
  }

  async close(): Promise<void> {
    await this.worker.close();
  }

  async pause(): Promise<void> {
    await this.worker.pause();
  }

  async resume(): Promise<void> {
    await this.worker.resume();
  }
}

/**
 * Factory to create and manage all workers
 */
export class WorkerManager {
  private readonly workers: Worker[] = [];

  constructor(
    private readonly workflowEngine: WorkflowEngine,
    private readonly connection: ConnectionOptions
  ) {}

  startRoomExecutionWorker(): RoomExecutionWorker {
    const worker = new RoomExecutionWorker(this.workflowEngine, this.connection);
    return worker;
  }

  async closeAll(): Promise<void> {
    await Promise.all(this.workers.map((w) => w.close()));
  }
}
