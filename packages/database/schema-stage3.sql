-- OpenRooms Stage 3 Schema Extensions
-- Agent as First-Class Primitive + API Keys + Governance

-- Agent Status Enum
DO $$ BEGIN
  CREATE TYPE "AgentStatus" AS ENUM (
    'ACTIVE',
    'PAUSED',
    'ARCHIVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Agent Loop State Enum
DO $$ BEGIN
  CREATE TYPE "AgentLoopState" AS ENUM (
    'IDLE',
    'PERCEIVING',
    'REASONING',
    'SELECTING_TOOL',
    'EXECUTING_TOOL',
    'UPDATING_MEMORY',
    'TERMINATING'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop existing agents table and recreate as first-class entity
DROP TABLE IF EXISTS agents CASCADE;

-- Agents Table (First-Class Primitive)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Room binding
  "roomId" UUID REFERENCES rooms(id) ON DELETE SET NULL,
  
  -- Tool governance
  "allowedTools" TEXT[] NOT NULL DEFAULT '{}',
  "policyConfig" JSONB NOT NULL DEFAULT '{}',
  
  -- Runtime state
  status "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
  "loopState" "AgentLoopState" NOT NULL DEFAULT 'IDLE',
  "memoryState" JSONB NOT NULL DEFAULT '{}',
  
  -- Versioning
  "parentAgentId" UUID REFERENCES agents(id) ON DELETE SET NULL,
  "snapshotData" JSONB,
  
  -- Metadata
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastExecutedAt" TIMESTAMP,
  
  CONSTRAINT unique_agent_version UNIQUE (name, version)
);

-- Agent Execution Traces (detailed reasoning logs)
CREATE TABLE IF NOT EXISTS agent_execution_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "agentId" UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  "roomId" UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  "executionLogId" UUID REFERENCES execution_logs(id) ON DELETE SET NULL,
  
  -- Loop step tracking
  "loopIteration" INTEGER NOT NULL,
  "loopState" "AgentLoopState" NOT NULL,
  
  -- Reasoning trace
  "modelPrompt" TEXT,
  "modelResponse" TEXT,
  "modelName" TEXT,
  "temperature" FLOAT,
  "maxTokens" INTEGER,
  
  -- Tool selection
  "selectedTool" TEXT,
  "toolRationale" TEXT,
  "toolInput" JSONB,
  "toolOutput" JSONB,
  "toolError" JSONB,
  
  -- State changes
  "stateBefore" JSONB,
  "stateAfter" JSONB,
  "stateDiff" JSONB,
  
  -- Metrics
  "durationMs" INTEGER,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "keyHash" TEXT NOT NULL UNIQUE,
  "keyPrefix" TEXT NOT NULL,
  
  -- Scoping
  "userId" TEXT,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  
  -- Rate limiting
  "rateLimit" INTEGER NOT NULL DEFAULT 100,
  "rateLimitWindow" INTEGER NOT NULL DEFAULT 60,
  
  -- Status
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP,
  "lastUsedAt" TIMESTAMP,
  
  -- Audit
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdBy" TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- API Key Usage Log (rate limiting + audit)
CREATE TABLE IF NOT EXISTS api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "apiKeyId" UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  "statusCode" INTEGER,
  "responseTime" INTEGER,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Policy Violations Log
CREATE TABLE IF NOT EXISTS policy_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "agentId" UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  "roomId" UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  "violationType" TEXT NOT NULL,
  "attemptedTool" TEXT,
  "policyRule" TEXT NOT NULL,
  "denialReason" TEXT NOT NULL,
  severity TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Extend ExecutionEventType for new agent events
ALTER TYPE "ExecutionEventType" ADD VALUE IF NOT EXISTS 'AGENT_LOOP_STARTED';
ALTER TYPE "ExecutionEventType" ADD VALUE IF NOT EXISTS 'AGENT_LOOP_ITERATION';
ALTER TYPE "ExecutionEventType" ADD VALUE IF NOT EXISTS 'AGENT_LOOP_COMPLETED';
ALTER TYPE "ExecutionEventType" ADD VALUE IF NOT EXISTS 'AGENT_TOOL_SELECTED';
ALTER TYPE "ExecutionEventType" ADD VALUE IF NOT EXISTS 'AGENT_TOOL_DENIED';
ALTER TYPE "ExecutionEventType" ADD VALUE IF NOT EXISTS 'AGENT_MEMORY_UPDATED';
ALTER TYPE "ExecutionEventType" ADD VALUE IF NOT EXISTS 'AGENT_REASONING_TRACE';

-- Indexes for Stage 3
CREATE INDEX IF NOT EXISTS idx_agents_room ON agents("roomId");
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_version ON agents(name, version);
CREATE INDEX IF NOT EXISTS idx_agent_traces_agent ON agent_execution_traces("agentId");
CREATE INDEX IF NOT EXISTS idx_agent_traces_room ON agent_execution_traces("roomId");
CREATE INDEX IF NOT EXISTS idx_agent_traces_timestamp ON agent_execution_traces(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys("keyHash");
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys("isActive");
CREATE INDEX IF NOT EXISTS idx_api_key_usage_key ON api_key_usage("apiKeyId", timestamp);
CREATE INDEX IF NOT EXISTS idx_policy_violations_agent ON policy_violations("agentId");
CREATE INDEX IF NOT EXISTS idx_policy_violations_timestamp ON policy_violations(timestamp);
