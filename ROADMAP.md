# OpenRooms — Engineering & Product Roadmap

> This document is internal. It is tracked in version control but not published.
> Last updated: 2026-03-01

---

## Current State

The platform is functional across its core surfaces:

- **Rooms** — isolated execution environments, create/run/pause via API and dashboard
- **Agents** — deploy autonomous agents with goals, tools, memory access, and model policy
- **Workflows** — define and trigger multi-step execution graphs via webhook or cron
- **Connectors** — register REST APIs as agent tools with a single endpoint registration
- **Runtime** — BullMQ worker pool, Redis pub/sub event bus, SSE streaming to dashboard
- **Auth** — workspace registration persisted to PostgreSQL with `or_` prefixed session tokens
- **Observability** — execution logs, run history, and per-room activity feed

---

## Priority 1 — Product-Market Fit Foundation

### 1.1 Flagship End-to-End Demo
Build one fully self-contained, publicly shareable demo that works without any manual configuration:

- **Target use case:** autonomous email triage — inbound email arrives, agent classifies intent, drafts reply, sends or escalates
- Requirements: real email polling (IMAP or webhook), real reply, full execution trace visible in dashboard
- Deliverable: a 90-second screen recording that can serve as top-of-funnel content
- Success metric: a non-technical user can deploy it in under 3 minutes

### 1.2 Persistent Workspace Memory
Rooms currently store memory per execution. Introduce **workspace-scoped shared memory**:

- Vector store (pgvector extension on existing PostgreSQL) per workspace
- All agents in the workspace can read/write to shared memory by key or semantic query
- Memory panel in the Room detail page showing current keys, embeddings count, and last written
- API: `GET /api/memory`, `POST /api/memory`, `DELETE /api/memory/:key`

This is the architectural feature that makes Rooms behave as persistent systems rather than stateless job runners. It is the clearest differentiator from workflow automation tools.

### 1.3 Trace Viewer & Replay
Every agent execution should be fully inspectable and replayable:

- Execution timeline: every LLM call, tool invocation, memory read/write, and decision branch with latency
- Diff view: re-run any historical trace against a different model or policy and surface divergence points
- Export: download trace as structured JSON for external analysis
- API: `GET /api/runs/:id/trace`

This directly addresses the core reliability objection from enterprise buyers: *"How do I know the agent did the right thing?"*

### 1.4 Multi-Model Routing Policy per Room
The multi-provider infrastructure exists in the backend. Surface it:

- Per-Room routing policy: `cheapest`, `fastest`, `highest-quality`, `compliance-safe`, or `manual`
- Real-time cost tracking per run (token count × model pricing)
- Cost dashboard: spend per room, per agent, per model, over time
- Hard spend caps: auto-pause a Room when cost threshold is exceeded

---

## Priority 2 — Developer Adoption

### 2.1 Public SDK
Publish `@openrooms/sdk` to npm with TypeScript-first design:

```typescript
import { OpenRooms } from '@openrooms/sdk'

const client = new OpenRooms({ apiKey: process.env.OPENROOMS_API_KEY })

const room = await client.rooms.create({ name: 'support-triage' })
await room.agents.deploy({
  goal: 'Classify and respond to incoming support tickets',
  tools: ['zendesk', 'slack'],
  policy: { provider: 'openai', model: 'gpt-4o', maxCost: 0.10 }
})
```

- Full CRUD for all resources (rooms, agents, workflows, connectors, runs)
- Webhook verification helpers
- SSE stream wrapper for real-time execution monitoring

### 2.2 Shareable Room Templates (Growth Loop)
Every deployed Room template generates a shareable slug:

- `app.openrooms.io/t/support-triage-bot` — one-click clone into any workspace
- Template gallery page with usage counts and author attribution
- API to publish a Room as a template: `POST /api/rooms/:id/publish`

Templates become the primary distribution mechanism: users build, share, and remix.

### 2.3 Webhook Developer Experience
- Dedicated webhook endpoint per Room with automatic signature verification
- Webhook event log in the dashboard (last 50 inbound payloads with parsed structure)
- Retry logic with configurable backoff
- `ngrok`-style local tunnel for development testing (via CLI)

### 2.4 CLI
```bash
npx @openrooms/cli init          # scaffold a new workspace config
npx @openrooms/cli deploy        # push Room + agent + workflow from config file
npx @openrooms/cli logs --room   # stream execution logs
npx @openrooms/cli run --agent   # trigger an agent run and stream output
```

YAML-based Room definition file:
```yaml
# openrooms.yaml
room: support-triage
agents:
  - name: classifier
    goal: Classify inbound ticket intent
    model: gpt-4o-mini
    tools: [zendesk]
  - name: responder
    goal: Draft and send reply based on classifier output
    model: gpt-4o
    tools: [zendesk, slack]
workflow: sequential
trigger:
  webhook: true
  cron: null
```

