'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CpuIcon, DatabaseIcon, ZapIcon, WorkersIcon, JobQueueIcon, RunsIllustrationIcon, MetricsIllustrationIcon, StorageIllustrationIcon, AgentsIllustrationIcon, ControlPlaneIllustrationIcon } from '@/components/icons'

export default function RuntimePage() {
  const [metrics, setMetrics] = useState({
    activeWorkers: 3,
    queuedJobs: 12,
    processingRate: 245,
    avgExecutionTime: 1.8,
    uptime: '12d 4h 23m',
    memoryUsage: 68,
    cpuUsage: 42
  })

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        queuedJobs: Math.max(0, prev.queuedJobs + Math.floor(Math.random() * 5 - 2)),
        cpuUsage: Math.min(100, Math.max(20, prev.cpuUsage + Math.floor(Math.random() * 10 - 5))),
        memoryUsage: Math.min(95, Math.max(50, prev.memoryUsage + Math.floor(Math.random() * 4 - 2)))
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const workers = [
    { id: '1', name: 'agent-worker-01', status: 'active', jobs: 4, uptime: '12d' },
    { id: '2', name: 'agent-worker-02', status: 'active', jobs: 3, uptime: '12d' },
    { id: '3', name: 'room-worker-01', status: 'active', jobs: 5, uptime: '12d' },
  ]

  const jobQueue = [
    { id: '1', type: 'agent-execution', agent: 'ResearchAgent', priority: 'high', queued: '2s ago' },
    { id: '2', type: 'room-execution', room: 'Analysis-Room', priority: 'normal', queued: '5s ago' },
    { id: '3', type: 'agent-execution', agent: 'DataProcessor', priority: 'normal', queued: '8s ago' },
  ]

  return (
    <div className="bg-[#E8DCC8] min-h-screen">
      <Header 
        title="Runtime" 
        subtitle="Execution engine powering autonomous systems"
      />
      
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription>Active Workers</CardDescription>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CpuIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <CardTitle className="text-4xl font-bold text-emerald-600">
                  {metrics.activeWorkers}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-600 font-semibold">All healthy</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription>Queued Jobs</CardDescription>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DatabaseIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-4xl font-bold text-blue-600">
                  {metrics.queuedJobs}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text-secondary">In BullMQ queue</p>
              </CardContent>
            </Card>

            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription>Processing Rate</CardDescription>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ZapIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-4xl font-bold text-purple-600">
                  {metrics.processingRate}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text-secondary">Jobs per hour</p>
              </CardContent>
            </Card>

            <Card className="border border-[#D4C4A8] bg-[#F5F1E8] hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription>Avg Execution</CardDescription>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-xl">⏱</span>
                  </div>
                </div>
                <CardTitle className="text-4xl font-bold text-orange-600">
                  {metrics.avgExecutionTime}s
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text-secondary">Mean job duration</p>
              </CardContent>
            </Card>
          </div>

          {/* System Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MetricsIllustrationIcon className="w-8 h-8" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{metrics.cpuUsage}%</span>
                    <span className="text-xs text-text-secondary">Uptime: {metrics.uptime}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${metrics.cpuUsage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StorageIllustrationIcon className="w-8 h-8" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{metrics.memoryUsage}%</span>
                    <span className="text-xs text-text-secondary">2.1 GB / 3.1 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${metrics.memoryUsage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workers Status */}
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RunsIllustrationIcon className="w-8 h-8" />
                Worker Pool Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workers.map((worker) => (
                  <div key={worker.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#D4C4A8]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CpuIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{worker.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-text-secondary mt-1">
                          <span>Processing: {worker.jobs} jobs</span>
                          <span>Uptime: {worker.uptime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-emerald-600">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Job Queue */}
          <Card className="border border-[#D4C4A8] bg-[#F5F1E8]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <JobQueueIcon className="w-8 h-8" />
                Job Queue
              </CardTitle>
              <CardDescription>{metrics.queuedJobs} pending jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobQueue.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#D4C4A8]">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        job.type === 'agent-execution' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {job.type === 'agent-execution' ? (
                          <AgentsIllustrationIcon className="w-6 h-6" />
                        ) : (
                          <ControlPlaneIllustrationIcon className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{job.type}</h4>
                        <div className="flex items-center gap-4 text-xs text-text-secondary mt-1">
                          <span>{job.type === 'agent-execution' ? `Agent: ${job.agent}` : `Room: ${job.room}`}</span>
                          <span>Queued: {job.queued}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                      job.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {job.priority}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
