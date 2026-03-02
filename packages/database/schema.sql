-- OpenRooms Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'IDLE',
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
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'IDLE',
  model TEXT NOT NULL,
  "systemPrompt" TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Execution Logs Table
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "roomId" UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  "workflowId" UUID NOT NULL,
  "nodeId" UUID,
  "eventType" TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'INFO',
  message TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_execution_logs_created ON execution_logs("createdAt");
CREATE INDEX IF NOT EXISTS idx_memories_room ON memories("roomId");
CREATE INDEX IF NOT EXISTS idx_memory_entries_memory ON memory_entries("memoryId");
