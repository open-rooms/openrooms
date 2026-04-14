'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircleIcon, AlertCircleIcon, ClockIcon, PlayIcon } from '@/components/icons'
import { LiveRunsIcon } from '@/components/icons/system'
import { getRooms, getRoomLogs, getAgents, getRuns, getLogsByRun, type ExecutionLog, type Room, type Run } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface SSEEvent {
  event: string
  runId: string
  data: Record<string, unknown>
  timestamp: string
}

export default function LiveRunsPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [roomEvents, setRoomEvents] = useState<(ExecutionLog & { roomName?: string })[]>([])
  const [sseEvents, setSseEvents] = useState<SSEEvent[]>([])
  const [sseConnected, setSseConnected] = useState(false)
  const [selectedRun, setSelectedRun] = useState<string | null>(null)
  const [runLogs, setRunLogs] = useState<ExecutionLog[]>([])
  const [stats, setStats] = useState({ totalRooms: 0, activeRooms: 0, agents: 0, totalRuns: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const sseRef = useRef<EventSource | null>(null)

  async function fetchAll() {
    try {
      setError(null)
      const [roomsData, agentsData, runsData] = await Promise.all([
        getRooms().catch(() => ({ rooms: [] })),
        getAgents().catch(() => ({ agents: [], count: 0 })),
        getRuns({ limit: 20 }).catch(() => ({ runs: [], count: 0 })),
      ])

      const allRooms = roomsData.rooms || []
      const allRuns = runsData.runs || []

      setRuns(allRuns)
      setStats({
        totalRooms: allRooms.length,
        activeRooms: allRooms.filter(r => r.status === 'RUNNING').length,
        agents: agentsData.count || agentsData.agents?.length || 0,
        totalRuns: allRuns.length,
      })

      // Fetch events from recent rooms for the event stream
      const targetRooms = allRooms
        .filter(r => ['RUNNING', 'COMPLETED', 'FAILED'].includes(r.status))
        .slice(0, 5)

      const logsArrays = await Promise.all(
        targetRooms.map(room =>
          getRoomLogs(room.id)
            .then(d => (d.logs || []).map(log => ({ ...log, roomName: room.name })))
            .catch(() => [])
        )
      )

      const merged = logsArrays
        .flat()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50)

      setRoomEvents(merged)
    } catch {
      setError('Cannot reach API. Make sure the backend is running on port 3001.')
    } finally {
      setLoading(false)
    }
  }

  async function loadRunLogs(runId: string) {
    setSelectedRun(runId)
    try {
      const data = await getLogsByRun(runId)
      setRunLogs(data.logs || [])
    } catch {
      setRunLogs([])
    }
  }

  // ── SSE connection for real-time events ──────────────────────────────────
  useEffect(() => {
    const connect = () => {
      if (sseRef.current) sseRef.current.close()

      const source = new EventSource(`${API_BASE}/api/runtime/events`)
      sseRef.current = source

      source.onopen = () => setSseConnected(true)

      source.onmessage = (e) => {
        try {
          const payload: SSEEvent = JSON.parse(e.data)
          setSseEvents(prev => [payload, ...prev].slice(0, 100))
          // Refresh run list when an execution ends
          if (payload.event?.includes('completed') || payload.event?.includes('failed')) {
            fetchAll()
          }
        } catch { /* malformed event */ }
      }

      source.onerror = () => {
        setSseConnected(false)
        source.close()
        // Reconnect after 5s
        setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      sseRef.current?.close()
      sseRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchAll()
    pollingRef.current = setInterval(fetchAll, 3000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [])

  // Refresh logs for selected run when runs update
  useEffect(() => {
    if (selectedRun) loadRunLogs(selectedRun)
  }, [runs])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':  return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"/>RUNNING</span>
      case 'completed': return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">✓ COMPLETED</span>
      case 'failed':    return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">✗ FAILED</span>
      case 'pending':   return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"/>QUEUED</span>
      default: return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{status.toUpperCase()}</span>
    }
  }

  const getTypeBadge = (type: string) => {
    if (type === 'agent') return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">AGENT</span>
    return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">WORKFLOW</span>
  }

  const getEventBadgeColor = (eventType: string) => {
    if (eventType.startsWith('AGENT')) return 'bg-purple-100 text-purple-700'
    if (eventType.startsWith('ROOM')) return 'bg-blue-100 text-blue-700'
    if (eventType.startsWith('TOOL')) return 'bg-orange-100 text-orange-700'
    if (eventType.startsWith('NODE')) return 'bg-teal-100 text-teal-700'
    return 'bg-gray-100 text-gray-700'
  }

  const formatTime = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return new Date(ts).toLocaleTimeString()
  }

  const formatDuration = (run: Run) => {
    if (!run.startedAt) return '—'
    const end = run.endedAt ? new Date(run.endedAt) : new Date()
    const ms = end.getTime() - new Date(run.startedAt).getTime()
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  }

  const activeRuns = runs.filter(r => r.status === 'running' || r.status === 'pending')
  const completedRuns = runs.filter(r => r.status === 'completed' || r.status === 'failed')

  return (
    <div className="bg-[#F9F5EF] min-h-screen">
      {/* Page header */}
      <div className="border-b border-[#E8E0D0] bg-white px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LiveRunsIcon className="w-10 h-10 flex-shrink-0 transition-transform hover:scale-105 duration-200" />
          <div>
            <h1 className="text-xl font-extrabold text-[#111]">Live Runs</h1>
            <p className="text-gray-400 text-xs mt-0.5">Real-time orchestration — agent loops, workflow executions, tool calls</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${sseConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`} />
            {sseConnected ? 'SSE Live' : 'Polling 3s'}
          </div>
          <Link href="/rooms" className="px-4 py-2 text-white text-sm font-bold rounded-xl transition-all"
            style={{ backgroundColor: '#EA580C' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#C2410C'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#EA580C'}>
            + Trigger Run
          </Link>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
              <button onClick={fetchAll} className="ml-auto text-sm font-bold text-red-600">Retry</button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Runs', value: stats.totalRuns, color: 'text-[#111111]' },
              { label: 'Active Now', value: activeRuns.length, color: 'text-blue-600', pulse: activeRuns.length > 0 },
              { label: 'Agents Deployed', value: stats.agents, color: 'text-purple-600' },
              { label: 'Rooms', value: stats.totalRooms, color: 'text-[#EA580C]' },
            ].map(stat => (
              <Card key={stat.label} className="border border-[#D4C4A8] bg-white">
                <CardContent className="pt-5 pb-4">
                  <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                  <div className={`text-3xl font-bold flex items-center gap-2 ${stat.color}`}>
                    {loading ? '…' : stat.value}
                    {stat.pulse && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* SSE Event Stream */}
          {sseEvents.length > 0 && (
            <Card className="border-2 border-emerald-200 bg-emerald-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Runtime Event Stream
                  <span className="text-xs font-normal text-gray-500 ml-1">({sseEvents.length} events)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {sseEvents.slice(0, 20).map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-white rounded px-2 py-1.5 border border-emerald-100">
                      <span className={`shrink-0 px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        ev.event?.includes('agent') ? 'bg-purple-100 text-purple-700'
                        : ev.event?.includes('tool') ? 'bg-orange-100 text-orange-700'
                        : ev.event?.includes('workflow') ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ev.event?.split('.').pop()?.toUpperCase()}
                      </span>
                      <span className="text-gray-700 truncate flex-1">
                        {(ev.data?.agentName as string) || (ev.data?.agentId as string)?.slice(0, 8) || ev.runId?.slice(0, 8)}
                      </span>
                      <span className="text-gray-400 shrink-0">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main layout: run list + log inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Run List ─────────────────────────────────────── */}
            <div className="space-y-4">
              {/* Active runs */}
              {activeRuns.length > 0 && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      Active Executions ({activeRuns.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {activeRuns.map(run => (
                      <button
                        key={run.id}
                        onClick={() => loadRunLogs(run.id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedRun === run.id ? 'border-[#EA580C] bg-white' : 'border-blue-200 bg-white hover:border-[#EA580C]'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeBadge(run.type)}
                            {getStatusBadge(run.status)}
                          </div>
                          <span className="text-xs text-gray-400">{formatDuration(run)}</span>
                        </div>
                        <div className="text-xs font-mono text-gray-500 truncate">{run.targetId}</div>
                        {run.input && Object.keys(run.input).length > 0 && (
                          <div className="text-xs text-gray-600 mt-1 truncate">
                            {JSON.stringify(run.input).substring(0, 60)}
                          </div>
                        )}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Completed runs */}
              <Card className="border border-[#D4C4A8] bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Run History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#EA580C]" />
                    </div>
                  )}
                  {!loading && runs.length === 0 && (
                    <div className="text-center py-10">
                      <LiveRunsIcon className="w-14 h-14 mx-auto mb-3 opacity-25" />
                      <p className="text-sm font-semibold text-gray-600 mb-1">No runs yet</p>
                      <p className="text-xs text-gray-500 mb-4">
                        Click <strong>Run</strong> on a workflow or <strong>Run Agent</strong> on an agent to start execution.
                      </p>
                      <div className="flex justify-center gap-3">
                        <Link href="/workflows" className="text-xs font-bold text-[#EA580C] hover:underline">→ Workflows</Link>
                        <Link href="/agents" className="text-xs font-bold text-[#EA580C] hover:underline">→ Agents</Link>
                      </div>
                    </div>
                  )}
                  {!loading && completedRuns.length > 0 && (
                    <div className="space-y-2">
                      {completedRuns.map(run => (
                        <button
                          key={run.id}
                          onClick={() => loadRunLogs(run.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${selectedRun === run.id ? 'border-[#EA580C] bg-white shadow-sm' : 'border-[#D4C4A8] bg-white hover:border-[#EA580C]'}`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              {getTypeBadge(run.type)}
                              {getStatusBadge(run.status)}
                            </div>
                            <span className="text-xs text-gray-400">{formatTime(run.createdAt)}</span>
                          </div>
                          <div className="text-xs font-mono text-gray-400 truncate">{run.id.slice(0, 16)}…</div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Duration: {formatDuration(run)}</span>
                            {run.error && <span className="text-red-500 truncate max-w-[120px]">{run.error}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Log Inspector ─────────────────────────────────── */}
            <div>
              <Card className="border border-[#D4C4A8] bg-white h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {selectedRun ? (
                      <>
                        <PlayIcon className="w-4 h-4 text-[#EA580C]" />
                        Run Execution Log
                        <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded ml-2">{selectedRun.slice(0, 8)}…</code>
                      </>
                    ) : (
                      <>Execution Event Stream</>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedRun ? (
                    /* Per-run logs */
                    runLogs.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No logs yet for this run. They appear as the execution progresses.</p>
                    ) : (
                      <div className="space-y-2 max-h-[520px] overflow-y-auto">
                        {runLogs.map((log, i) => (
                          <div key={log.id ?? i} className="flex gap-3 p-3 bg-white rounded-lg border border-[#D4C4A8] text-xs">
                            <div className="flex-shrink-0 mt-0.5">
                              {log.level === 'ERROR' ? <AlertCircleIcon className="w-4 h-4 text-red-500" />
                                : log.eventType?.includes('COMPLETED') ? <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                                : <ClockIcon className="w-4 h-4 text-gray-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${getEventBadgeColor(log.eventType)}`}>
                                  {log.eventType}
                                </span>
                                <span className="text-gray-400">{formatTime(log.timestamp)}</span>
                              </div>
                              <p className="text-gray-800">{log.message}</p>
                              {log.data && Object.keys(log.data).length > 0 && (
                                <pre className="text-[10px] text-gray-500 mt-1 bg-gray-50 rounded p-1 overflow-x-auto">{JSON.stringify(log.data, null, 1).slice(0, 200)}</pre>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    /* General room event stream */
                    roomEvents.length === 0 ? (
                      <div className="text-center py-12">
                        <LiveRunsIcon className="w-14 h-14 mx-auto mb-3 opacity-25" />
                        <p className="text-sm font-semibold text-gray-600 mb-1">No events yet</p>
                        <p className="text-xs text-gray-500">
                          Start a run and click it in the list to inspect its execution logs.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[520px] overflow-y-auto">
                        {roomEvents.map((event, i) => (
                          <div key={event.id ?? i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#D4C4A8] text-xs">
                            <div className="flex-shrink-0 mt-0.5">
                              {event.level === 'ERROR' ? <AlertCircleIcon className="w-4 h-4 text-red-500" />
                                : event.eventType.includes('COMPLETED') ? <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                                : <ClockIcon className="w-4 h-4 text-gray-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${getEventBadgeColor(event.eventType)}`}>
                                  {event.eventType}
                                </span>
                                {event.roomName && <span className="text-gray-500">Room: <strong>{event.roomName}</strong></span>}
                                <span className="text-gray-400 ml-auto">{formatTime(event.timestamp)}</span>
                              </div>
                              <p className="text-gray-800 truncate">{event.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
