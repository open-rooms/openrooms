# Test Execution

## Test Database

### Container Configuration

```bash
docker-compose -f docker-compose.test.yml up -d
```

**Connection**: `postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test`  
**Image**: `postgres:16-alpine`  
**Port**: 5433 (external) → 5432 (internal)

### Schema Initialization

```bash
docker exec -i rooms-test-db psql -U rooms_test -d rooms_test < packages/database/schema.sql
```

## Test Suites

### Runtime Guarantees

**File**: `apps/api/tests/runtime-guarantees.test.ts`

**Execution**:
```bash
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test runtime-guarantees
```

**Validates**:
- Idempotency via `executedSteps` Map
- FSM transition enforcement via `enforceTransition()`
- Crash recovery without duplication

### Determinism Tests

**File**: `apps/api/tests/determinism.test.ts`

**Execution**:
```bash
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test determinism
```

**Validates**:
- Identical execution results across runs
- Step execution tracking
- Deterministic state transitions

### Integration Tests

**File**: `apps/api/tests/integration.test.ts`

**Execution**:
```bash
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test integration
```

**Validates**:
- Repository contracts
- FSM state transitions
- Append-only log integrity
- State manager isolation

## All Tests

```bash
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test
```

## Cleanup

```bash
docker-compose -f docker-compose.test.yml down
```

**Remove volumes**:
```bash
docker-compose -f docker-compose.test.yml down -v
```
