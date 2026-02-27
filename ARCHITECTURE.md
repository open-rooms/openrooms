# OpenRooms Architecture

## System Overview

OpenRooms is a production-grade Agent Orchestration Control Plane built with clean architecture principles and domain-driven design.

## Core Architecture Principles

### 1. Deterministic Execution
- Workflows are modeled as Finite State Machines (FSM)
- All transitions are explicit and predictable
- No hidden state changes or side effects

### 2. Clean Boundaries
- Domain logic isolated from infrastructure
- Dependency injection throughout
- Interface-based design for extensibility

### 3. Event-Driven
- Comprehensive execution logging
- State changes emit events
- Observable at every layer

### 4. Production-Ready
- TypeScript strict mode
- Comprehensive error handling
- Distributed state management with Redis
- Background job processing with BullMQ

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard (Next.js)                   │
│                     Monitoring & Control UI                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Server (Fastify)                     │
│                   REST Endpoints + Validation                │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Workflow   │  │   State     │  │   Tool      │
│   Engine    │  │  Manager    │  │  Registry   │
│             │  │  (Redis)    │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
          │              │              │
          └──────────────┼──────────────┘
                         ▼
          ┌──────────────────────────────┐
          │      Job Queue (BullMQ)      │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │    Background Workers        │
          │  (Async Room Execution)      │
          └──────────────┬───────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Database   │  │   Memory    │  │  Logging    │
│ (Postgres)  │  │   Service   │  │  Service    │
└─────────────┘  └─────────────┘  └─────────────┘
```

## Package Structure

### `packages/core`
Domain types, interfaces, and errors. Pure TypeScript with no dependencies.

**Key Exports:**
- `Room`, `Workflow`, `WorkflowNode`, `Agent`, `Memory`, `ExecutionLog`
- Repository interfaces
- Service interfaces
- Domain errors

### `packages/database`
Prisma ORM integration and repository implementations.

**Key Components:**
- Prisma schema with all entities
- Repository implementations
- Database migrations
- Logging service

### `packages/engine`
Workflow execution engine - the heart of OpenRooms.

**Key Components:**
- `WorkflowExecutionEngine`: FSM orchestrator
- `RedisStateManager`: Distributed state management
- Node executors for each node type
- Retry logic and timeout handling

### `packages/worker`
BullMQ background job processing.

**Key Components:**
- `BullMQJobQueue`: Job queue wrapper
- `RoomExecutionWorker`: Async room execution
- `WorkerManager`: Worker lifecycle management

### `packages/tools`
Extensible tool plugin system.

**Key Components:**
- `ToolRegistry`: Plugin registration and execution
- `BaseToolExecutor`: Base class for tools
- Built-in tools (calculator, HTTP, memory query)

### `packages/llm`
OpenAI-compatible LLM abstraction layer.

**Key Components:**
- `OpenAIProvider`: OpenAI integration
- `AnthropicProvider`: Anthropic integration
- `LLMService`: Unified provider interface

### `apps/api`
Fastify REST API server.

**Endpoints:**
- `POST /api/rooms` - Create room
- `POST /api/rooms/:id/run` - Execute room
- `GET /api/rooms/:id` - Get room details
- `GET /api/rooms/:id/logs` - Get execution logs
- `GET /api/rooms/:id/status` - Get workflow status
- `GET /api/workflows` - List workflows
- `GET /api/tools` - List tools

### `apps/dashboard`
Minimal Next.js monitoring UI.

**Features:**
- Room listing and details
- Real-time log viewing
- Workflow management
- Tool browsing

## Data Flow

### Room Execution Flow

1. **Request**: `POST /api/rooms/:id/run`
2. **Enqueue**: Job added to BullMQ queue
3. **Worker**: Background worker picks up job
4. **Engine**: Workflow engine executes FSM
5. **State**: Redis tracks execution state
6. **Logs**: All events logged to Postgres
7. **Response**: Status updated, logs available

### Node Execution Flow

```
Start → Load Node → Execute → Evaluate Transitions → Next Node → ...
         ↓           ↓          ↓                     
       State      Tools      Update State         
                 Agents      
                 Memory      
