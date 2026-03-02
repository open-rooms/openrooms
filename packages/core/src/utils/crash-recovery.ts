/**
 * Crash Recovery and Heartbeat System
 * 
 * Detects and recovers from worker crashes and orphaned jobs
 */

import { UUID, RoomStatus } from '../types';

/**
 * Worker heartbeat record
 */
export interface WorkerHeartbeat {
  workerId: UUID;
  roomId: UUID;
  lastHeartbeat: string;
  status: 'ACTIVE' | 'STALE' | 'DEAD';
  processId?: number;
  hostname?: string;
}

/**
 * Crash recovery configuration
 */
export interface CrashRecoveryConfig {
  heartbeatInterval: number; // milliseconds
  heartbeatTimeout: number; // milliseconds
  maxRecoveryAttempts: number;
  orphanDetectionInterval: number; // milliseconds
}

/**
 * Default crash recovery configuration
 */
export const DEFAULT_CRASH_RECOVERY_CONFIG: CrashRecoveryConfig = {
  heartbeatInterval: 5000, // 5 seconds
  heartbeatTimeout: 15000, // 15 seconds
  maxRecoveryAttempts: 3,
  orphanDetectionInterval: 30000, // 30 seconds
};

/**
 * Check if a heartbeat is stale
 */
export function isHeartbeatStale(
  heartbeat: WorkerHeartbeat,
  timeout: number
): boolean {
  const lastHeartbeatTime = new Date(heartbeat.lastHeartbeat).getTime();
  const now = Date.now();
  return now - lastHeartbeatTime > timeout;
}

/**
 * Determine heartbeat status
 */
export function getHeartbeatStatus(
  heartbeat: WorkerHeartbeat,
  config: CrashRecoveryConfig
): 'ACTIVE' | 'STALE' | 'DEAD' {
  const age = Date.now() - new Date(heartbeat.lastHeartbeat).getTime();

  if (age < config.heartbeatInterval * 2) {
    return 'ACTIVE';
  }

  if (age < config.heartbeatTimeout) {
    return 'STALE';
  }

  return 'DEAD';
}

/**
 * Recovery action for orphaned room
 */
export interface RecoveryAction {
  roomId: UUID;
  action: 'RESUME' | 'FAIL' | 'RETRY' | 'CLEANUP';
  reason: string;
  timestamp: string;
  attemptCount: number;
}

/**
 * Determine recovery action for a room
 */
export function determineRecoveryAction(
  roomId: UUID,
  roomStatus: RoomStatus,
  heartbeat: WorkerHeartbeat | null,
  attemptCount: number,
  config: CrashRecoveryConfig
): RecoveryAction {
  const timestamp = new Date().toISOString();

  // No heartbeat and room is RUNNING = orphaned
  if (!heartbeat && roomStatus === RoomStatus.RUNNING) {
    if (attemptCount >= config.maxRecoveryAttempts) {
      return {
        roomId,
        action: 'FAIL',
        reason: 'Max recovery attempts exceeded',
        timestamp,
        attemptCount,
      };
    }

    return {
      roomId,
      action: 'RETRY',
      reason: 'Orphaned room detected, retrying execution',
      timestamp,
      attemptCount: attemptCount + 1,
    };
  }

  // Dead heartbeat = worker crashed
  if (heartbeat && getHeartbeatStatus(heartbeat, config) === 'DEAD') {
    if (attemptCount >= config.maxRecoveryAttempts) {
      return {
        roomId,
        action: 'FAIL',
        reason: 'Worker crashed, max recovery attempts exceeded',
        timestamp,
        attemptCount,
      };
    }

    return {
      roomId,
      action: 'RESUME',
      reason: 'Worker crashed, resuming from last checkpoint',
      timestamp,
      attemptCount: attemptCount + 1,
    };
  }

  // Room is in terminal state = cleanup
  if (
    roomStatus === RoomStatus.COMPLETED ||
    roomStatus === RoomStatus.FAILED ||
    roomStatus === RoomStatus.CANCELLED
  ) {
    return {
      roomId,
      action: 'CLEANUP',
      reason: 'Room in terminal state, cleaning up resources',
      timestamp,
      attemptCount,
    };
  }

  // Default: no action needed
  return {
    roomId,
    action: 'RESUME',
    reason: 'No action needed',
    timestamp,
    attemptCount,
  };
}

/**
 * Orphan detection result
 */
export interface OrphanDetectionResult {
  totalRooms: number;
  orphanedRooms: UUID[];
  stalledRooms: UUID[];
  activeRooms: UUID[];
}

/**
 * Create a worker heartbeat
 */
export function createHeartbeat(
  workerId: UUID,
  roomId: UUID
): WorkerHeartbeat {
  return {
    workerId,
    roomId,
    lastHeartbeat: new Date().toISOString(),
    status: 'ACTIVE',
    processId: process.pid,
    hostname: require('os').hostname(),
  };
}

/**
 * Update heartbeat timestamp
 */
export function updateHeartbeat(
  heartbeat: WorkerHeartbeat
): WorkerHeartbeat {
  return {
    ...heartbeat,
    lastHeartbeat: new Date().toISOString(),
    status: 'ACTIVE',
  };
}
