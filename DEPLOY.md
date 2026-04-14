# Railway Deployment Guide

## Services to create on Railway

You need **4 services** in one Railway project:

| Service | Source | Config |
|---------|--------|--------|
| `postgres` | Railway PostgreSQL plugin | automatic |
| `redis` | Railway Redis plugin | automatic |
| `api` | GitHub repo · root `/` · Dockerfile: `Dockerfile.api` | see below |
| `dashboard` | GitHub repo · root `/` · Dockerfile: `Dockerfile.dashboard` | see below |

---

## API Service environment variables

```
DATABASE_URL       = ${{Postgres.DATABASE_URL}}
REDIS_URL          = ${{Redis.REDIS_URL}}
NODE_ENV           = production
PORT               = 3001
API_SECRET         = <generate a random 32-char string>
OPENAI_API_KEY     = sk-...          (optional)
ANTHROPIC_API_KEY  = sk-ant-...      (optional)
```

## Dashboard Service environment variables

```
NEXT_PUBLIC_API_URL = https://<your-api-service>.railway.app
NODE_ENV            = production
NEXT_TELEMETRY_DISABLED = 1
```

---

## Database schema

After the API service first boots, run the schema manually once:

```bash
# From your local machine with DATABASE_URL pointed to Railway Postgres
psql $DATABASE_URL < packages/database/schema.sql
```

Or use the Railway CLI:
```bash
railway run --service postgres psql < packages/database/schema.sql
```

---

## Health check

API health endpoint: `GET /api/health`

Expected response when healthy:
```json
{ "status": "ok", "database": "connected", "redis": "connected" }
```

---

## Local development

```bash
# Start infrastructure
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14
docker run -d -p 6379:6379 redis:7

# Apply schema
docker exec -i <pg-container-id> psql -U postgres -c "CREATE DATABASE openrooms;"
docker exec -i <pg-container-id> psql -U postgres -d openrooms < packages/database/schema.sql

# Copy env
cp .env.example .env

# Start everything
pnpm install
pnpm dev
```

API → http://localhost:3001
Dashboard → http://localhost:3000
