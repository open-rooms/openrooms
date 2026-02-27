# Quick Start Guide

Get OpenRooms running in 5 minutes.

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker (for PostgreSQL and Redis)

## Setup

### 1. Clone and Install

```bash
cd /Users/kingchief/Documents/ROOMS

# Run automated setup
./setup.sh
```

This will:
- Install all dependencies
- Start PostgreSQL and Redis in Docker
- Generate Prisma client
- Set up the database schema

### 2. Configure Environment

Edit `apps/api/.env` if needed (defaults should work):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/openrooms"
REDIS_URL="redis://localhost:6379"
PORT=3001
```

### 3. Start Development

```bash
pnpm dev
```

This starts:
- **API**: http://localhost:3001
- **Dashboard**: http://localhost:3000

## Creating Your First Workflow

### Step 1: Create Workflow and Nodes

Create a file `examples/create-workflow.ts`:

```typescript
import { prisma } from '@openrooms/database';
import { NodeType, TransitionCondition, WorkflowStatus } from '@openrooms/core';

async function main() {
  // Create workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Hello World Workflow',
      description: 'A simple demonstration workflow',
      status: WorkflowStatus.ACTIVE,
      initialNodeId: 'temp',
    },
  });

  // Create START node
  const startNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: NodeType.START,
      name: 'Start',
      config: {},
      transitions: [],
    },
  });

  // Create WAIT node (simulates work)
  const waitNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: NodeType.WAIT,
      name: 'Wait 3 seconds',
      config: { duration: 3000 },
      transitions: [],
    },
  });

  // Create END node
  const endNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: NodeType.END,
      name: 'Complete',
      config: {},
      transitions: [],
    },
  });

  // Wire up transitions
  await prisma.workflowNode.update({
    where: { id: startNode.id },
    data: {
      transitions: [
        {
          condition: TransitionCondition.ALWAYS,
          targetNodeId: waitNode.id,
        },
      ],
    },
  });

  await prisma.workflowNode.update({
    where: { id: waitNode.id },
    data: {
      transitions: [
        {
          condition: TransitionCondition.SUCCESS,
          targetNodeId: endNode.id,
        },
      ],
    },
  });

  // Update workflow with initial node
  await prisma.workflow.update({
    where: { id: workflow.id },
    data: { initialNodeId: startNode.id },
  });

  console.log('✅ Workflow created!');
  console.log('Workflow ID:', workflow.id);
  console.log('\nNext steps:');
  console.log(`1. Visit: http://localhost:3000/workflows`);
  console.log(`2. Create a room with workflow ID: ${workflow.id}`);
  console.log(`3. Run the room and watch the logs!`);

  await prisma.$disconnect();
}

main().catch(console.error);
```

Run it:
```bash
pnpm tsx examples/create-workflow.ts
```

### Step 2: Create and Run Room via API

```bash
# Create a room
WORKFLOW_ID="<your-workflow-id-from-above>"

ROOM_RESPONSE=$(curl -s -X POST http://localhost:3001/api/rooms \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"My First Room\",
    \"description\": \"Testing OpenRooms\",
    \"workflowId\": \"$WORKFLOW_ID\"
  }")

ROOM_ID=$(echo $ROOM_RESPONSE | jq -r '.id')

echo "Room created: $ROOM_ID"

# Run the room
curl -X POST http://localhost:3001/api/rooms/$ROOM_ID/run

# Watch logs
curl http://localhost:3001/api/rooms/$ROOM_ID/logs | jq
```

### Step 3: Monitor in Dashboard

1. Open http://localhost:3000
2. Click "Rooms"
3. Click on your room
4. Watch real-time execution logs!

## Understanding the Architecture

### Execution Flow

```
User Request → API → Job Queue → Background Worker → Workflow Engine
                                                            ↓
                                                      State Manager (Redis)
                                                            ↓
                                                    Execute Nodes (FSM)
                                                            ↓
                                          Logs → Database (Postgres)
```

### Key Components

- **Room**: Isolated execution environment
- **Workflow**: Deterministic state machine (FSM)
- **Node**: Single state in the workflow
- **Transition**: Rules for moving between nodes
- **State Manager**: Tracks current execution state (Redis)
- **Logs**: Complete audit trail (Postgres)

## Built-in Node Types

| Type | Description | Config |
|------|-------------|--------|
| `START` | Entry point | None |
| `END` | Exit point | None |
| `WAIT` | Delay execution | `{ duration: 5000 }` |
| `AGENT_TASK` | LLM agent execution | Agent config |
| `TOOL_EXECUTION` | Run a tool | Tool config |
| `DECISION` | Conditional branching | Condition expression |
| `PARALLEL` | Parallel execution | Parallel config |

## Transition Conditions

- `ALWAYS`: Always proceed
- `SUCCESS`: On successful execution
- `FAILURE`: On execution failure
- `TIMEOUT`: On timeout
- `CONDITION_MET`: Custom expression

## Built-in Tools

OpenRooms includes three built-in tools:

1. **Calculator**: Basic arithmetic
2. **HTTP Request**: External API calls
3. **Memory Query**: Search room memory

List tools:
```bash
curl http://localhost:3001/api/tools | jq
```

## Example: Complex Workflow

Here's a more advanced example with conditional branching:

```typescript
// Create workflow with decision node
const decisionNode = await prisma.workflowNode.create({
  data: {
    workflowId: workflow.id,
    type: NodeType.DECISION,
    name: 'Check Value',
    config: {},
    transitions: [
      {
        condition: TransitionCondition.CONDITION_MET,
        conditionExpression: 'state.value > 10',
        targetNodeId: successNode.id,
      },
      {
        condition: TransitionCondition.ALWAYS,
        targetNodeId: failureNode.id,
      },
    ],
  },
});
```

## Troubleshooting

### Ports in Use

```bash
# Kill processes
lsof -ti:3001 | xargs kill -9  # API
lsof -ti:3000 | xargs kill -9  # Dashboard
```

### Database Issues

```bash
# Reset database
pnpm db:push --force-reset
```

### Redis Connection

```bash
# Test Redis
redis-cli ping  # Should return: PONG
```

### View Logs

```bash
# API logs
pnpm --filter @openrooms/api dev

# Enable debug logs
LOG_LEVEL=debug pnpm --filter @openrooms/api dev
```

## Next Steps

1. **Read Documentation**:
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
   - [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
   - [API.md](./API.md) - API reference

2. **Explore Examples**:
   - Create workflows with agents
   - Use built-in tools
   - Build custom tools

3. **Customize**:
   - Add custom node types
   - Create tool plugins
   - Integrate LLM providers

## Support

- Issues: GitHub Issues (if available)
- Documentation: See `/docs` folder
- Examples: See `/examples` folder

## Production Deployment

For production:

1. Set environment variables properly
2. Use managed PostgreSQL and Redis
3. Configure authentication
4. Set up monitoring
5. Scale workers independently
6. Enable rate limiting

See [ARCHITECTURE.md](./ARCHITECTURE.md) for deployment details.

---

**Happy orchestrating! 🚀**
