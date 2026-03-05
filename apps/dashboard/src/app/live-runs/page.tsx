'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LiveRunsIcon, PlayIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, LiveActivityIcon, ExecutionTraceIcon } from '@/components/icons'

interface ExecutionEvent {
  id: string
  timestamp: Date
  type: string
  agent?: string
  room?: string
  message: string
  status: 'success' | 'running' | 'failed'
}

export default function LiveRunsPage() {
  const [events, setEvents] = useState<ExecutionEvent[]>([
    { id: '1', timestamp: new Date(Date.now() - 1000), type: 'agent-execution', agent: 'ResearchAgent', message: 'Started market analysis workflow', status: 'running' },
    { id: '2', timestamp: new Date(Date.now() - 5000), type: 'tool-call', message: 'OpenAI GPT-4 invoked (1,234 tokens)', status: 'success' },
    { id: '3', timestamp: new Date(Date.now() - 8000), type: 'room-init', room: 'Sandbox-3', message: 'Room initialized with policy config', status: 'success' },
    { id: '4', timestamp: new Date(Date.now() - 12000), type: 'automation', message: 'Trigger "market_update" fired', status: 'success' },
    { id: '5', timestamp: new Date(Date.now() - 18000), type: 'agent-execution', agent: 'DataProcessor', message: 'Completed execution successfully', status: 'success' },
  ])

  const [stats, setStats] = useState({
    totalExecutions: 1247,
    activeNow: 3,
    successRate: 97.8,
    avgDuration: 2.4
  })

  useEffect(() => {
    // Simulate real-time events
    const interval = setInterval(() => {
      const newEvent: ExecutionEvent = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: ['agent-execution', 'tool-call', 'room-init', 'automation'][Math.floor(Math.random() * 4)],
        agent: ['ResearchAgent', 'DataProcessor', 'AnalysisBot'][Math.floor(Math.random() * 3)],
        room: ['Sandbox-' + Math.floor(Math.random() * 5)][0],
        message: [
          'Started workflow execution',
          'Tool call completed',
          'Room initialized',
          'Trigger fired',
          'Execution completed'
        ][Math.floor(Math.random() * 5)],
        status: Math.random() > 0.1 ? 'success' : 'running'
      }

      setEvents(prev => [newEvent, ...prev].slice(0, 20))
      setStats(prev => ({
        ...prev,
        totalExecutions: prev.totalExecutions + 1,
        activeNow: Math.max(1, Math.min(10, prev.activeNow + (Math.random() > 0.5 ? 1 : -1)))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
      case 'running':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'failed':
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agent-execution':
        return 'bg-blue-100 text-blue-700'
      case 'tool-call':
        return 'bg-purple-100 text-purple-700'
      case 'room-init':
        return 'bg-emerald-100 text-emerald-700'
      case 'automation':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return date.toLocaleTimeString()
  }

  return (
    <div className="bg-[#E8DCC8] min-h-screen">
      <Header 
        title="Live Runs" 
        subtitle="Real-time execution streams and system events"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-emerald-700">Live</span>
            </div>
          </div>
        }
      />
      
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-text-secondary">Total Executions</CardTitle>
                <div className="text-3xl font-bold text-text-primary">{stats.totalExecutions.toLocaleString()}</div>
              </CardHeader>
            </Card>

            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-text-secondary">Active Now</CardTitle>
                <div className="text-3xl font-bold text-blue-600 flex items-center gap-2">
                  {stats.activeNow}
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                </div>
              </CardHeader>
            </Card>

            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-text-secondary">Success Rate</CardTitle>
                <div className="text-3xl font-bold text-emerald-600">{stats.successRate}%</div>
              </CardHeader>
            </Card>

            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-text-secondary">Avg Duration</CardTitle>
                <div className="text-3xl font-bold text-purple-600">{stats.avgDuration}s</div>
              </CardHeader>
            </Card>
          </div>

          {/* Live Event Stream */}
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LiveActivityIcon className="w-8 h-8" />
                Event Stream
                <div className="flex items-center gap-2 ml-auto">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-normal text-emerald-600">Auto-updating</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events.map((event, idx) => (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#D4C4A8] hover:shadow-md transition-all animate-slide-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex-shrink-0">
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${getTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        {event.agent && (
                          <span className="text-xs text-text-secondary">Agent: {event.agent}</span>
                        )}
                        {event.room && (
                          <span className="text-xs text-text-secondary">Room: {event.room}</span>
                        )}
                      </div>
                      <p className="text-sm text-text-primary">{event.message}</p>
                    </div>
                    <div className="text-xs text-text-secondary whitespace-nowrap">
                      {formatTimestamp(event.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardContent className="p-4">
              <div className="flex items-center gap-6 flex-wrap">
                <span className="text-sm font-semibold text-text-secondary">Event Types:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">agent-execution</span>
                  <span className="text-xs text-text-secondary">Agent workflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">tool-call</span>
                  <span className="text-xs text-text-secondary">LLM & API calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-semibold">room-init</span>
                  <span className="text-xs text-text-secondary">Rooms created</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded font-semibold">automation</span>
                  <span className="text-xs text-text-secondary">Triggers fired</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
