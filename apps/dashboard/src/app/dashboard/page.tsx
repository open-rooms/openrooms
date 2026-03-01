'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { Sparkline } from '@/components/charts'
import { ActivityIcon, PlayIcon, ChevronRightIcon } from '@/components/icons'

interface DashboardStats {
  totalRooms: number
  runningRooms: number
  completedRooms: number
  failedRooms: number
  successRate: number
}

export default function DashboardPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<any[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    runningRooms: 0,
    completedRooms: 0,
    failedRooms: 0,
    successRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [roomsData, workflowsData] = await Promise.all([
          api.getRooms(),
          api.getWorkflows(),
        ])

        setRooms(roomsData.rooms)
        setWorkflows(workflowsData.workflows)

        const running = roomsData.rooms.filter((r: any) => r.status === 'RUNNING').length
        const completed = roomsData.rooms.filter((r: any) => r.status === 'COMPLETED').length
        const failed = roomsData.rooms.filter((r: any) => r.status === 'FAILED').length
        const successRate = completed + failed > 0 ? (completed / (completed + failed)) * 100 : 0

        setStats({
          totalRooms: roomsData.count,
          runningRooms: running,
          completedRooms: completed,
          failedRooms: failed,
          successRate,
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
        <div className="w-16 h-16 border-4 border-surface-active border-t-brand rounded-full animate-spin mx-auto mb-4" />
        <div className="text-text-secondary font-medium">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header 
        title="Dashboard" 
        subtitle="Monitor and manage your agent orchestration system"
        actions={
          <Button asChild>
            <Link href="/rooms?action=create">
              <PlayIcon className="w-4 h-4 mr-2" />
              Launch Room
            </Link>
          </Button>
        }
      />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Total Rooms - Uses brand color */}
            <Card 
              className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription>Total Rooms</CardDescription>
                  <ActivityIcon className="w-10 h-10" />
                </div>
                <CardTitle className="text-4xl font-bold">
                  {stats.totalRooms}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Sparkline value={stats.totalRooms} max={Math.max(stats.totalRooms, 10)} color="hsl(var(--color-brand))" />
                <p className="text-xs text-text-secondary mt-2">Execution environments</p>
              </CardContent>
            </Card>

            {/* Running - Active state when rooms are running */}
            <Card 
              className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg"
              data-state={stats.runningRooms > 0 ? 'active' : 'inactive'}
            >
              <CardHeader 
                className="pb-2" 
                data-state={stats.runningRooms > 0 ? 'active' : 'inactive'}
              >
                <div className="flex items-center justify-between mb-2">
                  <CardDescription>Running</CardDescription>
                  <PlayIcon className="w-10 h-10" />
                </div>
                <CardTitle className="text-4xl font-bold text-blue-600">
                  {stats.runningRooms}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-600 font-semibold">Active now</span>
                </div>
                <Sparkline value={stats.runningRooms} max={stats.totalRooms || 10} color="#3B82F6" />
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription>Success Rate</CardDescription>
                  <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-4xl font-bold text-emerald-600">
                  {stats.successRate.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="text-emerald-600 font-bold">{stats.completedRooms}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Failed</span>
                    <span className="text-red-600 font-bold">{stats.failedRooms}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflows */}
            <Card className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription>Workflows</CardDescription>
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-4xl font-bold text-purple-600">
                  {workflows.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Available templates</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="pt-8 border-t border-neutral-200">
            <h2 className="text-xl font-bold text-text-primary mb-6">Recent Activity</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Rooms */}
            <Card className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Rooms</CardTitle>
                    <CardDescription>Latest execution environments</CardDescription>
                  </div>
                  <Link
                    href="/rooms"
                    className="text-sm text-brand hover:text-brand/80 font-semibold flex items-center gap-1 group transition-colors duration-200"
                  >
                    <span>View all</span>
                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {rooms.length === 0 ? (
                  <div className="text-center py-12 text-text-secondary">
                    No rooms yet. Create your first room to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rooms.slice(0, 5).map((room) => (
                      <Link
                        key={room.id}
                        href={`/rooms/${room.id}`}
                        className="block p-4 rounded-lg border border-neutral-200 bg-white hover:shadow-sm transition-shadow duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-text-primary truncate">{room.name}</h4>
                              <StatusBadge status={room.status} />
                            </div>
                            {room.description && (
                              <p className="text-sm text-text-secondary truncate">{room.description}</p>
                            )}
                            <p className="text-xs text-text-secondary mt-1">
                              Updated {formatRelativeTime(room.updatedAt)}
                            </p>
                          </div>
                          <ChevronRightIcon className="w-5 h-5 text-text-secondary group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workflows */}
            <Card className="border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Workflows</CardTitle>
                    <CardDescription>Available workflow templates</CardDescription>
                  </div>
                  <Link
                    href="/workflows"
                    className="text-sm text-brand hover:text-brand/80 font-semibold flex items-center gap-1 group transition-colors duration-200"
                  >
                    <span>View all</span>
                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {workflows.length === 0 ? (
                  <div className="text-center py-12 text-text-secondary">
                    No workflows yet. Create your first workflow.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workflows.slice(0, 3).map((workflow) => (
                      <Link
                        key={workflow.id}
                        href={`/workflows/${workflow.id}`}
                        className="block p-4 rounded-lg border border-neutral-200 bg-white hover:shadow-sm transition-shadow duration-200 group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-xl">
                            ⚡
                          </div>
                          <h4 className="font-semibold text-text-primary truncate flex-1">{workflow.name}</h4>
                          <ChevronRightIcon className="w-5 h-5 text-text-secondary group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                        {workflow.description && (
                          <p className="text-sm text-text-secondary line-clamp-2">{workflow.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-surface-active text-text-secondary rounded-lg font-semibold">v{workflow.version}</span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold">{workflow.status}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
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
