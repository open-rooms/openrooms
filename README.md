# OpenRooms

A production-grade agent orchestration control plane for building deterministic, stateful AI workflows.

## Overview

OpenRooms provides isolated execution environments (Rooms) where AI agents run with deterministic behavior, extensible tooling, and complete observability.

**Core capabilities:**
- Finite state machine workflow engine
- Distributed state management (Redis)
- Async job processing (BullMQ)
- Extensible tool plugin system
- Real-time monitoring dashboard

## Architecture

```
Dashboard (Next.js) → API (Fastify) → Workflow Engine (FSM)
                                            ↓
                        State Manager (Redis) + Job Queue (BullMQ)
                                            ↓
                        Database (Postgres) + Background Workers
```

**Components:**
- **Workflow Engine**: FSM-based orchestrator with deterministic transitions
- **State Manager**: Distributed state with Redis persistence
- **Tool Registry**: Extensible plugin system for agent capabilities
- **Job Queue**: BullMQ for async workflow execution
- **Repository Layer**: Kysely query builder with Postgres

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker

### Installation

```bash
# Install dependencies
pnpm install

# Start infrastructure (Postgres + Redis)
docker-compose up -d

# Initialize database
pnpm db:setup

# Start development servers
pnpm dev
```

**Access:**
- Dashboard: http://localhost:3000
- API: http://localhost:3001

### Create a Workflow

```bash
# Create sample workflow
pnpm tsx examples/create-workflow.ts

# Create room via API
curl -X POST http://localhost:3001/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "My Room", "workflowId": "<workflow-id>"}'

# Execute room
curl -X POST http://localhost:3001/api/rooms/<room-id>/run

# View logs
curl http://localhost:3001/api/rooms/<room-id>/logs
```

## Project Structure

```
openrooms/
├── apps/
│   ├── api/          # Fastify REST API
│   └── dashboard/    # Next.js monitoring UI
├── packages/
│   ├── core/         # Domain types & interfaces
│   ├── database/     # Kysely query builder + migrations
│   ├── engine/       # Workflow execution engine
│   ├── worker/       # BullMQ workers
│   ├── tools/        # Tool plugin system
│   └── llm/          # LLM provider abstraction
└── examples/         # Example workflows
```

## Core Concepts

### Room
Stateful execution environment with isolated context, memory, and configuration. Each room tracks status (IDLE, RUNNING, COMPLETED, FAILED) and maintains execution logs.

### Workflow
Deterministic finite state machine defining agent behavior. Nodes represent states (START, AGENT_TASK, TOOL_EXECUTION, END), transitions define state changes with conditions.

### Node Types
- **START**: Workflow entry point
- **END**: Workflow exit point
- **AGENT_TASK**: LLM agent execution
- **TOOL_EXECUTION**: Tool invocation
- **DECISION**: Conditional branching
- **PARALLEL**: Concurrent execution
- **WAIT**: Delay/pause

### Tools
Extensible plugins providing agent capabilities. Built-in tools include Calculator, HTTP Request, and Memory Query. Custom tools via plugin system with parameter validation and timeout handling.

## Tech Stack

**Monorepo**: Turborepo + pnpm workspaces

**Backend**: 
- Node.js + Fastify (TypeScript strict)
- Postgres (Kysely)
- Redis (state + caching)
- BullMQ (job queue)

**Frontend**: 
- Next.js 14 App Router
- Tailwind CSS
- React Server Components

**AI/LLM**: 
- OpenAI-compatible abstraction
- Pluggable provider system

## Documentation

- [Architecture](./docs/architecture.md) - System design and components
- [Development](./docs/development.md) - Development workflow
- [API Reference](./docs/api.md) - REST API endpoints
- [Deployment](./docs/deployment.md) - Production deployment guide

## Production Deployment

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/openrooms

# Redis
REDIS_URL=redis://host:6379

# API
API_PORT=3001
API_HOST=0.0.0.0

# LLM
OPENAI_API_KEY=sk-...
```

### Docker Deployment

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling Considerations

- **Horizontal scaling**: Load balance API servers
- **Database**: Use managed Postgres with read replicas
- **Redis**: Redis Cluster for distributed state
- **Workers**: Scale background workers independently
- **Monitoring**: Add OpenTelemetry tracing

## Contributing

Contributions welcome. Please:

1. Fork the repository
2. Create a feature branch (`feat/feature-name`)
3. Ensure TypeScript compiles (`pnpm typecheck`)
4. Run linter (`pnpm lint`)
5. Submit pull request

Follow conventional commits for messages:
- `feat(scope): add new feature`
- `fix(scope): resolve bug`
- `refactor(scope): restructure code`
- `chore(scope): update dependencies`

## License

MIT

---

**Production-grade agent orchestration for developers who ship.**
