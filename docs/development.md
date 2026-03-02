# Development Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker Desktop

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/open-rooms/openrooms.git
cd openrooms
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Infrastructure

```bash
# Start Postgres and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 4. Initialize Database

```bash
# Apply schema
pnpm db:setup

# Or manually
docker exec -i $(docker ps -q -f name=postgres) psql -U postgres -d openrooms < packages/database/schema.sql
```

### 5. Configure Environment

Create `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/openrooms

# Redis
REDIS_URL=redis://localhost:6379

# API
API_PORT=3001
API_HOST=localhost

# LLM (optional for development)
OPENAI_API_KEY=sk-...
```

### 6. Start Development

```bash
# Start all services
pnpm dev

# Or individually
pnpm dev:api        # API server on :3001
pnpm dev:dashboard  # Dashboard on :3000
pnpm dev:worker     # Background worker
```

## Project Structure

```
openrooms/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── plugins/     # Fastify plugins
│   │   │   └── server.ts    # Server setup
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── dashboard/
│       ├── src/
│       │   ├── app/         # Next.js App Router
│       │   ├── components/  # React components
│       │   └── lib/         # Utilities
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── core/                # Domain types
│   ├── database/            # Kysely + repositories
│   ├── engine/              # Workflow FSM engine
│   ├── worker/              # BullMQ workers
│   ├── tools/               # Tool plugins
│   └── llm/                 # LLM abstraction
└── examples/                # Sample workflows
```

## Development Workflow

### Making Changes

1. Create feature branch:
```bash
git checkout -b feat/feature-name
```

2. Make changes in relevant package

3. Run type checking:
```bash
pnpm typecheck
```

4. Run linter:
```bash
pnpm lint
```

5. Test locally:
```bash
pnpm dev
```

### Adding a New Tool

1. Create tool in `packages/tools/src/`:

```typescript
// packages/tools/src/my-tool.ts
import { Tool, ToolInput, ToolOutput } from '@openrooms/core';

export class MyTool implements Tool {
  name = 'my_tool';
  description = 'Does something useful';

  async execute(input: ToolInput): Promise<ToolOutput> {
    // Implementation
    return { success: true, data: result };
  }
}
```

2. Register in tool registry:

```typescript
// packages/tools/src/registry.ts
import { MyTool } from './my-tool';

export function createToolRegistry() {
  return {
    my_tool: new MyTool(),
    // ... other tools
  };
}
```

3. Test:

```bash
pnpm test packages/tools
```

### Adding an API Endpoint

1. Create route in `apps/api/src/routes/`:

```typescript
// apps/api/src/routes/my-route.ts
import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/my-endpoint', async (request, reply) => {
    return { message: 'Hello' };
  });
}
```

2. Fastify auto-loads routes from `routes/` directory

3. Test:

```bash
curl http://localhost:3001/my-endpoint
```

## Database Migrations

### Creating a Migration

```bash
# Create new migration file
touch packages/database/migrations/$(date +%s)_migration_name.sql
```

### Applying Migrations

```bash
# Apply all pending migrations
pnpm db:migrate

# Or manually
docker exec -i $(docker ps -q -f name=postgres) psql -U postgres -d openrooms < migration.sql
```

### Rolling Back

```bash
# Rollback last migration
pnpm db:rollback
```

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Test specific package
pnpm test packages/engine

# Watch mode
pnpm test --watch
```

### Integration Tests

```bash
# Start test infrastructure
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
pnpm test:integration

# Cleanup
docker-compose -f docker-compose.test.yml down
```

## Debugging

### API Server

```bash
# Start with Node inspector
node --inspect node_modules/.bin/fastify start

# Attach debugger (VS Code launch.json)
{
  "type": "node",
  "request": "attach",
  "name": "Attach to API",
  "port": 9229
}
```

### Dashboard

```bash
# Next.js includes debugging support
pnpm dev:dashboard

# Use browser DevTools or VS Code debugger
```

### Worker

```bash
# Start worker with logging
DEBUG=bull* pnpm dev:worker
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Connection Failed

```bash
# Verify Postgres is running
docker ps | grep postgres

# Check connection
docker exec -it $(docker ps -q -f name=postgres) psql -U postgres -d openrooms -c "SELECT 1;"
```

### Redis Connection Failed

```bash
# Verify Redis is running
docker ps | grep redis

# Check connection
docker exec -it $(docker ps -q -f name=redis) redis-cli ping
```

## Code Style

### TypeScript

- Use strict mode
- Avoid `any` type
- Prefer interfaces over types for objects
- Use explicit return types for functions

### Formatting

```bash
# Format all files
pnpm format

# Check formatting
pnpm format:check
```

### Commit Messages

Follow conventional commits:

```
feat(scope): add new feature
fix(scope): resolve bug
refactor(scope): restructure code
chore(scope): update dependencies
docs(scope): update documentation
test(scope): add tests
```

## Performance

### Profiling

```bash
# Profile API server
node --prof apps/api/dist/server.js

# Generate report
node --prof-process isolate-*.log > profile.txt
```

### Monitoring

```bash
# Add OpenTelemetry tracing
pnpm add @opentelemetry/sdk-node
```

## Resources

- [Fastify Documentation](https://fastify.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Kysely Documentation](https://kysely.dev)
