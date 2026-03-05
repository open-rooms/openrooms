# Agent Runtime System

## Overview

OpenRooms implements a deterministic, resumable agent execution system with policy enforcement, reasoning trace capture, and multi-model LLM support.

## Architecture

### Core Components

**Agent Entity**
- Autonomous AI unit with memory, tools, and execution policies
- Version-controlled configuration snapshots
- Status management (ACTIVE, PAUSED, ARCHIVED)
- Room-scoped isolation

**Execution Loop**
```
Perceive → Reason → Select Tool → Execute → Log → Update Memory
```

All steps are:
- Deterministic (same input → same output)
- Resumable (crash recovery without side effect duplication)
- Replayable (historical version execution)
- Observable (full reasoning trace capture)

**Policy Enforcement**
- Tool permission validation (`allowedTools`, `deniedTools`)
- Resource limits (tokens, cost, iterations)
- Pre-execution authorization checks
- Policy violation logging

**Reasoning Traces**
Append-only log capturing:
- Model prompts and responses
- Tool selection rationale
- Tool execution results
- State transitions
- Token usage and costs

## Database Schema

### Agents Table
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  allowed_tools TEXT[],
  denied_tools TEXT[],
  memory_state JSONB,
  policy_config JSONB,
  room_id UUID REFERENCES rooms(id),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Agent Execution Traces Table
```sql
CREATE TABLE agent_execution_traces (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  agent_version INTEGER,
  execution_id UUID,
  step_number INTEGER,
  model_provider VARCHAR(100),
  model_name VARCHAR(100),
  prompt TEXT,
  response TEXT,
  tool_calls JSONB,
  reasoning TEXT,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### Agent Management

**Create Agent**
```http
POST /api/agents
Content-Type: application/json

{
  "name": "ResearchAgent",
  "goal": "Market intelligence gathering",
  "allowedTools": ["search_*", "calculator"],
  "policyConfig": {
    "maxLoopIterations": 10,
    "maxTokensPerRequest": 4000,
    "maxCostPerExecution": 0.50
  }
}
```

**Execute Agent**
```http
POST /api/agents/:id/execute
Content-Type: application/json

{
  "roomId": "uuid",
  "maxIterations": 10
}

Response:
{
  "executionId": "uuid",
  "status": "QUEUED"
}
```

**Get Reasoning Traces**
```http
GET /api/agents/:id/traces?limit=50

Response:
{
  "traces": [
    {
      "id": "uuid",
      "step_number": 1,
      "model_provider": "openai",
      "model_name": "gpt-4",
      "prompt": "...",
      "response": "...",
      "tool_calls": [...],
      "reasoning": "...",
      "tokens_used": 1234,
      "cost_usd": 0.0123
    }
  ]
}
```

**Create Agent Version**
```http
POST /api/agents/:id/versions
Content-Type: application/json

{
  "goal": "Updated goal",
  "allowedTools": ["new_tool"]
}
```

**Get Version History**
```http
GET /api/agents/:name/versions

Response:
{
  "versions": [
    {
      "version": 2,
      "goal": "...",
      "created_at": "..."
    }
  ]
}
```

## LLM Integration

### Supported Providers

**OpenAI**
- Models: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- Features: Streaming, function calling, vision
- Token limits: 8K, 32K, 128K variants

**Anthropic**
- Models: Claude 3 Opus, Sonnet, Haiku
- Features: System prompts, tool use, 200K context
- Vision capabilities

### Dynamic Provider Selection

```typescript
const llmProvider = policyConfig.modelProvider === 'anthropic'
  ? new AnthropicProvider({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      model: policyConfig.modelName || 'claude-3-sonnet-20240229',
      maxTokens: policyConfig.maxTokensPerRequest,
    })
  : new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY!,
      model: policyConfig.modelName || 'gpt-4',
      maxTokens: policyConfig.maxTokensPerRequest,
    });
