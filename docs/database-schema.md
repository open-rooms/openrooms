# Database Schema Alignment

## Enum Type Enforcement

PostgreSQL enum types added to enforce contract compliance at database level.

### Types Defined

```sql
CREATE TYPE "RoomStatus" AS ENUM (
  'IDLE', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED'
);

CREATE TYPE "LogLevel" AS ENUM (
  'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'
);

CREATE TYPE "ExecutionEventType" AS ENUM (
  'ROOM_CREATED', 'ROOM_STARTED', 'ROOM_PAUSED', 'ROOM_RESUMED',
  'ROOM_COMPLETED', 'ROOM_FAILED', 'NODE_ENTERED', 'NODE_EXECUTED',
  'NODE_EXITED', 'NODE_FAILED', 'TOOL_INVOKED', 'TOOL_COMPLETED',
  'TOOL_FAILED', 'AGENT_INVOKED', 'AGENT_RESPONSE', 'AGENT_ERROR',
  'TRANSITION', 'STATE_UPDATED', 'MEMORY_UPDATED'
);
```

## Execution Logs Schema

### Column Structure

| Column | Type | Constraint | Purpose |
|--------|------|------------|---------|
| id | UUID | PRIMARY KEY | Log entry identifier |
| roomId | UUID | NOT NULL, FK to rooms | Execution context |
| workflowId | UUID | NOT NULL | Workflow reference (no FK - audit trail) |
| nodeId | UUID | NULL | Workflow node (ephemeral, no FK) |
| agentId | UUID | NULL | Agent reference (independent lifecycle) |
| eventType | ExecutionEventType | NOT NULL | Event classification |
| level | LogLevel | NOT NULL, DEFAULT 'INFO' | Severity |
| message | TEXT | NOT NULL | Event description |
| data | JSONB | DEFAULT '{}' | Event payload |
| error | JSONB | NULL | Error details if applicable |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | Event occurrence time |
| duration | INTEGER | NULL | Execution duration (ms) |
| metadata | JSONB | NOT NULL, DEFAULT '{}' | Additional context |

### Foreign Key Strategy

**Single FK**: `roomId` → `rooms(id)` ON DELETE CASCADE

**Rationale**:
- Execution logs owned by room execution context
- Logs survive workflow/node/agent deletion for audit compliance
- Append-only architecture prevents orphan log issues
- Room deletion cascades to clean up execution history

### Column Semantics by Domain

**Temporal Events** (execution_logs):
- `timestamp` - Event occurrence time
- Immutable after insert
- Chronological ordering

**Domain Entities** (rooms, workflows, agents, memories):
- `createdAt` - Entity creation time
- `updatedAt` - Last modification time
- Entity lifecycle tracking

## Migration Path

### For Existing Databases

```sql
-- 1. Create enum types (idempotent)
DO $$ BEGIN
  CREATE TYPE "ExecutionEventType" AS ENUM (...);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Alter table to use enums
ALTER TABLE execution_logs 
  ALTER COLUMN "eventType" TYPE "ExecutionEventType" 
  USING "eventType"::"ExecutionEventType";

-- 3. Add new columns
ALTER TABLE execution_logs
  ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS duration INTEGER,
  ADD COLUMN IF NOT EXISTS error JSONB,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 4. Migrate timestamp data if needed
UPDATE execution_logs 
  SET timestamp = "createdAt" 
  WHERE timestamp IS NULL;
```

### Schema Validation

```sql
-- Verify enum constraints
SELECT COUNT(*) FROM execution_logs 
WHERE eventType NOT IN (
  SELECT enumlabel FROM pg_enum 
  WHERE enumtypid = '"ExecutionEventType"'::regtype
);
-- Should return 0

-- Verify FK constraints
SELECT conname, confrelid::regclass, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'execution_logs'::regclass AND contype = 'f';
```

## Implementation Files

- `packages/database/schema.sql` - Complete schema definition
- `packages/database/src/types.ts` - Kysely table interfaces
- `packages/database/src/repositories.ts` - Repository implementations
- `packages/database/migrations/001_add_enum_types.sql` - Migration script
