# OpenRooms — Railway Deployment Guide

This deploys 4 services in a single Railway project:
| Service | What it is |
|---|---|
| **API** | Fastify server + BullMQ workers |
| **Dashboard** | Next.js frontend |
| **PostgreSQL** | Managed database (Railway plugin) |
| **Redis** | Managed queue/pub-sub (Railway plugin) |

---

## Prerequisites

- A [Railway account](https://railway.app) (free hobby tier works)
- This repo pushed to GitHub (already done)
- Your OpenAI API key

---

## Step 1 — Create the Railway project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select the `openrooms` / `ROOMS` repository
4. When prompted "What should Railway build?", click **"Empty project"** — we'll add services manually

---

## Step 2 — Add PostgreSQL

1. In your Railway project, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creates the database and auto-sets `DATABASE_URL` (shared across all services automatically)

---

## Step 3 — Add Redis

1. Click **"+ New"** → **"Database"** → **"Add Redis"**
2. Railway creates Redis and auto-sets `REDIS_URL`

---

## Step 4 — Deploy the API service

1. Click **"+ New"** → **"GitHub Repo"** → select your repo
2. In **Settings → Source**:
   - Root Directory: `apps/api`
3. Railway will detect `railway.json` and use:
   - Build: nixpacks (auto)
   - Start: `pnpm --filter @openrooms/api start`
4. Go to **Variables** tab and add:
   ```
   NODE_ENV=production
   OPENAI_API_KEY=sk-your-key-here
   CORS_ORIGIN=*
   ```
   > `DATABASE_URL` and `REDIS_URL` are injected automatically by Railway — do NOT add them manually.
5. Go to **Settings → Networking** → click **"Generate Domain"** to get a public URL like `https://openrooms-api.up.railway.app`

---

## Step 5 — Run database migrations

After the API service is running (green):

1. In the API service, click **"+ New"** → **"Job"** or use the Railway shell
2. Open the Railway CLI and run:
   ```bash
   railway run --service api psql $DATABASE_URL < packages/database/schema.sql
   railway run --service api psql $DATABASE_URL < packages/database/schema-stage4.sql
   railway run --service api psql $DATABASE_URL < packages/database/seed-production.sql
   ```
   
   **Or** use the Railway web shell (API service → Shell tab):
   ```bash
   psql $DATABASE_URL < /app/packages/database/schema.sql
   psql $DATABASE_URL < /app/packages/database/schema-stage4.sql
   psql $DATABASE_URL < /app/packages/database/seed-production.sql
   ```

---

## Step 6 — Deploy the Dashboard service

1. Click **"+ New"** → **"GitHub Repo"** → select your repo again
2. In **Settings → Source**:
   - Root Directory: `apps/dashboard`
3. Go to **Variables** tab and add:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://openrooms-api.up.railway.app
   ```
   Replace the URL with the actual API domain from Step 4.
4. Go to **Settings → Networking** → click **"Generate Domain"**

---

## Step 7 — Verify everything works

Once both services show a green checkmark:

1. Open your dashboard URL in the browser
2. Go to **Settings** → enter your OpenAI key (or it was set via env var in Step 4)
3. Go to **Live Runs** → click **Run** on any agent or workflow
4. Watch real-time logs appear

---

## Useful Railway CLI commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs for API service
railway logs --service api

# Run a one-off command in the API service context
railway run --service api pnpm --filter @openrooms/api start
```

---

## Environment variable reference

### API service
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Auto | Injected by PostgreSQL plugin |
| `REDIS_URL` | Auto | Injected by Redis plugin |
| `NODE_ENV` | Yes | Set to `production` |
| `OPENAI_API_KEY` | Recommended | Real LLM reasoning (falls back to simulation if absent) |
| `ANTHROPIC_API_KEY` | Optional | Claude support |
| `CORS_ORIGIN` | Optional | Restrict to dashboard domain in production |
| `LOG_LEVEL` | Optional | `info` (default), `debug`, `warn` |

### Dashboard service
| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Full URL of the deployed API service |
| `NODE_ENV` | Yes | Set to `production` |
