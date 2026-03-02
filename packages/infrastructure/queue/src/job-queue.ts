/**
 * BullMQ Queue Manager
 */

import { Queue, QueueEvents, ConnectionOptions } from 'bullmq';
import { JobQueue, JobOptions, Job, JobProcessor } from '@openrooms/core';

export class BullMQJobQueue implements JobQueue {
  private readonly queues: Map<string, Queue> = new Map();
  private readonly connection: ConnectionOptions;

  constructor(connection: ConnectionOptions) {
    this.connection = connection;
  }

  async addJob<T>(
    queueName: string,
    jobName: string,
    data: T,
    options?: JobOptions
  ): Promise<string> {
    const queue = this.getOrCreateQueue(queueName);

    const job = await queue.add(jobName, data, {
      priority: options?.priority,
      delay: options?.delay,
      attempts: options?.attempts ?? 3,
      backoff: options?.backoff
        ? {
            type: options.backoff.type,
            delay: options.backoff.delay,
          }
        : undefined,
      removeOnComplete: options?.removeOnComplete ?? true,
      removeOnFail: options?.removeOnFail ?? false,
    });

    return job.id ?? '';
  }

  process<T>(
    queueName: string,
    jobName: string,
    processor: JobProcessor<T>
  ): void {
    const queue = this.getOrCreateQueue(queueName);

    // BullMQ uses Worker class for processing
    // This is a simplified implementation
    void queue.add(jobName, {});
  }

  async getJob(jobId: string): Promise<Job | null> {
    // Need to know which queue - simplified implementation
    return null;
  }

  async removeJob(jobId: string): Promise<void> {
    // Need to know which queue - simplified implementation
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.pause();
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.resume();
    }
  }

  private getOrCreateQueue(queueName: string): Queue {
    let queue = this.queues.get(queueName);
    
    if (!queue) {
      queue = new Queue(queueName, {
        connection: this.connection,
      });
      this.queues.set(queueName, queue);
    }

    return queue;
  }

  async close(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    this.queues.clear();
  }
}
