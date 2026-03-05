# OpenRooms

Orchestration infrastructure for autonomous AI systems. Provides deterministic execution, policy enforcement, and multi-model LLM integration across distributed environments.

## Core Capabilities

- **Agent Runtime**: Autonomous execution with reasoning trace capture
- **Policy Enforcement**: Tool permissions, resource limits, cost controls
- **Deterministic Execution**: Idempotency, FSM validation, crash recovery
- **Multi-Model Support**: OpenAI, Anthropic, extensible provider system
- **Async Worker Pool**: BullMQ-based job processing
- **API Authentication**: Key-based access control with rate limiting
- **Observability**: Append-only trace logs, execution metrics

## Architecture

### Package Structure

- `@openrooms/core` - Core types and contracts
- `@openrooms/agent-runtime` - Agent execution loop and lifecycle
- `@openrooms/execution` - LLM providers, policy enforcement, tool execution
- `@openrooms/database` - PostgreSQL schema and migrations
- `@openrooms/infrastructure-*` - Database, Redis, Queue implementations

### System Components

```
┌─────────────┐
│   API       │ ← Fastify REST API
└──────┬──────┘
       │
       v
┌─────────────┐
│  Job Queue  │ ← BullMQ (Redis)
└──────┬──────┘
       │
       v
┌─────────────┐
│  Workers    │ ← Agent execution pool
└──────┬──────┘
       │
       v
┌─────────────┐
│  Runtime    │ ← Perceive → Reason → Execute → Log
└──────┬──────┘
       │
       ├─→ LLM Providers (OpenAI, Anthropic)
       ├─→ Tool Registry
       ├─→ Policy Enforcer
       ├─→ Trace Logger
       └─→ Memory Manager
```

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

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker
- PostgreSQL 14+
- Redis 7+

### Installation

```bash
pnpm install
docker-compose up -d
docker exec -i rooms-postgres psql -U postgres -d openrooms < packages/database/schema.sql
```

### Environment Configuration

```bash
# apps/api/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/openrooms
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

### Run Services

```bash
pnpm dev              # All services
pnpm dev:api          # API only (port 3001)
pnpm dev:dashboard    # Dashboard only (port 3000)
```

### API Usage

```bash
# Health check
curl http://localhost:3001/api/health

# Create agent
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ResearchAgent",
    "goal": "Market intelligence",
    "allowedTools": ["search_*"],
    "policyConfig": {
      "maxLoopIterations": 10,
      "maxTokensPerRequest": 4000
    }
  }'

# Execute agent
curl -X POST http://localhost:3001/api/agents/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{"roomId": "uuid", "maxIterations": 10}'
```

## Documentation

- [`docs/agent-runtime.md`](docs/agent-runtime.md) - Agent system architecture
- [`docs/api-authentication.md`](docs/api-authentication.md) - API key management
- [`docs/runtime-guarantees.md`](docs/runtime-guarantees.md) - Determinism implementation
- [`docs/database-schema.md`](docs/database-schema.md) - Schema reference
- [`docs/api.md`](docs/api.md) - API endpoints

## Technology Stack

- **API**: Fastify, TypeScript
- **Database**: PostgreSQL, Kysely ORM
- **Queue**: BullMQ, Redis
- **LLM**: OpenAI, Anthropic SDKs
- **UI**: Next.js, React, Tailwind CSS
