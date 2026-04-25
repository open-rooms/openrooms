'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { api, createRoom, createAgent, createWorkflow, getAgents } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { PlayIcon, PlusIcon, AlertCircleIcon } from '@/components/icons'
import {
  RoomsIcon,
  AgentIcon,
  WorkflowIcon,
  LiveRunsIcon,
  ReportsIcon,
  SecurityIcon,
  APIIcon,
  MessageIcon,
  MemoryIcon,
  AutomationIcon,
} from '@/components/icons/system'

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'watchdog',
    Icon: AutomationIcon,
    title: 'Watchdog',
    description: 'Something breaks at 3am — this Room notices, finds out why, and wakes the right person. Before your users do.',
    agentGoal: 'Continuously monitor all registered service health endpoints, detect any degradation or failure, classify the severity and likely root cause, then immediately alert the on-call person via the configured connector with a structured incident summary and recommended first steps.',
  },
  {
    id: 'help-desk',
    Icon: MessageIcon,
    title: 'Help Desk',
    description: 'Every support message gets read, understood, and answered in seconds. Hard ones get escalated with full context attached.',
    agentGoal: 'Receive incoming support requests, classify the intent and urgency of each message, search the knowledge base for matching resolutions, then either send a complete helpful response or escalate to the right human team with a detailed context summary already written.',
  },
  {
    id: 'data-bridge',
    Icon: APIIcon,
    title: 'Data Bridge',
    description: 'Pull from any API, clean the data, merge it, and push it where it needs to go. No scripts. No glue code.',
    agentGoal: 'Fetch data from all configured source API connectors, validate and clean each record, apply the configured field mapping and transformation rules, resolve conflicts, and deliver a unified structured output to the configured destination connector.',
  },
  {
    id: 'deep-dive',
    Icon: MemoryIcon,
    title: 'Deep Dive',
    description: 'Give it a question. Agents fan out across every source, each owns a slice, and come back with one complete answer.',
    agentGoal: 'Break the research topic into sub-questions, assign each to a parallel agent thread, gather evidence from configured sources, store all findings in shared Room memory, then synthesise everything into a single structured research report with citations and key conclusions.',
  },
  {
    id: 'audit-sweep',
    Icon: SecurityIcon,
    title: 'Audit Sweep',
    description: 'Every output your system produces gets checked against your rules. Violations flagged. Nothing slips through.',
    agentGoal: 'Receive the content or event payload, evaluate it against the stored policy ruleset, score overall compliance from 0 to 100, quote any specific rule violations with exact references, and generate a structured audit report with recommended remediation for each issue found.',
  },
  {
    id: 'model-relay',
    Icon: WorkflowIcon,
    title: 'Model Relay',
    description: 'Chain different AI models in one pipeline. Each handles what it\'s best at — cheaper, faster, smarter together.',
    agentGoal: 'Receive the input payload, route it through Agent 1 to extract and structure the key data, pass the output to Agent 2 to reason, fact-check, and enrich, then deliver a final polished output via the configured output connector.',
  },
]

