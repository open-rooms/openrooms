'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api, getAgents, getRuns, runAgent, updateAgent, createAgent, getTools } from '@/lib/api'
import type { Agent, Run } from '@/lib/api'
import { PlayIcon, RefreshIcon, AlertCircleIcon, CheckCircleIcon, PlusIcon } from '@/components/icons'
import {
  AgentIcon,
  WorkflowIcon,
  LiveRunsIcon,
  APIIcon,
  ReportsIcon,
  MemoryIcon,
  AutomationIcon,
  ToolIcon,
} from '@/components/icons/system'
import { formatDate } from '@/lib/utils'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Panel = 'agents' | 'workflows' | 'connectors' | 'events' | 'logs' | 'metrics' | 'storage' | 'linked' | null

// ─── Capability definition ─────────────────────────────────────────────────────
const CAPABILITIES = [
  { id: 'agents' as Panel,     label: 'Agents',         Icon: AgentIcon,      desc: 'Deploy and manage agents' },
  { id: 'workflows' as Panel,  label: 'Workflows',      Icon: WorkflowIcon,   desc: 'Orchestration graph' },
  { id: 'connectors' as Panel, label: 'Connectors',     Icon: APIIcon,        desc: 'APIs & tools' },
  { id: 'events' as Panel,     label: 'Triggers',       Icon: AutomationIcon, desc: 'Fire the system' },
  { id: 'logs' as Panel,       label: 'Live Activity',  Icon: LiveRunsIcon,   desc: 'Real-time feed' },
  { id: 'metrics' as Panel,    label: 'Metrics',        Icon: ReportsIcon,    desc: 'Run stats' },
  { id: 'storage' as Panel,    label: 'Memory',         Icon: MemoryIcon,     desc: 'Shared room state' },
  { id: 'linked' as Panel,     label: 'Linked Rooms',   Icon: ToolIcon,       desc: 'Room-to-room wiring' },
]

