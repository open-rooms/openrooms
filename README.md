# OpenRooms

**An open-source Agent Orchestration Control Plane**

OpenRooms is a production-ready distributed control plane for building deterministic, stateful AI agent workflows. Built with TypeScript, it provides a robust infrastructure for orchestrating complex agent interactions with clean architecture and domain-driven design.

---

## 🎯 Overview

OpenRooms provides a **stateful execution environment** (called a "Room") where:
- **Agents** run with deterministic behavior
- **Tools** execute through an extensible plugin system  
- **Workflow nodes** transition via finite state machines (FSM)
- **Memory** is persisted across executions
- **Execution logs** provide complete observability
- **Status** is tracked in distributed state (Redis)

## ✨ Key Features

- **🔄 Deterministic Execution**: Workflows modeled as FSMs with predictable state transitions
- **🏗️ Clean Architecture**: Domain-driven design with clear boundaries and dependency injection
- **🔌 Extensible**: Plugin system for custom tools and LLM providers
- **🚀 Production-Ready**: TypeScript strict mode, distributed state, background job processing
- **📊 Observable**: Comprehensive execution logging and monitoring dashboard
- **⚡ High Performance**: Redis for state management, BullMQ for job queues, Postgres for persistence

## 🏛️ Architecture

```
Dashboard (Next.js) → API (Fastify) → Workflow Engine (FSM)
                                            ↓
                        State Manager (Redis) + Job Queue (BullMQ)
                                            ↓
                        Database (Postgres) + Background Workers
```

**Core Components:**
- **Workflow Engine**: Deterministic FSM orchestrator
- **State Manager**: Distributed state with Redis
- **Tool Registry**: Extensible plugin system
- **LLM Service**: OpenAI-compatible abstraction
- **Job Queue**: BullMQ for async execution
- **Repository Layer**: Prisma ORM with Postgres

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8  
- Docker (for Postgres & Redis)

### Installation

```bash
# Clone the repository
cd openrooms

# Run automated setup
./setup.sh

# Start development
pnpm dev
```

**Services will be available at:**
- API: http://localhost:3001
- Dashboard: http://localhost:3000

### Create Your First Workflow

```bash
# Create a sample workflow
pnpm tsx examples/create-workflow.ts

# Create a room via API
curl -X POST http://localhost:3001/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "My Room", "workflowId": "<workflow-id>"}'

# Run the room
curl -X POST http://localhost:3001/api/rooms/<room-id>/run

# View logs
curl http://localhost:3001/api/rooms/<room-id>/logs
```

Or use the **Dashboard** at http://localhost:3000

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and architecture
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide
- **[API.md](./API.md)** - REST API reference
- **[STRUCTURE.md](./STRUCTURE.md)** - Project structure

## 🛠️ Tech Stack

**Monorepo**: Turborepo + pnpm workspaces

**Backend**: 
- Node.js + Fastify (TypeScript strict mode)
- Postgres (Prisma ORM)
- Redis (state + caching)
- BullMQ (background jobs)

**Frontend**: 
- Next.js 14 (App Router)
- Tailwind CSS
- React Server Components

**AI/LLM**: 
- OpenAI-compatible abstraction layer
- Extensible provider system

## 📦 Project Structure

```
openrooms/
├── apps/
│   ├── api/          # Fastify REST API server
│   └── dashboard/    # Next.js monitoring UI
├── packages/
│   ├── core/         # Domain types & interfaces
│   ├── database/     # Prisma + repositories
│   ├── engine/       # Workflow execution engine
│   ├── worker/       # BullMQ workers
│   ├── tools/        # Tool plugin system
│   └── llm/          # LLM provider abstraction
└── examples/         # Example workflows
```

## 🔌 Core Concepts

### Room
A stateful execution environment where workflows run. Each room has:
- Isolated context and memory
- Status tracking (IDLE, RUNNING, COMPLETED, FAILED)
- Execution logs
- Configuration (timeouts, LLM settings)

### Workflow
A deterministic finite state machine defining agent behavior:
- Nodes represent states (START, AGENT_TASK, TOOL_EXECUTION, END)
- Transitions define state changes with conditions
- Version controlled and reusable

### Node Types
- **START**: Entry point
- **END**: Exit point  
- **AGENT_TASK**: LLM agent execution
- **TOOL_EXECUTION**: Tool invocation
- **DECISION**: Conditional branching
- **PARALLEL**: Parallel execution
- **WAIT**: Delay/pause

### Tools
Extensible plugins that agents can use:
- Built-in: Calculator, HTTP Request, Memory Query
- Custom tools via plugin system
- Parameter validation and timeout handling

## 🔥 Example Workflow

```typescript
// Create a workflow: Start → Wait → End
const workflow = await prisma.workflow.create({
  data: {
    name: 'Hello World',
    initialNodeId: startNode.id,
  },
});

// Define nodes
const startNode = { type: NodeType.START, transitions: [...] };
const waitNode = { type: NodeType.WAIT, config: { duration: 3000 } };
const endNode = { type: NodeType.END };

// Run it
await workflowEngine.executeRoom(roomId);
```

## 🎯 Use Cases

- **Multi-agent Systems**: Orchestrate multiple AI agents with defined workflows
- **Process Automation**: Build complex automation pipelines with agents
- **AI Workflows**: Chain LLM calls with deterministic logic
- **Agent Testing**: Test agent behaviors in controlled environments
- **Production AI**: Deploy reliable, observable AI systems

## 🔐 Production Considerations

- **Authentication**: Add API key auth middleware
- **Rate Limiting**: Implement per-room limits
- **Monitoring**: Add OpenTelemetry tracing
- **Scaling**: Horizontal scaling with load balancer
- **Database**: Use managed Postgres with replicas
- **Redis**: Redis Cluster for distributed state

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure TypeScript compiles: `pnpm lint`
5. Submit a pull request

## 📝 License

MIT

## 🙏 Acknowledgments

Built with modern distributed systems principles:
- Domain-Driven Design (DDD)
- Clean Architecture
- CQRS (Command Query Responsibility Segregation)
- Event Sourcing (execution logs)
- Dependency Injection

## 🔗 Links

- **Documentation**: See `/docs` folder
- **Examples**: See `/examples` folder  
- **API Reference**: [API.md](./API.md)

---

**Built for developers who need production-grade agent orchestration.**

**Star ⭐ if you find this useful!**
