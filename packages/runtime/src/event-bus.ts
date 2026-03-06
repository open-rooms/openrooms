/**
 * Event Bus — Redis Pub/Sub
 *
 * Publishes and subscribes to real-time execution events.
 * Powers the Live Runs UI stream.
 */

import type Redis from 'ioredis';

export type RuntimeEvent =
  | 'agent.started'
  | 'agent.step'
  | 'agent.tool_call'
  | 'agent.completed'
  | 'agent.failed'
  | 'workflow.step'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'run.completed'
  | 'run.failed';

export interface EventPayload {
  event: RuntimeEvent;
  runId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

const CHANNEL_PREFIX = 'openrooms:runtime:';

export class EventBus {
  constructor(private readonly publisher: Redis) {}

  async emit(event: RuntimeEvent, runId: string, data: Record<string, unknown> = {}): Promise<void> {
    const payload: EventPayload = {
      event,
      runId,
      data,
      timestamp: new Date().toISOString(),
    };
    await this.publisher.publish(`${CHANNEL_PREFIX}${event}`, JSON.stringify(payload));
    // Also publish to a per-run channel so the UI can listen to a specific run
    await this.publisher.publish(`${CHANNEL_PREFIX}run:${runId}`, JSON.stringify(payload));
  }

  /**
   * Subscribe to one or more events.
   * Returns an unsubscribe function.
   */
  subscribe(
    redis: Redis,
    events: RuntimeEvent[],
    handler: (payload: EventPayload) => void
  ): () => void {
    const subscriber = redis.duplicate();
    const channels = events.map(e => `${CHANNEL_PREFIX}${e}`);

    subscriber.subscribe(...channels).catch(console.error);

    subscriber.on('message', (_channel: string, message: string) => {
      try {
        const payload = JSON.parse(message) as EventPayload;
        handler(payload);
      } catch {
        // ignore malformed messages
      }
    });

    return () => {
      subscriber.unsubscribe(...channels).catch(console.error);
      subscriber.disconnect();
    };
  }

  /**
   * Subscribe to all events for a specific run.
   */
  subscribeToRun(
    redis: Redis,
    runId: string,
    handler: (payload: EventPayload) => void
  ): () => void {
    const subscriber = redis.duplicate();
    const channel = `${CHANNEL_PREFIX}run:${runId}`;

    subscriber.subscribe(channel).catch(console.error);

    subscriber.on('message', (_channel: string, message: string) => {
      try {
        const payload = JSON.parse(message) as EventPayload;
        handler(payload);
      } catch {
        // ignore
      }
    });

    return () => {
      subscriber.unsubscribe(channel).catch(console.error);
      subscriber.disconnect();
    };
  }
}
