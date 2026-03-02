/**
 * Idempotency utilities for deterministic workflow execution
 */

import { UUID } from '../types';
import * as crypto from 'crypto';

/**
 * Generate a deterministic idempotency key
 * 
 * Format: {roomId}:{nodeId}:{attempt}:{timestamp}
 * This ensures the same step with the same attempt never executes twice
 */
export function generateIdempotencyKey(
  roomId: UUID,
  nodeId: UUID,
  attempt: number,
  timestamp: string
): string {
  const data = `${roomId}:${nodeId}:${attempt}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a unique execution ID
 * 
 * This is a UUID that uniquely identifies a single execution attempt
 */
export function generateExecutionId(): UUID {
  return crypto.randomUUID();
}

/**
 * Validate that an idempotency key matches expected parameters
 */
export function validateIdempotencyKey(
  key: string,
  roomId: UUID,
  nodeId: UUID,
  attempt: number,
  timestamp: string
): boolean {
  const expectedKey = generateIdempotencyKey(roomId, nodeId, attempt, timestamp);
  return key === expectedKey;
}

/**
 * Check if a step execution should be skipped (already completed)
 */
export function shouldSkipExecution(
  executedSteps: Map<UUID, any>,
  nodeId: UUID,
  currentAttempt: number
): boolean {
  const record = executedSteps.get(nodeId);
  
  if (!record) {
    return false; // Never executed
  }
  
  // Skip if already completed successfully for this attempt
  if (record.status === 'COMPLETED' && record.attempt === currentAttempt) {
    return true;
  }
  
  // Skip if currently running (prevents duplicate execution)
  if (record.status === 'RUNNING') {
    return true;
  }
  
  return false;
}
