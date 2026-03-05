# Stage 3 Testing Guide - Step by Step

## Prerequisites

Before starting, ensure you have:
- ✅ Docker Desktop running
- ✅ OpenAI API key (get from https://platform.openai.com/api-keys)
- ✅ Terminal access
- ✅ The codebase at `/Users/kingchief/Documents/ROOMS`

---

## Step 1: Set Up Environment Variables

**Location**: Root of your project

```bash
cd /Users/kingchief/Documents/ROOMS/apps/api
```

**Create `.env.local` file**:

```bash
cat > .env.local << 'EOF'
DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
EOF
```

**⚠️ IMPORTANT**: Replace `sk-proj-YOUR_KEY_HERE` with your real OpenAI API key!

---

## Step 2: Verify Docker Services Are Running

**Check what's running**:

```bash
docker ps
```

**Expected output**:
```
CONTAINER ID   IMAGE              STATUS          PORTS
083aad002334   postgres:16-alpine Up (healthy)    0.0.0.0:5433->5432/tcp   rooms-test-db
c551513233e3   redis:7-alpine     Up (healthy)    0.0.0.0:6379->6379/tcp   rooms-redis-1
```

**If services aren't running**:

```bash
cd /Users/kingchief/Documents/ROOMS
docker-compose up -d
```

---

## Step 3: Verify Database Schema

**Check if schema is loaded**:

```bash
docker exec -i rooms-test-db psql -U rooms_test -d rooms_test -c "\dt"
```

**Expected output**: You should see tables like `agents`, `agent_execution_traces`, `api_keys`, etc.

**If tables are missing**:

```bash
docker exec -i rooms-test-db psql -U rooms_test -d rooms_test < /Users/kingchief/Documents/ROOMS/packages/database/schema.sql
```

---

## Step 4: Start the API Server (with Workers)

**Open Terminal 1** (API Server):

```bash
cd /Users/kingchief/Documents/ROOMS/apps/api
pnpm dev
```

**Expected output**:
```
✓ Ready in 4s
Server listening on http://localhost:3001

Room execution worker started
Agent execution worker started
```

**⚠️ Leave this terminal running!** This is your API server + workers.

---

## Step 5: Start the Dashboard (Optional)

**Open Terminal 2** (Dashboard):

```bash
cd /Users/kingchief/Documents/ROOMS/apps/dashboard
pnpm dev
```

**Expected output**:
```
✓ Ready in 3s
Local: http://localhost:3000
```

**Visit**: http://localhost:3000/agents

---

## Step 6: Create Your First Agent

**Open Terminal 3** (Testing):

```bash
cd /Users/kingchief/Documents/ROOMS
```

**Create an agent**:

```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestAgent",
    "description": "My first autonomous agent",
    "goal": "Search for information about artificial intelligence and summarize findings",
    "allowedTools": ["search_web", "calculator"],
    "policyConfig": {
      "maxLoopIterations": 5,
      "maxTokensPerRequest": 2000,
      "maxCostPerExecution": 1.0
    }
  }'
```

**Expected response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "TestAgent",
  "version": 1,
  "status": "ACTIVE",
  "loopState": "IDLE",
  "allowedTools": ["search_web", "calculator"],
  ...
}
```

**📝 SAVE THE AGENT ID** - You'll need it for the next step!

---

## Step 7: Execute the Agent (Real LLM Calls!)

**Replace `AGENT_ID` with the ID from Step 6**:

```bash
curl -X POST http://localhost:3001/api/agents/AGENT_ID/execute \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "test-room-001",
    "maxIterations": 5
  }'
