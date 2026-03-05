'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { LogEmptyState } from '@/components/empty-state'

export default function ActivityPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [allLogs, setAllLogs] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const roomsData = await api.getRooms()
        setRooms(roomsData.rooms)

        const logsPromises = roomsData.rooms.map((room: any) =>
          api.getRoomLogs(room.id).then((data) =>
            data.logs.map((log: any) => ({ ...log, roomName: room.name, roomId: room.id }))
          )
        )
        const logsArrays = await Promise.all(logsPromises)
        const logs = logsArrays.flat().sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setAllLogs(logs)
      } catch (error) {
        console.error('Failed to load logs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredLogs = allLogs.filter((log) => {
    if (selectedRoom !== 'all' && log.roomId !== selectedRoom) return false
    if (selectedLevel !== 'all' && log.level !== selectedLevel) return false
    return true
  })

  const levelCounts = {
    all: allLogs.length,
    INFO: allLogs.filter(l => l.level === 'INFO').length,
    WARN: allLogs.filter(l => l.level === 'WARN').length,
    ERROR: allLogs.filter(l => l.level === 'ERROR').length,
    DEBUG: allLogs.filter(l => l.level === 'DEBUG').length,
  }

  const toggleEventExpansion = (logId: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev)
      if (next.has(logId)) {
        next.delete(logId)
      } else {
        next.add(logId)
      }
      return next
    })
  }

  const getReadableEventDescription = (log: any) => {
    const typeDescriptions: Record<string, string> = {
      'ROOM_STARTED': 'Room execution started',
      'ROOM_COMPLETED': 'Room execution completed',
      'ROOM_FAILED': 'Room execution failed',
      'STATE_UPDATED': 'State updated',
      'STEP_EXECUTED': 'Step executed',
      'AGENT_INVOKED': 'Agent invoked',
      'ERROR': 'Error occurred',
    }
    return typeDescriptions[log.eventType] || log.eventType
  }

  const getHumanReadableTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  return (
    <div>
      <Header title="Live Runs" subtitle="Real-time execution streams and system events" />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Room Filter */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block font-medium">Filter by Room</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full bg-white border border-[#DED8D2] rounded-lg px-4 py-2 text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F54E00] transition-all duration-200"
              >
                <option value="all">All Rooms ({rooms.length})</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block font-medium">Filter by Level</label>
              <div className="flex items-center gap-2">
                {Object.entries(levelCounts).map(([level, count]) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 ease-in-out ${
                      selectedLevel === level
                        ? 'bg-[#F54E00] text-white'
                        : 'bg-white text-gray-600 hover:bg-[#FBF7F2] border border-[#DED8D2]'
                    }`}
                  >
                    {level}
                    <span className="ml-1 text-xs opacity-70">({count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-8 border-t border-[#DED8D2]">
            <Card className="border border-[#DED8D2] bg-white rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    {filteredLogs.length} events
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>LIVE</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-[#F54E00] rounded-full animate-spin mx-auto mb-4" />
                  <span className="text-gray-600">Loading activity...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <LogEmptyState />
              ) : (
                <div className="space-y-0">
                  {filteredLogs.slice(0, 100).map((log, idx) => (
                    <div
                      key={`${log.id}-${idx}`}
                      className="relative border-b border-[#DED8D2] last:border-0 hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out"
                    >
                      <div className="flex items-start gap-4 px-4 py-4">
                        {/* Timeline dot */}
                        <div className="flex-shrink-0 w-8 flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            log.level === 'ERROR'
                              ? 'bg-red-500'
                              : log.level === 'WARN'
                              ? 'bg-yellow-500'
                              : log.level === 'INFO'
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }`} />
                          {idx < filteredLogs.slice(0, 100).length - 1 && (
                            <div className="w-px h-full bg-[#DED8D2] mt-2" />
                          )}
                        </div>

                        {/* Event content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-medium text-[#111111]">
                              {getReadableEventDescription(log)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getHumanReadableTimestamp(log.createdAt)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            {log.message}
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">Room:</span>
                            <span className="text-xs text-[#111111] font-medium">{log.roomName}</span>
                          </div>

                          {/* Collapsible technical details */}
                          <button
                            onClick={() => toggleEventExpansion(`${log.id}-${idx}`)}
                            className="text-xs text-[#F54E00] hover:text-[#E24600] font-medium"
                          >
                            {expandedEvents.has(`${log.id}-${idx}`) ? '▼' : '▶'} Technical details
                          </button>

                          {expandedEvents.has(`${log.id}-${idx}`) && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-[#DED8D2] font-mono text-xs">
                              <div className="space-y-1 text-gray-700">
                                <div><span className="text-gray-500">Event Type:</span> {log.eventType}</div>
                                <div><span className="text-gray-500">Level:</span> {log.level}</div>
                                <div><span className="text-gray-500">Timestamp:</span> {formatDate(log.createdAt)}</div>
                                <div><span className="text-gray-500">Room ID:</span> {log.roomId}</div>
                                {log.data && (
                                  <div className="mt-2">
                                    <span className="text-gray-500">Payload:</span>
                                    <pre className="mt-1 p-2 bg-white rounded border border-[#DED8D2] overflow-x-auto">
                                      {JSON.stringify(log.data, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredLogs.length > 100 && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Showing 100 of {filteredLogs.length} events
                </div>
              )}
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
