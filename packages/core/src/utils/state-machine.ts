/**
 * Finite State Machine for Room Status Transitions
 * 
 * Enforces valid state transitions to prevent invalid workflow states
 */

import { RoomStatus } from '../types';
import { InvalidStateTransitionError } from '../errors';

/**
 * Valid state transitions for Room execution
 */
const VALID_TRANSITIONS: Record<RoomStatus, RoomStatus[]> = {
  [RoomStatus.IDLE]: [RoomStatus.RUNNING],
  [RoomStatus.RUNNING]: [
    RoomStatus.PAUSED,
    RoomStatus.COMPLETED,
    RoomStatus.FAILED,
    RoomStatus.CANCELLED,
  ],
  [RoomStatus.PAUSED]: [RoomStatus.RUNNING, RoomStatus.CANCELLED],
  [RoomStatus.COMPLETED]: [], // Terminal state
  [RoomStatus.FAILED]: [], // Terminal state
  [RoomStatus.CANCELLED]: [], // Terminal state
};

/**
 * Validate if a state transition is allowed
 */
export function isValidTransition(from: RoomStatus, to: RoomStatus): boolean {
  const allowedTransitions = VALID_TRANSITIONS[from];
  return allowedTransitions.includes(to);
}

/**
 * Get all valid next states from current state
 */
export function getValidNextStates(from: RoomStatus): RoomStatus[] {
  return VALID_TRANSITIONS[from] || [];
}

/**
 * Check if a state is terminal (no further transitions allowed)
 */
export function isTerminalState(state: RoomStatus): boolean {
  return VALID_TRANSITIONS[state].length === 0;
}

/**
 * Validate and enforce a state transition
 * 
 * @throws Error if transition is invalid
 */
export function enforceTransition(from: RoomStatus, to: RoomStatus): void {
  if (!isValidTransition(from, to)) {
    throw new InvalidStateTransitionError(from, to);
  }
}

/**
 * State transition rules for deterministic execution
 */
export const STATE_TRANSITION_RULES = {
  /** Transition to RUNNING only from IDLE or PAUSED */
  canStart: (state: RoomStatus) => state === RoomStatus.IDLE,
  
  /** Can only pause if currently RUNNING */
  canPause: (state: RoomStatus) => state === RoomStatus.RUNNING,
  
  /** Can only resume if currently PAUSED */
  canResume: (state: RoomStatus) => state === RoomStatus.PAUSED,
  
  /** Can cancel if RUNNING or PAUSED */
  canCancel: (state: RoomStatus) =>
    state === RoomStatus.RUNNING || state === RoomStatus.PAUSED,
  
  /** Can only complete if currently RUNNING */
  canComplete: (state: RoomStatus) => state === RoomStatus.RUNNING,
  
  /** Can only fail if currently RUNNING */
  canFail: (state: RoomStatus) => state === RoomStatus.RUNNING,
  
  /** Check if state is immutable (terminal) */
  isImmutable: (state: RoomStatus) => isTerminalState(state),
} as const;
