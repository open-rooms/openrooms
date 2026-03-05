-- OpenRooms Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types (strict contracts)
DO $$ BEGIN
  CREATE TYPE "RoomStatus" AS ENUM (
    'IDLE',
    'RUNNING',
    'PAUSED',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "LogLevel" AS ENUM (
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR',
    'FATAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExecutionEventType" AS ENUM (
    'ROOM_CREATED',
    'ROOM_STARTED',
    'ROOM_PAUSED',
    'ROOM_RESUMED',
    'ROOM_COMPLETED',
    'ROOM_FAILED',
    'NODE_ENTERED',
    'NODE_EXECUTED',
    'NODE_EXITED',
    'NODE_FAILED',
    'TOOL_INVOKED',
    'TOOL_COMPLETED',
    'TOOL_FAILED',
    'AGENT_INVOKED',
    'AGENT_RESPONSE',
    'AGENT_ERROR',
    'TRANSITION',
    'STATE_UPDATED',
    'MEMORY_UPDATED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status "RoomStatus" NOT NULL DEFAULT 'IDLE',
  "workflowId" UUID NOT NULL,
  "currentNodeId" UUID,
  config JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP
);

-- Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  "initialNodeId" UUID NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Workflow Nodes Table
CREATE TABLE IF NOT EXISTS workflow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workflowId" UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  "nodeId" UUID NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("workflowId", "nodeId")
);

-- Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "roomId" UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Execution Logs Table (append-only, strict event types)
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "roomId" UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  "workflowId" UUID NOT NULL,
  "nodeId" UUID,
  "agentId" UUID,
  "eventType" "ExecutionEventType" NOT NULL,
  level "LogLevel" NOT NULL DEFAULT 'INFO',
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  error JSONB,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  duration INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Memories Table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "roomId" UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Memory Entries Table
CREATE TABLE IF NOT EXISTS memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "memoryId" UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  embedding FLOAT8[],
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("memoryId", key)
);

-- Tools Table
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  version TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '[]',
  "returnType" JSONB NOT NULL DEFAULT '{}',
  timeout INTEGER NOT NULL DEFAULT 30000,
  metadata JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_workflow ON rooms("workflowId");
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_workflow ON workflow_nodes("workflowId");
CREATE INDEX IF NOT EXISTS idx_agents_room ON agents("roomId");
CREATE INDEX IF NOT EXISTS idx_execution_logs_room ON execution_logs("roomId");
CREATE INDEX IF NOT EXISTS idx_execution_logs_workflow ON execution_logs("workflowId");
CREATE INDEX IF NOT EXISTS idx_execution_logs_timestamp ON execution_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_execution_logs_event_type ON execution_logs("eventType");
CREATE INDEX IF NOT EXISTS idx_memories_room ON memories("roomId");
CREATE INDEX IF NOT EXISTS idx_memory_entries_memory ON memory_entries("memoryId");
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
