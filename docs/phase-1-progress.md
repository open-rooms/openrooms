# Phase 1 Implementation - In Progress

## Completed ✅

### 1. Repository Interface Contracts
- Created `packages/core/src/contracts/repositories.ts`
- Defined interfaces for:
  - `RoomRepository` with full CRUD + status updates
  - `WorkflowRepository` with node operations
  - `ExecutionLogRepository` with querying
  - `MemoryRepository` with entry management
  - `StateRepository` with locking and CAS
  - `ExecutionStepRepository` for idempotency
- Exported from core package

### 2. Infrastructure Package Structure
- Created `packages/infrastructure/database/`
- Set up package.json with dependencies
- Configured TypeScript
- Ready for repository implementations

## Next Steps

### Step 1: Implement RoomRepository (30 min)
Create `packages/infrastructure/database/src/repositories/room-repository.ts`:
```typescript
import { Kysely } from 'kysely';
import {
  RoomRepository,
  CreateRoomData,
  UpdateRoomData,
  RoomFilters,
  Room,
  RoomStatus,
  UUID,
} from '@openrooms/core';

export class KyselyRoomRepository implements RoomRepository {
  constructor(private db: Kysely<Database>) {}
  
  async create(data: CreateRoomData): Promise<Room> {
    // Implementation using Kysely insert
  }
  
  async findById(id: UUID): Promise<Room | null> {
    // Implementation using Kysely select
  }
  
  // ... implement all interface methods
}
```

### Step 2: Implement WorkflowRepository (30 min)
Similar pattern for workflows and nodes.

### Step 3: Implement ExecutionLogRepository (20 min)
Similar pattern for execution logs.

### Step 4: Implement StateRepository (45 min)
Create `packages/infrastructure/redis/src/state-repository.ts`:
```typescript
import Redis from 'ioredis';
import { StateRepository, RoomState, UUID } from '@openrooms/core';

export class RedisStateRepository implements StateRepository {
  constructor(private redis: Redis) {}
  
  async get(roomId: UUID): Promise<RoomState | null> {
    const data = await this.redis.get(`room:${roomId}:state`);
    return data ? JSON.parse(data) : null;
  }
  
  async compareAndSet(
    roomId: UUID,
    expectedVersion: number,
    newState: RoomState
  ): Promise<boolean> {
    // Use Redis WATCH/MULTI/EXEC for atomic CAS
    await this.redis.watch(`room:${roomId}:state`);
    const current = await this.get(roomId);
    
    if (current && current.version !== expectedVersion) {
      await this.redis.unwatch();
      return false;
    }
    
    const result = await this.redis.multi()
      .set(`room:${roomId}:state`, JSON.stringify(newState))
      .exec();
      
    return result !== null;
  }
  
  // ... implement locking with Redis
}
```

### Step 5: Refactor Existing Code (1-2 hours)
1. Update `packages/database/src/index.ts` to export repositories
2. Modify services to accept repository interfaces via DI
3. Replace direct Kysely usage with repository calls
4. Add repository factories

### Step 6: Test & Validate
- Unit tests for each repository
- Integration tests with real DB
- Verify no direct Kysely imports outside infrastructure

## Files to Create

```
packages/infrastructure/
├── database/
│   ├── src/
│   │   ├── repositories/
│   │   │   ├── room-repository.ts
│   │   │   ├── workflow-repository.ts
│   │   │   ├── execution-log-repository.ts
│   │   │   ├── memory-repository.ts
│   │   │   └── execution-step-repository.ts
│   │   ├── kysely/
│   │   │   ├── db.ts (move from packages/database)
│   │   │   └── types.ts (move from packages/database)
│   │   └── index.ts
│   ├── package.json ✅
│   └── tsconfig.json ✅
│
└── redis/
    ├── src/
    │   ├── state-repository.ts
    │   ├── lock-manager.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

## Commands to Continue

```bash
# Install dependencies for new packages
cd packages/infrastructure/database && pnpm install

# Start implementing repositories
# (Use the patterns above)

# Run type checking
pnpm typecheck

# When done, commit
git add packages/core/src/contracts packages/infrastructure
git commit -m "feat(arch): implement repository pattern (Phase 1)"
```

## Estimated Time to Complete Phase 1

- Repository implementations: 2-3 hours
- Refactoring existing code: 1-2 hours
- Testing: 1 hour
- **Total: 4-6 hours**

## Current Status

✅ Interfaces defined
✅ Package structure ready
🔄 Implementation in progress
⏳ Refactoring pending
⏳ Testing pending