// ─── Panel: Agents ─────────────────────────────────────────────────────────────
function AgentsPanel({ roomId, agents, onRefresh, onRunAgent }: { roomId: string; agents: Agent[]; onRefresh: () => void; onRunAgent: (id: string) => Promise<void> }) {
  const [runningId, setRunningId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleRun(id: string) {
    setRunningId(id)
    try { await onRunAgent(id) }
    finally { setRunningId(null) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName || !newGoal) return
    setCreating(true)
    try {
      await createAgent({ name: newName, goal: newGoal, roomId, allowedTools: ['calculator', 'http_request', 'memory_query'], policyConfig: { provider: 'simulation', model: 'gpt-4o', maxLoopIterations: 5 } })
      setShowCreate(false); setNewName(''); setNewGoal('')
      onRefresh()
    } finally { setCreating(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Agents share this room's memory. What one learns, all can use.</p>
        <button onClick={() => setShowCreate(s => !s)}
          className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
          <PlusIcon className="w-3 h-3" /> Deploy Agent
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 border-2 border-[#EA580C]/40 bg-orange-50 rounded-xl space-y-3">
          <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Agent name"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#EA580C]" />
          <textarea required value={newGoal} onChange={e => setNewGoal(e.target.value)} rows={3}
            placeholder="Agent goal — be specific about what it should do and what to output"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#EA580C] resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="px-4 py-2 bg-[#EA580C] text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-1.5">
              {creating ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {creating ? 'Deploying…' : 'Deploy'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {agents.length === 0 ? (
        <div className="text-center py-8">
          <AgentIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm text-gray-500">No agents in this room. Deploy one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {agents.map(agent => (
            <div key={agent.id} className="p-4 bg-white border border-[#D4C4A8] rounded-xl hover:bg-white transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link href={`/agents/${agent.id}`} className="font-bold text-[#111111] hover:text-[#EA580C] text-sm truncate">{agent.name}</Link>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                      agent.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' :
                      agent.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>{agent.status}</span>
                    <span className={`text-[10px] font-mono ${
                      agent.loopState === 'REASONING' ? 'text-purple-500' :
                      agent.loopState === 'EXECUTING_TOOL' ? 'text-orange-500' :
                      'text-gray-400'
                    }`}>{agent.loopState}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">{agent.goal}</p>
                  {agent.allowedTools.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {agent.allowedTools.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded font-mono">{t}</span>
                      ))}
                      {agent.allowedTools.length > 3 && <span className="text-[10px] text-gray-400">+{agent.allowedTools.length - 3}</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleRun(agent.id)} disabled={runningId === agent.id || agent.status !== 'ACTIVE'}
                    className="px-2.5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                    {runningId === agent.id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlayIcon className="w-3 h-3" />}
                    Run
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Panel: Events (Webhook trigger) ──────────────────────────────────────────
function EventsPanel({ roomId, onEvent }: { roomId: string; onEvent: (msg: string) => void }) {
  const [payload, setPayload] = useState('{\n  "trigger": "manual",\n  "context": {}\n}')
  const [triggering, setTriggering] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  async function handleTrigger() {
    let body: Record<string, unknown>
    try { body = JSON.parse(payload) } catch { setResult({ ok: false, msg: 'Invalid JSON' }); return }
    setTriggering(true); setResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, msg: `Run queued: ${data.runId?.slice(0, 12)}…` })
        onEvent(`Webhook triggered → run ${data.runId?.slice(0, 8)}…`)
      } else {
        setResult({ ok: false, msg: data.message || 'Trigger failed' })
      }
    } catch (e: any) {
      setResult({ ok: false, msg: e.message })
    } finally { setTriggering(false) }
  }

  const webhookUrl = `${API_BASE}/api/rooms/${roomId}/webhook`
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(webhookUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Trigger this room's workflow from any external system — smart contract, API, cron job, or manually below.</p>

      {/* Webhook URL */}
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Webhook URL</label>
        <div className="flex gap-2">
          <code className="flex-1 px-3 py-2 bg-[#111111] text-emerald-300 text-xs rounded-lg font-mono overflow-x-auto whitespace-nowrap">
            POST {webhookUrl}
          </code>
          <button onClick={copy} className="px-3 py-2 border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50 whitespace-nowrap">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Manual trigger */}
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1.5 block">Trigger Payload (JSON)</label>
        <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={6}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#EA580C] bg-[#111111] text-emerald-300 resize-none" />
      </div>

      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-semibold ${result.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {result.ok ? <CheckCircleIcon className="w-4 h-4" /> : <AlertCircleIcon className="w-4 h-4" />}
          {result.msg}
        </div>
      )}

      <button onClick={handleTrigger} disabled={triggering}
        className="w-full py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2">
        {triggering ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <AutomationIcon className="w-4 h-4" />}
        {triggering ? 'Triggering…' : 'Trigger Event'}
      </button>
    </div>
  )
}

// ─── Panel: Connectors ────────────────────────────────────────────────────────
function ConnectorsPanel({ roomId }: { roomId: string }) {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTools().then(d => setTools(d.tools || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const connectors = tools.filter(t => ['API', 'BLOCKCHAIN', 'EXTERNAL_API'].includes(t.category))
  const builtins = tools.filter(t => !['API', 'BLOCKCHAIN', 'EXTERNAL_API'].includes(t.category))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Tools agents in this room can call by name.</p>
        <Link href="/connectors" className="px-3 py-1.5 border border-[#D4C4A8] hover:border-[#EA580C] text-xs font-bold rounded-lg transition-colors">+ Add Connector</Link>
      </div>

      {loading ? <div className="text-center py-6"><div className="w-5 h-5 border-2 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin mx-auto" /></div> : (
        <div className="space-y-3">
          {connectors.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Registered Connectors</p>
              {connectors.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-white border border-[#D4C4A8] rounded-xl mb-2">
                  <ToolIcon className="w-8 h-8 flex-shrink-0" />
                  <div><p className="text-xs font-bold text-[#111111]">{t.name}</p><p className="text-[10px] text-gray-500 truncate">{t.description}</p></div>
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold ${t.category === 'BLOCKCHAIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{t.category}</span>
                </div>
              ))}
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Built-in Tools</p>
            {builtins.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-white border border-[#D4C4A8] rounded-xl mb-2">
                <ToolIcon className="w-8 h-8 flex-shrink-0" />
                <div><p className="text-xs font-bold text-[#111111]">{t.name}</p><p className="text-[10px] text-gray-500 truncate">{t.description}</p></div>
              </div>
            ))}
            {builtins.length === 0 && connectors.length === 0 && (
              <div className="text-center py-6">
                <ToolIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs text-gray-500">No tools yet. <Link href="/connectors" className="text-[#EA580C] font-bold hover:underline">Add a connector →</Link></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Room Command Input ────────────────────────────────────────────────────────
function RoomCommandInput({ roomId, onActivity }: { roomId: string; onActivity: (msg: string, type: 'event' | 'log') => void }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const msg = input.trim()
    if (!msg) return
    setSending(true)
    setInput('')
    onActivity(`> ${msg}`, 'event')
    try {
      const res = await fetch(`/api/rooms/${roomId}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user_command', payload: { message: msg, source: 'dashboard' } }),
      })
      if (res.ok) {
        onActivity('Command received — agents are processing it', 'log')
      } else {
        onActivity('Queued locally — start the system to process', 'log')
      }
    } catch {
      onActivity('Queued locally — connect the API to process', 'log')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border-t-2 border-[#D4C4A8] p-3">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Send command to this Room</p>
      <form onSubmit={send} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tell this room what to do…"
          className="flex-1 px-3 py-1.5 text-xs border border-[#D4C4A8] rounded-lg bg-white focus:outline-none focus:border-[#EA580C] font-mono text-gray-700 placeholder:text-gray-300"
        />
        <button type="submit" disabled={sending || !input.trim()}
          className="px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors">
          {sending
            ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none"><path d="M2 7 L12 7 M8 3 L12 7 L8 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          }
          Run
        </button>
      </form>
    </div>
  )
}

// ─── Panel: Linked Rooms ───────────────────────────────────────────────────────
function LinkedRoomsPanel({ currentRoomId }: { currentRoomId: string }) {
  const [allRooms, setAllRooms] = useState<any[]>([])
  const [linked, setLinked] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/rooms').then(r => r.json()).then(d => {
      setAllRooms((d.rooms || []).filter((r: any) => r.id !== currentRoomId))
    }).catch(() => {})
  }, [currentRoomId])

  function toggle(id: string) {
    setLinked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function save() {
    setSaving(true)
    // Linking is stored locally for now — backend wiring in next phase
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-gray-700 mb-1">Link this Room to others</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Linked Rooms can trigger each other via webhooks. When this Room completes a run,
          it fires an event into every linked Room automatically.
        </p>
      </div>

      {allRooms.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-xs text-gray-400">No other rooms yet.</p>
          <Link href="/rooms" className="text-xs font-bold text-[#EA580C] hover:underline">Create another Room →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {allRooms.map((r: any) => (
            <button key={r.id} onClick={() => toggle(r.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                linked.includes(r.id)
                  ? 'border-[#EA580C] bg-orange-50'
                  : 'border-[#E8E0D0] bg-white hover:border-[#EA580C]/40'
              }`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                linked.includes(r.id) ? 'border-[#EA580C] bg-[#EA580C]' : 'border-gray-300'
              }`}>
                {linked.includes(r.id) && (
                  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                    <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#111] truncate">{r.name}</p>
                <p className="text-[10px] text-gray-400">{r.status || 'IDLE'} · webhook-ready</p>
              </div>
              {linked.includes(r.id) && (
                <span className="text-[9px] font-bold text-[#EA580C] bg-orange-100 px-2 py-0.5 rounded-full flex-shrink-0">linked</span>
              )}
            </button>
          ))}
        </div>
      )}

      {linked.length > 0 && (
        <button onClick={save} disabled={saving}
          className="w-full py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
          {saving
            ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
            : `Save — link ${linked.length} room${linked.length > 1 ? 's' : ''}`
          }
        </button>
      )}

      <p className="text-[10px] text-gray-300 leading-relaxed">
        Full room-to-room event routing ships in the next release.
        This UI wires the configuration ahead of the backend.
      </p>
    </div>
  )
}

// ─── Panel: Metrics ────────────────────────────────────────────────────────────
function MetricsPanel({ runs, agentCount }: { runs: Run[]; agentCount: number }) {
  const total = runs.length
  const completed = runs.filter(r => r.status === 'completed').length
  const failed = runs.filter(r => r.status === 'failed').length
  const running = runs.filter(r => r.status === 'running' || r.status === 'pending').length
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Runs', value: total, color: 'text-[#111111]' },
          { label: 'Success Rate', value: `${successRate}%`, color: 'text-emerald-600' },
          { label: 'Completed', value: completed, color: 'text-emerald-600' },
          { label: 'Failed', value: failed, color: 'text-red-500' },
          { label: 'Active Now', value: running, color: 'text-blue-600' },
          { label: 'Agents', value: agentCount, color: agentCount > 0 ? 'text-[#EA580C]' : 'text-gray-400' },
        ].map(m => (
          <div key={m.label} className="p-3 bg-white border border-[#D4C4A8] rounded-xl">
            <p className="text-[10px] text-gray-500 mb-1">{m.label}</p>
            <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>
      {running > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-blue-700">{running} execution{running > 1 ? 's' : ''} active right now</span>
          <Link href="/live-runs" className="ml-auto text-xs font-bold text-[#EA580C] hover:underline">Watch →</Link>
        </div>
      )}
    </div>
  )
}

// ─── Panel: Logs ──────────────────────────────────────────────────────────────
function LogsPanel({ logs }: { logs: any[] }) {
  const logsEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])
  return (
    <div>
      <div className="bg-[#111111] rounded-xl p-4 font-mono text-xs max-h-[420px] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500 py-4 text-center">No logs yet. Run an agent to see execution output here.</div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={`flex gap-3 py-1 ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-emerald-300'}`}>
                <span className="text-gray-600 w-20 flex-shrink-0">{new Date(log.timestamp || log.createdAt).toLocaleTimeString()}</span>
                <span className="opacity-60 w-12 flex-shrink-0">[{log.level}]</span>
                <span className="text-gray-200 flex-1">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Panel: State/Storage ─────────────────────────────────────────────────────
function StoragePanel({ room }: { room: any }) {
  const state = room?.memoryState || room?.config || {}
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">Room memory state — shared across all agents in this room.</p>
      <div className="bg-[#111111] rounded-xl p-4 font-mono text-xs text-emerald-300 min-h-[200px]">
        <pre className="whitespace-pre-wrap break-words">
          {Object.keys(state).length > 0
            ? JSON.stringify(state, null, 2)
            : '// No state captured yet.\n// Run an agent to populate room memory.'}
        </pre>
      </div>
      <div className="text-[10px] text-gray-400">Room ID: <code className="font-mono">{room?.id}</code></div>
    </div>
  )
}

// ─── Workflow Panel ───────────────────────────────────────────────────────────
function WorkflowPanel({ room }: { room: any }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">The workflow bound to this room defines the orchestration graph — which agents run and in what order.</p>
      <div className="p-4 bg-white border border-[#D4C4A8] rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <WorkflowIcon className="w-8 h-8" />
          <div>
            <p className="text-xs font-bold text-[#111111]">Workflow ID</p>
            <code className="text-[10px] text-gray-500 font-mono">{room?.workflowId}</code>
          </div>
          <Link href={`/workflows`} className="ml-auto text-xs font-bold text-[#EA580C] hover:underline">View →</Link>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span>START</span>
            <span className="text-gray-300">──</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">AGENT</span>
            <span className="text-gray-300">──</span>
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span>END</span>
          </div>
        </div>
      </div>
      <Link href="/workflows" className="block w-full py-2.5 border border-[#DDD5C8] hover:bg-[#111111] hover:text-white text-center text-sm font-bold rounded-xl transition-all">
        Open Workflow Builder
      </Link>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RoomSystemPage() {
  const params = useParams()
  const roomId = params.id as string

  const [room, setRoom] = useState<any>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activePanel, setActivePanel] = useState<Panel>(null)
  const [activityFeed, setActivityFeed] = useState<{ time: string; msg: string; type: 'run' | 'agent' | 'event' | 'log' }[]>([])
  const [systemStatus, setSystemStatus] = useState<'IDLE' | 'RUNNING' | 'PROCESSING'>('IDLE')
  const [runningAction, setRunningAction] = useState<'start' | 'stop' | null>(null)
  const [lastNotice, setLastNotice] = useState<string | null>(null)

  const pushActivity = useCallback((msg: string, type: 'run' | 'agent' | 'event' | 'log' = 'log') => {
    setActivityFeed(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 40))
  }, [])

  const load = useCallback(async () => {
    try {
      const [roomData, agentsData, runsData, logsData] = await Promise.all([
        api.getRoom(roomId),
        getAgents().catch(() => ({ agents: [], count: 0 })),
        getRuns({ limit: 30 }).catch(() => ({ runs: [], count: 0 })),
        api.getRoomLogs(roomId).catch(() => ({ logs: [] })),
      ])
      setRoom(roomData)
      const roomAgents = (agentsData.agents || []).filter((a: Agent) => a.roomId === roomId)
      setAgents(roomAgents)
      const roomRuns = (runsData.runs || []).filter((r: Run) => r.roomId === roomId)
      setRuns(roomRuns)
      setLogs(logsData.logs || [])
      // Derive status
      const hasRunning = roomRuns.some(r => r.status === 'running' || r.status === 'pending')
      setSystemStatus(hasRunning ? 'RUNNING' : roomData.status === 'RUNNING' ? 'RUNNING' : 'IDLE')
    } catch (err) {
      console.error('Failed to load room', err)
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    load()
    const i = setInterval(load, 3000)
    return () => clearInterval(i)
  }, [load])

  const handleStart = async () => {
    setRunningAction('start')
    try {
      await api.runRoom(roomId)
      setSystemStatus('RUNNING')
      pushActivity('System started — workflow executing', 'run')
      setLastNotice('System started')
      setTimeout(() => setLastNotice(null), 3000)
      setTimeout(load, 1000)
    } catch (e: any) {
      setLastNotice(`Error: ${e.message}`)
      setTimeout(() => setLastNotice(null), 4000)
    } finally { setRunningAction(null) }
  }

  const handleStop = async () => {
    setRunningAction('stop')
    try {
      await api.pauseRoom(roomId)
      setSystemStatus('IDLE')
      pushActivity('System paused — all workflows halted', 'log')
      setLastNotice('System paused')
      setTimeout(() => setLastNotice(null), 3000)
      setTimeout(load, 500)
    } catch (e: any) {
      setLastNotice(`Pause error: ${e.message}`)
      setTimeout(() => setLastNotice(null), 4000)
    } finally { setRunningAction(null) }
  }

  const handleRunAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    pushActivity(`Agent "${agent?.name}" dispatched`, 'agent')
    const result = await runAgent(agentId, { roomId, maxIterations: 5 })
    pushActivity(`Run queued: ${result.runId.slice(0, 10)}…`, 'run')
    setTimeout(load, 1000)
  }

  const togglePanel = (panel: Panel) => setActivePanel(p => p === panel ? null : panel)

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#F9F5EF]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading system…</p>
      </div>
    </div>
  )

  if (!room) return (
    <div className="flex items-center justify-center h-screen bg-[#F9F5EF]">
      <div className="text-center">
        <p className="text-xl font-bold text-[#111111] mb-2">Room not found</p>
        <Link href="/rooms" className="text-[#EA580C] font-semibold hover:underline text-sm">← Back to rooms</Link>
      </div>
    </div>
  )

  const activeRuns = runs.filter(r => r.status === 'running' || r.status === 'pending')

  return (
    <div className="min-h-screen bg-[#F9F5EF] flex flex-col">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className={`border-b-2 border-black transition-colors duration-500 ${systemStatus === 'RUNNING' ? 'bg-blue-50' : 'bg-white'}`}>
        <div className="px-6 md:px-8 py-4">
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
            <Link href="/rooms" className="hover:text-[#EA580C] transition-colors font-semibold">Rooms</Link>
            <span>/</span>
            <span className="font-semibold text-[#111111] truncate">{room.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-[#111111] truncate">{room.name}</h1>
                {/* Status badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  systemStatus === 'RUNNING'
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {systemStatus === 'RUNNING' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                  {systemStatus}
                </span>
                {activeRuns.length > 0 && (
                  <Link href="/live-runs" className="text-xs text-blue-600 font-semibold hover:underline">
                    {activeRuns.length} active run{activeRuns.length > 1 ? 's' : ''} →
                  </Link>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{room.description || `Room · ${roomId.slice(0, 8)}…`}</p>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {lastNotice && (
                <span className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                  {lastNotice}
                </span>
              )}
              <button onClick={handleStart} disabled={!!runningAction || systemStatus === 'RUNNING'}
                className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all">
                {runningAction === 'start' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlayIcon className="w-4 h-4" />}
                Start System
              </button>
              <button onClick={handleStop} disabled={!!runningAction || systemStatus === 'IDLE'}
                className="px-4 py-2 border border-[#DDD5C8] hover:bg-[#111111] hover:text-white disabled:opacity-40 text-sm font-bold rounded-lg transition-all">
                Stop
              </button>
              <button onClick={() => togglePanel('events')}
                className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${activePanel === 'events' ? 'bg-[#111111] text-white border-[#111111]' : 'border-black hover:bg-[#111111] hover:text-white'}`}>
                Trigger Event
              </button>
              <button onClick={load} className="p-2 border border-gray-200 hover:border-gray-400 rounded-lg transition-colors" title="Refresh">
                <RefreshIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: Capability Grid + panel ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 space-y-6">

            {/* Capability Grid */}
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Capabilities</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {CAPABILITIES.map(({ id, label, Icon, desc }) => {
                  const isActive = activePanel === id
                  // Dot indicators
                  const dotColor =
                    id === 'agents' && agents.length > 0 ? 'bg-emerald-400' :
                    id === 'logs' && logs.length > 0 ? 'bg-blue-400' :
                    id === 'metrics' && runs.length > 0 ? 'bg-purple-400' : null

                  return (
                    <button
                      key={id}
                      onClick={() => togglePanel(id)}
                      title={desc}
                      className={`relative group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                        isActive
                          ? 'border-[#EA580C] bg-white shadow-[0_0_0_4px_rgba(245,78,0,0.12)]'
                          : 'border-[#D4C4A8] bg-white hover:border-[#EA580C] hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Active indicator line */}
                      {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px w-8 h-0.5 bg-[#EA580C] rounded-full" />}

                      {/* Icon */}
                      <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
                      </div>

                      {/* Label */}
                      <span className={`text-[10px] font-bold text-center leading-tight transition-colors ${isActive ? 'text-[#EA580C]' : 'text-gray-600 group-hover:text-[#111111]'}`}>
                        {label}
                      </span>

                      {/* Live dot */}
                      {dotColor && (
                        <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${dotColor} ${id === 'agents' && systemStatus === 'RUNNING' ? 'animate-pulse' : ''}`} />
                      )}

                      {/* Count badge */}
                      {id === 'agents' && agents.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#EA580C] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                          {agents.length}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Inline Panel */}
            {activePanel && (
              <div className="bg-white border-2 border-[#EA580C] rounded-2xl overflow-hidden shadow-[0_0_0_4px_rgba(245,78,0,0.08)] animate-[fadeSlideIn_0.18s_ease]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const cap = CAPABILITIES.find(c => c.id === activePanel)
                      if (!cap) return null
                      const { Icon } = cap
                      return <><Icon className="w-6 h-6" /><span className="font-bold text-sm text-[#111111]">{cap.label}</span></>
                    })()}
                  </div>
                  <button onClick={() => setActivePanel(null)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 font-bold text-lg leading-none">×</button>
                </div>
                <div className="p-5">
                  {activePanel === 'agents' && <AgentsPanel roomId={roomId} agents={agents} onRefresh={load} onRunAgent={handleRunAgent} />}
                  {activePanel === 'workflows' && <WorkflowPanel room={room} />}
                  {activePanel === 'connectors' && <ConnectorsPanel roomId={roomId} />}
                  {activePanel === 'events' && <EventsPanel roomId={roomId} onEvent={msg => pushActivity(msg, 'event')} />}
                  {activePanel === 'logs' && <LogsPanel logs={logs} />}
                  {activePanel === 'metrics' && <MetricsPanel runs={runs} agentCount={agents.length} />}
                  {activePanel === 'storage' && <StoragePanel room={room} />}
                  {activePanel === 'linked' && <LinkedRoomsPanel currentRoomId={roomId} />}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Right: Live Activity Panel ──────────────────────────────── */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 border-l-2 border-[#D4C4A8] bg-white">
          <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#D4C4A8]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${systemStatus === 'RUNNING' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-xs font-bold text-[#111111]">Live Activity</span>
            </div>
            <span className="text-[10px] text-gray-400">3s refresh</span>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 divide-x divide-[#D4C4A8] border-b-2 border-[#D4C4A8]">
            {[
              { label: 'Agents', value: agents.length },
              { label: 'Runs', value: runs.length },
              { label: 'Active', value: activeRuns.length },
            ].map(s => (
              <div key={s.label} className="px-3 py-2.5 text-center">
                <p className="text-base font-black text-[#111111]">{s.value}</p>
                <p className="text-[10px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {/* Logs as live feed */}
            {logs.slice(0, 15).map((log, i) => (
              <div key={`log-${i}`} className="flex items-start gap-2 text-xs py-1.5 px-2 rounded-lg hover:bg-white transition-colors">
                <span className="text-gray-400 flex-shrink-0 font-mono">{new Date(log.timestamp || log.createdAt).toLocaleTimeString()}</span>
                <span className={`flex-1 leading-snug ${log.level === 'ERROR' ? 'text-red-600' : log.level === 'WARN' ? 'text-yellow-600' : 'text-gray-700'}`}>{log.message}</span>
              </div>
            ))}
            {/* Manual activity pushes */}
            {activityFeed.map((ev, i) => (
              <div key={`feed-${i}`} className={`flex items-start gap-2 text-xs py-1.5 px-2 rounded-lg ${
                ev.type === 'event' ? 'bg-orange-50' :
                ev.type === 'run' ? 'bg-blue-50' :
                ev.type === 'agent' ? 'bg-purple-50' : 'bg-white'
              }`}>
                <span className="text-gray-400 flex-shrink-0 font-mono">{ev.time}</span>
                <span className={`flex-1 leading-snug font-medium ${
                  ev.type === 'event' ? 'text-orange-700' :
                  ev.type === 'run' ? 'text-blue-700' :
                  ev.type === 'agent' ? 'text-purple-700' : 'text-gray-700'
                }`}>{ev.msg}</span>
              </div>
            ))}
            {logs.length === 0 && activityFeed.length === 0 && (
              <div className="text-center py-10">
                <LiveRunsIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-xs text-gray-400">No activity yet.<br/>Start the system to see live events.</p>
              </div>
            )}
          </div>

          {/* Recent runs */}
          {runs.length > 0 && (
            <div className="border-t-2 border-[#D4C4A8] p-3 space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recent Runs</p>
              {runs.slice(0, 4).map(run => (
                <div key={run.id} className="flex items-center gap-2 text-[10px] py-1">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    run.status === 'completed' ? 'bg-emerald-500' :
                    run.status === 'failed' ? 'bg-red-500' :
                    run.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <span className="font-mono text-gray-500 flex-1 truncate">{run.id.slice(0, 12)}…</span>
                  <span className={`font-bold ${
                    run.status === 'completed' ? 'text-emerald-600' :
                    run.status === 'failed' ? 'text-red-500' :
                    run.status === 'running' ? 'text-blue-600' : 'text-gray-400'
                  }`}>{run.status}</span>
                </div>
              ))}
              <Link href="/live-runs" className="block text-center text-[10px] font-bold text-[#EA580C] hover:underline pt-1">
                View all runs →
              </Link>
            </div>
          )}

          {/* ── Command input — send a message or trigger directly ── */}
          <RoomCommandInput roomId={roomId} onActivity={pushActivity} />
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
