# Infrastructure Integrity Fixes

## Issues Identified

### 1. Schema Drift - ExecutionEventType Enum

**Problem**: PostgreSQL schema missing enum type definitions  
**Impact**: Runtime tests failing with "invalid input value for enum"  
**Status**: FIXED

**Solution**:
- Added `ExecutionEventType`, `LogLevel`, `RoomStatus` enum types to schema.sql
- Aligned execution_logs table to use strict enum types
- Updated column names: `createdAt` → `timestamp` to match core interface

### 2. Type Safety - Nullable Fields

**Problem**: Integration test checking `lastLog.message` without null check  
**Impact**: TypeScript strictness error  
**Status**: FIXED

**Solution**:
- Added explicit null check: `expect(lastLog).toBeDefined();` before accessing properties
- Changed test event type from `TEST_EVENT` to `STATE_UPDATED` (valid enum value)

### 3. Resource Leaks - Open Handles

**Problem**: Jest not exiting due to unclosed connections  
**Impact**: Tests passing but process hangs  
**Status**: PARTIAL FIX

**Solution Applied**:
- Added proper Redis `disconnect()` in all test `afterAll` hooks
- Removed attempts to close non-existent `container.db` property

**Remaining Issue**:
- BullMQ worker pool connections may still leak
- Need to add `.unref()` to timer handles in WorkerManager
- Consider adding `globalTeardown` script for Jest

## Schema Changes

### Execution Logs Table

**Before**:
```sql
"eventType" TEXT NOT NULL,
level TEXT NOT NULL DEFAULT 'INFO',
"createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
```

**After**:
```sql
"eventType" "ExecutionEventType" NOT NULL,
level "LogLevel" NOT NULL DEFAULT 'INFO',
timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
duration INTEGER,
error JSONB,
metadata JSONB NOT NULL DEFAULT '{}'
```

### Benefits

1. **Type Safety**: Database enforces valid event types at insert time
2. **Contract Alignment**: Schema matches core TypeScript types exactly
3. **Append-Only Integrity**: Separate columns for error/metadata prevent data loss

## Test Status

**Runtime Guarantees**: ALL PASSING
```
✓ [A] CRITICAL: duplicate execution prevented by idempotency (19 ms)
✓ [B] CRITICAL: illegal FSM transition rejected (RUNNING → IDLE) (10 ms)
✓ [C] CRITICAL: crash recovery prevents duplication (6 ms)
```

**Integration Tests**: 1 PASSING (after enum fix)
**Determinism Tests**: FAILING (foreign key constraint on nodeId)

## Remaining Work

1. Fix determinism test foreign key issues (nodeId references)
2. Add proper BullMQ cleanup in test teardown
3. Document enum migration process for existing databases
4. Add `.unref()` to worker timers to prevent hang

## Files Modified

- `packages/database/schema.sql` - Added enum types, updated execution_logs
- `packages/database/src/types.ts` - Updated ExecutionLogTable interface
- `packages/database/src/repositories.ts` - Fixed column names (createdAt → timestamp)
- `apps/api/tests/*.test.ts` - Added proper cleanup, null checks, valid enum values
- `packages/database/migrations/001_add_enum_types.sql` - Migration script for existing DBs