```

## State Management

### Room State (Redis)
```typescript
{
  roomId: UUID
  currentNodeId: UUID
  status: RoomStatus
  variables: JSONObject      // Workflow variables
  executionStack: UUID[]     // For nested execution
  attempts: Map<UUID, number> // Retry tracking
  startTime: ISO8601DateTime
  lastUpdateTime: ISO8601DateTime
}
```

### Concurrency Control
- Distributed locks via Redis
- Lock timeout prevents deadlocks
- Optimistic concurrency for state updates

## Observability

### Execution Logs
Every operation logs:
- Event type (ROOM_STARTED, NODE_EXECUTED, etc.)
- Timestamp with millisecond precision
- Duration for performance tracking
- Structured data for debugging
- Error details with stack traces

### Log Levels
- `DEBUG`: Detailed debugging info
- `INFO`: Normal operation events
- `WARN`: Warning conditions
- `ERROR`: Error conditions
- `FATAL`: Critical failures

## Extensibility

### Adding New Node Types

1. Define executor:
```typescript
class CustomNodeExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<Result<void>> {
    // Your logic here
  }
}
```

2. Register in engine:
```typescript
nodeExecutors.set(NodeType.CUSTOM, new CustomNodeExecutor());
```

### Adding New Tools

1. Create tool executor:
```typescript
class MyToolExecutor extends BaseToolExecutor {
  protected validateArgs(args: JSONObject): void {
    this.requireParam(args, 'param1', 'string');
  }

  async execute(args: JSONObject, context: ToolExecutionContext) {
    // Tool implementation
    return { success: true, data: result };
  }
}
```

2. Register tool:
```typescript
toolRegistry.register(toolDefinition, new MyToolExecutor());
```

### Adding New LLM Providers

1. Implement provider:
```typescript
class MyLLMProvider implements LLMProvider {
  async chat(request: LLMRequest): Promise<LLMResponse> {
    // Provider-specific implementation
  }
}
```

2. Register:
```typescript
llmService.registerProvider(new MyLLMProvider(config));
```

## Deployment

### Environment Variables

**API Server:**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `PORT`: API server port (default: 3001)
- `OPENAI_API_KEY`: OpenAI API key (optional)

**Dashboard:**
- `NEXT_PUBLIC_API_URL`: API server URL

### Docker Compose (Example)

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: openrooms
      POSTGRES_PASSWORD: postgres
    
  redis:
    image: redis:7-alpine
    
  api:
    build: ./apps/api
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/openrooms
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    
  dashboard:
    build: ./apps/dashboard
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001
```

### Scaling

- **Horizontal**: Multiple API instances behind load balancer
- **Workers**: Scale worker instances independently
- **Database**: Read replicas for query scaling
- **Redis**: Redis Cluster for distributed state

## Security Considerations

- Input validation on all endpoints
- Helmet.js for security headers
- CORS configuration
- Rate limiting (implement per requirements)
- API key authentication (implement per requirements)
- Tool execution sandboxing (implement per requirements)

## Performance

### Optimizations
- Redis for fast state access
- Database indexes on query fields
- Connection pooling (Prisma)
- Job queue for async processing
- Streaming responses for large datasets

### Monitoring
- Health check endpoint
- Structured logging
- Execution duration tracking
- Queue metrics
- Database query performance

## Testing Strategy

1. **Unit Tests**: Core domain logic
2. **Integration Tests**: Repository implementations
3. **E2E Tests**: API endpoints
4. **Load Tests**: Concurrent room execution

## Future Enhancements

- Workflow versioning
- Hot reload of workflows
- Visual workflow editor
- Semantic memory with embeddings
- Distributed tracing (OpenTelemetry)
- Workflow templates
- Multi-tenancy
- Rate limiting per room
- Webhook notifications
