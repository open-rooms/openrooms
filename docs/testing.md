# Test Infrastructure

## Database Configuration

### PostgreSQL Test Instance

**Image**: `postgres:16-alpine`  
**Container**: `rooms-test-db`  
**Port Mapping**: `5433:5432`  
**Database**: `rooms_test`  
**Credentials**: `rooms_test` / `rooms_test_pass`

**Connection String**:
```
postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test
```

### Container Management

**Start**:
```bash
docker-compose -f docker-compose.test.yml up -d
```

**Health Check**:
```bash
docker exec rooms-test-db pg_isready -U rooms_test
```

**Stop**:
```bash
docker-compose -f docker-compose.test.yml down
```

**Remove Volumes**:
```bash
docker-compose -f docker-compose.test.yml down -v
```

## Test Execution

### Runtime Guarantees

**Test File**: `apps/api/tests/runtime-guarantees.test.ts`

**Manual Execution**:
```bash
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test runtime-guarantees
```

**Automated Script**:
```bash
./test-runtime.sh
```

### Determinism Tests

**Test File**: `apps/api/tests/determinism.test.ts`

**Execution**:
```bash
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test determinism
```

### Full Test Suite

**All Tests**:
```bash
cd apps/api
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test pnpm test
```

## Test Categories

### Runtime Guarantee Tests

Three critical execution invariants:

1. **Idempotency Test**: Validates duplicate execution prevention via `executedSteps` Map
2. **FSM Transition Test**: Validates state transition enforcement via `enforceTransition()`
3. **Crash Recovery Test**: Validates deterministic recovery without duplication

### Expected Output

```
PASS tests/runtime-guarantees.test.ts
  CRITICAL Runtime Guarantees
    ✓ [A] duplicate execution prevented by idempotency
    ✓ [B] illegal FSM transition rejected (RUNNING → IDLE)
    ✓ [C] crash recovery prevents duplication

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

## Configuration

### Environment Variables

**Required**:
- `DATABASE_URL` - PostgreSQL connection string

**Optional**:
- `REDIS_URL` - Redis connection (default: `redis://localhost:6379`)
- `NODE_ENV` - Environment mode (set to `test` for test runs)

### Test Database Schema

Schema is initialized from:
- `packages/database/src/schema.sql`
- Applied via Kysely migrations

## Troubleshooting

### Database Connection Refused

**Symptom**: `ECONNREFUSED` errors when running tests

**Solution**:
```bash
# Check container status
docker ps | grep rooms-test-db

# Restart if needed
docker-compose -f docker-compose.test.yml restart
```

### Port Already in Use

**Symptom**: `port 5433 already allocated`

**Solution**:
```bash
# Check what's using the port
lsof -i :5433

# Stop conflicting service or change port in docker-compose.test.yml
```

### Jest Timeout

**Symptom**: `Jest did not exit one second after test completion`

**Cause**: Redis/Postgres connections remain open

**Note**: Tests still pass, cleanup happens on process exit. This is expected behavior for integration tests with persistent connections.

### Invalid Event Type

**Symptom**: `invalid input value for enum "ExecutionEventType"`

**Cause**: Database enum doesn't match code types

**Solution**: Ensure migrations are applied and schema is up to date

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: rooms_test
          POSTGRES_USER: rooms_test
          POSTGRES_PASSWORD: rooms_test_pass
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test
```

## Test Data Management

### Cleanup Strategy

Tests use `beforeAll` and `afterAll` hooks for setup/teardown:

```typescript
beforeAll(async () => {
  // Initialize test data
});

afterAll(async () => {
  // Cleanup test data
  await container.redis.disconnect();
});
```

### Isolation

Each test suite creates isolated workflows and rooms to prevent interference between tests.

## Performance Considerations

### Test Execution Time

- Runtime guarantees: ~50ms total
- Determinism tests: ~3-5s (includes workflow execution simulation)
- Full suite: ~7-10s

### Database Reset

For complete isolation between test runs:
```bash
docker-compose -f docker-compose.test.yml down -v && docker-compose -f docker-compose.test.yml up -d
```

## Documentation References

- Runtime guarantee implementation: `docs/runtime-guarantees.md`
- Quick start guide: `README_TESTS.md`
- Architecture overview: `docs/architecture.md`
