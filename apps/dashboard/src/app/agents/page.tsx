'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AgentIcon, LiveRunsIcon, RoomsIcon } from '@/components/icons/system'
import { getAgents, runAgent } from '@/lib/api'

interface Agent {
  id: string
  name: string
  description?: string
  goal: string
  version: number
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  loopState: string
  allowedTools: string[]
  roomId?: string
  createdAt: string
  updatedAt: string
  lastExecutedAt?: string
}

const LOOP_COLORS: Record<string, string> = {
  IDLE: 'text-gray-400',
  PERCEIVING: 'text-blue-500',
  REASONING: 'text-purple-500',
  SELECTING_TOOL: 'text-indigo-500',
  EXECUTING_TOOL: 'text-orange-500',
  UPDATING_MEMORY: 'text-teal-500',
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PAUSED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ARCHIVED: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [runningId, setRunningId] = useState<string | null>(null)
  const [lastRunId, setLastRunId] = useState<string | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAgents = async () => {
    try {
      const data = await getAgents()
      setAgents(data.agents || [])
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
    pollRef.current = setInterval(fetchAgents, 4000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  async function handleRunAgent(agentId: string) {
    setRunningId(agentId)
    try {
      const result = await runAgent(agentId)
      setLastRunId(result.runId)
      setTimeout(() => setLastRunId(null), 6000)
    } catch (err: unknown) {
      alert(`Failed to run agent: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setRunningId(null)
    }
  }

  const filtered = agents
    .filter(a => filter === 'ALL' || a.status === filter)
    .filter(a =>
      !searchTerm ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.goal.toLowerCase().includes(searchTerm.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-[#F9F5EF] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <AgentIcon className="w-12 h-12 flex-shrink-0 transition-transform hover:scale-105 duration-200" />
            <div>
              <h1 className="text-2xl font-extrabold text-[#111]">Agents</h1>
              <p className="text-gray-500 text-sm mt-0.5">Autonomous AI units — perception, reasoning, tool execution loops</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E0D0] rounded-full text-[11px] text-gray-400">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live · 4s refresh
            </div>
            <Link href="/agents/create"
              className="px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all duration-150 hover:opacity-90"
              style={{ backgroundColor: '#EA580C' }}>
              + Deploy Agent
            </Link>
          </div>
        </div>

        {/* Run success banner */}
        {lastRunId && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-fadeSlideDown">
            <span className="text-sm font-semibold text-emerald-800">
              Agent execution queued — Run <code className="font-mono text-xs bg-emerald-100 px-1.5 py-0.5 rounded">{lastRunId.slice(0, 16)}</code>
            </span>
            <Link href="/live-runs" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
              <LiveRunsIcon className="w-4 h-4" /> View Live Runs
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Agents', value: agents.length, color: 'text-[#111]' },
            { label: 'Active', value: agents.filter(a => a.status === 'ACTIVE').length, color: 'text-emerald-600', pulse: true },
            { label: 'Paused', value: agents.filter(a => a.status === 'PAUSED').length, color: 'text-yellow-600' },
            { label: 'Archived', value: agents.filter(a => a.status === 'ARCHIVED').length, color: 'text-gray-400' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E8E0D0] rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className={`text-2xl font-extrabold flex items-center gap-2 ${s.color}`}>
                {loading ? '...' : s.value}
                {s.pulse && (s.value as number) > 0 && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mb-5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input type="text" placeholder="Search by name or goal..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#DDD5C8] bg-white text-[#111] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['ALL', 'ACTIVE', 'PAUSED', 'ARCHIVED'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                  filter === s ? 'bg-[#EA580C] text-white' : 'bg-white text-gray-500 border border-[#DDD5C8] hover:border-[#EA580C]'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-gray-400 text-sm">Loading agents...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#E8E0D0] rounded-2xl p-12 text-center">
            <AgentIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-extrabold text-[#111] mb-2">No agents found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {searchTerm || filter !== 'ALL'
                ? 'Try adjusting your filters or search.'
                : 'Deploy your first autonomous agent to get started.'}
            </p>
            {!searchTerm && filter === 'ALL' && (
              <Link href="/agents/create"
                className="inline-block px-6 py-2.5 text-white text-sm font-bold rounded-xl"
                style={{ backgroundColor: '#EA580C' }}>
                + Deploy First Agent
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(agent => (
              <div key={agent.id}
                className="bg-white border border-[#E8E0D0] rounded-2xl p-5 hover:border-[#EA580C] hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Link href={`/agents/${agent.id}`}
                        className="text-base font-extrabold text-[#111] group-hover:text-[#EA580C] transition-colors truncate">
                        {agent.name}
                      </Link>
                      <span className="text-xs font-mono text-gray-400">v{agent.version}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[agent.status] || ''}`}>
                        {agent.status}
                      </span>
                      {agent.status === 'ACTIVE' && (
                        <span className={`text-[10px] font-mono ${LOOP_COLORS[agent.loopState] || 'text-gray-400'}`}>
                          {agent.loopState}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      <span className="font-semibold text-gray-700">Goal:</span> {agent.goal}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>{agent.allowedTools.length} tools</span>
                      {agent.roomId && (
                        <Link href={`/rooms/${agent.roomId}`}
                          className="flex items-center gap-1 text-[#EA580C] hover:underline font-semibold">
                          <RoomsIcon className="w-3 h-3" />
                          In Room →
                        </Link>
                      )}
                      {!agent.roomId && (
                        <span className="text-gray-300 italic">No room assigned</span>
                      )}
                      {agent.lastExecutedAt && (
                        <span>Last run: {new Date(agent.lastExecutedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRunAgent(agent.id)}
                      disabled={runningId === agent.id}
                      className="px-3.5 py-2 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                      style={{ backgroundColor: '#EA580C' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C2410C'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EA580C'}
                    >
                      {runningId === agent.id ? (
                        <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running</>
                      ) : (
                        <><span>&#9654;</span> Run</>
                      )}
                    </button>
                    <Link href={`/agents/${agent.id}`}
                      className="px-3.5 py-2 bg-[#F9F5EF] border border-[#E8E0D0] hover:border-[#EA580C] text-[#111] text-xs font-bold rounded-lg transition-all">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