// ─── Create Room Modal ────────────────────────────────────────────────────────
function CreateRoomModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', description: '', workflowId: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getWorkflows().then(d => setWorkflows(d.workflows || [])).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name is required')
    if (!form.workflowId) return setError('Select a workflow')
    setCreating(true); setError(null)
    try {
      const room = await createRoom({ name: form.name.trim(), description: form.description.trim() || undefined, workflowId: form.workflowId })
      onCreated(room.id)
    } catch (err: any) {
      setError(err.message || 'Failed to create room')
    } finally { setCreating(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white border border-[#DDD5C8] rounded-2xl w-full max-w-md shadow-[8px_8px_0_0_rgba(0,0,0,1)] animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <RoomsIcon className="w-7 h-7" />
            <h2 className="text-lg font-bold">New Room</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 font-bold text-lg leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircleIcon className="w-4 h-4 flex-shrink-0" />{error}</div>}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Room Name *</label>
            <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Market Analysis" className="w-full px-3 py-2 border border-[#DDD5C8] rounded-lg text-sm focus:outline-none focus:border-[#EA580C]" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="What does this room do?" className="w-full px-3 py-2 border border-[#DDD5C8] rounded-lg text-sm focus:outline-none focus:border-[#EA580C] resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Bind to Workflow *</label>
            {workflows.length === 0
              ? <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">No workflows yet. <Link href="/workflows" onClick={onClose} className="font-bold underline">Create one →</Link></div>
              : <select value={form.workflowId} onChange={e => setForm(f => ({ ...f, workflowId: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DDD5C8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#EA580C]">
                  <option value="">— Select workflow —</option>
                  {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            }
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#DDD5C8] rounded-lg text-sm font-bold hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={creating || !workflows.length}
              className="flex-1 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
              {creating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating…</> : <>Create Room</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Template picker modal ────────────────────────────────────────────────────
function TemplateModal({ onClose, onLaunched }: { onClose: () => void; onLaunched: (id: string) => void }) {
  const [launching, setLaunching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function launch(t: typeof TEMPLATES[0]) {
    setLaunching(t.id); setError(null)
    const uid = Date.now().toString(36).slice(-5)
    try {
      const wf = await createWorkflow({ name: t.title + ' Flow ' + uid, description: t.description, nodes: [{ nodeId: 'start', type: 'START', name: 'Start', config: {} }, { nodeId: 'end', type: 'END', name: 'End', config: {} }] })
      const room = await createRoom({ name: t.title + ' ' + uid, description: t.description, workflowId: wf.id })
      await createAgent({ name: t.title + ' Agent ' + uid, goal: t.agentGoal, roomId: room.id, allowedTools: ['calculator', 'http_request', 'memory_query'], policyConfig: { provider: 'simulation', model: 'gpt-4o', maxLoopIterations: 5 } })
      onLaunched(room.id)
    } catch (e: any) { setError(e.message) }
    finally { setLaunching(null) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#FAF7F4] border border-[#DDD5C8] rounded-2xl w-full max-w-2xl shadow-[6px_6px_0_0_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E0D0]">
          <div>
            <h2 className="text-base font-extrabold text-[#111]">System Blueprints</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Pick a pre-built Room — creates workflow + agent automatically</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E8E0D0] font-bold text-lg text-gray-500">×</button>
        </div>
        <div className="p-5 overflow-y-auto">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map(t => {
              const TIcon = t.Icon
              const isLaunching = launching === t.id
              return (
                <button key={t.id} onClick={() => launch(t)} disabled={!!launching}
                  className="text-left p-4 bg-white border border-[#E8E0D0] hover:border-[#EA580C] rounded-xl transition-all duration-200 disabled:opacity-60 group hover:shadow-md relative overflow-hidden">
                  <div className="mb-3">
                    <TIcon className="w-10 h-10 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <div className="font-bold text-[#111] text-[13px] mb-1 leading-snug">{t.title}</div>
                  <div className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{t.description}</div>
                  <div className="mt-3 flex items-center justify-between">
                    {isLaunching
                      ? <div className="w-4 h-4 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
                      : <span className="text-[11px] font-bold text-[#EA580C] opacity-0 group-hover:opacity-100 transition-opacity">Deploy →</span>
                    }
                  </div>
                  {/* hover accent strip */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA580C] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<any[]>([])
  const [agentCounts, setAgentCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [apiError, setApiError] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  async function loadRooms() {
    try {
      const [roomsData, agentsData] = await Promise.all([
        api.getRooms(),
        getAgents().catch(() => ({ agents: [], count: 0 })),
      ])
      const rooms = roomsData.rooms || []
      setRooms(rooms)
      // Build agent count map by roomId
      const counts: Record<string, number> = {}
      for (const a of (agentsData.agents || [])) {
        if (a.roomId) counts[a.roomId] = (counts[a.roomId] || 0) + 1
      }
      setAgentCounts(counts)
      setApiError(false)
    } catch {
      setApiError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
    const i = setInterval(loadRooms, 4000)
    return () => clearInterval(i)
  }, [])

  async function handleRun(e: React.MouseEvent, roomId: string) {
    e.preventDefault(); e.stopPropagation()
    setRunningId(roomId)
    setRunError(null)
    try { await api.runRoom(roomId); setTimeout(loadRooms, 800) }
    catch (err: any) { setRunError(`Run failed: ${err.message}`) }
    finally { setRunningId(null) }
  }

  async function handleDelete(e: React.MouseEvent, roomId: string, name: string) {
    e.preventDefault(); e.stopPropagation()
    if (!confirm(`Delete "${name}"?`)) return
    try { await api.deleteRoom(roomId); loadRooms() }
    catch (err: any) { setRunError(err.message) }
  }

  const filteredRooms = rooms.filter(r => filter === 'all' || r.status === filter)
  const counts = {
    all: rooms.length,
    IDLE: rooms.filter(r => r.status === 'IDLE').length,
    RUNNING: rooms.filter(r => r.status === 'RUNNING').length,
    COMPLETED: rooms.filter(r => r.status === 'COMPLETED').length,
    FAILED: rooms.filter(r => r.status === 'FAILED').length,
  }

  return (
    <div className="bg-[#F9F5EF] min-h-screen">
      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={id => { setShowCreate(false); router.push(`/rooms/${id}`) }} />}
      {showTemplate && <TemplateModal onClose={() => setShowTemplate(false)} onLaunched={id => { setShowTemplate(false); router.push(`/rooms/${id}`) }} />}

      <Header
        title="Rooms"
        subtitle={`${rooms.length} execution environment${rooms.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTemplate(true)}
              className="px-4 py-2 border border-[#DDD5C8] hover:bg-[#111111] hover:text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2">
              <WorkflowIcon className="w-4 h-4" />
              Start from Template
            </button>
            <button onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Create Room
            </button>
          </div>
        }
      />

      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-5">

          {/* API error */}
          {apiError && !loading && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 font-medium">API unreachable — start the backend with <code className="bg-red-100 px-1 rounded">pnpm dev --filter @openrooms/api</code></span>
            </div>
          )}

          {/* Run error */}
          {runError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 font-medium flex-1">{runError}</span>
              <button onClick={() => setRunError(null)} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex items-center gap-1 border-b-2 border-[#D4C4A8] pb-0">
            {Object.entries(counts).map(([status, count]) => (
              <button key={status} onClick={() => setFilter(status)}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-[2px] transition-all ${filter === status ? 'border-[#EA580C] text-[#EA580C]' : 'border-transparent text-gray-500 hover:text-[#111111]'}`}>
                {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                <span className="ml-1.5 text-xs opacity-60">{count}</span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-[#D4C4A8] border-t-[#EA580C] rounded-full animate-spin mx-auto mb-3" />
              <span className="text-gray-500 text-sm">Loading rooms…</span>
            </div>
          ) : filteredRooms.length === 0 && filter !== 'all' ? (
            <div className="text-center py-16">
              <RoomsIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm text-gray-500">No {filter.toLowerCase()} rooms</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            /* ── First-run onboarding ── */
            <div className="py-8 space-y-6">

              {/* Hero row */}
              <div className="bg-[#111111] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold tracking-widest text-[#EA580C] uppercase mb-3">Your workspace is empty</p>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
                    Create your first Room.<br />
                    <span className="text-[#EA580C]">Watch it run.</span>
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
                    Rooms are isolated execution environments. Deploy agents into them, bind workflows, connect APIs —
                    then trigger the whole thing with a single webhook.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setShowTemplate(true)}
                      className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black rounded-xl text-sm transition-colors flex items-center gap-2">
                      <WorkflowIcon className="w-4 h-4" />
                      Launch from Template
                    </button>
                    <button onClick={() => setShowCreate(true)}
                      className="px-6 py-3 border border-white/20 hover:border-white/50 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
                      <PlusIcon className="w-4 h-4" />
                      Start blank
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 hidden md:block">
                  <div className="w-40 h-40 flex items-center justify-center opacity-60">
                    <RoomsIcon className="w-36 h-36" />
                  </div>
                </div>
              </div>

              {/* Step guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    step: '01',
                    icon: <RoomsIcon className="w-10 h-10" />,
                    title: 'Create a Room',
                    desc: 'Give it a name and bind a workflow. The Room becomes the brain — agents, memory, and tools all live here.',
                  },
                  {
                    step: '02',
                    icon: <AgentIcon className="w-10 h-10" />,
                    title: 'Deploy Agents',
                    desc: 'Set a goal, pick tools, configure cost and iteration limits. Agents reason, act, and write back to shared memory.',
                  },
                  {
                    step: '03',
                    icon: <AutomationIcon className="w-10 h-10" />,
                    title: 'Trigger & Observe',
                    desc: 'Fire the Room via webhook or manually. Watch real-time execution, trace every decision, and monitor cost.',
                  },
                ].map(({ step, icon, title, desc }) => (
                  <div key={step} className="bg-white border-2 border-[#D4C4A8] rounded-2xl p-6 hover:border-[#EA580C] hover:shadow-[0_4px_20px_rgba(234,88,12,0.10)] transition-all duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      {icon}
                      <span className="text-3xl font-black text-[#EA580C]/20 font-mono">{step}</span>
                    </div>
                    <p className="text-sm font-black text-[#111] mb-1.5">{title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Quick template cards */}
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Or launch in one click</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TEMPLATES.slice(0, 3).map(t => (
                    <button key={t.id} onClick={() => setShowTemplate(true)}
                      className="group p-4 bg-white border border-[#D4C4A8] rounded-xl text-left hover:border-[#EA580C] hover:shadow-md transition-all duration-200">
                      <t.Icon className="w-9 h-9 mb-3 group-hover:scale-110 transition-transform duration-200" />
                      <p className="text-xs font-black text-[#111] mb-1">{t.title}</p>
                      <p className="text-[11px] text-gray-400 leading-tight line-clamp-2">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* Room cards */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredRooms.map(room => {
                const agentCount = agentCounts[room.id] || 0
                const isRunning = room.status === 'RUNNING'
                return (
                  <Link key={room.id} href={`/rooms/${room.id}`} className="block group">
                    <div className={`relative bg-white border-2 rounded-xl p-5 transition-all duration-300 overflow-hidden
                      ${isRunning
                        ? 'border-blue-300 bg-blue-50/30 hover:border-blue-400 hover:shadow-[0_4px_24px_rgba(59,130,246,0.15)]'
                        : 'border-[#D4C4A8] hover:border-[#EA580C] hover:shadow-[0_4px_24px_rgba(234,88,12,0.12)] hover:-translate-y-0.5'
                      }`}>
                      {/* Orange glow sweep on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#EA580C]/0 via-[#EA580C]/5 to-[#EA580C]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <div className="flex items-center gap-4 relative">

                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:border-[#EA580C]/40 group-hover:shadow-[0_2px_12px_rgba(234,88,12,0.18)] ${
                          isRunning ? 'border-blue-300 bg-blue-50' :
                          room.status === 'COMPLETED' ? 'border-emerald-300 bg-emerald-50' :
                          room.status === 'FAILED' ? 'border-red-300 bg-red-50' : 'border-[#D4C4A8] bg-[#FDF8F4]'
                        }`}>
                          <RoomsIcon className="w-9 h-9" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-bold text-[#111111] truncate">{room.name}</span>
                            {/* Status badge */}
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border ${
                              isRunning ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              room.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                              room.status === 'FAILED' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {isRunning && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                              {room.status}
                            </span>
                          </div>
                          {/* Meta row */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                            {/* Agent count */}
                            <span className="flex items-center gap-1">
                              <AgentIcon className="w-3.5 h-3.5" />
                              {agentCount} agent{agentCount !== 1 ? 's' : ''}
                            </span>
                            {/* Workflow */}
                            <span className="flex items-center gap-1">
                              <WorkflowIcon className="w-3.5 h-3.5" />
                              workflow
                            </span>
                            {/* Last activity */}
                            <span className="flex items-center gap-1">
                              <LiveRunsIcon className="w-3.5 h-3.5" />
                              {formatRelativeTime(room.updatedAt)}
                            </span>
                            {/* ID */}
                            <code className="font-mono text-gray-400">{room.id.slice(0, 8)}…</code>
                          </div>
                          {room.description && (
                            <p className="text-xs text-gray-400 mt-1.5 truncate">{room.description}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.preventDefault()}>
                          {!isRunning && (
                            <button onClick={e => handleRun(e, room.id)} disabled={runningId === room.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                              {runningId === room.id
                                ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <PlayIcon className="w-3 h-3" />
                              }
                              Run
                            </button>
                          )}
                          {isRunning && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 text-xs font-bold">
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> Running
                            </span>
                          )}
                          <button onClick={e => handleDelete(e, room.id, room.name)}
                            className="px-2.5 py-1.5 border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 text-xs rounded-lg transition-colors font-bold">
                            ✕
                          </button>
                        </div>

                      </div>
                      {/* Animated bottom accent bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#EA580C] to-[#F97316] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
