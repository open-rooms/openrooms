# Project Structure

```
openrooms/
├── README.md                 # Project overview
├── QUICKSTART.md            # Quick start guide
├── ARCHITECTURE.md          # System architecture documentation
├── DEVELOPMENT.md           # Development guide
├── API.md                   # API reference
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # pnpm workspace config
├── turbo.json               # Turborepo configuration
├── docker-compose.yml       # Docker services (Postgres, Redis)
├── setup.sh                 # Automated setup script
│
├── .gitignore              # Git ignore patterns
├── .vscode/                # VS Code configuration
│   └── settings.json       # Recommended VS Code settings
│
├── examples/               # Example scripts
│   └── create-workflow.ts  # Example workflow creation
│
├── apps/                   # Application packages
│   ├── api/                # Fastify REST API server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── index.ts            # Server entry point
│   │       ├── container.ts        # Dependency injection
│   │       └── routes/             # API routes
│   │           ├── health.ts       # Health check endpoint
│   │           ├── rooms.ts        # Room CRUD + execution
│   │           ├── workflows.ts    # Workflow management
│   │           └── tools.ts        # Tool listing
│   │
│   └── dashboard/          # Next.js monitoring UI
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── .env.local.example
│       └── src/
│           ├── app/                # Next.js app router
│           │   ├── layout.tsx      # Root layout
│           │   ├── page.tsx        # Home page
│           │   ├── globals.css     # Global styles
│           │   ├── rooms/          # Room pages
│           │   │   ├── page.tsx    # Room list
│           │   │   └── [id]/       # Dynamic room detail
│           │   │       └── page.tsx
│           │   ├── workflows/      # Workflow pages
│           │   │   └── page.tsx
│           │   └── tools/          # Tool pages
│           │       └── page.tsx
│           └── lib/
│               └── api.ts          # API client functions
│
└── packages/               # Shared packages
    ├── core/               # Core domain types & interfaces
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts            # Package exports
    │       ├── types.ts            # Domain types
    │       ├── interfaces.ts       # Service interfaces
    │       └── errors.ts           # Domain errors
    │
    ├── database/           # Prisma & repositories
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── prisma/
    │   │   └── schema.prisma       # Database schema
    │   └── src/
    │       ├── index.ts            # Prisma client export
    │       ├── repositories.ts     # Repository implementations
    │       └── logging-service.ts  # Logging service
    │
    ├── engine/             # Workflow execution engine
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts            # Package exports
    │       ├── workflow-engine.ts  # Main FSM engine
    │       ├── state-manager.ts    # Redis state manager
    │       └── node-executors.ts   # Node type executors
    │
    ├── worker/             # Background job processing
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts            # Package exports
    │       ├── queue.ts            # BullMQ queue wrapper
    │       └── workers.ts          # Worker implementations
    │
    ├── tools/              # Tool plugin system
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts            # Package exports
    │       ├── registry.ts         # Tool registry
    │       └── builtin-tools.ts    # Built-in tools
    │
    └── llm/                # LLM provider abstraction
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts            # Package exports
            └── providers.ts        # OpenAI/Anthropic providers
```

## Package Dependencies

### Dependency Graph

```
apps/api
  ├─ @openrooms/core
  ├─ @openrooms/database
  ├─ @openrooms/engine
  ├─ @openrooms/worker
  ├─ @openrooms/tools
  └─ @openrooms/llm

apps/dashboard
  └─ (no internal dependencies, calls API)

packages/database
  └─ @openrooms/core

packages/engine
  ├─ @openrooms/core
  └─ @openrooms/database

packages/worker
  ├─ @openrooms/core
  └─ @openrooms/engine

packages/tools
  └─ @openrooms/core

packages/llm
  └─ @openrooms/core

packages/core
  └─ (no dependencies - pure types)
```

## Key Files

### Configuration Files

- **package.json**: Root dependencies and workspace scripts
- **pnpm-workspace.yaml**: Workspace package locations
- **turbo.json**: Build pipeline configuration
- **docker-compose.yml**: Local development services

### Application Entry Points

- **apps/api/src/index.ts**: API server
- **apps/dashboard/src/app/layout.tsx**: Dashboard root
- **examples/create-workflow.ts**: Workflow creation example

### Core Domain

- **packages/core/src/types.ts**: All domain types
- **packages/core/src/interfaces.ts**: Repository & service interfaces
- **packages/core/src/errors.ts**: Domain-specific errors

### Database

- **packages/database/prisma/schema.prisma**: Database schema
- **packages/database/src/repositories.ts**: All repository implementations

### Engine

- **packages/engine/src/workflow-engine.ts**: FSM execution logic
- **packages/engine/src/state-manager.ts**: Redis state management
- **packages/engine/src/node-executors.ts**: Node type handlers

## Development Files

### Setup

```bash
./setup.sh              # Automated setup
pnpm install            # Install dependencies
pnpm db:generate        # Generate Prisma client
pnpm db:push            # Push database schema
pnpm dev                # Start all apps
```

### Common Commands

```bash
# Development
pnpm dev                          # Start all
pnpm --filter @openrooms/api dev  # API only
pnpm --filter @openrooms/dashboard dev  # Dashboard only

# Database
pnpm db:generate        # Generate client
pnpm db:push            # Push schema
pnpm db:migrate         # Create migration
pnpm db:studio          # Open Prisma Studio

# Build
pnpm build              # Build all
pnpm lint               # Lint all
pnpm clean              # Clean all

# Examples
pnpm tsx examples/create-workflow.ts
```

## Port Allocation

- **3000**: Next.js Dashboard
- **3001**: Fastify API
- **5432**: PostgreSQL
- **6379**: Redis

## Environment Variables

### API (.env)
- DATABASE_URL
- REDIS_URL
- PORT
- OPENAI_API_KEY (optional)

### Dashboard (.env.local)
- NEXT_PUBLIC_API_URL

## Build Outputs

```
apps/api/dist/          # Compiled API
apps/dashboard/.next/   # Next.js build
packages/*/dist/        # Compiled packages
```

## Ignored Files

- node_modules/
- dist/
- .next/
- .env
- *.db
- .turbo/