---

## Priority 3 — Enterprise Readiness

### 3.1 Role-Based Access Control
- Workspace members with roles: `owner`, `admin`, `developer`, `viewer`
- Resource-level permissions: who can deploy agents, who can view traces, who can manage connectors
- Invite flow: email invitation with workspace join link

### 3.2 Audit Log
- Immutable append-only log of all workspace actions: who did what, when, on which resource
- Filterable by user, resource type, and time range
- Exportable as CSV for compliance purposes
- API: `GET /api/audit`

### 3.3 Compliance Mode
- Per-Room policy flag: `compliance: strict`
- In strict mode: all LLM outputs are logged verbatim, no data leaves the workspace boundary, automatic PII detection flags in trace viewer
- SOC 2 Type II readiness checklist tracked in engineering

### 3.4 SLA & Reliability Targets
- 99.9% API uptime SLA
- Execution queue depth alerting: auto-scale workers when BullMQ depth exceeds threshold
- Dead-letter queue with automatic retry and human escalation path
- Incident response playbook documented and tested quarterly

---

## Priority 4 — Go-to-Market

### 4.1 Pricing Tiers
| Tier | Target | Price | Limits |
|---|---|---|---|
| **Developer** | Solo builders | Free | 3 Rooms, 500 agent runs/month, 1 user |
| **Startup** | Early teams | $49/month | 20 Rooms, 10,000 runs/month, 5 users |
| **Growth** | Scaling companies | $199/month | Unlimited Rooms, 100,000 runs, 20 users, priority support |
| **Enterprise** | Companies > 50 engineers | Custom | RBAC, audit log, compliance mode, dedicated workers, SLA |

Monetisation lever: **agent run volume**. Every run costs compute. Charge above the free tier.

### 4.2 First 10 Paying Customers
Target profile: early-stage B2B SaaS startups (5–30 engineers) who have started deploying LLM features and are hitting reliability, cost, and debugging pain.

Acquisition channels:
1. Direct outreach to YC alumni companies that shipped AI features in 2024–2025
2. Content: technical blog posts on agent reliability, cost control, and debugging — problems OpenRooms solves
3. GitHub presence: open-source the SDK and example templates
4. Developer community: Hacker News Show HN post with the flagship demo

### 4.3 Investor Narrative (Seed Round)
**Problem:** Every company is deploying AI agents. None of them have infrastructure to run those agents reliably at scale — no observability, no cost controls, no memory management, no audit trail.

**Solution:** OpenRooms is the control plane for autonomous AI systems. Deploy agents into isolated Rooms with full memory, policy enforcement, real-time tracing, and cost governance.

**Market:** The AI infrastructure market is at the same inflection point that cloud infrastructure was in 2008. Every software company becomes an AI company in the next 3 years. Developer tools that sit between the LLM API and production systems are a durable, high-margin category.

**Traction requirements before raising:**
- 10+ active paying workspaces
- 1 enterprise design partner with a signed LOI
- Public SDK with 500+ GitHub stars
- One viral demo with >10,000 organic views

---

## Technical Debt to Resolve Before Scale

| Item | Priority | Notes |
|---|---|---|
| Database migrations (proper migration runner) | High | Currently schema is created ad-hoc; adopt Kysely migrations |
| Worker auto-scaling | High | BullMQ workers are fixed count; need dynamic scaling based on queue depth |
| Rate limiting on all API routes | High | No per-workspace rate limiting in place |
| Token authentication hardening | High | Replace session tokens with signed JWTs or short-lived bearer tokens |
| Test coverage | Medium | No automated tests; at minimum integration tests on core execution paths |
| OpenAPI spec | Medium | Auto-generate from Fastify routes; enables SDK generation and docs |
| Database connection pooling | Medium | PgBouncer or Kysely pool config tuning for production load |
| Log aggregation | Medium | Structured logs exist; need a log aggregator (Loki or Datadog) in production |
| CI/CD pipeline | Low | GitHub Actions: lint, type-check, test, deploy on merge to main |

---

## Engineering Conventions

- All database changes via numbered migration files in `packages/database/migrations/`
- API routes must include OpenAPI annotations (Fastify schema validation)
- Every new feature requires a corresponding entry in `CHANGELOG.md`
- TypeScript strict mode enforced; no `any` except in adapter layers with explicit comment
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- Branches: `feat/<name>`, `fix/<name>`, `chore/<name>` — all PRs require review before merge to main

---

*This roadmap is a living document. Reprioritise quarterly based on customer feedback and market signal.*