```

**Expected response**:
```json
{
  "executionId": "1",
  "agentId": "550e8400-...",
  "roomId": "test-room-001",
  "status": "QUEUED",
  "message": "Agent execution queued successfully"
}
```

**📝 SAVE THE EXECUTION ID** (job ID)

---

## Step 8: Watch the Worker Execute

**Switch to Terminal 1** (API Server logs)

You should see logs like:

```
[AgentWorker] Starting execution for agent 550e8400-...
[AgentWorker] Executing agent TestAgent (v1)
[AgentWorker] Completed execution for agent 550e8400-...
```

**This means**:
- ✅ Worker picked up the job
- ✅ OpenAI was called for reasoning
- ✅ Agent completed its loop
- ✅ Traces were logged

---

## Step 9: View Execution Traces

**Get all traces for this agent**:

```bash
curl http://localhost:3001/api/agents/AGENT_ID/traces?limit=50
```

**Expected response**:
```json
{
  "agentId": "550e8400-...",
  "traces": [
    {
      "id": "trace-1",
      "loopIteration": 1,
      "loopState": "REASONING",
      "selectedTool": "search_web",
      "toolRationale": "I need to search for AI information",
      "durationMs": 1234,
      "timestamp": "2026-03-05T21:30:00.000Z"
    },
    ...
  ],
  "count": 5
}
```

**Get detailed trace**:

```bash
curl http://localhost:3001/api/agents/AGENT_ID/traces/TRACE_ID
```

This shows:
- Model prompt sent to OpenAI
- Model response
- Tool selection rationale
- Tool input/output
- State before/after
- State diff

---

## Step 10: Test API Key Authentication

**Generate an API key**:

```bash
curl -X POST http://localhost:3001/api/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "scopes": ["read", "write"],
    "rateLimit": 100,
    "rateLimitWindow": 60,
    "expiresIn": 365
  }'
```

**Expected response**:
```json
{
  "key": "sk_a1b2c3d4e5f6...",
  "prefix": "sk_a1b2c3d",
  "name": "Test Key",
  "message": "Store this key securely. It will not be shown again."
}
```

**📝 SAVE THE KEY** - You'll never see it again!

**Test authenticated request**:

```bash
curl -X POST http://localhost:3001/api/agents/AGENT_ID/execute \
  -H "Authorization: Bearer sk_a1b2c3d4e5f6..." \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "test-room-002",
    "maxIterations": 3
  }'
```

**Check rate limit headers in response**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1709675460
```

**Test rate limiting** (run this 101 times):

```bash
for i in {1..101}; do
  echo "Request $i"
  curl -X GET http://localhost:3001/api/agents \
    -H "Authorization: Bearer sk_a1b2c3d4e5f6..."
done
```

**After 100 requests, you should see**:
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Limit: 100 requests per 60s",
  "retryAfter": 60,
  "remaining": 0
}
```

---

## Step 11: View in Dashboard

**Open browser**: http://localhost:3000/agents

You should see:
- ✅ Your TestAgent in the list
- ✅ Status: ACTIVE
- ✅ Loop State: IDLE (or PERCEIVING if running)

**Click on the agent** to see:
- Overview tab (config, tools, timestamps)
- Traces tab (execution traces from OpenAI)
- Policy tab (resource limits)
- Memory tab (conversation state)

**Click "Execute" button** to queue another run from the UI!

---

## Step 12: Monitor Workers

**Check BullMQ job queue**:

```bash
# Install Redis CLI if needed
brew install redis

# Check queue length
redis-cli -h localhost -p 6379 LLEN bull:agent-execution:wait

# Check processing jobs
redis-cli -h localhost -p 6379 LLEN bull:agent-execution:active

# Check completed jobs
redis-cli -h localhost -p 6379 LLEN bull:agent-execution:completed
```

---

## Step 13: View API Key Usage Stats

```bash
curl http://localhost:3001/api/api-keys/KEY_ID/usage?hours=24
```

**Expected response**:
```json
{
  "apiKeyId": "key-123",
  "period": "Last 24 hours",
  "stats": {
    "totalRequests": 15,
    "successRate": 0.93,
    "avgResponseTime": 234,
    "byEndpoint": {
      "/api/agents": 10,
      "/api/agents/:id/execute": 5
    },
    "byStatus": {
      "200": 14,
      "429": 1
    }
  },
  "recentUsage": [...]
}
```

---

## Troubleshooting

### Issue: "OPENAI_API_KEY not configured"

**Solution**:
```bash
# Check if env var is set
cd /Users/kingchief/Documents/ROOMS/apps/api
cat .env.local | grep OPENAI

