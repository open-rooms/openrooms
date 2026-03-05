# OpenRooms Architecture

## Layered Architecture

OpenRooms uses a layered architecture with strict dependency rules:

```
┌─────────────────┐
│  Control Plane  │ ← API routes, business logic
└─────────────────┘
        ↓
┌─────────────────┐
│   Execution     │ ← Workflow engine, node executors
└─────────────────┘
        ↓
┌─────────────────┐
│ Infrastructure  │ ← Database, Redis, Queue
└─────────────────┘
        ↓
┌─────────────────┐
│      Core       │ ← Types, interfaces, contracts
└─────────────────┘
```

### Dependency Rules

1. Control plane uses repositories (never direct DB access)
2. Execution layer cannot import control plane
3. Infrastructure implements contracts from core
4. All state mutations go through StateManager
5. All data access goes through repositories

### Key Contracts

- `RoomRepository` - Room persistence
- `WorkflowRepository` - Workflow definitions
- `ExecutionLogRepository` - Append-only logs
- `StateManager` - Runtime state management
- `WorkflowEngine` - Execution orchestration

## Determinism Guarantees

### Idempotent Execution
- Each step has unique execution ID
- Idempotency key: `hash(roomId:nodeId:attempt:timestamp)`
- Duplicate executions return cached result
- Step status: PENDING → RUNNING → COMPLETED/FAILED

### FSM State Transitions
Valid transitions enforced by `enforceTransition()`:
- IDLE → RUNNING
- RUNNING → PAUSED | COMPLETED | FAILED | CANCELLED
- PAUSED → RUNNING | CANCELLED
- Terminal states (COMPLETED, FAILED, CANCELLED) cannot transition

### Append-Only Logs
- ExecutionLogRepository only has `create()` method
- No updates or deletes
- Complete audit trail preserved

## Testing

Run integration tests to validate contracts:
```bash
pnpm --filter @openrooms/api test
```

Tests verify:
- Repositories enforce data contracts
- FSM transitions validated
- Logs are append-only
- State mutations go through StateManager
