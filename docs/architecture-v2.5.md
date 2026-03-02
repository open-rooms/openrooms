# OpenRooms Architecture v2.5 - Stabilization Plan

## Current State Analysis

### Existing Structure
```
packages/
├── core/          # Domain types & interfaces (good foundation)
├── database/      # Kysely + repositories (needs abstraction)
├── engine/        # Workflow FSM engine (needs determinism audit)
├── worker/        # BullMQ workers (needs crash recovery)
├── tools/         # Tool plugins (needs proper abstraction)
└── llm/           # LLM providers (needs proper abstraction)

apps/
├── api/           # Fastify API (needs layer separation)
└── dashboard/     # Next.js UI (control plane only)
```

### Issues Identified
1. **Layer leakage**: API routes contain business logic
2. **Direct DB access**: Services bypass repository pattern
3. **Non-deterministic execution**: No idempotency guarantees
4. **Crash recovery missing**: Worker failures leave inconsistent state
5. **Type duplication**: Types defined across multiple packages
6. **Circular dependencies**: Cross-package imports

## Target Architecture

### Clean Layer Separation

```
packages/
├── core/                           # LAYER 0: Pure domain
│   ├── types/                      # Canonical domain types
│   │   ├── room.ts
│   │   ├── workflow.ts
│   │   ├── execution.ts
│   │   ├── tool.ts
│   │   ├── llm.ts
│   │   └── index.ts
│   └── contracts/                  # Interface contracts
│       ├── repositories.ts         # Persistence contracts
│       ├── services.ts             # Business logic contracts
│       └── adapters.ts             # Infrastructure contracts
│
├── infrastructure/                 # LAYER 1: Infrastructure adapters
│   ├── database/                   # Database implementation
│   │   ├── repositories/           # Repository implementations
│   │   │   ├── room-repository.ts
│   │   │   ├── workflow-repository.ts
│   │   │   ├── log-repository.ts
│   │   │   └── state-repository.ts
│   │   ├── kysely/                 # Kysely setup
│   │   └── migrations/
│   ├── redis/                      # Redis state manager
│   │   ├── state-manager.ts
│   │   └── lock-manager.ts
│   └── queue/                      # BullMQ queue adapter
│       ├── job-queue.ts
│       └── worker-pool.ts
│
├── execution/                      # LAYER 2: Execution runtime
│   ├── workflow-engine/            # FSM orchestrator
│   │   ├── engine.ts               # Main engine
│   │   ├── executor.ts             # Node executor
│   │   ├── transition.ts           # Transition logic
│   │   └── recovery.ts             # Crash recovery
│   ├── runtime/                    # Execution context
│   │   ├── context.ts              # Execution context
│   │   ├── idempotency.ts          # Idempotency guard
│   │   └── transaction.ts          # State transaction
│   ├── tools/                      # Tool execution
│   │   ├── registry.ts             # Tool registry
│   │   ├── executor.ts             # Tool executor
│   │   └── builtin/                # Built-in tools
│   └── llm/                        # LLM execution
│       ├── service.ts              # LLM service
│       ├── providers/              # Provider implementations
│       └── adapter.ts              # Provider adapter
│
└── control-plane/                  # LAYER 3: Control plane
    ├── services/                   # Business logic services
    │   ├── room-service.ts         # Room orchestration
    │   ├── workflow-service.ts     # Workflow management
    │   ├── execution-service.ts    # Execution coordination
    │   └── logging-service.ts      # Logging aggregation
    ├── use-cases/                  # Application use cases
    │   ├── create-room.ts
    │   ├── run-room.ts
    │   ├── get-room-status.ts
    │   └── get-room-logs.ts
    └── events/                     # Domain events
        ├── emitter.ts
        └── handlers.ts

apps/
├── api/                            # HTTP API (thin controller layer)
│   ├── routes/                     # Route handlers
│   ├── controllers/                # Request/response mapping
│   └── middleware/                 # HTTP middleware
└── dashboard/                      # UI (read-only control plane)
```

### Dependency Rules

**LAYER 0 (core):**
- No external dependencies
- Only exports types and interfaces
- Never imports from other layers

**LAYER 1 (infrastructure):**
- Implements contracts from core
- Can import from core only
- Never imports from execution or control-plane

**LAYER 2 (execution):**
- Depends on core contracts
- Uses infrastructure through adapters
- Never imports from control-plane

**LAYER 3 (control-plane):**
- Orchestrates execution layer
- Uses infrastructure through contracts
- Never contains runtime logic

**Apps:**
- Only imports from control-plane
- Thin HTTP/UI layer
- No business logic

## Architectural Guarantees

### 1. Deterministic Execution

**Guarantee**: Given the same workflow definition and inputs, execution produces the same result.

**Implementation:**
- All node executors are pure functions
- External I/O is abstracted behind interfaces
- Random/time-dependent operations are seeded
- Tool invocations are idempotent
- State transitions are explicit and logged

**Verification:**
```typescript
// Idempotency key per execution step
interface ExecutionStep {
  id: UUID;                    // Unique step ID
  roomId: UUID;
  nodeId: UUID;
  attemptNumber: number;
  idempotencyKey: string;      // Hash of (roomId, nodeId, inputs)
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  result?: JSONValue;
  timestamp: ISO8601DateTime;
}

// Before executing node
async function executeNodeIdempotent(step: ExecutionStep) {
  const existing = await getStepByIdempotencyKey(step.idempotencyKey);
  if (existing && existing.status === 'COMPLETED') {
    return existing.result; // Return cached result
  }
  // Execute and store with idempotency key
}
```

