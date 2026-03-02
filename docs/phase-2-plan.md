# Phase 2: Layer Separation - Plan

## Current State Analysis

### Existing Packages
```
packages/
├── core/           # Domain types & interfaces ✅ (already clean)
├── database/       # Old database code (to deprecate)
├── engine/         # Workflow FSM engine → Move to execution/
├── worker/         # BullMQ workers → Move to execution/
├── tools/          # Tool plugins → Move to execution/
├── llm/           # LLM providers → Move to execution/
└── infrastructure/ # New infrastructure layer ✅ (Phase 1)
    └── database/
```

### Target Architecture

```
packages/
├── core/                           # LAYER 0: Pure domain
│   ├── types/
│   ├── contracts/
│   └── errors/
│
├── infrastructure/                 # LAYER 1: Adapters
│   ├── database/      ✅ (done)
│   ├── redis/         (to create)
│   └── queue/         (to create)
│
├── execution/                      # LAYER 2: Runtime
│   ├── workflow-engine/
│   │   ├── engine.ts
│   │   ├── node-executors.ts
│   │   ├── state-manager.ts  (move to infra/redis)
│   │   └── transition.ts
│   ├── runtime/
│   │   ├── context.ts
│   │   └── idempotency.ts
│   ├── tools/
│   │   ├── registry.ts
│   │   ├── executor.ts
│   │   └── builtin/
│   ├── llm/
│   │   ├── service.ts
│   │   ├── providers/
│   │   └── adapter.ts
│   └── workers/
│       ├── queue-adapter.ts
│       └── worker-pool.ts
│
└── control-plane/                  # LAYER 3: Business logic
    ├── services/
    │   ├── room-service.ts
    │   ├── workflow-service.ts
    │   └── execution-service.ts
    └── use-cases/
        ├── create-room.ts
        ├── run-room.ts
        └── get-room-status.ts
```

## Migration Strategy

### Step 1: Create New Package Structures (30 min)

Create three new packages:
- `packages/execution/` - Workflow engine, tools, LLM, workers
- `packages/control-plane/` - Business logic services
- `packages/infrastructure/redis/` - State manager
- `packages/infrastructure/queue/` - BullMQ adapter

### Step 2: Move Files (1 hour)

**From `packages/engine/` to `packages/execution/workflow-engine/`:**
- `workflow-engine.ts` → `engine.ts`
- `node-executors.ts` → `node-executors.ts`
- `state-manager.ts` → Move to `infrastructure/redis/state-manager.ts`

**From `packages/tools/` to `packages/execution/tools/`:**
- `registry.ts` → `registry.ts`
- `builtin-tools.ts` → `builtin/index.ts`

**From `packages/llm/` to `packages/execution/llm/`:**
- `providers.ts` → `providers/index.ts`
- `index.ts` → `service.ts`

**From `packages/worker/` to `packages/execution/workers/`:**
- `queue.ts` → Move to `infrastructure/queue/job-queue.ts`
- `workers.ts` → `worker-pool.ts`

### Step 3: Update Imports (1 hour)

Update all import paths to use new package locations:
- `@openrooms/engine` → `@openrooms/execution`
- `@openrooms/tools` → `@openrooms/execution`
- `@openrooms/llm` → `@openrooms/execution`
- `@openrooms/worker` → `@openrooms/execution`

### Step 4: Deprecate Old Packages (15 min)

Mark old packages as deprecated:
- `packages/database/` - Use `infrastructure/database` instead
- `packages/engine/` - Use `execution/workflow-engine` instead
- `packages/tools/` - Use `execution/tools` instead
- `packages/llm/` - Use `execution/llm` instead
- `packages/worker/` - Use `execution/workers` instead

### Step 5: Add Import Rules (30 min)

Create `.eslintrc.js` with import restrictions:
```javascript
rules: {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['@openrooms/execution'],
          importNames: ['*'],
          message: 'Core layer cannot import from execution layer',
        },
        {
          group: ['@openrooms/control-plane'],
          importNames: ['*'],
          message: 'Execution layer cannot import from control-plane',
        },
      ],
    },
  ],
}
```

## Dependency Rules

### ✅ Allowed
- `core` → nothing
- `infrastructure` → `core`
- `execution` → `core`, `infrastructure` (via contracts)
- `control-plane` → `core`, `infrastructure` (via contracts), `execution` (via contracts)
- `apps` → `control-plane`

### ❌ Forbidden
- `core` → anything
- `infrastructure` → `execution`, `control-plane`
- `execution` → `control-plane`
- Any circular dependencies

## Validation

After migration, verify:
1. ✅ All imports follow dependency rules
2. ✅ TypeScript compiles without errors
3. ✅ Tests pass
4. ✅ No circular dependencies
5. ✅ ESLint enforces layer boundaries

## Time Estimate

- Package structure: 30 min
- File migration: 1 hour
- Import updates: 1 hour
- Testing & validation: 30 min
- Documentation: 30 min

**Total: 3.5 hours**

## Risk Mitigation

1. **Create new packages first** - Don't delete old ones immediately
2. **Copy, don't move** - Keep old files until new structure works
3. **Update one app at a time** - Start with API, then dashboard
4. **Test after each step** - Don't accumulate changes
5. **Can rollback** - Old packages remain until fully migrated

## Success Criteria

- [ ] Clean layer separation enforced
- [ ] Zero circular dependencies
- [ ] ESLint validates architecture
- [ ] All tests passing
- [ ] API and dashboard using new structure
- [ ] Old packages deprecated (not deleted yet)

---

**Ready to proceed with Step 1: Create new package structures?**
