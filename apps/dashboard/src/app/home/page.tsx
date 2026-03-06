'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@/components/icons'
import { useEffect, useState } from 'react'
import { getRooms, getAgents, getWorkflows, getRoomLogs } from '@/lib/api'
import {
  DashboardIcon,
  RoomsIcon,
  WorkflowIcon,
  AutomationIcon,
  LiveRunsIcon,
  ToolIcon,
  AgentIcon,
  RuntimeIcon,
  SettingsIcon,
  ArchitectureIcon,
} from '@/components/icons/system'

const dockApps = [
  { id: 'rooms', name: 'Rooms', icon: RoomsIcon, href: '/rooms' },
  { id: 'agents', name: 'Agents', icon: AgentIcon, href: '/agents' },
  { id: 'workflows', name: 'Workflows', icon: WorkflowIcon, href: '/workflows' },
  { id: 'automation', name: 'Automation', icon: AutomationIcon, href: '/automation' },
  { id: 'live-runs', name: 'Live Runs', icon: LiveRunsIcon, href: '/live-runs' },
  { id: 'tools', name: 'Tools', icon: ToolIcon, href: '/tools' },
  { id: 'runtime', name: 'Runtime', icon: RuntimeIcon, href: '/runtime' },
  { id: 'settings', name: 'Settings', icon: SettingsIcon, href: '/settings' },
  { id: 'control-plane', name: 'Control Plane', icon: DashboardIcon, href: '/control-plane' },
]

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState('')
  const [liveStats, setLiveStats] = useState({
    roomsActive: '…',
    agentsRunning: '…',
    workflowsDeployed: '…',
    systemStatus: 'Operational',
    events24h: '…',
  })
  const [liveActivity, setLiveActivity] = useState<{ time: string; message: string }[]>([])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchStats() {
      try {
        const [roomsData, agentsData, workflowsData] = await Promise.all([
          getRooms().catch(() => ({ rooms: [] })),
          getAgents().catch(() => ({ agents: [], count: 0 })),
          getWorkflows().catch(() => ({ workflows: [] })),
        ])

        const rooms = roomsData.rooms || []
        const activeRooms = rooms.filter((r) => r.status === 'RUNNING')
        const workflows = workflowsData.workflows || []
        const agentCount = agentsData.count ?? (agentsData.agents?.length ?? 0)

        // grab recent logs from active rooms for activity feed
        let recentLogs: { time: string; message: string }[] = []
        const targetRooms = rooms.filter(r => ['RUNNING', 'COMPLETED'].includes(r.status)).slice(0, 3)
        for (const room of targetRooms) {
          try {
            const logsData = await getRoomLogs(room.id)
            const entries = (logsData.logs || []).slice(0, 3).map(log => ({
              time: new Date(log.timestamp).toLocaleTimeString(),
              message: log.message,
            }))
            recentLogs = [...recentLogs, ...entries]
          } catch { /* skip */ }
        }

        setLiveStats({
          roomsActive: String(activeRooms.length),
          agentsRunning: String(agentCount),
          workflowsDeployed: String(workflows.filter(w => w.status === 'ACTIVE').length),
          systemStatus: 'Operational',
          events24h: recentLogs.length > 0 ? `${recentLogs.length}+` : '0',
        })

        if (recentLogs.length > 0) {
          setLiveActivity(recentLogs.slice(0, 5))
        }
      } catch {
        // keep defaults on error
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#E8DCC8] pb-24 animate-fade-in">
      {/* Top Navigation Bar */}
      <nav className="bg-[#F5F1E8] border-b-2 border-black sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <AgentIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-bold text-[#111111]">OpenRooms</span>
            <span className="hidden sm:inline-block px-3 py-1 bg-black text-white text-xs font-bold rounded-full">PLATFORM</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/home" className="text-xs sm:text-sm font-semibold text-[#111111] hover:text-[#F54E00] transition-colors duration-150">Home</Link>
            <Link href="/docs" className="hidden sm:inline-block text-sm font-semibold text-gray-700 hover:text-[#F54E00] transition-colors duration-150">Docs</Link>
            <Link href="/live-runs" className="hidden md:inline-block text-sm font-semibold text-gray-700 hover:text-[#F54E00] transition-colors duration-150">Status</Link>
            <Link href="https://github.com" className="hidden md:inline-block text-sm font-semibold text-gray-700 hover:text-[#F54E00] transition-colors duration-150">GitHub</Link>
            <button className="px-3 sm:px-4 py-2 bg-[#F54E00] hover:bg-[#E24600] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors duration-150">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Platform Hero */}
      <div className="bg-[#F5F1E8] border-b-2 border-black overflow-hidden">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <div className="max-w-4xl animate-slide-up">
            <div className="mb-4">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-600 inline-block animate-fade-in px-3 py-1 bg-gray-200 rounded-full">AUTONOMOUS AI CONTROL PLANE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] mb-4 sm:mb-6 leading-tight animate-slide-up hover:text-[#F54E00] transition-colors duration-500" style={{ animationDelay: '0.1s' }}>
              Orchestrate Intelligent Systems at Runtime
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              OpenRooms is a control plane for autonomous systems.<br className="hidden sm:block" />
              It orchestrates AI agents, workflows, APIs, and external tools into coordinated execution environments called Rooms.<br className="hidden sm:block" />
              Teams can deploy intelligent agents, automate complex tasks, and observe system behavior in real time.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/control-plane" className="px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm sm:text-base font-bold rounded-lg transition-colors duration-150 inline-flex items-center justify-center gap-2">
              <span>Launch Control Plane</span>
              <ChevronRightIcon className="w-5 h-5" />
            </Link>
            <Link href="/live-runs" className="px-6 py-3 bg-white border-2 border-black hover:bg-[#F54E00] hover:border-[#F54E00] text-[#111111] hover:text-white text-sm sm:text-base font-bold rounded-lg transition-colors duration-150 text-center">
              View Live System
            </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Product Path Cards */}
      <div className="bg-[#E8DCC8] py-12 sm:py-16 border-b-2 border-black">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Choose your path</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111111]">Who is OpenRooms for?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: RoomsIcon,
                title: 'Clients',
                description: 'Deploy intelligent agents that research, monitor, and automate tasks for you.',
                href: '/clients',
                cta: 'Explore Rooms',
                bg: 'bg-[#A78BFA]',
                hoverBg: 'hover:bg-[#9270f0]',
                textColor: 'text-white',
              },
              {
                icon: AgentIcon,
                title: 'Developers',
                description: 'Build, deploy, and orchestrate autonomous agents using APIs, workflows, and tools.',
                href: '/developers',
                cta: 'Open Control Plane',
                bg: 'bg-[#5EEAD4]',
                hoverBg: 'hover:bg-[#4dd4be]',
                textColor: 'text-[#111111]',
              },
              {
                icon: ArchitectureIcon,
                title: 'Enterprise',
                description: 'Operate large-scale intelligent systems across teams, infrastructure, and data pipelines.',
                href: '/enterprise',
                cta: 'Enterprise Architecture',
                bg: 'bg-[#FB923C]',
                hoverBg: 'hover:bg-[#e87d2a]',
                textColor: 'text-white',
              },
            ].map((card, i) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="group bg-[#F5F1E8] border-2 border-[#D4C4A8] rounded-2xl p-6 sm:p-8 flex flex-col hover:border-[#F54E00] hover:shadow-[4px_4px_0px_0px_rgba(245,78,0,0.4)] hover:-translate-y-1.5 transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${0.4 + i * 0.1}s` }}
                >
                  <div className="mb-5 transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-1">
                    <Icon className="w-20 h-20 sm:w-24 sm:h-24" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#111111] mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">{card.description}</p>
                  </div>
                  <Link
                    href={card.href}
                    className={`inline-flex items-center justify-center gap-2 w-full py-3 ${card.bg} ${card.hoverBg} ${card.textColor} text-sm font-bold rounded-xl transition-colors duration-150 group-hover:shadow-md`}
                  >
                    <span>{card.cta}</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Live Platform Status Strip */}
      <div className="border-b border-[#D4C4A8] bg-[#E8DCC8] py-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-8">
          <div className="bg-[#F5F1E8] border border-[#D4C4A8] rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-[#F54E00]">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-2 group">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-[#111111]">System Status:</span>
                <span className="text-sm font-semibold text-green-600 transition-all duration-200 group-hover:scale-110">{liveStats.systemStatus}</span>
              </div>
              <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <span className="text-sm text-gray-600">Rooms Active:</span>
                <span className="text-sm font-bold text-[#111111]">{liveStats.roomsActive}</span>
              </div>
              <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <span className="text-sm text-gray-600">Agents:</span>
                <span className="text-sm font-bold text-[#111111]">{liveStats.agentsRunning}</span>
              </div>
              <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <span className="text-sm text-gray-600">Workflows Deployed:</span>
                <span className="text-sm font-bold text-[#111111]">{liveStats.workflowsDeployed}</span>
              </div>
              <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
                <span className="text-sm text-gray-600">Recent Events:</span>
                <span className="text-sm font-bold text-[#111111]">{liveStats.events24h}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Platform Activity — dark terminal */}
      <div className="py-12 border-t border-[#D4C4A8] animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-8">
          <div className="bg-black rounded-2xl overflow-hidden">
            {/* Terminal title bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-gray-400 font-mono">live-activity — openrooms runtime</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-mono">live</span>
              </div>
            </div>
            {/* Terminal body */}
            <div className="p-6 font-mono min-h-[180px]">
              {liveActivity.length === 0 ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">$ waiting for activity...</p>
                  <p className="text-sm text-gray-600">Start a Room or run an agent to see live events here.</p>
                  <span className="inline-block w-2 h-4 bg-gray-500 animate-pulse ml-0.5" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  {liveActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm animate-fade-in" style={{ animationDelay: `${index * 0.08}s` }}>
                      <span className="text-[#FB923C] font-bold shrink-0">[{activity.time}]</span>
                      <span className="text-[#86EFAC]">{activity.message}</span>
                    </div>
                  ))}
                  <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-0.5 mt-1" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dock */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up px-4" style={{ animationDelay: '2.3s' }}>
        <div className="bg-white/95 backdrop-blur-md border-2 border-black rounded-2xl px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(245,78,0,1)] transition-all duration-500 hover:scale-105 overflow-x-auto">
          {dockApps.map((app, index) => {
            const Icon = app.icon
            return (
              <Link 
                key={app.id} 
                href={app.href} 
                className="group relative flex-shrink-0 animate-bounce-in"
                style={{ animationDelay: `${2.4 + index * 0.05}s` }}
              >
                <div className="transition-all duration-500 cursor-pointer hover:scale-150 hover:-translate-y-3 active:scale-90 hover:rotate-12 hover:animate-wiggle">
                  <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#F54E00] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none group-hover:-translate-y-2 shadow-xl animate-pop">
                  {app.name}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#F54E00] rotate-45" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