# If missing, add it
echo "OPENAI_API_KEY=sk-proj-YOUR_KEY" >> .env.local

# Restart API server (Ctrl+C in Terminal 1, then pnpm dev)
```

### Issue: "Agent execution failed"

**Check logs in Terminal 1**:
- Look for OpenAI API errors
- Check for policy violations
- Verify tool permissions

**Check trace errors**:
```bash
curl http://localhost:3001/api/agents/AGENT_ID/traces
```

### Issue: "Database connection failed"

**Restart Docker services**:
```bash
docker-compose down
docker-compose up -d
```

**Reload schema**:
```bash
docker exec -i rooms-test-db psql -U rooms_test -d rooms_test < packages/database/schema.sql
```

### Issue: "Rate limit headers not showing"

**Make sure you're using the middleware**:
- Check Terminal 1 logs for "Agent execution worker started"
- Verify `.env.local` has correct Redis config

---

## What You Should See

### Terminal 1 (API Server):
```
✓ Ready in 4s
Server listening on http://localhost:3001

Room execution worker started
Agent execution worker started

[AgentWorker] Starting execution for agent 550e8400-...
[AgentWorker] Executing agent TestAgent (v1)
[AgentWorker] Completed execution for agent 550e8400-...
```

### Terminal 3 (curl commands):
```json
{
  "executionId": "1",
  "status": "QUEUED",
  "message": "Agent execution queued successfully"
}
```

### Dashboard (http://localhost:3000/agents):
- Agent card showing TestAgent
- Status: ACTIVE
- Execution traces visible
- Can click "Execute" button

---

## Success Criteria ✅

You know it's working when:

1. ✅ Agent created successfully (Step 6)
2. ✅ Execution queued with job ID (Step 7)
3. ✅ Worker logs show "Starting execution" (Step 8)
4. ✅ Worker logs show "Completed execution" (Step 8)
5. ✅ Traces returned with reasoning data (Step 9)
6. ✅ API key generated (Step 10)
7. ✅ Rate limiting enforced (429 after limit) (Step 10)
8. ✅ Dashboard shows agent and traces (Step 11)

**If all 8 criteria pass, Stage 3 is FULLY OPERATIONAL!** 🚀

---

## Next Steps

Once testing is complete:

1. **Create more agents** with different tools
2. **Test policy enforcement** (try denied tools)
3. **Monitor rate limits** (track API key usage)
4. **Scale workers** (increase concurrency)
5. **Add custom tools** to the registry
6. **Build multi-agent workflows**

---

## Quick Reference

**Useful Commands**:

```bash
# Check Docker services
docker ps

# View API logs
cd /Users/kingchief/Documents/ROOMS/apps/api && pnpm dev

# Create agent
curl -X POST http://localhost:3001/api/agents -H "Content-Type: application/json" -d '{...}'

# Execute agent
curl -X POST http://localhost:3001/api/agents/ID/execute -H "Content-Type: application/json" -d '{...}'

# View traces
curl http://localhost:3001/api/agents/ID/traces

# Generate API key
curl -X POST http://localhost:3001/api/api-keys -H "Content-Type: application/json" -d '{...}'

# View dashboard
open http://localhost:3000/agents
```

**File Locations**:
- API Server: `/Users/kingchief/Documents/ROOMS/apps/api`
- Dashboard: `/Users/kingchief/Documents/ROOMS/apps/dashboard`
- Env Config: `/Users/kingchief/Documents/ROOMS/apps/api/.env.local`
- Worker Code: `/Users/kingchief/Documents/ROOMS/apps/api/src/workers/agent-worker.ts`
- Middleware: `/Users/kingchief/Documents/ROOMS/apps/api/src/middleware/api-key-auth.ts`
