-- OpenRooms Stage 4 Schema: Execution Runtime
-- Apply with: psql -d openrooms -f packages/database/schema-stage4.sql

-- Runs table: tracks every agent/workflow execution instance
CREATE TABLE IF NOT EXISTS runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('agent', 'workflow')),
  "targetId" UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB,
  error TEXT,
  "roomId" UUID REFERENCES rooms(id) ON DELETE SET NULL,
  "startedAt" TIMESTAMP,
  "endedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_runs_target  ON runs("targetId");
CREATE INDEX IF NOT EXISTS idx_runs_status  ON runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_type    ON runs(type);
CREATE INDEX IF NOT EXISTS idx_runs_room    ON runs("roomId");
CREATE INDEX IF NOT EXISTS idx_runs_created ON runs("createdAt");
