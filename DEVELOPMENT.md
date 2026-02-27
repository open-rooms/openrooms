# Development Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14
- Redis >= 7
- Docker (optional, for running dependencies)

## Initial Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

**API Server** (`apps/api/.env`):
```bash
cp apps/api/.env.example apps/api/.env
# Edit .env with your database and Redis URLs
```

**Dashboard** (`apps/dashboard/.env.local`):
```bash
cp apps/dashboard/.env.local.example apps/dashboard/.env.local
```

### 3. Start Dependencies

Using Docker:
```bash
docker run -d --name openrooms-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=openrooms -p 5432:5432 postgres:16
docker run -d --name openrooms-redis -p 6379:6379 redis:7-alpine
```

Or use your local installations.

### 4. Set Up Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Or run migrations
pnpm db:migrate
```

### 5. Start Development Servers

```bash
# Start all apps in dev mode
pnpm dev
```

This starts:
- API server on http://localhost:3001
- Dashboard on http://localhost:3000

## Project Structure

```
openrooms/
├── apps/
│   ├── api/              # Fastify REST API
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── container.ts  # DI container
│   │   │   └── index.ts  # Server entry point
│   │   └── package.json
│   └── dashboard/        # Next.js UI
│       ├── src/
│       │   ├── app/      # App router pages
│       │   └── lib/      # API client
│       └── package.json
├── packages/
│   ├── core/             # Domain types & interfaces
│   ├── database/         # Prisma & repositories
│   ├── engine/           # Workflow execution engine
│   ├── worker/           # BullMQ workers
│   ├── tools/            # Tool plugin system
│   └── llm/              # LLM provider abstraction
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # pnpm workspace config
└── turbo.json            # Turborepo config
```

## Development Workflow

### Creating a New Package

```bash
mkdir -p packages/my-package/src
cd packages/my-package

# Create package.json
cat > package.json <<EOF
{
  "name": "@openrooms/my-package",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "dependencies": {
    "@openrooms/core": "workspace:*"
  }
}
EOF

# Create TypeScript config
cat > tsconfig.json <<EOF
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
EOF
```

### Adding Dependencies

```bash
# Add to specific package
pnpm add --filter @openrooms/api fastify

# Add to all packages
pnpm add -w typescript

# Add dev dependency
pnpm add -D --filter @openrooms/api @types/node
```

### Running Specific Apps

```bash
# API only
pnpm --filter @openrooms/api dev

# Dashboard only
pnpm --filter @openrooms/dashboard dev
```

### Database Operations

```bash
# Generate Prisma client
pnpm --filter @openrooms/database db:generate

# Create migration
pnpm --filter @openrooms/database db:migrate

# Open Prisma Studio
pnpm --filter @openrooms/database db:studio

# Reset database
pnpm --filter @openrooms/database db:push --force-reset
```

## Testing

### Unit Tests (to be implemented)

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @openrooms/core test

# Watch mode
pnpm --filter @openrooms/engine test:watch
```

### Manual API Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Create a workflow (you'll need to create nodes first)
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "description": "A test workflow",
    "initialNodeId": "uuid-of-start-node"
  }'

# Create a room
curl -X POST http://localhost:3001/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Room",
    "workflowId": "workflow-uuid"
  }'

# Run a room
curl -X POST http://localhost:3001/api/rooms/{room-id}/run

# Get logs
curl http://localhost:3001/api/rooms/{room-id}/logs
```

## Creating a Sample Workflow

Here's how to create a simple workflow programmatically:

```typescript
import { prisma } from '@openrooms/database';
import { NodeType, TransitionCondition, WorkflowStatus } from '@openrooms/core';

async function createSampleWorkflow() {
  // Create workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Simple Sequential Flow',
      description: 'Start → Wait → End',
      status: WorkflowStatus.ACTIVE,
      initialNodeId: 'temp', // Will update
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

  // Create WAIT node
  const waitNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: NodeType.WAIT,
      name: 'Wait 5 seconds',
      config: { duration: 5000 },
      transitions: [],
    },
  });

  // Create END node
  const endNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: NodeType.END,
      name: 'End',
      config: {},
      transitions: [],
    },
  });

  // Update transitions
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

  console.log('Workflow created:', workflow.id);
  return workflow;
}
```

## Debugging

### API Server

The API server uses Pino for logging. In development:

```bash
# Enable debug logs
LOG_LEVEL=debug pnpm --filter @openrooms/api dev
```

### Inspecting Redis

```bash
# Connect to Redis CLI
redis-cli

# List all keys
KEYS *

# Get room state
GET room:{room-id}:state

# Monitor commands in real-time
MONITOR
```

### Inspecting Database

```bash
# Open Prisma Studio
pnpm --filter @openrooms/database db:studio
```

### BullMQ Dashboard

Install Bull Board for queue monitoring:

```bash
pnpm add --filter @openrooms/api @bull-board/api @bull-board/fastify
```

## Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with recommended rules
- **Formatting**: Use Prettier (recommended)
- **Naming**: 
  - PascalCase for classes and types
  - camelCase for functions and variables
  - SCREAMING_SNAKE_CASE for constants

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Prisma Client Out of Sync

```bash
pnpm db:generate
```

### Redis Connection Failed

Check Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

### Database Migration Issues

```bash
# Reset database
pnpm db:push --force-reset

# Or drop and recreate
dropdb openrooms
createdb openrooms
pnpm db:push
```

## Performance Tips

1. **Use connection pooling**: Prisma handles this automatically
2. **Index frequently queried fields**: Already done in schema
3. **Use Redis for hot data**: State manager does this
4. **Batch operations**: Use Prisma's batch operations
5. **Monitor slow queries**: Enable Prisma query logging

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure TypeScript compiles: `pnpm lint`
4. Test your changes
5. Submit a pull request

## Additional Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Fastify Docs](https://www.fastify.io/)
- [Prisma Docs](https://www.prisma.io/docs)
- [BullMQ Docs](https://docs.bullmq.io/)
- [Next.js Docs](https://nextjs.org/docs)
