/**
 * Redis-based State Manager for Room execution state
 */

import Redis from 'ioredis';
import {
  StateManager,
  RoomState,
  UUID,
  JSONObject,
} from '@openrooms/core';

export class RedisStateManager implements StateManager {
  private readonly redis: Redis;
  private readonly ttl: number = 3600; // 1 hour default TTL
  private readonly lockTTL: number = 30; // 30 seconds lock TTL

  constructor(redis: Redis, ttl?: number) {
    this.redis = redis;
    if (ttl) this.ttl = ttl;
  }

  async getState(roomId: UUID): Promise<RoomState | null> {
    const key = this.getStateKey(roomId);
    const data = await this.redis.get(key);
    
    if (!data) return null;

    try {
      const parsed = JSON.parse(data) as RoomState;
      // Convert attempts from object to Map
      const state: RoomState = {
        ...parsed,
        attempts: new Map(Object.entries((parsed.attempts as unknown as JSONObject) ?? {})),
      };
      return state;
    } catch (error) {
      console.error(`Failed to parse state for room ${roomId}:`, error);
      return null;
    }
  }

  async setState(roomId: UUID, state: RoomState): Promise<void> {
    const key = this.getStateKey(roomId);
    // Convert Map to object for JSON serialization
    const serializable = {
      ...state,
      attempts: Object.fromEntries(state.attempts),
    };
    
    await this.redis.setex(
      key,
      this.ttl,
      JSON.stringify(serializable)
    );
  }

  async updateState(roomId: UUID, updates: Partial<RoomState>): Promise<void> {
    const currentState = await this.getState(roomId);
    
    if (!currentState) {
      throw new Error(`State not found for room ${roomId}`);
    }

    const updatedState: RoomState = {
      ...currentState,
      ...updates,
      lastUpdateTime: new Date().toISOString(),
    };

    await this.setState(roomId, updatedState);
  }

  async deleteState(roomId: UUID): Promise<void> {
    const key = this.getStateKey(roomId);
    await this.redis.del(key);
  }

  async acquireLock(roomId: UUID, timeout: number): Promise<boolean> {
    const lockKey = this.getLockKey(roomId);
    const lockValue = `${Date.now()}`;
    
    // Use SET with NX (only set if not exists) and EX (expiry)
    const result = await this.redis.set(
      lockKey,
      lockValue,
      'NX',
      'EX',
      Math.ceil(timeout / 1000)
    );

    return result === 'OK';
  }

  async releaseLock(roomId: UUID): Promise<void> {
    const lockKey = this.getLockKey(roomId);
    await this.redis.del(lockKey);
  }

  private getStateKey(roomId: UUID): string {
    return `room:${roomId}:state`;
  }

  private getLockKey(roomId: UUID): string {
    return `room:${roomId}:lock`;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}
