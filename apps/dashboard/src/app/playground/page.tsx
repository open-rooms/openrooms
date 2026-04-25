'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createWorkflow, createRoom, createAgent, runAgent } from '@/lib/api'
import { AgentIcon, WorkflowIcon, RoomsIcon } from '@/components/icons/system'

const EXAMPLE_GOALS = [
  'Check the current weather in London and summarise the conditions',
  'Fetch the latest 3 news headlines and write a one-paragraph briefing',
  'Look up upcoming US public holidays this month and list them',
  'Analyse the state of a fictional e-commerce platform and suggest improvements',
  'Research the best practices for deploying multi-agent systems and produce a concise report',
]

const PHASE_LABELS: Record<string, string> = {
  perceive:      'Perceiving — loading context',
  reason:        'Reasoning',
  memory_update: 'Updating memory',
}

interface StreamLine {
  type: 'system' | 'reason' | 'tool' | 'result' | 'done' | 'error'
  text: string
  ts: string
}

export default function PlaygroundPage() {
  const [goal, setGoal] = useState('')
  const [running, setRunning] = useState(false)
  const [lines, setLines] = useState<StreamLine[]>([])
  const [roomId, setRoomId] = useState<string | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const termRef = useRef<HTMLDivElement>(null)
  const esRef = useRef<EventSource | null>(null)

  const push = useCallback((line: StreamLine) => {
    setLines(prev => [...prev, line])
  }, [])

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight
    }
  }, [lines])

  // Clean up SSE on unmount
  useEffect(() => {
    return () => { esRef.current?.close() }
  }, [])

  async function handleRun() {
    if (!goal.trim() || running) return
    setRunning(true)
    setDone(false)
    setLines([])
    setRoomId(null)
    setRunId(null)

    const ts = () => new Date().toLocaleTimeString()
    const uid = Date.now().toString(36).slice(-5)

    push({ type: 'system', text: '→ Bootstrapping execution environment…', ts: ts() })

    try {
      // Create ephemeral workflow + room + agent
      const wf = await createWorkflow({
        name: `Playground ${uid}`,
        description: 'Ephemeral playground run',
        nodes: [
          { nodeId: 'start', type: 'START', name: 'Start', config: {} },
          { nodeId: 'end',   type: 'END',   name: 'End',   config: {} },
        ],
      })
      push({ type: 'system', text: `✓ Workflow created  ${wf.id.slice(0, 8)}…`, ts: ts() })

      const room = await createRoom({
        name: `Playground Room ${uid}`,
        description: goal.slice(0, 80),
        workflowId: wf.id,
      })
      setRoomId(room.id)
      push({ type: 'system', text: `✓ Room spawned       ${room.id.slice(0, 8)}…`, ts: ts() })

      const agent = await createAgent({
        name: `Playground Agent ${uid}`,
        goal: goal.trim(),
        roomId: room.id,
        allowedTools: ['weather', 'news_headlines', 'public_holidays', 'calculator', 'http_request'],
        policyConfig: { maxLoopIterations: 4, maxCostPerExecution: 0.10 },
      })
      push({ type: 'system', text: `✓ Agent deployed     ${agent.id.slice(0, 8)}…`, ts: ts() })
      push({ type: 'system', text: `→ Subscribing to live stream…`, ts: ts() })

      // Subscribe to room SSE before triggering the run
      const es = new EventSource(`/api/rooms/${room.id}/events`)
      esRef.current = es

      es.onopen = () => {
        push({ type: 'system', text: '✓ LIVE stream connected — starting agent…', ts: ts() })
      }

      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data)
          if (payload.event === 'connected') return
          const { event, data } = payload

          if (event === 'agent.step') {
            const phase = data?.phase as string
            if (phase === 'perceive') {
              push({ type: 'system', text: `[${data.iteration}/${data.maxIter}] ${PHASE_LABELS.perceive}`, ts: ts() })
            } else if (phase === 'reason') {
              const r = (data?.reasoning as string) || ''
              push({ type: 'reason', text: r, ts: ts() })
            } else if (phase === 'memory_update') {
              push({ type: 'system', text: `[${data.iteration}/${data.maxIter}] ${PHASE_LABELS.memory_update}`, ts: ts() })
            }
          } else if (event === 'agent.tool_call') {
            push({ type: 'tool', text: `⚡ Tool call → ${data?.tool}  ${JSON.stringify(data?.input || {}).slice(0, 60)}`, ts: ts() })
          } else if (event === 'agent.tool_result') {
            const r = JSON.stringify(data?.result || {})
            push({ type: 'result', text: `← ${data?.tool}: ${r.slice(0, 120)}${r.length > 120 ? '…' : ''}`, ts: ts() })
          } else if (event === 'agent.completed' || event === 'run.completed') {
            push({ type: 'done', text: '✓ Run completed successfully.', ts: ts() })
            setDone(true)
            setRunning(false)
            es.close()
          } else if (event === 'agent.failed') {
            push({ type: 'error', text: `✕ Agent failed: ${data?.error || 'Unknown'}`, ts: ts() })
            setRunning(false)
            setDone(true)
            es.close()
          }
        } catch { /* ignore */ }
      }

      es.onerror = () => {
        push({ type: 'error', text: 'SSE stream disconnected — check API status.', ts: ts() })
        es.close()
        setRunning(false)
      }

      // Fire the run
      const result = await runAgent(agent.id, { roomId: room.id, maxIterations: 4 })
      setRunId(result.runId)
      push({ type: 'system', text: `→ Run dispatched   ${result.runId.slice(0, 8)}…`, ts: ts() })

      // Fallback: if SSE doesn't fire done within 30s, stop spinner
      setTimeout(() => {
        if (running) { setRunning(false); setDone(true) }
      }, 30000)

    } catch (e: any) {
      push({ type: 'error', text: `✕ Setup failed: ${e.message}`, ts: ts() })
      setRunning(false)
    }
  }

  function reset() {
    esRef.current?.close()
    setLines([])
    setGoal('')
    setRunning(false)
    setDone(false)
    setRoomId(null)
    setRunId(null)
  }

  return (
    <div className="min-h-screen bg-[#0D0F1A] flex flex-col">

      {/* Top bar */}
      <div className="border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/home" className="text-xs text-gray-500 hover:text-white transition-colors font-mono">← openrooms</Link>
          <span className="text-gray-700 text-xs">/</span>
          <span className="text-xs text-gray-400 font-mono">playground</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-emerald-500 animate-pulse' : done ? 'bg-blue-500' : 'bg-gray-700'}`} />
          <span className="text-[10px] font-mono text-gray-600">
            {running ? 'RUNNING' : done ? 'DONE' : 'IDLE'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 py-8 gap-8">

        {/* Left: input panel */}
        <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Playground</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Type a goal. Watch an agent reason, call real APIs, and produce output — live.
              No setup, no credentials.
            </p>
          </div>

          {/* Goal input */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Agent Goal</label>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              disabled={running}
              rows={4}
              placeholder="Describe what you want the agent to do…"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-[#EA580C]/60 resize-none disabled:opacity-50"
            />
          </div>

          {/* Examples */}
          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Try an example</p>
            <div className="space-y-1.5">
              {EXAMPLE_GOALS.map((eg, i) => (
                <button key={i} onClick={() => setGoal(eg)} disabled={running}
                  className="w-full text-left text-xs text-gray-500 hover:text-gray-300 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40 border border-transparent hover:border-white/10">
                  {eg}
                </button>
              ))}
            </div>
          </div>

          {/* Run / Reset buttons */}
          <div className="flex gap-3">
            {!done ? (
              <button
                onClick={handleRun}
                disabled={running || !goal.trim()}
                className="flex-1 py-3 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white font-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {running
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Running…</>
                  : 'Run Agent →'
                }
              </button>
            ) : (
              <button onClick={reset}
                className="flex-1 py-3 border border-white/20 hover:border-white/50 text-white font-bold rounded-xl text-sm transition-colors">
                ← Run another
              </button>
            )}
          </div>

          {/* Links after run */}
          {(roomId || runId) && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Created resources</p>
              {roomId && (
                <Link href={`/rooms/${roomId}`}
                  className="flex items-center gap-2 text-xs text-[#EA580C] hover:underline">
                  <RoomsIcon className="w-4 h-4" />
                  View Room →
                </Link>
              )}
              {runId && (
                <Link href={`/live-runs/${runId}`}
                  className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                  <AgentIcon className="w-4 h-4" />
                  Full execution trace →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right: terminal */}
        <div className="flex-1 flex flex-col min-h-[500px]">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-t-xl">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-[11px] font-mono text-gray-600">
              openrooms:~$ agent-run {goal.slice(0, 40) || '<goal>'}
            </span>
          </div>

          <div
            ref={termRef}
            className="flex-1 bg-[#080A14] border border-white/10 border-t-0 rounded-b-xl p-4 overflow-y-auto font-mono text-[12px] space-y-1 min-h-[400px]"
          >
            {lines.length === 0 && (
              <div className="text-gray-700 select-none">
                <p>{'# OpenRooms Playground'}</p>
                <p>{'# Enter a goal on the left and click Run Agent'}</p>
                <p>{'# The agent will reason, call tools, and stream output here live'}</p>
                <p className="mt-2 animate-pulse">{'_'}</p>
              </div>
            )}

            {lines.map((line, i) => (
              <div key={i} className="flex items-start gap-3 leading-relaxed">
                <span className="text-gray-700 flex-shrink-0 select-none">{line.ts}</span>
                <span className={
                  line.type === 'reason'  ? 'text-purple-300' :
                  line.type === 'tool'    ? 'text-orange-300' :
                  line.type === 'result'  ? 'text-emerald-300' :
                  line.type === 'done'    ? 'text-blue-300 font-bold' :
                  line.type === 'error'   ? 'text-red-400' :
                  'text-gray-400'
                }>
                  {line.text}
                </span>
              </div>
            ))}

            {running && (
              <div className="flex items-center gap-2 text-emerald-500/70 pt-1">
                <span className="animate-pulse">▋</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Feature callout footer */}
      <div className="border-t border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-[11px] text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Real HTTP tool calls</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" />Live reasoning stream</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" />Redis pub/sub events</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Full trace stored</span>
          </div>
          <Link href="/rooms" className="text-xs text-[#EA580C] hover:underline font-semibold">Build a full Room →</Link>
        </div>
      </div>
    </div>
  )
}