### 2. Crash Recovery

**Guarantee**: If a worker crashes mid-execution, the system recovers to a consistent state.

**Implementation:**
- All state mutations are transactional
- Worker heartbeats monitored
- Stale executions detected and restarted
- Partial executions are rolled back or resumed
- Duplicate delivery is handled via idempotency

**Recovery Algorithm:**
```typescript
// On worker startup
async function recoverStaleExecutions() {
  // Find rooms in RUNNING state with no active worker
  const staleRooms = await findRoomsWithoutHeartbeat(60_000);
  
  for (const room of staleRooms) {
    const state = await getState(room.id);
    const lastStep = await getLastExecutionStep(room.id);
    
    if (lastStep.status === 'COMPLETED') {
      // Last step completed, continue from next transition
      await transitionToNextNode(room.id, lastStep.nodeId);
    } else {
      // Last step incomplete, retry from last known good state
      await retryStep(lastStep);
    }
  }
}
```

### 3. State Consistency

**Guarantee**: Room state is always consistent. No partial updates visible externally.

**Implementation:**
- Redis transactions for state updates
- Optimistic locking with version numbers
- Append-only execution log
- State rebuilds from log if corrupted

**State Update Pattern:**
```typescript
async function updateRoomState(
  roomId: UUID,
  updates: Partial<RoomState>
): Promise<Result<void>> {
  const lock = await acquireLock(roomId, 5000);
  if (!lock) {
    return { success: false, error: new Error('Lock acquisition failed') };
  }
  
  try {
    const currentState = await getState(roomId);
    const newState = { ...currentState, ...updates, version: currentState.version + 1 };
    
    // Atomic compare-and-set
    const success = await redis.watch(`room:${roomId}:state`);
    if (currentState.version !== newState.version - 1) {
      throw new Error('Version mismatch - concurrent update detected');
    }
    
    await redis.multi()
      .set(`room:${roomId}:state`, JSON.stringify(newState))
      .exec();
    
    return { success: true, data: undefined };
  } finally {
    await releaseLock(roomId);
  }
}
```

### 4. Append-Only Logs

**Guarantee**: Execution logs are immutable and provide complete audit trail.

**Implementation:**
- Logs never deleted, only archived
- Each log entry has monotonic sequence number
- State can be reconstructed from logs (event sourcing)
- Log entries are immutable after write

### 5. Tool Invocation Idempotency

**Guarantee**: Duplicate tool invocations (from retries) do not cause duplicate side effects.

**Implementation:**
- Tool calls tagged with invocation ID
- Tool executors check for existing result before executing
- External APIs called with idempotency keys
- Results cached in state

**Tool Execution Pattern:**
```typescript
async function executeToolIdempotent(
  call: ToolCall,
  context: ToolExecutionContext
): Promise<ToolResult> {
  // Check for existing result
  const cached = await getToolResult(call.id);
  if (cached) {
    return cached;
  }
  
  // Execute tool
  const result = await tool.execute(call.arguments, context);
  
  // Store result atomically
  await storeToolResult(call.id, result);
  
  return result;
}
```

## Implementation Phases

### Phase 1: Repository Pattern (Week 1)
- [ ] Extract repository interfaces to `core/contracts/repositories.ts`
- [ ] Implement concrete repositories in `infrastructure/database/repositories/`
- [ ] Refactor services to depend on repository interfaces
- [ ] Remove direct Kysely usage outside infrastructure layer

### Phase 2: Layer Separation (Week 1-2)
- [ ] Create `infrastructure/`, `execution/`, `control-plane/` packages
- [ ] Move code to correct layers
- [ ] Enforce import rules via linter
- [ ] Update API to only import from control-plane

### Phase 3: Determinism & Idempotency (Week 2)
- [ ] Add `ExecutionStep` table and tracking
- [ ] Implement idempotency guards in node executor
- [ ] Add tool invocation deduplication
- [ ] Add integration tests for idempotency

### Phase 4: Crash Recovery (Week 2-3)
- [ ] Implement worker heartbeat system
- [ ] Build stale execution detector
- [ ] Implement recovery algorithm
- [ ] Add chaos testing (kill workers mid-execution)

### Phase 5: State Transactions (Week 3)
- [ ] Implement optimistic locking
- [ ] Add version numbers to room state
- [ ] Implement compare-and-set pattern
- [ ] Add concurrent update tests

### Phase 6: Testing & Documentation (Week 3-4)
- [ ] Write architectural tests
- [ ] Document guarantees
- [ ] Create migration guide
- [ ] Update API documentation

## Unresolved Technical Debt

1. **Database Migration**: Currently using Kysely but no formal migration system
2. **Monitoring**: No metrics or tracing infrastructure
3. **Authentication**: No auth layer (intentionally deferred)
4. **Rate Limiting**: No rate limiting on tool invocations
5. **Workflow Versioning**: No strategy for versioning workflow definitions
6. **Event Sourcing**: Logs are append-only but not used for state rebuild yet
7. **Horizontal Scaling**: Workers scale but state manager is single-node Redis

## Success Criteria

- ✅ All layers have clear boundaries
- ✅ No direct database queries outside repositories
- ✅ Workflow execution is deterministic and testable
- ✅ Worker crashes do not corrupt state
- ✅ Duplicate queue delivery is handled safely
- ✅ State updates are transactional
- ✅ Execution logs provide complete audit trail
- ✅ Architecture document explains all guarantees
