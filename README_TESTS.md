# Running Tests

## Quick Start

```bash
./test-runtime.sh
```

This script will:
1. Start PostgreSQL test container if not running
2. Wait for database ready state
3. Execute runtime guarantee tests
4. Display results

## Manual Execution

### Start Test Database

```bash
docker-compose -f docker-compose.test.yml up -d
```

### Run Runtime Guarantee Tests

```bash
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test runtime-guarantees
```

### Run All Tests

```bash
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test
```

### Stop Test Database

```bash
docker-compose -f docker-compose.test.yml down
```

## Test Suites

### Runtime Guarantees (`runtime-guarantees.test.ts`)

Validates three critical execution invariants:

**Test A: Idempotency Enforcement**
- Mechanism: `executedSteps` Map tracking
- Validation: Duplicate step execution prevented
- Expected: Single execution despite multiple enqueue attempts

**Test B: FSM Transition Validation**
- Mechanism: `enforceTransition()` guard function
- Validation: Illegal state transitions rejected
- Expected: `InvalidStateTransitionError` for invalid transitions

**Test C: Crash Recovery**
- Mechanism: Interrupted step detection and marking
- Validation: Deterministic recovery without duplication
- Expected: Crashed steps marked `FAILED`, no re-execution

### Determinism Tests (`determinism.test.ts`)

Validates workflow execution produces identical results across multiple runs with fixed inputs.

## Expected Output

```
PASS tests/runtime-guarantees.test.ts
  CRITICAL Runtime Guarantees
    ✓ [A] duplicate execution prevented by idempotency (18 ms)
    ✓ [B] illegal FSM transition rejected (RUNNING → IDLE) (12 ms)
    ✓ [C] crash recovery prevents duplication (9 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

## Database Configuration

**Connection**: `postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test`  
**Container**: `rooms-test-db`  
**Image**: `postgres:16-alpine`

## Documentation

- Implementation details: `docs/runtime-guarantees.md`
- Infrastructure setup: `docs/testing.md`
- Architecture: `docs/architecture.md`
