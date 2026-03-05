-- Migration: Add strict enum types to execution_logs
-- This ensures schema matches core ExecutionEventType contract

-- Backup existing data if needed
DO $$ 
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'execution_logs'
  ) INTO table_exists;
  
  IF table_exists THEN
    -- Check if column is already an enum
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'execution_logs' 
      AND column_name = 'eventType'
      AND udt_name = 'ExecutionEventType'
    ) THEN
      RAISE NOTICE 'execution_logs.eventType is already an enum type';
    ELSE
      -- Alter table to use enum type
      ALTER TABLE execution_logs 
        ALTER COLUMN "eventType" TYPE "ExecutionEventType" 
        USING "eventType"::"ExecutionEventType";
      
      ALTER TABLE execution_logs 
        ALTER COLUMN level TYPE "LogLevel" 
        USING level::"LogLevel";
      
      RAISE NOTICE 'Migrated execution_logs to use enum types';
    END IF;
  END IF;
END $$;