```

## Worker Execution

### Job Queue Architecture

```
API Request → BullMQ Queue → Worker Pool → Agent Runtime
```

**Job Definition**
```typescript
interface AgentExecutionJobData {
  agentId: string;
  roomId: string;
  maxIterations: number;
}
```

**Worker Implementation**
- Spawns on server startup
- Processes jobs asynchronously
- Instantiates full runtime stack:
  - LLM provider
  - Policy enforcer
  - Trace logger
  - Memory manager
  - Tool executor
- Graceful shutdown handling

### Error Handling

- Job retry logic (exponential backoff)
- Failed job tracking
- Policy violation rejection
- Resource limit enforcement
- Execution timeout handling

## Policy Configuration

### Example Policy

```json
{
  "modelProvider": "openai",
  "modelName": "gpt-4",
  "maxLoopIterations": 10,
  "maxTokensPerRequest": 4000,
  "maxCostPerExecution": 0.50,
  "allowParallelToolCalls": false
}
```

### Enforcement Points

1. **Pre-execution validation**
   - Tool permission check
   - Resource limit verification
   - Model availability confirmation

2. **Mid-execution monitoring**
   - Iteration count tracking
   - Token usage accumulation
   - Cost calculation

3. **Post-execution logging**
   - Policy violations recorded
   - Resource usage summary
   - Execution metrics

## Memory Management

### Token-Aware Pruning

- Maintains working memory under token limits
- LRU eviction strategy
- Preserves critical context (goal, recent actions)
- Memory state persisted to database

### Memory Operations

```typescript
interface MemoryManager {
  read(roomId: string): Promise<MemoryEntry[]>;
  write(roomId: string, entry: MemoryEntry): Promise<void>;
  prune(roomId: string, maxTokens: number): Promise<void>;
}
```

## Tool Execution

### Tool Registry

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (args: unknown) => Promise<unknown>;
}
```

### Built-in Tools

- **search**: Web search integration
- **calculator**: Arithmetic operations
- **fetch**: HTTP requests
- **query_database**: Database queries

### Permission Model

```typescript
// Wildcard support
allowedTools: ["search_*", "calculator"]

// Explicit denial
deniedTools: ["admin_*"]

// Validation
function isToolAllowed(toolName: string, policy: AgentPolicy): boolean {
  if (policy.deniedTools?.some(pattern => matchPattern(toolName, pattern))) {
    return false;
  }
  return policy.allowedTools.some(pattern => matchPattern(toolName, pattern));
}
```

## Observability

### Trace Capture

Every execution step logged:
- Timestamp
- Agent version
- Model used
- Token count
- Cost
- Tool calls
- Reasoning output

### Query Patterns

```sql
-- Get all traces for agent
SELECT * FROM agent_execution_traces
WHERE agent_id = $1
ORDER BY created_at DESC;

-- Calculate total cost
SELECT SUM(cost_usd) as total_cost
FROM agent_execution_traces
WHERE agent_id = $1;

-- Find failed executions
SELECT * FROM agent_execution_traces
WHERE response LIKE '%error%'
OR reasoning LIKE '%failed%';
```

## Determinism Guarantees

### Idempotency

- Step execution tracked in database
- Duplicate execution prevented via unique constraints
- Side effects executed once

### Crash Recovery

- Worker failure detection
- In-progress execution identification
- Resume from last checkpoint
- No duplicate side effects

### Replay

- Historical version snapshots
- Identical configuration reproduction
- Debugging and audit trails

## Configuration

### Environment Variables

```bash
# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
```

### Runtime Limits

```typescript
const DEFAULT_POLICY: AgentPolicy = {
  maxLoopIterations: 10,
  maxTokensPerRequest: 4000,
  maxCostPerExecution: 1.00,
  modelProvider: 'openai',
  modelName: 'gpt-4',
};
```

## Testing

### Integration Tests

```bash
cd apps/api
DATABASE_URL=postgresql://...test... pnpm test
```

Tests cover:
- Agent CRUD operations
- Execution loop determinism
- Policy enforcement
- Trace logging
- Version management
- Crash recovery

### Test Database

```bash
docker run -d \
  --name rooms-test-db \
  -e POSTGRES_USER=rooms_test \
  -e POSTGRES_PASSWORD=rooms_test_pass \
  -e POSTGRES_DB=rooms_test \
  -p 5433:5432 \
  postgres:16-alpine
```

## Production Deployment

### Prerequisites

- PostgreSQL 14+
- Redis 7+
- Node.js 20+
- OpenAI/Anthropic API keys

### Startup

```bash
pnpm install
cd apps/api
pnpm build
pnpm start
```

### Health Check

```bash
curl http://localhost:3001/api/health
```

### Graceful Shutdown

- SIGTERM/SIGINT handlers
- Worker completion or timeout
- Database connection closure
- Redis disconnect
