# Runtime Guarantees Implementation

## Overview

Implementation of three critical runtime guarantees for deterministic workflow execution: idempotency enforcement, finite state machine transition validation, and crash recovery without duplication.

## Implementation Status

All three runtime guarantees are implemented and validated with automated tests.

### Test Results

```
PASS tests/runtime-guarantees.test.ts
  CRITICAL Runtime Guarantees
    ✓ [A] duplicate execution prevented by idempotency (18 ms)
    ✓ [B] illegal FSM transition rejected (RUNNING → IDLE) (12 ms)
    ✓ [C] crash recovery prevents duplication (9 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

## Architecture Changes

### Core Layer

**Idempotency Tracking**
- `RoomState.executedSteps: Map<UUID, StepExecutionRecord>`
- Location: `packages/core/src/types.ts`
- Tracks all completed step executions to prevent duplication

**FSM Transition Validation**
- `enforceTransition(from: RoomStatus, to: RoomStatus): void`
- Location: `packages/core/src/utils/state-machine.ts`
- Throws `InvalidStateTransitionError` for illegal state transitions
- Exported from `@openrooms/core`

**Error Types**
- `InvalidStateTransitionError extends DomainError`
- Location: `packages/core/src/errors.ts`
- Used by FSM transition guards

### Infrastructure Layer

**State Persistence**
- Redis state manager handles Map serialization/deserialization
- Location: `packages/infrastructure/redis/src/state-manager.ts`
- Converts `executedSteps` Map to/from JSON for persistence

**Serialization Logic**
```typescript
// setState: Map → Object
const serializable = {
  ...state,
  executedSteps: Object.fromEntries(state.executedSteps),
};

// getState: Object → Map
const state = {
  ...parsed,
  executedSteps: new Map(Object.entries(parsed.executedSteps ?? {})),
};
```

## Runtime Guarantees

### [A] Idempotency Enforcement

**Mechanism**: Step execution tracking via `executedSteps` Map

**Implementation**:
```typescript
if (state.executedSteps.has(stepId)) {
  // Step already executed - return cached result
  return state.executedSteps.get(stepId).result;
}
```

**Test Validation**: Manually enqueue same step twice, verify single execution

**Test Output**:
```
Duplicate execution prevented
Step <uuid> marked COMPLETED
Re-execution blocked by idempotency map
```

### [B] FSM Transition Validation

**Mechanism**: Guard function validates all state transitions

**Valid Transitions**:
- `IDLE → RUNNING`
- `RUNNING → PAUSED, COMPLETED, FAILED, CANCELLED`
- `PAUSED → RUNNING, CANCELLED`
- Terminal states (`COMPLETED`, `FAILED`, `CANCELLED`) cannot transition

**Implementation**:
```typescript
export function enforceTransition(from: RoomStatus, to: RoomStatus): void {
  if (!isValidTransition(from, to)) {
    throw new InvalidStateTransitionError(from, to);
  }
}
```

**Test Validation**: Attempt illegal transitions, verify rejection

**Test Output**:
```
Illegal FSM transitions rejected
RUNNING → IDLE: REJECTED
COMPLETED → RUNNING: REJECTED
RUNNING → PAUSED: ALLOWED
RUNNING → COMPLETED: ALLOWED
```

### [C] Crash Recovery

**Mechanism**: Detect interrupted executions, mark as failed without duplication

**Recovery Logic**:
```typescript
const state = await stateManager.getState(roomId);
for (const [stepId, step] of state.executedSteps) {
  if (step.status === 'RUNNING') {
    // System crashed during execution
    step.status = 'FAILED';
    step.error = { code: 'CRASH_RECOVERY', message: '...' };
  }
}
```

**Test Validation**: Simulate crash mid-execution, verify deterministic recovery

**Test Output**:
```
Crash detected during recovery
Step <uuid> was RUNNING when system crashed
Recovery action: Mark step FAILED
Final state: FAILED (deterministic)
No duplicate execution occurred
```

## Test Infrastructure

### Database

**Container**: PostgreSQL 16 Alpine  
**Configuration**: `docker-compose.test.yml`  
**Connection**: `postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test`

**Start Database**:
```bash
docker-compose -f docker-compose.test.yml up -d
```

### Test Suite

**Location**: `apps/api/tests/runtime-guarantees.test.ts`

**Run Tests**:
```bash
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test runtime-guarantees
```

**Automated Runner**:
```bash
./test-runtime.sh
```

## Dependencies

**Added Packages**:
- `openai` - LLM provider integration
- `bullmq` - Job queue implementation

**Package Updates**:
- `packages/execution/package.json`
- `pnpm-lock.yaml`

## Modified Files

**Core Package** (`@openrooms/core`):
- `src/index.ts` - Remove duplicate exports
- `src/utils/state-machine.ts` - Add `enforceTransition()` with error handling

**Database Package** (`@openrooms/database`):
- `src/repositories.ts` - Align repository implementations with interfaces
- `src/types.ts` - Update table schemas for core type compatibility

**Execution Package** (`@openrooms/execution`):
- `llm/src/providers.ts` - Type assertions for OpenAI SDK
- `tools/src/builtin-tools.ts` - Fix implicit any types
- `workflow-engine/src/engine.ts` - JSONValue type handling
- `workflow-engine/src/node-executors.ts` - Correct import paths

**Infrastructure Packages**:
- `packages/infrastructure/redis/src/state-manager.ts` - Map serialization
- `packages/infrastructure/queue/src/job-queue.ts` - Remove unused parameters

## Type System Changes

**JSON Type Safety**:
- Added `JSONValue` and `JSONObject` type assertions throughout execution layer
- Ensures compatibility with strict typing requirements

**Map Serialization**:
- `executedSteps: Map<UUID, StepExecutionRecord>` serializes to/from Redis
- `attempts: Map<UUID, number>` serializes to/from Redis

## Validation

**Compiler**: All TypeScript errors resolved  
**Tests**: All runtime guarantee tests passing  
**Coverage**: Three critical execution paths validated

## Documentation

- `TESTING.md` - Test infrastructure setup and troubleshooting
- `README_TESTS.md` - Quick start guide for running tests
- This document - Runtime guarantees implementation details
