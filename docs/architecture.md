# Architecture

## System Design

OpenRooms implements a finite state machine (FSM) workflow engine with distributed state management for deterministic agent orchestration.

## Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Dashboard (Next.js)                        │
│                 Monitoring & Control UI                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Server (Fastify)                        │
│                REST Endpoints + Validation                   │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Workflow   │  │   State     │  │   Tool      │
│   Engine    │  │  Manager    │  │  Registry   │
│   (FSM)     │  │  (Redis)    │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
          │              │              │
          └──────────────┼──────────────┘
                         ▼
          ┌──────────────────────────────┐
          │   Job Queue (BullMQ)         │
          └──────────────┬───────────────┘
                         ▼
          ┌──────────────────────────────┐
          │   Database (Postgres)        │
          │   Repository Layer (Kysely)  │
          └──────────────────────────────┘
```

## Core Packages

### `@openrooms/core`
Domain types and interfaces. No external dependencies.

**Key Types:**
- `Room`: Execution environment
- `Workflow`: FSM definition
- `Node`: Workflow state
- `Transition`: State change condition
- `Tool`: Plugin interface

### `@openrooms/database`
Database layer using Kysely query builder.

**Responsibilities:**
- Schema management
- Query builder
- Repository pattern
- Connection pooling

### `@openrooms/engine`
Workflow execution engine implementing FSM logic.

**Components:**
- `WorkflowEngine`: Main orchestrator
- `NodeExecutor`: Per-node execution logic
- `TransitionEvaluator`: Condition checking
- `ExecutionContext`: Runtime state

### `@openrooms/worker`
Background job processing with BullMQ.

**Jobs:**
- Workflow execution
- Tool invocation
- State cleanup
- Log aggregation

### `@openrooms/tools`
Extensible tool plugin system.

**Built-in Tools:**
- Calculator
- HTTP Request
- Memory Query
- File Operations

### `@openrooms/llm`
LLM provider abstraction.

**Supported Providers:**
- OpenAI
- Anthropic (via adapter)
- Custom providers

## Data Flow

### Room Execution

```
1. Client → POST /api/rooms/{id}/run
2. API → Queue job in BullMQ
3. Worker → Load room state from Redis
4. Worker → Execute workflow via Engine
5. Engine → Transition through FSM nodes
6. Engine → Persist logs to Postgres
7. Engine → Update state in Redis
8. Worker → Complete job
9. Dashboard → Poll for status updates
```

### State Management

**Redis Keys:**
```
room:{id}:state      → Current workflow state
room:{id}:context    → Execution context
room:{id}:lock       → Distributed lock
workflow:{id}:cache  → Workflow definition cache
```

**Postgres Tables:**
```
rooms                → Room metadata
workflows            → Workflow definitions
nodes                → Workflow nodes
transitions          → Node transitions
logs                 → Execution logs
```

## Design Principles

### 1. Deterministic Execution
- All workflows are FSMs
- Transitions are explicit and conditional
- No hidden state changes

### 2. Clean Architecture
- Domain logic isolated from infrastructure
- Dependency injection throughout
- Interface-based extensibility

### 3. Observable
- Comprehensive execution logging
- State change events
- Metrics at every layer

### 4. Production-Ready
- TypeScript strict mode
- Distributed state management
- Background job processing
- Error handling and retries

## Scaling Strategy

### Horizontal Scaling
- Stateless API servers behind load balancer
- Multiple BullMQ workers
- Redis Cluster for distributed state

### Database
- Managed Postgres with read replicas
- Connection pooling per service
- Query optimization via Kysely

### Caching
- Redis for workflow definitions
- Redis for room state
- TTL-based invalidation

## Security

### API Layer
- API key authentication
- Rate limiting per client
- Input validation (Zod schemas)

### Execution
- Tool timeout enforcement
- Resource limits per room
- Sandboxed execution context

### Database
- Parameterized queries (Kysely)
- Connection string encryption
- Least privilege access

## Monitoring

### Metrics
- Workflow execution time
- Node transition counts
- Tool invocation latency
- Queue depth

### Logging
- Structured logs (JSON)
- Execution traces
- Error aggregation

### Alerting
- Failed workflow executions
- Queue backlog
- Database connection issues
