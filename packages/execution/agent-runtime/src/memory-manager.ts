/**
 * Memory Manager - Context Management for Agent Loop
 * 
 * Manages agent memory with:
 * - Token-aware context pruning
 * - Conversation history management
 * - Memory entry retrieval
 */

import type {
  Memory,
  ConversationMessage,
  MemoryEntry,
  UUID,
  JSONObject,
} from '@openrooms/core';

export interface MemoryManagerImpl {
  getRecentContext(roomId: UUID, maxTokens: number): Promise<JSONObject>;
  appendMessage(roomId: UUID, message: ConversationMessage): Promise<void>;
  getMemory(roomId: UUID): Promise<Memory | null>;
  updateMemoryState(roomId: UUID, updates: Partial<Memory>): Promise<void>;
}

/**
 * PostgreSQL + Redis Memory Manager
 */
export class HybridMemoryManager implements MemoryManagerImpl {
  constructor(
    private readonly db: any, // Kysely DB instance
    private readonly redis: any // Redis client
  ) {}

  /**
   * Get recent context within token limit
   */
  async getRecentContext(roomId: UUID, maxTokens: number): Promise<JSONObject> {
    const memory = await this.getMemory(roomId);
    
    if (!memory) {
      return {
        conversationHistory: [],
        context: {},
        entries: [],
      };
    }

    // Prune conversation history to fit token limit
    const prunedHistory = this.pruneConversationHistory(
      memory.conversationHistory,
      maxTokens
    );

    // Get most recent memory entries
    const recentEntries = await this.getRecentMemoryEntries(roomId, 10);

    return {
      conversationHistory: prunedHistory,
      context: memory.context,
      entries: recentEntries,
    };
  }

  /**
   * Append message to conversation history
   */
  async appendMessage(roomId: UUID, message: ConversationMessage): Promise<void> {
    // Try Redis first (fast cache)
    const cacheKey = `memory:${roomId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      const memory = JSON.parse(cached);
      memory.conversationHistory.push(message);
      memory.updatedAt = new Date().toISOString();
      
      // Update cache
      await this.redis.setex(cacheKey, 3600, JSON.stringify(memory));
    }

    // Always persist to PostgreSQL
    await this.db
      .insertInto('memory_entries')
      .values({
        id: crypto.randomUUID(),
        memoryId: roomId,
        key: `message_${Date.now()}`,
        value: JSON.stringify(message),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .execute();
  }

  /**
   * Get full memory object
   */
  async getMemory(roomId: UUID): Promise<Memory | null> {
    // Try Redis first
    const cacheKey = `memory:${roomId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to PostgreSQL
    const memoryRecord = await this.db
      .selectFrom('memories')
      .selectAll()
      .where('roomId', '=', roomId)
      .executeTakeFirst();

    if (!memoryRecord) {
      return null;
    }

    const entries = await this.db
      .selectFrom('memory_entries')
      .selectAll()
      .where('memoryId', '=', memoryRecord.id)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .execute();

    // Reconstruct conversation history from entries
    const conversationHistory: ConversationMessage[] = entries
      .filter((e: any) => e.key.startsWith('message_'))
      .map((e: any) => JSON.parse(e.value))
      .reverse();

    const memory: Memory = {
      id: memoryRecord.id,
      roomId: memoryRecord.roomId,
      conversationHistory,
      context: memoryRecord.config || {},
      entries: entries.map((e: any) => ({
        id: e.id,
        roomId: memoryRecord.roomId,
        type: 'SHORT_TERM',
        key: e.key,
        value: JSON.parse(e.value),
        metadata: {},
        createdAt: e.createdAt,
      })),
      createdAt: memoryRecord.createdAt,
      updatedAt: memoryRecord.updatedAt,
    };

    // Cache in Redis
    await this.redis.setex(cacheKey, 3600, JSON.stringify(memory));

    return memory;
  }

  /**
   * Update memory state
   */
  async updateMemoryState(roomId: UUID, updates: Partial<Memory>): Promise<void> {
    const cacheKey = `memory:${roomId}`;
    
    // Invalidate cache
    await this.redis.del(cacheKey);

    // Update PostgreSQL
    if (updates.context) {
      await this.db
        .updateTable('memories')
        .set({
          config: JSON.stringify(updates.context),
          updatedAt: new Date().toISOString(),
        })
        .where('roomId', '=', roomId)
        .execute();
    }
  }

  /**
   * Prune conversation history to fit token limit
   * 
   * Strategy:
   * 1. Keep system messages
   * 2. Keep most recent messages
   * 3. Drop older messages until within limit
   */
  private pruneConversationHistory(
    history: ConversationMessage[],
    maxTokens: number
  ): ConversationMessage[] {
    // Rough token estimation: 1 token ≈ 4 characters
    const estimateTokens = (message: ConversationMessage): number => {
      return Math.ceil(message.content.length / 4);
    };

    // Always keep system messages
    const systemMessages = history.filter(m => m.role === 'system');
    const otherMessages = history.filter(m => m.role !== 'system');

    let totalTokens = systemMessages.reduce((sum, m) => sum + estimateTokens(m), 0);
    const pruned: ConversationMessage[] = [...systemMessages];

    // Add messages from most recent, working backwards
    for (let i = otherMessages.length - 1; i >= 0; i--) {
      const message = otherMessages[i]!;
      const messageTokens = estimateTokens(message);

      if (totalTokens + messageTokens <= maxTokens) {
        pruned.unshift(message);
        totalTokens += messageTokens;
      } else {
        break;
      }
    }

    return pruned;
  }

  /**
   * Get recent memory entries
   */
  private async getRecentMemoryEntries(roomId: UUID, limit: number): Promise<MemoryEntry[]> {
    const entries = await this.db
      .selectFrom('memory_entries')
      .selectAll()
      .where('memoryId', '=', roomId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .execute();

    return entries.map((e: any) => ({
      id: e.id,
      roomId,
      type: 'SHORT_TERM',
      key: e.key,
      value: JSON.parse(e.value),
      metadata: {},
      createdAt: e.createdAt,
    }));
  }
}

/**
 * In-Memory Memory Manager (for testing)
 */
export class InMemoryMemoryManager implements MemoryManagerImpl {
  private memories: Map<UUID, Memory> = new Map();

  async getRecentContext(roomId: UUID, maxTokens: number): Promise<JSONObject> {
    const memory = this.memories.get(roomId);

    if (!memory) {
      return {
        conversationHistory: [],
        context: {},
        entries: [],
      };
    }

    // Simple pruning: take last N messages
    const recentHistory = memory.conversationHistory.slice(-10);

    return {
      conversationHistory: recentHistory,
      context: memory.context,
      entries: memory.entries,
    };
  }

  async appendMessage(roomId: UUID, message: ConversationMessage): Promise<void> {
    let memory = this.memories.get(roomId);

    if (!memory) {
      memory = {
        id: roomId,
        roomId,
        conversationHistory: [],
        context: {},
        entries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.memories.set(roomId, memory);
    }

    memory.conversationHistory.push(message);
    memory.updatedAt = new Date().toISOString();
  }

  async getMemory(roomId: UUID): Promise<Memory | null> {
    return this.memories.get(roomId) || null;
  }

  async updateMemoryState(roomId: UUID, updates: Partial<Memory>): Promise<void> {
    const memory = this.memories.get(roomId);

    if (memory) {
      Object.assign(memory, updates);
      memory.updatedAt = new Date().toISOString();
    }
  }

  clear(): void {
    this.memories.clear();
  }
}
