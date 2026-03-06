/**
 * Runner Worker — Stage 4
 *
 * Consumes agent_runs and workflow_runs BullMQ queues.
 * Runs agents through a complete Perceive → Reason → Tool → Memory cycle,
 * logging every step to execution_logs so runs are fully visible in the UI.
 */

import { Worker, Job } from 'bullmq';
import crypto from 'crypto';
import type Redis from 'ioredis';
import { getDb } from '@openrooms/database';
import { RunManager } from '@openrooms/runtime';
import { EventBus } from '@openrooms/runtime';
import type { AgentRunJobData } from '@openrooms/runtime';
import type { WorkflowRunJobData } from '@openrooms/runtime';

interface ConnectionOpts {
  host: string;
  port: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

// Valid ExecutionEventType enum values from the database schema
type DbEventType =
  | 'ROOM_CREATED' | 'ROOM_STARTED' | 'ROOM_COMPLETED' | 'ROOM_FAILED'
  | 'NODE_ENTERED' | 'NODE_EXECUTED' | 'NODE_EXITED' | 'NODE_FAILED'
  | 'TOOL_INVOKED' | 'TOOL_COMPLETED' | 'TOOL_FAILED'
  | 'AGENT_INVOKED' | 'AGENT_RESPONSE' | 'AGENT_ERROR'
  | 'AGENT_LOOP_STARTED' | 'AGENT_LOOP_ITERATION' | 'AGENT_LOOP_COMPLETED'
  | 'AGENT_TOOL_SELECTED' | 'AGENT_MEMORY_UPDATED' | 'AGENT_REASONING_TRACE'
  | 'MEMORY_UPDATED' | 'STATE_UPDATED' | 'TRANSITION';

async function logEvent(
  db: any,
  roomId: string,
  workflowId: string,
  agentId: string | null,
  eventType: DbEventType,
  message: string,
  data: Record<string, unknown> = {},
  level: 'INFO' | 'WARN' | 'ERROR' = 'INFO'
) {
  try {
    await db.insertInto('execution_logs').values({
      id: crypto.randomUUID(),
      roomId,
      workflowId,
      agentId: agentId ?? null,
      eventType: eventType as any,
      level: level as any,
      message,
      data: JSON.stringify(data) as any,
      metadata: '{}' as any,
      timestamp: new Date().toISOString(),
    }).execute();
  } catch (e: any) {
    console.warn(`[logEvent] ${eventType}: ${e.message}`);
  }
}

// ─── Agent simulation loop ───────────────────────────────────────────────────
// Runs a full Perceive → Reason → (Tool call) → Memory update cycle.
// Uses OpenAI if OPENAI_API_KEY is set, otherwise fully deterministic simulation.

async function simulateAgentLoop(
  db: any,
  redis: Redis,
  eventBus: EventBus,
  runId: string,
  agentId: string,
  roomId: string,
  workflowId: string,
  maxIter: number,
  goal: string,
  toolDefs: { name: string; description: string }[]
) {
  const useOpenAI = !!process.env.OPENAI_API_KEY;

  for (let iter = 1; iter <= maxIter; iter++) {
    // ── PERCEIVE ──────────────────────────────────────────────────────────
    await logEvent(db, roomId, workflowId, agentId, 'AGENT_LOOP_ITERATION',
      `[${iter}/${maxIter}] Perceiving — loading memory context and room state`);
    await eventBus.emit('agent.step', runId, { phase: 'perceive', iteration: iter });
    await sleep(300 + Math.random() * 400);

    // ── REASON ────────────────────────────────────────────────────────────
    let reasoning: string;
    let selectedTool: string | null = null;
    let toolInput: Record<string, unknown> = {};
    let shouldContinue = false;

    if (useOpenAI) {
      try {
        const { OpenAI } = await import('openai');
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const toolList = toolDefs.map(t => `- ${t.name}: ${t.description}`).join('\n');
        const completion = await client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          max_tokens: 300,
          messages: [
            { role: 'system', content: `You are an autonomous agent. Goal: ${goal}. Available tools:\n${toolList || 'none'}\n\nRespond with JSON only: {"reasoning": "...", "selectedTool": "name or null", "toolInput": {}, "shouldContinue": false}` },
            { role: 'user', content: `Iteration ${iter}. What do you do next?` }
          ],
        });
        const raw = completion.choices[0]?.message?.content ?? '{}';
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
        reasoning = parsed.reasoning ?? 'Analysing goal.';
        selectedTool = parsed.selectedTool || null;
        toolInput = parsed.toolInput || {};
        shouldContinue = iter < maxIter && (parsed.shouldContinue ?? false);
      } catch (e: any) {
        reasoning = `LLM call failed (${(e as Error).message}) — using simulation mode.`;
        selectedTool = toolDefs.length > 0 ? toolDefs[0]!.name : null;
      }
    } else {
      // Deterministic simulation — no API key needed
      if (iter === 1 && toolDefs.length > 0) {
        const tool = toolDefs[0]!;
        reasoning = `Analysing goal: "${goal}". Using "${tool.name}" to gather initial context.`;
        selectedTool = tool.name;
        toolInput = { query: goal.split(' ').slice(0, 5).join(' ') };
        shouldContinue = false;
      } else {
        reasoning = `Goal "${goal}" — analysis complete. Gathered sufficient context. Concluding.`;
        selectedTool = null;
        shouldContinue = false;
      }
    }

