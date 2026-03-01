'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatDate, formatDuration } from '@/lib/utils'
import { LogEmptyState } from '@/components/empty-state'
import { PlayIcon, RefreshIcon } from '@/components/icons'

export default function RoomDetailPage() {
  const params = useParams()
  const roomId = params.id as string
  
  const [room, setRoom] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'logs' | 'memory' | 'timeline'>('logs')
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadRoom() {
      try {
        const [roomData, logsData] = await Promise.all([
          api.getRoom(roomId),
          api.getRoomLogs(roomId),
        ])
        setRoom(roomData)
        setLogs(logsData.logs)
      } catch (error) {
        console.error('Failed to load room:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRoom()
    const interval = setInterval(loadRoom, 2000)
    return () => clearInterval(interval)
  }, [roomId])

  useEffect(() => {
    if (activeTab === 'logs') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, activeTab])

  const handleRunRoom = async () => {
    try {
      await api.runRoom(roomId)
    } catch (error) {
      console.error('Failed to run room:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-surface-active border-t-brand rounded-full animate-spin mb-4" />
        <div className="text-text-secondary">Loading room details...</div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <svg className="w-16 h-16 text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="text-text-secondary">Room not found</div>
      </div>
    )
  }

  return (
    <div>
      <Header 
        title={room.name} 
        subtitle={`Room ${roomId.slice(0, 8)}... • Workflow ${room.workflowId.slice(0, 8)}...`}
        actions={
          <div className="flex gap-2">
            <Button
              onClick={handleRunRoom}
              disabled={room.status === 'RUNNING'}
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              {room.status === 'RUNNING' ? 'Running...' : 'Run Room'}
            </Button>
            <Button variant="outline">
              <RefreshIcon className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        }
      />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Status and Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <Card className="border border-[#E5E7EB] bg-white hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out rounded-lg">
              <CardHeader className="pb-3">
                <CardDescription>Status</CardDescription>
                <div className="flex items-center gap-3">
                  <StatusBadge status={room.status} />
                  {room.status === 'RUNNING' && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs text-blue-600 font-semibold">Active</span>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            <Card className="border border-[#E5E7EB] bg-white hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out rounded-lg">
              <CardHeader className="pb-3">
                <CardDescription>Created</CardDescription>
                <CardTitle className="text-base font-mono">{formatDate(room.createdAt)}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border border-[#E5E7EB] bg-white hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out rounded-lg">
              <CardHeader className="pb-3">
                <CardDescription>Updated</CardDescription>
                <CardTitle className="text-base font-mono">{formatDate(room.updatedAt)}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border border-[#E5E7EB] bg-white hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out rounded-lg">
              <CardHeader className="pb-3">
                <CardDescription>Workflow ID</CardDescription>
                <CardTitle className="text-sm truncate font-mono">{room.workflowId.slice(0, 16)}...</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Tabs */}
          <div className="pt-8 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] mb-6">
            {(['logs', 'memory', 'timeline'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold transition-colors duration-150 ease-in-out border-b-2 ${
                activeTab === tab
                  ? 'border-brand text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            </div>

          {/* Tab Content */}
          {activeTab === 'logs' && (
            <Card className="border border-[#E5E7EB] bg-white hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out rounded-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Execution Logs</CardTitle>
                    <CardDescription>
                      {logs.length} log entries
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>LIVE • Refreshing every 2s</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-surface-active rounded-xl border border-border p-4 font-mono text-sm max-h-[600px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <LogEmptyState />
                  ) : (
                    <div className="space-y-1">
                      {logs.map((log, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-4 px-3 py-2 rounded-lg hover:bg-background transition-colors duration-150 ease-in-out ${
                            log.level === 'ERROR'
                              ? 'text-red-600 bg-red-50'
                              : log.level === 'WARN'
                              ? 'text-yellow-600 bg-yellow-50'
                              : log.level === 'INFO'
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-text-secondary'
                          }`}
                        >
                          <span className="text-text-secondary w-20 flex-shrink-0">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                          <span className="w-16 flex-shrink-0 font-semibold">
                            [{log.level}]
                          </span>
                          <span className="flex-1">{log.message}</span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'memory' && (
            <Card className="border border-[#E5E7EB] bg-white hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out rounded-lg">
              <CardHeader>
                <CardTitle>Memory State</CardTitle>
                <CardDescription>Room memory and context</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-text-secondary text-center py-12">
                  Memory viewer coming soon
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'timeline' && (
            <Card className="border border-[#E5E7EB] bg-white hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out rounded-lg">
              <CardHeader>
                <CardTitle>Execution Timeline</CardTitle>
                <CardDescription>Node execution flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-text-secondary text-center py-12">
                  Timeline view coming soon
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration */}
          {room.description && (
            <Card className="border border-[#E5E7EB] bg-white hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out rounded-lg">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">{room.description}</p>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
