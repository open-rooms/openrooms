# OpenRooms — Next Phase

> Engineering tasks for the next development session.
> Pick up from here. Each item has context, the relevant files, and a clear acceptance criterion.

---

## 1. Persistent Workspace Memory (pgvector)

**Why:** Agents currently have no memory between runs. This is the feature that makes Rooms feel like
living systems rather than stateless job runners. It is the clearest technical differentiator.

**What to build:**
- Enable the `pgvector` PostgreSQL extension in the production Railway database
- Add a `memory_entries` table: `(id, workspace_id, key, embedding vector(1536), value jsonb, created_at)`
- Add API routes: `POST /api/memory`, `GET /api/memory`, `DELETE /api/memory/:key`, `POST /api/memory/query` (semantic search)
- Add a "Memory" panel to the Room detail page (`apps/dashboard/src/app/rooms/[id]/page.tsx`) showing stored keys, vector count, and last written timestamp
- Wire the agent runner to read/write memory on each execution step

**Files to touch:**
- `packages/database/schema.sql` — add `memory_entries` table
- `apps/api/src/routes/memory.ts` — new file
- `apps/api/src/index.ts` — register memory routes
- `apps/dashboard/src/app/rooms/[id]/page.tsx` — add Memory capability panel
- `apps/dashboard/src/lib/api.ts` — add memory API client methods

**Acceptance criterion:** An agent in Room A can store a value during run 1 and retrieve it during run 2 without re-fetching from an external source.

---

## 2. Execution Trace Viewer

**Why:** The #1 enterprise objection is "how do I know the agent did the right thing?" A trace viewer
directly answers this and is a strong demo moment for investors.

**What to build:**
- A `/runs/:id` detail page showing a full execution timeline: every LLM call, tool invocation, memory read/write, and decision step with latency
- Each step shows: input, output, model used, tokens, cost, and duration
- A "Replay with different model" button that re-runs the same trace payload against a new model and surfaces divergence points
- Export trace as JSON button

**Files to touch:**
- `apps/dashboard/src/app/live-runs/[id]/page.tsx` — new trace detail page (currently only list view exists)
- `apps/api/src/routes/runs.ts` — add `GET /api/runs/:id/trace` endpoint
- `packages/execution/` — ensure trace steps are persisted to `agent_execution_traces` table (already exists in schema)

**Acceptance criterion:** Click any run in Live Runs → see a full timeline of every decision the agent made.

---

## 3. Multi-Model Cost Routing

**Why:** The backend already supports multiple providers (OpenAI, Anthropic). Surfacing cost control
as a first-class feature makes OpenRooms immediately valuable to engineering teams burning API budget.

**What to build:**
- Per-Room routing policy UI in the Room settings panel: `cheapest-pass`, `fastest`, `quality-first`, `manual`
- Real-time cost display per run (tokens × model pricing, calculated server-side)
- Spend dashboard on the homepage stats strip: total spend this month, cost per room
- Hard cap: auto-pause a Room when monthly spend exceeds a configured threshold

**Files to touch:**
- `apps/dashboard/src/app/rooms/[id]/page.tsx` — add routing policy selector
- `apps/api/src/routes/agents.ts` — add cost calculation on execution complete
- `apps/dashboard/src/app/home/page.tsx` — add spend chip to live stats strip
- `packages/execution/agent-runtime/src/` — add cost tracking to agent runner

**Acceptance criterion:** User sets a $1.00/month cap on a Room. After the cap is hit, the Room auto-pauses and shows "Spend cap reached" in the dashboard.

---

## 4. Public SDK: `@openrooms/sdk`

**Why:** A publishable npm SDK makes the platform real to technical evaluators and enables GitHub growth.

**What to build:**
- New package at `packages/sdk/` with TypeScript-first client
- Core methods: `rooms.create()`, `rooms.list()`, `agents.deploy()`, `workflows.trigger()`, `runs.stream()`
- Webhook verification helper: `openrooms.verifyWebhook(signature, payload, secret)`
- SSE stream wrapper: `runs.stream(runId, callback)` piping the existing SSE endpoint
- Publish to npm as `@openrooms/sdk`