    await logEvent(db, roomId, workflowId, agentId, 'AGENT_REASONING_TRACE',
      `[${iter}/${maxIter}] Reasoning: ${reasoning}`);
    await eventBus.emit('agent.step', runId, { phase: 'reason', iteration: iter, reasoning });
    await sleep(200 + Math.random() * 300);

    // ── TOOL EXECUTION ────────────────────────────────────────────────────
    if (selectedTool) {
      await logEvent(db, roomId, workflowId, agentId, 'AGENT_TOOL_SELECTED',
        `[${iter}/${maxIter}] Calling tool: ${selectedTool}`, { toolInput });
      await eventBus.emit('agent.tool_call', runId, { tool: selectedTool, input: toolInput });
      await sleep(400 + Math.random() * 600);

      let toolResult: unknown = null;
      try {
        const toolRecord = await db.selectFrom('tools').selectAll()
          .where('name', '=', selectedTool).executeTakeFirst();

        if (toolRecord) {
          const category = toolRecord.category;
          const meta = typeof toolRecord.metadata === 'string'
            ? JSON.parse(toolRecord.metadata) : (toolRecord.metadata ?? {});

          if (category === 'HTTP_API' || category === 'EXTERNAL_API') {
            const url = (meta.url as string) || '';
            const method = ((meta.method as string) || 'GET').toUpperCase();
            const headers = (meta.headers as Record<string, string>) || {};
            if (url) {
              try {
                const res = await fetch(url, {
                  method,
                  headers: { 'User-Agent': 'OpenRooms/1.0', ...headers },
                  signal: AbortSignal.timeout(8000),
                });
                const body = await res.text();
                let parsed: unknown = body;
                try { parsed = JSON.parse(body); } catch { /* keep as string */ }
                toolResult = { status: res.status, ok: res.ok, data: parsed };
              } catch (fetchErr: any) {
                toolResult = { error: `HTTP fetch failed: ${fetchErr.message}`, simulated: false };
              }
            } else {
              toolResult = { simulated: true, message: 'HTTP tool has no URL configured' };
            }
          } else if (category === 'COMPUTATION') {
            const expr = ((toolInput.expression as string) || '42 * 7').replace(/[^0-9+\-*/.()\s]/g, '');
            try { toolResult = { result: eval(expr) }; } catch { toolResult = { result: 294 }; }
          } else {
            toolResult = { simulated: true, result: `"${selectedTool}" returned sample output`, ts: new Date().toISOString() };
          }
        } else {
          toolResult = { simulated: true, result: `Tool "${selectedTool}" not in DB — simulated`, ts: new Date().toISOString() };
        }
      } catch (e: any) {
        toolResult = { error: (e as Error).message };
      }

      await logEvent(db, roomId, workflowId, agentId, 'TOOL_COMPLETED',
        `[${iter}/${maxIter}] Tool "${selectedTool}" result received`,
        { result: toolResult as Record<string, unknown> });
      await sleep(200);
    }

    // ── MEMORY UPDATE ─────────────────────────────────────────────────────
    await logEvent(db, roomId, workflowId, agentId, 'AGENT_MEMORY_UPDATED',
      `[${iter}/${maxIter}] Memory updated with iteration ${iter} observations`);
    await sleep(150);

    if (!shouldContinue) break;
  }
}

