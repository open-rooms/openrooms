# Running Critical Runtime Tests

## Quick Start

```bash
./test-runtime.sh
```

This will:
1. Start the test database (if not running)
2. Run all three critical runtime guarantee tests
3. Display results

## Three Non-Negotiable Tests

### [A] Duplicate Execution Prevention
**Validates**: Idempotency via `executedSteps` Map  
**Test**: Manually enqueue same step twice  
**Expected**: Side effect executes once

### [B] FSM Transition Enforcement  
**Validates**: State machine guards illegal transitions  
**Test**: Attempt RUNNING → IDLE transition  
**Expected**: `InvalidStateTransitionError` thrown

### [C] Crash Recovery
**Validates**: Deterministic recovery without duplication  
**Test**: Kill worker mid-step, restart  
**Expected**: Step marked FAILED, no duplicate execution

## Manual Test Execution

```bash
# Start database
docker-compose -f docker-compose.test.yml up -d

# Run tests
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test runtime-guarantees

# Stop database
docker-compose -f docker-compose.test.yml down
```

## Expected Output

```
PASS tests/runtime-guarantees.test.ts
  CRITICAL Runtime Guarantees
    ✓ [A] CRITICAL: duplicate execution prevented by idempotency
    ✓ [B] CRITICAL: illegal FSM transition rejected (RUNNING → IDLE)
    ✓ [C] CRITICAL: crash recovery prevents duplication

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

## Documentation

- `RUNTIME_GUARANTEES.md` - Full validation report
- `TESTING.md` - Test infrastructure setup
- `docker-compose.test.yml` - Test database configuration

## Architecture Guarantees

These tests enforce:
- ✅ Idempotent step execution
- ✅ Strict FSM state transitions
- ✅ Deterministic crash recovery
- ✅ Append-only execution logs
- ✅ Transactional state management
