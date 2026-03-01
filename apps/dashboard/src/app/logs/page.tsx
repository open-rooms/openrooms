'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { LogEmptyState } from '@/components/empty-state'

export default function LogsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [allLogs, setAllLogs] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
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

  return (
    <div>
      <Header title="Logs" subtitle="Global execution logs across all rooms" />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Room Filter */}
            <div>
              <label className="text-sm text-text-secondary mb-2 block font-medium">Filter by Room</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
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
              <label className="text-sm text-text-secondary mb-2 block font-medium">Filter by Level</label>
              <div className="flex items-center gap-2">
                {Object.entries(levelCounts).map(([level, count]) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`flex-1 px-4 py-2 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                      selectedLevel === level
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-surface-active text-text-secondary hover:bg-surface-active/80'
                    }`}
                  >
                    {level}
                    <span className="ml-1 text-xs opacity-70">({count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="pt-8 border-t border-neutral-200">
            <Card className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Execution Logs</CardTitle>
                  <CardDescription>
                    {filteredLogs.length} entries
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
                  <div className="w-8 h-8 border-2 border-surface-active border-t-accent rounded-full animate-spin mx-auto mb-4" />
                  <span className="text-text-secondary">Loading logs...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <LogEmptyState />
              ) : (
                <div className="space-y-0 border border-border rounded-xl overflow-hidden">
                  {filteredLogs.slice(0, 100).map((log, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 px-4 py-3 border-b border-neutral-200 last:border-0 hover:bg-surface-active font-mono text-sm transition-colors duration-200 ${
                        log.level === 'ERROR'
                          ? 'bg-red-50'
                          : log.level === 'WARN'
                          ? 'bg-yellow-50'
                          : log.level === 'INFO'
                          ? 'bg-blue-50'
                          : ''
                      }`}
                    >
                      <div className="w-32 flex-shrink-0 text-xs text-text-secondary">
                        {formatDate(log.createdAt)}
                      </div>
                      
                      <div className={`w-16 flex-shrink-0 text-xs font-semibold ${
                        log.level === 'ERROR'
                          ? 'text-red-600'
                          : log.level === 'WARN'
                          ? 'text-yellow-600'
                          : log.level === 'INFO'
                          ? 'text-blue-600'
                          : 'text-text-secondary'
                      }`}>
                        {log.level}
                      </div>

                      <div className="flex-shrink-0 w-48 truncate text-xs text-text-secondary">
                        <span>Room:</span>{' '}
                        <span className="text-text-primary">{log.roomName}</span>
                      </div>

                      <div className="flex-1 min-w-0 text-text-primary truncate">
                        {log.message}
                      </div>

                      <div className="flex-shrink-0 text-xs text-text-secondary">
                        {log.eventType}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredLogs.length > 100 && (
                <div className="mt-4 text-center text-sm text-text-secondary">
                  Showing 100 of {filteredLogs.length} logs
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
