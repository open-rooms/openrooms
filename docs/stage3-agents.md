# OpenRooms Stage 3: Agent as First-Class Primitive

## Overview

Stage 3 elevates Agent from a passive entity to a first-class autonomous primitive with deterministic runtime loop, policy enforcement, and full observability.

## Architecture Components

### 1. Agent Entity (First-Class)

**Database Schema:** `packages/database/schema-stage3.sql`

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Room binding
  roomId UUID REFERENCES rooms(id),
  
  -- Tool governance
  allowedTools TEXT[] NOT NULL DEFAULT '{}',
  policyConfig JSONB NOT NULL DEFAULT '{}',
  
  -- Runtime state
  status AgentStatus NOT NULL DEFAULT 'ACTIVE',
  loopState AgentLoopState NOT NULL DEFAULT 'IDLE',
  memoryState JSONB NOT NULL DEFAULT '{}',
  
  -- Versioning
  parentAgentId UUID REFERENCES agents(id),
  snapshotData JSONB,
  
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  lastExecutedAt TIMESTAMP
);
```

**Key Features:**
- Independent lifecycle (not bound to room)
- Version history with parent chaining
- Policy configuration for governance
- Runtime state tracking

### 2. Agent Runtime Loop

**Implementation:** `packages/execution/agent-runtime/src/agent-loop.ts`

#### Loop States

```
IDLE → PERCEIVING → REASONING → SELECTING_TOOL → 
EXECUTING_TOOL → UPDATING_MEMORY → IDLE (repeat)
```

#### Execution Flow

```
┌─────────────────────────────────────────┐
│  1️⃣ PERCEIVE                            │
│  - Read memory context                  │
│  - Load room state                      │
│  - Get available tools                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  2️⃣ REASON (LLM)                        │
│  - Analyze goal                         │
│  - Decide next action                   │
│  - Select tool or terminate             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  3️⃣ VALIDATE (Policy Check)             │
│  - Check allowedTools                   │
│  - Enforce policyConfig constraints     │
│  - Log denials                          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  4️⃣ EXECUTE TOOL                        │
│  - Invoke tool with input               │
│  - Capture output/error                 │
│  - Measure duration                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  5️⃣ LOG TRACE                           │
│  - Model prompt/response                │
│  - Tool selection rationale             │
│  - State diffs                          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  6️⃣ UPDATE MEMORY                       │
│  - Append tool result                   │
│  - Update conversation history          │
│  - Persist state changes                │
└──────────────┬──────────────────────────┘
               │
               └──────┐ Repeat or Terminate
```

### 3. Reasoning Trace Logging

**Table:** `agent_execution_traces`

Captures full execution context:
- **Model interaction**: prompt, response, temperature, model name
- **Tool selection**: selected tool, rationale, input, output, errors
- **State changes**: before/after snapshots, computed diffs
- **Metrics**: duration per step, token usage

**Purpose:**
- Debugging agent behavior
- Auditing decisions
- Replay historical executions
- Training data for improved models

### 4. Policy Enforcement

**PolicyConfig Structure:**

```typescript
interface AgentPolicy {
  // Tool restrictions
  allowedToolCategories?: ToolCategory[];
  deniedTools?: string[];
  requireApprovalFor?: string[];
  
  // Resource limits
  maxToolCallsPerLoop?: number;
  maxLoopIterations?: number;
  maxExecutionTime?: number;
  
  // Cost controls
  maxTokensPerRequest?: number;
  maxCostPerExecution?: number;
  
