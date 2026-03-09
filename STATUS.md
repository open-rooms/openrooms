# OpenRooms — Production Status

## Current State

Dashboard and API are wired for end-to-end flows: rooms, workflows, agents, tools, and live runs. Runtime APIs expose queue status and event streaming.

## Before Production Deploy

1. **API TypeScript** — Resolve strict-mode errors in `apps/api` so `pnpm run build` succeeds
2. **Environment** — Ensure `DATABASE_URL`, `REDIS_URL`, `NEXT_PUBLIC_API_URL` are set in production
3. **Migrations** — Run `packages/database/schema.sql` against production database
4. **OpenAI Key** — Set `OPENAI_API_KEY` for live agent execution

## Local Run

```bash
# PostgreSQL + Redis (Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14
docker run -d -p 6379:6379 redis:7

# Schema
docker exec -i <postgres-container-id> psql -U postgres -c "CREATE DATABASE openrooms;"
docker exec -i <postgres-container-id> psql -U postgres -d openrooms < packages/database/schema.sql

# API (port 3001)
pnpm --filter @openrooms/api dev

# Dashboard (port 3000)
pnpm --filter dashboard dev
```