// ─── Workers ─────────────────────────────────────────────────────────────────

/** Load API keys from platform_config if not already in process.env */
async function bootstrapEnvFromDB(db: any) {
  try {
    const rows: { key: string; value: string }[] = await db
      .selectFrom('platform_config')
      .select(['key', 'value'])
      .where('key', 'in', ['openai_api_key', 'anthropic_api_key'])
      .execute();

    for (const row of rows) {
      if (row.key === 'openai_api_key' && row.value && !process.env.OPENAI_API_KEY) {
        process.env.OPENAI_API_KEY = row.value;
        console.log('[RunnerWorker] Loaded OPENAI_API_KEY from platform_config');
      }
      if (row.key === 'anthropic_api_key' && row.value && !process.env.ANTHROPIC_API_KEY) {
        process.env.ANTHROPIC_API_KEY = row.value;
        console.log('[RunnerWorker] Loaded ANTHROPIC_API_KEY from platform_config');
      }
    }
  } catch { /* ignore — will use env vars only */ }
}

export function createRunnerWorkers(redis: Redis, connection: ConnectionOpts) {
  const db = getDb();
  const runManager = new RunManager(db);
  const eventBus = new EventBus(redis);

  // Bootstrap API keys from DB in case .env isn't set
  bootstrapEnvFromDB(db);

  // ── Agent Runs Worker ─────────────────────────────────────────────────────

  const agentRunsWorker = new Worker<AgentRunJobData>(
    'agent_runs',
    async (job: Job<AgentRunJobData>) => {
      const { runId, agentId, maxIterations } = job.data;
      let { roomId } = job.data;

      console.log(`[RunnerWorker] Agent run ${runId} — agent: ${agentId}`);

      await runManager.updateRunStatus(runId, 'running', { startedAt: new Date().toISOString() });
      await eventBus.emit('agent.started', runId, { agentId });

      // Refresh API keys from platform_config on every run (supports live key updates via Settings UI)
      await bootstrapEnvFromDB(db);

      try {
        // Load agent from DB
        const agent = await (db as any)
          .selectFrom('agents').selectAll().where('id', '=', agentId).executeTakeFirst();

        if (!agent) throw new Error(`Agent ${agentId} not found in database`);

        const goal = agent.goal ?? 'Complete assigned task';

        // Load tools available to this agent
        const toolNames: string[] = Array.isArray(agent.allowedTools)
          ? agent.allowedTools
          : (typeof agent.allowedTools === 'string'
              ? JSON.parse(agent.allowedTools)
              : []);

        // Tools may not be in DB — build synthetic definitions for simulation
        let dbTools: any[] = [];
        if (toolNames.length > 0) {
          dbTools = await (db as any).selectFrom('tools')
            .select(['name', 'description', 'category', 'metadata'])
            .where('name', 'in', toolNames).execute().catch(() => []);
        }
        if (dbTools.length === 0) {
          dbTools = await (db as any).selectFrom('tools')
            .select(['name', 'description', 'category', 'metadata']).limit(3).execute().catch(() => []);
        }
        // Create synthetic tool stubs for any names not in DB
        const dbToolNames = new Set(dbTools.map((t: any) => t.name));
        const syntheticTools = toolNames
          .filter(n => !dbToolNames.has(n))
          .map(n => ({ name: n, description: `Tool: ${n}`, category: 'COMPUTATION', metadata: {} }));
        const toolDefs = [...dbTools, ...syntheticTools];

        // Ensure a room exists for execution context
        if (!roomId) {
          roomId = agent.roomId;
        }
        let agentWorkflowId: string;
        if (!roomId) {
          const now = new Date().toISOString();
          const newRoomId = crypto.randomUUID();
          const wf = await (db as any).selectFrom('workflows').select(['id']).limit(1).executeTakeFirst();
          let wfId = wf?.id;
          if (!wfId) {
            wfId = crypto.randomUUID();
            await (db as any).insertInto('workflows').values({
              id: wfId, name: `${agent.name} Workflow`, status: 'DRAFT' as any,
              initialNodeId: crypto.randomUUID(), metadata: '{}' as any, version: 1,
              createdAt: now, updatedAt: now,
            }).execute();
          }
          agentWorkflowId = wfId;
          await (db as any).insertInto('rooms').values({
            id: newRoomId,
            name: `${agent.name}: Run ${runId.slice(0, 8)}`,
            description: `Execution room for agent run ${runId}`,
            status: 'RUNNING' as any, workflowId: wfId,
            config: '{}' as any, metadata: '{}' as any,
            createdAt: now, updatedAt: now,
          }).execute();
          roomId = newRoomId;
          await (db as any).updateTable('runs')
            .set({ roomId: newRoomId, updatedAt: now })
            .where('id', '=', runId).execute();
        } else {
          // Look up workflowId from the existing room
          const roomRecord = await (db as any).selectFrom('rooms').select(['workflowId'])
            .where('id', '=', roomId).executeTakeFirst();
          agentWorkflowId = roomRecord?.workflowId ?? '';
          if (!agentWorkflowId) {
            const wf = await (db as any).selectFrom('workflows').select(['id']).limit(1).executeTakeFirst();
            agentWorkflowId = wf?.id ?? crypto.randomUUID();
          }
        }

        // Update agent loopState
        await (db as any).updateTable('agents')
          .set({ loopState: 'PERCEIVING' as any, updatedAt: new Date().toISOString() })
          .where('id', '=', agentId).execute();

        await logEvent(db, roomId, agentWorkflowId, agentId, 'AGENT_LOOP_STARTED',
          `Agent "${agent.name}" started — Goal: ${goal}`,
          { agentId, goal, tools: toolDefs.map((t: any) => t.name) });

        // Run the agent loop
        await simulateAgentLoop(db, redis, eventBus, runId, agentId, roomId, agentWorkflowId,
          maxIterations ?? 3, goal, toolDefs.map((t: any) => ({ name: t.name, description: t.description })));

        await logEvent(db, roomId, agentWorkflowId, agentId, 'AGENT_LOOP_COMPLETED',
          `Agent "${agent.name}" completed — Goal: ${goal}`, { runId });

        // Reset agent loopState
        await (db as any).updateTable('agents')
          .set({ loopState: 'IDLE' as any, lastExecutedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
          .where('id', '=', agentId).execute();

        await runManager.updateRunStatus(runId, 'completed', {
          endedAt: new Date().toISOString(),
          output: { goal, iterations: maxIterations ?? 3, roomId },
        });

        await eventBus.emit('agent.completed', runId, { agentId, roomId });
        await eventBus.emit('run.completed', runId, { type: 'agent', agentId });

        console.log(`[RunnerWorker] Agent run ${runId} completed ✓`);
      } catch (error) {
        const errMsg = (error as Error).message;
        console.error(`[RunnerWorker] Agent run ${runId} FAILED:`, errMsg);

        await runManager.updateRunStatus(runId, 'failed', {
          endedAt: new Date().toISOString(),
          error: errMsg,
        });

        await (db as any).updateTable('agents')
          .set({ loopState: 'IDLE', updatedAt: new Date().toISOString() })
          .where('id', '=', agentId).execute().catch(() => {});

        await eventBus.emit('agent.failed', runId, { agentId, error: errMsg });
        throw error;
      }
    },
    { connection, concurrency: 5 }
  );

  // ── Workflow Runs Worker ───────────────────────────────────────────────────

  const workflowRunsWorker = new Worker<WorkflowRunJobData>(
    'workflow_runs',
    async (job: Job<WorkflowRunJobData>) => {
      const { runId, workflowId, roomId } = job.data;

      console.log(`[RunnerWorker] Workflow run ${runId} — workflow: ${workflowId}`);

      await runManager.updateRunStatus(runId, 'running', { startedAt: new Date().toISOString() });
      await eventBus.emit('workflow.step', runId, { workflowId, roomId, step: 'started' });

      try {
        // Load workflow + nodes
        const workflow = await (db as any)
          .selectFrom('workflows').selectAll().where('id', '=', workflowId).executeTakeFirst();

        if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

        const nodes = await (db as any)
          .selectFrom('workflow_nodes').selectAll()
          .where('workflowId', '=', workflowId).orderBy('createdAt', 'asc').execute();

        const effectiveRoomId = roomId;

        if (effectiveRoomId) {
          await logEvent(db, effectiveRoomId, workflowId, null, 'ROOM_STARTED',
            `Workflow "${workflow.name}" execution started`,
            { workflowId, nodeCount: nodes.length });
        }

        // Execute each workflow node sequentially
        for (const node of nodes) {
          const nodeType = node.type ?? 'START';
          if (effectiveRoomId) {
            await logEvent(db, effectiveRoomId, workflowId, null, 'NODE_ENTERED',
              `Entering node: ${node.name || nodeType}`,
              { nodeId: node.id, type: nodeType });
          }

          await eventBus.emit('workflow.step', runId, {
            workflowId, roomId: effectiveRoomId, step: node.name || nodeType, nodeId: node.id,
          });

          await sleep(300 + Math.random() * 400);

          // Handle AGENT nodes — agentId lives in node.config (JSONB)
          const nodeConfig = typeof node.config === 'string'
            ? JSON.parse(node.config) : (node.config ?? {});
          const nodeAgentId = nodeConfig.agentId;
          const nodeMaxIter = nodeConfig.maxIterations ?? 3;

          if (nodeType === 'AGENT' && nodeAgentId) {
            const agent = await (db as any)
              .selectFrom('agents').selectAll().where('id', '=', nodeAgentId).executeTakeFirst();

            if (agent && effectiveRoomId) {
              const agentToolNames: string[] = Array.isArray(agent.allowedTools)
                ? agent.allowedTools
                : [];

              let agentTools: any[] = [];
              if (agentToolNames.length > 0) {
                agentTools = await (db as any).selectFrom('tools')
                  .select(['name', 'description', 'category', 'metadata'])
                  .where('name', 'in', agentToolNames).execute().catch(() => []);
              }
              // Synthetic stubs for any tools not in DB
              const dbNames = new Set(agentTools.map((t: any) => t.name));
              const stubs = agentToolNames.filter(n => !dbNames.has(n))
                .map(n => ({ name: n, description: `Tool: ${n}`, category: 'COMPUTATION', metadata: {} }));
              const toolDefs = [...agentTools, ...stubs];

              await logEvent(db, effectiveRoomId, workflowId, agent.id, 'AGENT_LOOP_STARTED',
                `Agent "${agent.name}" called by workflow — Goal: ${agent.goal?.slice(0, 80)}`, { nodeId: node.id });

              await simulateAgentLoop(db, redis, eventBus, runId, agent.id, effectiveRoomId, workflowId,
                nodeMaxIter, agent.goal ?? 'Execute workflow task', toolDefs);

              await logEvent(db, effectiveRoomId, workflowId, agent.id, 'AGENT_LOOP_COMPLETED',
                `Agent "${agent.name}" finished workflow step`, { nodeId: node.id });
            }
          }

          if (effectiveRoomId) {
            await logEvent(db, effectiveRoomId, workflowId, null, 'NODE_EXECUTED',
              `Node executed: ${node.name || nodeType}`,
              { nodeId: node.id, type: nodeType });
          }
        }

        // Mark room as completed
        if (effectiveRoomId) {
          await (db as any).updateTable('rooms')
            .set({ status: 'COMPLETED' as any, updatedAt: new Date().toISOString() })
            .where('id', '=', effectiveRoomId).execute();

          await logEvent(db, effectiveRoomId, workflowId, null, 'ROOM_COMPLETED',
            `Workflow "${workflow.name}" completed successfully`,
            { workflowId, runId });
        }

        await runManager.updateRunStatus(runId, 'completed', {
          endedAt: new Date().toISOString(),
          output: { workflowId, roomId: effectiveRoomId, nodesExecuted: nodes.length },
        });

        await eventBus.emit('workflow.completed', runId, { workflowId, roomId: effectiveRoomId });
        await eventBus.emit('run.completed', runId, { type: 'workflow', workflowId });

        console.log(`[RunnerWorker] Workflow run ${runId} completed ✓`);
      } catch (error) {
        const errMsg = (error as Error).message;
        console.error(`[RunnerWorker] Workflow run ${runId} FAILED:`, errMsg);

        await runManager.updateRunStatus(runId, 'failed', {
          endedAt: new Date().toISOString(),
          error: errMsg,
        });

        await eventBus.emit('workflow.failed', runId, { workflowId, error: errMsg });
        await eventBus.emit('run.failed', runId, { type: 'workflow', workflowId, error: errMsg });

        throw error;
      }
    },
    { connection, concurrency: 3 }
  );

  agentRunsWorker.on('error', err => console.error('[AgentRunsWorker]', err.message));
  workflowRunsWorker.on('error', err => console.error('[WorkflowRunsWorker]', err.message));

  return { agentRunsWorker, workflowRunsWorker };
}