  // Behavior constraints
  requireExplicitTermination?: boolean;
  allowRecursiveToolCalls?: boolean;
}
```

**Enforcement Points:**
1. Before tool selection (allowedTools validation)
2. Before tool execution (policy constraint checks)
3. During loop execution (iteration/time limits)
4. Cost tracking (token/API call limits)

**Violations Logged:**
- Attempted tool name
- Policy rule violated
- Denial reason
- Severity level
- Full audit trail

### 5. API Key System

**Tables:**
- `api_keys`: Key metadata, scopes, rate limits
- `api_key_usage`: Per-request audit log

**Features:**
- Key hashing (never store plaintext)
- Key prefix for identification
- Scoped access (read, write, admin)
- Rate limiting per key (requests/window)
- Expiration dates
- Usage audit trail

**Rate Limiting:**
- Sliding window algorithm
- Per-key quotas
- 429 responses on limit exceeded
- Usage tracking in `api_key_usage` table

### 6. Observability Foundation

**Structured Logging:**
- All agent events use `ExecutionEventType` enum
- Consistent log format across system
- Correlation IDs for distributed tracing
- Duration tracking for all operations

**Metrics Collected:**
- Agent loop iterations
- Tool execution duration
- LLM response times
- Policy violation counts
- Memory update frequency

**Dashboards:**
- Agent status overview
- Active loops in progress
- Tool usage heatmap
- Policy violation alerts
- Cost tracking per agent

### 7. Agent Versioning

**Version Management:**
- Immutable version snapshots
- Parent-child version chain
- Historical replay capability
- Config pinning per version

**Workflow:**
1. Create new agent version
2. Link to parent via `parentAgentId`
3. Store snapshot in `snapshotData`
4. Execute against specific version
5. Replay historical versions for analysis

**Use Cases:**
- A/B testing agent configurations
- Rollback to previous versions
- Historical audit of decision evolution
- Training data generation

## Guarantees

### Runtime Guarantees

✅ **Deterministic Execution**
- Agent loop is replayable with same inputs
- State transitions follow strict FSM
- All side effects logged

✅ **Resumable Execution**
- Loop state persisted at each step
- Crash recovery restarts from last checkpoint
- No duplicate tool executions (idempotency)

✅ **Policy Enforcement**
- All tool calls validated before execution
- Hard stops on policy violations
- Audit trail of denied actions

### Governance Guarantees

✅ **Tool Permission Enforcement**
- Agents cannot execute disallowed tools
- Policy violations logged and blocked
- Zero-trust model

✅ **Resource Limits**
- Iteration caps prevent infinite loops
- Token limits prevent cost overruns
- Execution time limits prevent hangs

✅ **Auditability**
- Full reasoning trace for every decision
- Immutable append-only logs
- Version snapshots for historical replay

### Observability Guarantees

✅ **Full Reasoning Transparency**
- Every LLM prompt logged
- Every model response captured
- Tool selection rationale preserved

✅ **State Change Tracking**
- Before/after snapshots
- Computed diffs
- Memory evolution over time

✅ **Performance Monitoring**
- Execution duration per step
- Tool call latency
- Memory growth tracking

## Migration Path

### From Stage 2.5 to Stage 3

1. **Apply schema extensions:**
   ```bash
   psql -U postgres -d openrooms < packages/database/schema-stage3.sql
   ```

2. **Update existing agents:**
   ```sql
   -- Agents table was dropped and recreated in Stage 3
   -- Re-import agent data with new schema
   ```

3. **Enable policy enforcement:**
   - Configure default policies
   - Set allowed tools per agent
   - Enable violation logging

4. **Deploy agent runtime loop:**
   - Update execution engine
   - Enable reasoning trace logging
   - Configure observability dashboards

## API Changes

### New Endpoints

```
POST   /agents              Create agent with policy
GET    /agents/:id          Get agent details
PATCH  /agents/:id          Update agent config
POST   /agents/:id/execute  Start agent loop
GET    /agents/:id/traces   Get execution traces
POST   /agents/:id/version  Create new version

POST   /api-keys            Generate API key
GET    /api-keys            List keys
DELETE /api-keys/:id        Revoke key
GET    /api-keys/:id/usage  Get usage stats
```

### Authentication

All API requests require:
```
Authorization: Bearer <api-key>
```

Rate limits enforced per key.

## Performance Considerations

- **Agent loop iterations:** Capped by policy (default: 10)
- **Reasoning trace size:** Limited by token count (default: 4K context)
- **Memory growth:** Pruned based on TTL and token limits
- **Database writes:** Batch trace logging to reduce I/O

## Security

- API keys hashed with bcrypt
- Key rotation supported
- Scoped access per key
- Rate limiting prevents abuse
- Policy violations trigger alerts

## Testing

Stage 3 tests validate:
- Agent loop determinism (5 identical runs)
- Policy enforcement (denial of disallowed tools)
- Reasoning trace completeness
- API key rate limiting
- Version snapshot/replay

Run tests:
```bash
cd apps/api
DATABASE_URL=postgresql://... pnpm test:stage3
```

## Next: Stage 4

Stage 4 will add:
- Distributed agent coordination
- Multi-agent collaboration
- Advanced policy rules (time-based, conditional)
- Cost optimization (model routing)
- Production-grade observability (Prometheus, Grafana)

---

Last updated: 2026-03-05
OpenRooms v0.3.0 (Stage 3)