**Files to touch:**
- `packages/sdk/` — new package (src/index.ts, package.json, tsconfig.json, README.md)
- `pnpm-workspace.yaml` — add sdk to workspace packages
- `apps/api/src/routes/` — ensure all routes have consistent JSON shape (SDK depends on this)

**Acceptance criterion:**
```typescript
import { OpenRooms } from '@openrooms/sdk'
const client = new OpenRooms({ apiKey: 'or_...' })
const room = await client.rooms.create({ name: 'support-bot' })
console.log(room.id) // valid UUID
```

---

## 5. Shareable Room Templates (Growth Loop)

**Why:** Every room template deployed should generate a shareable URL. This is the distribution mechanic.

**What to build:**
- `POST /api/rooms/:id/publish` — mark a room as a public template, return a slug
- `GET /api/templates` — list published templates
- `GET /t/:slug` — public template landing page (no auth required, shows Room config + "Clone to my workspace" button)
- Template gallery page linked from the homepage

**Files to touch:**
- `apps/api/src/routes/templates.ts` — new file
- `apps/dashboard/src/app/t/[slug]/page.tsx` — new public template page
- `packages/database/schema.sql` — add `published_templates` table

**Acceptance criterion:** Deploy a Room → click "Share template" → send the URL to someone → they clone it into their workspace in one click without configuring anything.

---

## 6. API Key Authentication (Production Hardening)

**Why:** Currently auth is workspace-session based. For the SDK and any production usage, real API key management is required.

**What to build:**
- API key management page: `apps/dashboard/src/app/settings/api-keys/page.tsx`
- `POST /api/keys` — generate a new `or_live_...` key, store hash in DB
- `DELETE /api/keys/:id` — revoke a key
- Update `AuthGuard` to also accept `Bearer or_live_...` tokens in the Authorization header
- Key scopes: `read`, `write`, `admin`

**Files to touch:**
- `apps/api/src/middleware/api-key-auth.ts` — already exists, extend it
- `apps/api/src/routes/keys.ts` — new file
- `apps/dashboard/src/app/settings/` — add API Keys tab

**Acceptance criterion:** User creates a key in the dashboard → uses it in a curl request → request succeeds. User revokes the key → same curl request returns 401.

---

## Current Known Issues (Fix Before Next Session Ends)

| Issue | File | Notes |
|---|---|---|
| Workspaces table missing on Railway | `apps/api/src/routes/workspaces.ts` | DB migration needed; currently falls back gracefully but table should be created via Railway DB shell |
| Production `API_URL` env var missing `https://` | Railway env | Fixed in `next.config.js` with defensive normalisation, but should also fix the env var directly |
| Agent execution traces not shown in UI | `apps/dashboard/src/app/live-runs/` | `agent_execution_traces` table exists but no UI to display it |
| Room capability panels (Events, Connectors) show empty state | `apps/dashboard/src/app/rooms/[id]/page.tsx` | Wire these to real endpoints |

---

## Railway Setup Checklist (run once in Railway DB shell)

```sql
-- Run in Railway PostgreSQL shell to create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(128) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable vector extension for memory (Phase 2)
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Environment Variables Required in Railway

| Variable | Service | Value |
|---|---|---|
| `API_URL` | dashboard | `https://<your-api-service>.up.railway.app` |
| `DATABASE_URL` | api | Set by Railway PostgreSQL plugin |
| `REDIS_URL` | api | Set by Railway Redis plugin |
| `OPENAI_API_KEY` | api | Your OpenAI key |
| `JWT_SECRET` | api | Any 32+ char random string |

---

*Resume here next session. All Phase 1 features are deployed. Start with item 1 (Persistent Memory) as it delivers the most product value.*
