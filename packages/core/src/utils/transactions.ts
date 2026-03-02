/**
 * Transactional State Management Utilities
 * 
 * Provides transactional guarantees for state mutations
 */

import { UUID, RoomState, Result } from '../types';

/**
 * Transaction context for atomic state operations
 */
export interface StateTransaction {
  id: UUID;
  roomId: UUID;
  timestamp: string;
  operations: StateOperation[];
  committed: boolean;
}

export interface StateOperation {
  type: 'UPDATE_NODE' | 'UPDATE_VARIABLE' | 'UPDATE_STEP' | 'UPDATE_STATUS';
  path: string;
  oldValue: any;
  newValue: any;
}

/**
 * State manager with transactional guarantees
 */
export interface TransactionalStateManager {
  /**
   * Begin a new transaction
   */
  beginTransaction(roomId: UUID): Promise<StateTransaction>;
  
  /**
   * Commit a transaction (atomic)
   */
  commitTransaction(transactionId: UUID): Promise<Result<void>>;
  
  /**
   * Rollback a transaction
   */
  rollbackTransaction(transactionId: UUID): Promise<void>;
  
  /**
   * Execute multiple operations atomically
   */
  executeAtomic<T>(
    roomId: UUID,
    operation: (state: RoomState) => Promise<T>
  ): Promise<Result<T>>;
}

/**
 * Atomic state update pattern
 * 
 * Usage:
 *   const result = await atomicUpdate(stateManager, roomId, (state) => {
 *     state.currentNodeId = newNodeId;
 *     state.variables.count = (state.variables.count as number) + 1;
 *     return state;
 *   });
 */
export async function atomicStateUpdate<SM extends { getState: Function; setState: Function }>(
  stateManager: SM,
  roomId: UUID,
  updateFn: (state: RoomState) => RoomState | Promise<RoomState>
): Promise<Result<RoomState>> {
  try {
    // Get current state
    const state = await stateManager.getState(roomId);
    if (!state) {
      return {
        success: false,
        error: new Error(`State not found for room ${roomId}`),
      };
    }

    // Apply update
    const updatedState = await updateFn(state);

    // Persist atomically
    await stateManager.setState(roomId, updatedState);

    return {
      success: true,
      data: updatedState,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * State snapshot for recovery
 */
export interface StateSnapshot {
  roomId: UUID;
  state: RoomState;
  checksum: string;
  timestamp: string;
  version: number;
}

/**
 * Create a snapshot of current state for recovery
 */
export function createStateSnapshot(
  roomId: UUID,
  state: RoomState,
  version: number
): StateSnapshot {
  const timestamp = new Date().toISOString();
  const stateJson = JSON.stringify(state);
  const checksum = require('crypto')
    .createHash('sha256')
    .update(stateJson)
    .digest('hex');

  return {
    roomId,
    state: JSON.parse(JSON.stringify(state)), // Deep clone
    checksum,
    timestamp,
    version,
  };
}

/**
 * Validate state snapshot integrity
 */
export function validateStateSnapshot(snapshot: StateSnapshot): boolean {
  const stateJson = JSON.stringify(snapshot.state);
  const checksum = require('crypto')
    .createHash('sha256')
    .update(stateJson)
    .digest('hex');

  return checksum === snapshot.checksum;
}
