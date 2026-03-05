# OpenRooms Architecture - Stage 3

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Control Plane UI                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │  Agents  │  │ Live Run │  │  Tools   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                          API Layer                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Room API     │ │ Agent API    │ │ Auth API     │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                 │
│  API Key Validation → Rate Limiting → Request Logging          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    Execution Layer                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Agent Runtime Loop                          │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  │
│  │  │Perceive │→ │ Reason  │→ │ Select  │→ │ Execute │   │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │  │
│  │       ↓            ↓            ↓            ↓          │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │        Policy Enforcer                          │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Workflow Engine                             │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           │  │
│  │  │  START    │→ │ AGENT_TASK│→ │   TOOL    │→ END      │  │
│  │  └───────────┘  └───────────┘  └───────────┘           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Tool Registry                               │  │
│  │  - Search Tools                                          │  │
│  │  - HTTP Request Tools                                    │  │
│  │  - Database Tools                                        │  │
│  │  - Custom Tools                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    Infrastructure Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ PostgreSQL   │  │    Redis     │  │    BullMQ    │         │
│  │              │  │              │  │              │         │
│  │ - Rooms      │  │ - State Mgr  │  │ - Job Queue  │         │
│  │ - Agents     │  │ - Cache      │  │ - Workflows  │         │
│  │ - Workflows  │  │ - Sessions   │  │ - Retries    │         │
│  │ - Traces     │  │              │  │              │         │
│  │ - API Keys   │  │              │  │              │         │
│  │ - Policies   │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Core Entities

### Agent (First-Class Primitive)

```typescript
Agent {
  id: UUID
  name: string
  goal: string
  version: number
  
  // Binding
  roomId?: UUID
  
  // Governance
  allowedTools: string[]
  policyConfig: AgentPolicy
  
  // Runtime
  status: ACTIVE | PAUSED | ARCHIVED
  loopState: IDLE | PERCEIVING | REASONING | ...
  memoryState: JSONObject
  
  // Versioning
  parentAgentId?: UUID
  snapshotData?: JSONObject
}
```

### Room (Execution Environment)

```typescript
Room {
  id: UUID
  name: string
  status: IDLE | RUNNING | PAUSED | COMPLETED | FAILED
  workflowId: UUID
  currentNodeId?: UUID
  config: RoomConfig
  
  // Runtime state managed by Redis
  state: RoomState
}
```

### Workflow (FSM Definition)

```typescript
Workflow {
  id: UUID
  name: string
  version: number
  initialNodeId: UUID
  
  // Nodes define state machine
  nodes: WorkflowNode[]
}
```

## Data Flow

### Agent Autonomous Execution

```
1. User creates Agent with goal and allowed tools
2. User starts Agent execution in a Room
3. Agent enters runtime loop:

   Loop:
     - Perceive: Read memory, room state, available tools
     - Reason: LLM decides next action
     - Validate: Policy enforcer checks permissions
     - Execute: Tool execution (if approved)
     - Log: Reasoning trace stored
     - Update: Memory updated with result
     
   Until:
     - Goal achieved
     - Max iterations reached
     - Policy violation (hard stop)
     - Explicit termination
```

### Workflow Deterministic Execution

```
1. User creates Workflow with nodes and transitions
2. User launches Room with workflowId
3. Execution engine:
   - Loads workflow from DB
   - Initializes room state in Redis
   - Executes nodes in FSM order
   - Transitions based on conditions
   - Persists execution logs (append-only)
   - Handles retries per node policy
   - Completes or fails deterministically
```

## Governance Model

### Three-Layer Enforcement

```
Layer 1: API Authentication
├─ API key validation
├─ Rate limiting (per key)
└─ Scope enforcement (read/write/admin)

Layer 2: Policy Enforcement
├─ Tool allowlist/denylist
├─ Resource limits (iterations, tokens, cost)
├─ Behavior constraints (recursion, approval)
└─ Violation logging

Layer 3: Audit Trail
├─ All decisions logged
├─ Reasoning traces preserved
├─ Policy violations recorded
└─ Immutable append-only logs
```

## Observability

### Logging Hierarchy

```
ExecutionLog (append-only)
├─ ROOM_CREATED, ROOM_STARTED, ...
├─ NODE_ENTERED, NODE_EXECUTED, ...
├─ AGENT_LOOP_STARTED, AGENT_LOOP_ITERATION, ...
├─ AGENT_TOOL_SELECTED, AGENT_TOOL_DENIED, ...
└─ TOOL_INVOKED, TOOL_COMPLETED, TOOL_FAILED

AgentExecutionTrace (detailed reasoning)
├─ Model prompt/response
├─ Tool selection rationale
├─ Tool input/output
├─ State before/after
└─ Duration metrics
```

### Metrics

- **Agent metrics**: Loop iterations, tool calls, terminations
- **Workflow metrics**: Execution duration, node transitions, retries
- **Tool metrics**: Invocation count, latency, error rate
- **Policy metrics**: Violations by type, denials by tool
- **Cost metrics**: Token usage, API calls, estimated cost

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│           Load Balancer                     │
└──────────┬──────────────┬───────────────────┘
           │              │
┌──────────▼────┐  ┌──────▼──────┐
│  API Server 1 │  │ API Server 2│
│  (Stateless)  │  │ (Stateless) │
└──────────┬────┘  └──────┬──────┘
           │              │
┌──────────▼──────────────▼───────────────────┐
│          BullMQ Worker Pool                 │
│  ┌───────┐  ┌───────┐  ┌───────┐          │
│  │Worker1│  │Worker2│  │Worker3│          │
│  └───────┘  └───────┘  └───────┘          │
└──────────┬──────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────┐
│          Shared Infrastructure              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │PostgreSQL│ │  Redis   │ │  Redis   │   │
│  │ Primary  │ │  State   │ │  Queue   │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────┘
```

## Security Model

### Authentication

- API keys required for all endpoints
- Key hashing (bcrypt) in database
- Key prefix for identification without revealing key
- Expiration dates enforced

### Authorization

- Scoped access per key (read, write, admin)
- Agent-level tool restrictions
- Policy-based constraints

### Audit

- All API calls logged in `api_key_usage`
- All policy violations in `policy_violations`
- All agent decisions in `agent_execution_traces`
- Immutable logs (append-only)

## Performance Characteristics

### Latency

- Agent loop iteration: ~500ms - 3s (LLM dependent)
- Tool execution: 50ms - 5s (tool dependent)
- Workflow node transition: < 100ms
- Memory read/write: < 50ms (Redis)
- Database writes: Batched for traces

### Throughput

- API requests: 1000+ req/s (with load balancing)
- Agent loops: 100+ concurrent (worker pool)
- Workflow executions: 500+ concurrent (BullMQ)

### Scalability

- Horizontal: Add API servers and workers
- Vertical: Scale PostgreSQL, Redis
- Storage: PostgreSQL handles millions of logs
- Workers: Auto-scale based on queue depth

---

Last updated: 2026-03-05
