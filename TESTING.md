# ROOMS Test Infrastructure

## Test Database Setup

### Quick Start

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Wait for healthy status
docker exec rooms-test-db pg_isready -U rooms_test

# Run tests
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test

# Stop database
docker-compose -f docker-compose.test.yml down
```

### Database Configuration

- **Connection String**: `postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test`
- **Host**: localhost
- **Port**: 5433 (external), 5432 (internal)
- **Database**: rooms_test
- **User**: rooms_test
- **Password**: rooms_test_pass

## Critical Runtime Tests

Three non-negotiable guarantees are tested in `runtime-guarantees.test.ts`:

### [A] Duplicate Execution Prevention
- **Test**: Manually enqueue the same step twice
- **Expected**: Side effect executed once (idempotency)
- **Mechanism**: `executedSteps` Map tracks completed steps

### [B] FSM Transition Enforcement
- **Test**: Attempt illegal state transition (RUNNING → IDLE)
- **Expected**: `InvalidStateTransitionError` thrown
- **Valid Transitions**:
  - IDLE → RUNNING
  - RUNNING → PAUSED, COMPLETED, FAILED, CANCELLED
  - PAUSED → RUNNING, CANCELLED
  - Terminal states (COMPLETED, FAILED, CANCELLED) cannot transition

### [C] Crash Recovery
- **Test**: Kill worker mid-step, restart
- **Expected**: Resume or deterministic fail (no duplication)
- **Recovery**: Crashed RUNNING steps marked as FAILED with `CRASH_RECOVERY` error code

## Test Architecture

```
apps/api/tests/
├── determinism.test.ts      # Workflow determinism validation
└── runtime-guarantees.test.ts # Critical runtime guarantees

docker-compose.test.yml       # Test database container
```

## Running Individual Test Suites

```bash
# Runtime guarantees only
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test \
  pnpm test runtime-guarantees

# Determinism tests only
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test \
  pnpm test determinism

# All tests
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test \
  pnpm test
```

## Architecture Guarantees

These tests validate the core architectural principles:

1. **Idempotency**: Steps execute exactly once via `executedSteps` tracking
2. **FSM Enforcement**: State transitions follow strict rules via `enforceTransition()`
3. **Crash Recovery**: System recovers deterministically from mid-execution failures
4. **Determinism**: Identical inputs produce identical outputs and state transitions
5. **Append-Only Logs**: Execution logs never deleted, only appended
6. **Transactional State**: State changes atomic via Redis serialization

## Troubleshooting

### "DATABASE_URL environment variable is not set"
```bash
export DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test
```

### "Jest did not exit"
This is expected - Redis and Postgres connections may remain open. The tests still pass.

### Database connection refused
```bash
# Check if container is running
docker ps | grep rooms-test-db

# Restart if needed
docker-compose -f docker-compose.test.yml restart
```
