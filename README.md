# OpenRooms

AI agent orchestration infrastructure for coordinating autonomous systems across models, APIs and blockchain environments.

## Architecture

**Layered package structure:**
- `@openrooms/core` - Types, interfaces, contracts
- `@openrooms/execution` - Workflow engine, node executors, tools, LLM
- `@openrooms/infrastructure-*` - Database, Redis, Queue implementations
- `@openrooms/control-plane` - Control plane services

**Repository pattern:**
- All routes use repositories (`roomRepository`, `workflowRepository`)
- No direct database access in API routes
- Contracts defined in core package

**Node executors:**
- All 7 types implemented (START, END, WAIT, AGENT_TASK, TOOL_EXECUTION, DECISION, PARALLEL)
- Dependencies properly injected
- LLM and tool integration functional

## Determinism and Runtime Guarantees

OpenRooms implements deterministic execution semantics to ensure reliable autonomous operation:

### **Idempotency**
Every workflow step execution is tracked with a unique idempotency key. If a step has already executed, re-execution is prevented by checking the `executedSteps` map in room state. This prevents duplicate side effects during retries or recovery.

### **Finite State Machine (FSM) Validation**
Room status transitions are validated against a defined FSM. Illegal transitions (e.g., `RUNNING → IDLE`, `COMPLETED → RUNNING`) are rejected via `enforceTransition()`. Valid paths:
- `IDLE → RUNNING → PAUSED → RUNNING → COMPLETED`
- `RUNNING → FAILED`

### **Crash Recovery**
When a worker crashes mid-execution, steps in `RUNNING` state are detected on restart. Recovery logic marks these steps as `FAILED` with error code `CRASH_RECOVERY`, preventing silent duplication or inconsistent state.

### **Append-Only Logs**
All execution events are logged to an append-only event stream. Logs are immutable and ordered by timestamp, enabling deterministic replay and audit trails.

### **Test Validation**
Runtime guarantees are validated by:
- **Duplicate Execution Prevention Test**: Verifies idempotency map blocks re-execution
- **Illegal FSM Transition Test**: Validates state transition enforcement
- **Crash Recovery Test**: Simulates mid-step crash and validates recovery
- **Determinism Test**: Runs identical workflow 5 times, verifies identical state/logs

Run tests:
```bash
docker exec -i rooms-test-db psql -U rooms_test -d rooms_test < packages/database/schema.sql
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test
```

Expected: 12 tests pass (3 runtime guarantees + 7 integration + 2 determinism)

## Development

**Prerequisites:**
- Node.js 18+
- pnpm 8+
- Docker (for Postgres and Redis)

**Setup:**
```bash
pnpm install
docker-compose up -d
pnpm db:push
```

**Run services:**
```bash
pnpm dev              # All services
pnpm dev:api          # API only
pnpm dev:dashboard    # Dashboard only
```

**Run tests:**
```bash
pnpm test             # All tests
pnpm test:api         # API tests only
```

## Infrastructure

**Database:** PostgreSQL 14+  
**Cache/Queue:** Redis 7+  
**Message Queue:** BullMQ  
**API Framework:** Express  
**UI Framework:** Next.js 14

## Status

✅ Core execution engine operational  
✅ Runtime guarantees validated  
✅ Deterministic workflow execution  
✅ Platform UI infrastructure  

Last updated: 2026-03-05
