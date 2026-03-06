'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircleIcon, AlertCircleIcon, ClockIcon } from '@/components/icons'
import { RunsIcon as RunsProductIcon } from '@/components/icons/product/RunsIcon'
import { getRooms, getRoomLogs, getAgents, type ExecutionLog, type Room } from '@/lib/api'

interface EnrichedEvent extends ExecutionLog {
  roomName?: string
}

export default function LiveRunsPage() {
  const [events, setEvents] = useState<EnrichedEvent[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalRooms: 0, activeNow: 0, agents: 0 })
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  async function fetchLiveData() {
    try {
      setError(null)
      const [roomsData, agentsData] = await Promise.all([getRooms(), getAgents()])
      const allRooms = roomsData.rooms || []
      setRooms(allRooms)
      setStats({
        totalRooms: allRooms.length,
        activeNow: allRooms.filter(r => r.status === 'RUNNING').length,
        agents: agentsData.count || 0,
      })

      // Fetch logs from active + recently completed rooms (up to 5)
      const targetRooms = allRooms
        .filter(r => ['RUNNING', 'COMPLETED', 'FAILED'].includes(r.status))
        .slice(0, 5)

      const logsArrays = await Promise.all(
        targetRooms.map(room =>
          getRoomLogs(room.id)
            .then(data => (data.logs || []).map(log => ({ ...log, roomName: room.name })))
            .catch(() => [] as EnrichedEvent[])
        )
      )

      const allLogs = logsArrays
        .flat()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 40)

      setEvents(allLogs)
    } catch {
      setError('Could not connect to API. Is the backend running on port 3001?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveData()
    pollingRef.current = setInterval(fetchLiveData, 4000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [])

  const getStatusIcon = (level: string, eventType: string) => {
    if (level === 'ERROR' || eventType.includes('FAILED')) return <AlertCircleIcon className="w-5 h-5 text-red-500" />
    if (eventType.includes('COMPLETED')) return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
    if (eventType.includes('STARTED') || eventType.includes('RUNNING')) return (
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    )
    return <ClockIcon className="w-5 h-5 text-gray-400" />
  }

  const getEventBadgeColor = (eventType: string) => {
    if (eventType.startsWith('AGENT')) return 'bg-purple-100 text-purple-700'
    if (eventType.startsWith('ROOM')) return 'bg-blue-100 text-blue-700'
    if (eventType.startsWith('TOOL')) return 'bg-orange-100 text-orange-700'
    if (eventType.startsWith('NODE')) return 'bg-teal-100 text-teal-700'
    return 'bg-gray-100 text-gray-700'
  }

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return d.toLocaleTimeString()
  }

  const activeRooms = rooms.filter(r => r.status === 'RUNNING')

  return (
    <div className="bg-[#E8DCC8] min-h-screen">
      <Header
        title="Live Runs"
        subtitle="Real-time execution streams and system events"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-emerald-700">Live · 4s</span>
            </div>
          </div>
        }
      />

      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Hero */}
          <div className="flex items-center gap-6">
            <RunsProductIcon className="w-20 h-20 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-[#111111]">Live Runs</h1>
              <p className="text-gray-600 text-sm mt-1">
                Real-time execution events from rooms, agent loops, tool calls and workflow transitions.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
              <button onClick={fetchLiveData} className="ml-auto text-sm font-bold text-red-600">Retry</button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Rooms', value: stats.totalRooms, color: 'text-[#111111]' },
              { label: 'Active Now', value: stats.activeNow, color: 'text-blue-600', pulse: stats.activeNow > 0 },
              { label: 'Agents', value: stats.agents, color: 'text-purple-600' },
              { label: 'Log Events', value: events.length, color: 'text-[#F97316]' },
            ].map(stat => (
              <Card key={stat.label} className="border border-[#D4C4A8] bg-[#F5F1E8]">
                <CardHeader className="pb-3">
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className={`text-3xl font-bold flex items-center gap-2 ${stat.color}`}>
                    {stat.value}
                    {stat.pulse && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Active rooms */}
          {activeRooms.length > 0 && (
            <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Currently Executing Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeRooms.map(room => (
                    <div key={room.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#D4C4A8]">
                      <div>
                        <span className="font-semibold text-sm">{room.name}</span>
                        <span className="ml-3 text-xs font-mono text-gray-500">{room.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-blue-600">RUNNING</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event stream */}
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Execution Event Stream
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-normal text-emerald-600">Auto-updating</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F54E00] mb-3" />
                  <p className="text-sm text-gray-500">Connecting to execution stream...</p>
                </div>
              )}

              {!loading && events.length === 0 && !error && (
                <div className="text-center py-12">
                  <RunsProductIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <h3 className="font-semibold text-[#111111] mb-1">No live execution events yet</h3>
                  <p className="text-sm text-gray-500">
                    Launch a room run or agent execution to stream orchestration events in real time.
                  </p>
                </div>
              )}

              {!loading && events.length > 0 && (
                <div className="space-y-2">
                  {events.map((event, idx) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#D4C4A8] hover:shadow-sm transition-all"
                      style={{ animationDelay: `${idx * 20}ms` }}
                    >
                      <div className="flex-shrink-0">{getStatusIcon(event.level, event.eventType)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${getEventBadgeColor(event.eventType)}`}>
                            {event.eventType}
                          </span>
                          {event.roomName && (
                            <span className="text-xs text-gray-500">Room: <strong>{event.roomName}</strong></span>
                          )}
                          {event.duration && (
                            <span className="text-xs text-gray-400">{event.duration}ms</span>
                          )}
                        </div>
                        <p className="text-sm text-[#111111] truncate">{event.message}</p>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatTime(event.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-6 flex-wrap text-xs">
                <span className="font-semibold text-gray-500">Event types:</span>
                {[
                  { label: 'AGENT_*', color: 'bg-purple-100 text-purple-700' },
                  { label: 'ROOM_*', color: 'bg-blue-100 text-blue-700' },
                  { label: 'TOOL_*', color: 'bg-orange-100 text-orange-700' },
                  { label: 'NODE_*', color: 'bg-teal-100 text-teal-700' },
                ].map(e => (
                  <span key={e.label} className={`px-2 py-0.5 rounded font-semibold ${e.color}`}>{e.label}</span>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
