'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { RoomsIcon } from '@/components/icons/RoomsIcon'
import { AgentIcon } from '@/components/icons/AgentIcon'
import { WorkflowIcon } from '@/components/icons/WorkflowIcon'
import { LogsIcon } from '@/components/icons/LogsIcon'
import { MemoryIcon } from '@/components/icons/MemoryIcon'
import { DashboardIcon } from '@/components/icons/DashboardIcon'
import { LaunchRoomIcon } from '@/components/icons/LaunchRoomIcon'
import { LiveActivityIcon } from '@/components/icons/LiveActivityIcon'
import { ChevronRightIcon } from '@/components/icons'

interface AppCard {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  href: string
  color: string
  bgGradient: string
}

const apps: AppCard[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'System overview & real-time metrics',
    icon: DashboardIcon,
    href: '/dashboard',
    color: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'rooms',
    name: 'Rooms',
    description: 'Agent execution environments',
    icon: RoomsIcon,
    href: '/rooms',
    color: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'workflows',
    name: 'Workflows',
    description: 'Orchestration templates',
    icon: WorkflowIcon,
    href: '/workflows',
    color: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-400 to-pink-500',
  },
  {
    id: 'logs',
    name: 'Logs',
    description: 'Activity & debugging',
    icon: LogsIcon,
    href: '/logs',
    color: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-green-400 to-emerald-500',
  },
  {
    id: 'tools',
    name: 'Tools',
    description: 'Plugin marketplace',
    icon: AgentIcon,
    href: '/tools',
    color: 'from-amber-500 to-orange-500',
    bgGradient: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'System configuration',
    icon: MemoryIcon,
    href: '/settings',
    color: 'from-slate-500 to-gray-600',
    bgGradient: 'from-gray-400 to-slate-500',
  },
]

const quickActions = [
  {
    id: 'launch',
    title: 'Launch Room',
    description: 'Start a new AI agent execution',
    icon: LaunchRoomIcon,
    href: '/rooms?action=create',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'activity',
    title: 'Live Activity',
    description: 'Monitor real-time executions',
    icon: LiveActivityIcon,
    href: '/rooms',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'explore-logs',
    title: 'Logs',
    description: 'Debug & trace events',
    icon: LogsIcon,
    href: '/logs',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'tools-quick',
    title: 'Tools',
    description: 'Plugin ecosystem',
    icon: AgentIcon,
    href: '/tools',
    gradient: 'from-orange-500 to-red-500',
  },
]

export default function HomePage() {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] via-[#F8F4EE] to-[#FAF6F0] relative">
      {/* OS-style top bar */}
      <div className="fixed top-0 left-0 right-0 h-8 bg-white/90 backdrop-blur-xl border-b border-black/10 flex items-center px-4 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer transition-colors" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer transition-colors" />
          <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer transition-colors" />
        </div>
        <div className="flex-1 text-center text-xs font-bold text-text-primary tracking-wide">OpenRooms Control Plane</div>
        <div className="text-xs font-mono text-text-secondary font-bold tabular-nums">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Main container - max-width 1200px, centered, 8px spacing system */}
      <div className="max-w-[1200px] mx-auto px-8 pt-24 pb-40">
        {/* Header Section - 48px spacing below */}
        <header className="mb-12">
          <div className="flex items-center gap-4">
            {/* Agent Icon - Direct render with brand color */}
            <AgentIcon className="w-16 h-16" />
            <div>
              <h1 className="text-6xl font-black tracking-tight text-brand">
                OpenRooms
              </h1>
              <p className="text-base text-text-secondary font-bold tracking-wide mt-2">AI Agent Control Plane</p>
            </div>
          </div>
        </header>

        {/* Apps Grid - CSS Grid with 3/2/1 responsive columns, 32px gap */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apps.map((app) => {
              const Icon = app.icon
              
              return (
                <Link
                  key={app.id}
                  href={app.href}
                  className="group block"
                >
                  <Card className="min-h-[220px] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-neutral-200 bg-white">
                    <CardContent className="p-6 h-full flex flex-col">
                      {/* Icon - Direct SVG render */}
                      <div className="mb-6">
                        <Icon className="w-16 h-16" />
                      </div>
                      
                      {/* App name */}
                      <h3 className="text-2xl font-black text-text-primary mb-3 tracking-tight">
                        {app.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-text-secondary font-semibold mb-6">
                        {app.description}
                      </p>
                      
                      {/* Arrow indicator - Uses theme accent */}
                      <div className="mt-auto flex items-center gap-2 text-sm font-bold text-text-secondary group-hover:text-accent transition-colors duration-200">
                        <span>Open</span>
                        <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Quick Actions Section - Section divider added */}
        <section className="pt-12 border-t border-neutral-200">
          <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Quick Actions</h2>
          
          {/* 4 column grid for quick actions, 32px gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickActions.map((action) => {
              const Icon = action.icon
              
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className="group block"
                >
                  <Card className="min-h-[220px] rounded-lg bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                    <CardContent className="p-6 h-full flex flex-col relative">
                      {/* Icon - Direct SVG render */}
                      <div className="mb-4">
                        <Icon className="w-12 h-12" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-2xl font-black text-text-primary mb-2 tracking-tight">
                        {action.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-text-secondary font-semibold mb-4">
                        {action.description}
                      </p>
                      
                      {/* CTA Button */}
                      <div className="mt-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-active text-text-primary rounded-xl font-black text-sm hover:bg-surface transition-colors duration-200 shadow-sm">
                          <span>Open</span>
                          <ChevronRightIcon className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      </div>

      {/* Bottom dock - Professional spacing with gap-6 (24px) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-surface/95 backdrop-blur-2xl border-2 border-border rounded-3xl shadow-2xl px-6 py-5 flex items-center gap-6">
          {apps.map((app) => {
            const Icon = app.icon
            return (
              <Link
                key={app.id}
                href={app.href}
                className="group relative flex-shrink-0"
              >
                <div className="transition-all duration-200 ease-out hover:scale-110 hover:-translate-y-2 cursor-pointer">
                  <Icon className="w-16 h-16" />
                </div>
                {/* Tooltip */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 bg-text-primary text-accent-foreground text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl">
                  {app.name}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-text-primary rotate-45" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
