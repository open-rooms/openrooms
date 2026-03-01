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
    <div className="min-h-screen bg-[#F8F3EE] relative">
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
            {/* Agent Icon - Colorful teal bot */}
            <AgentIcon className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
                OpenRooms
              </h1>
              <p className="text-xs text-gray-600 font-normal tracking-wide mt-1">AI Agent Control Plane</p>
            </div>
          </div>
        </header>

        {/* Apps Grid - CSS Grid with 3/2/1 responsive columns, 32px gap */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => {
              const Icon = app.icon
              
              return (
                <Link
                  key={app.id}
                  href={app.href}
                  className="group block"
                >
                  <Card className="min-h-[220px] rounded-lg border-2 border-[#C9C3BD] bg-white hover:border-[#B8B2AC] transition-all duration-150 ease-in-out cursor-pointer overflow-hidden">
                    {/* Terminal-style header bar */}
                    <div className="h-8 bg-[#F3EDE7] border-b border-[#DED8D2] flex items-center px-3">
                      <div className="flex items-center gap-2">
                        {/* Running status indicator */}
                        <div className="relative">
                          <div className="w-2 h-2 rounded-full bg-[#D9480F]"></div>
                          <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#D9480F] opacity-30 animate-pulse"></div>
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{app.name}</span>
                      </div>
                    </div>
                    
                    {/* Content area with subtle inset shadow */}
                    <CardContent className="p-5 h-[calc(100%-2rem)] flex flex-col bg-[#FDFCFB] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
                      <div className="mb-5">
                        <Icon className="w-14 h-14" />
                      </div>
                      
              <h3 className="text-lg font-medium text-[#111111] mb-2 tracking-tight">
                        {app.name}
                      </h3>
                      
              {/* Description */}
              <p className="text-sm text-gray-600 font-normal mb-5">
                        {app.description}
                      </p>
                      
              {/* Arrow indicator */}
              <div className="mt-auto flex items-center gap-2 text-sm font-medium text-gray-600 group-hover:text-[#F54E00] transition-colors duration-120 ease-in-out">
                        <span>Open</span>
                        <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-120 ease-in-out" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="pt-12 border-t border-[#DED8D2]">
          <h2 className="text-xl font-semibold text-[#111111] mb-6 tracking-tight">Quick Actions</h2>
          
          {/* 4 column grid for quick actions, reduced gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className="group block"
                >
                  <Card className="min-h-[220px] rounded-lg border border-[#DED8D2] bg-white hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out cursor-pointer">
                    <CardContent className="p-5 h-full flex flex-col relative">
                      <div className="mb-4">
                        <Icon className="w-12 h-12" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-semibold text-[#111111] mb-2 tracking-tight">
                        {action.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 font-normal mb-4">
                        {action.description}
                      </p>
                      
                      {/* CTA Button */}
                      <div className="mt-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F54E00] text-white rounded-md font-medium text-sm hover:bg-[#E24600] active:bg-[#D03D00] transition-colors duration-120 ease-in-out">
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
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-6 py-4 flex items-center gap-6">
          {apps.map((app) => {
            const Icon = app.icon
            return (
              <Link
                key={app.id}
                href={app.href}
                className="group relative flex-shrink-0"
              >
                <div className="transition-all duration-150 ease-in-out cursor-pointer hover:bg-[#F1EBE6] rounded-lg p-2 -m-2">
                  <Icon className="w-12 h-12 opacity-100 hover:opacity-90 transition-opacity duration-120" />
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
