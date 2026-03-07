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
  LiveActivityIcon,
  LogsIcon,
  MemoryIcon,
  DeveloperIcon,
  BuildIcon,
  GovernIcon,
  ClientsIcon,
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

const categoryGroups = [
  {
    tag: 'BUILD',
    icon: BuildIcon,
    items: ['Agents', 'Workflows', 'Tools'],
  },
  {
    tag: 'DEPLOY & RUN',
    icon: RuntimeIcon,
    items: ['Rooms', 'Runtime', 'Automation'],
  },
  {
    tag: 'OBSERVE & GOVERN',
    icon: GovernIcon,
    items: ['Live Runs', 'Dashboard', 'Control Plane'],
  },
]

const featureHighlights = [
  { icon: RuntimeIcon, title: 'Zero-Drift Execution', desc: 'Agents run on rails. Every token, tool call, and decision is logged — reproducible in production, auditable forever.' },
  { icon: LiveActivityIcon, title: 'Trigger Anything', desc: 'Webhooks, schedules, API calls, agent signals. If something can emit an event, OpenRooms will act on it — without code.' },
  { icon: WorkflowIcon, title: 'Parallel Agent Networks', desc: 'Deploy clusters of specialist agents that divide work, share context, and converge on results — no human handholding.' },
  { icon: LogsIcon, title: 'Execution X-Ray', desc: 'Not just logs. Structured telemetry on every step — filter, replay, and debug any execution in milliseconds.' },
  { icon: MemoryIcon, title: 'Memory That Compounds', desc: "Agents don't start blank. Vectorised memory lets them accumulate context across every room and every run." },
  { icon: ToolIcon, title: 'Infinite Surface Area', desc: 'Any REST API, database, or platform becomes an agent-native tool in one config block. No SDK. No boilerplate.' },
]

const poweredByItems = [
  'Deterministic Runtime',
  'Event-Driven Automation',
  'Multi-Model LLM Execution',
  'Vector Memory',
  'BullMQ Job Queue',
  'PostgreSQL',
  'Redis',
  'Fastify API',
  'Next.js Dashboard',
  'OpenAI Compatible',
  'Webhook Triggers',
  'Real-time Observability',
  'Blockchain Integrations',
  'Horizontal Scaling',
  'API-First Design',
  'pnpm Monorepo',
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

  // Build live status marquee items from live stats
  const statusMarqueeItems = [
    { label: '● System', value: liveStats.systemStatus, color: 'text-green-400' },
    { label: 'Rooms Active', value: liveStats.roomsActive },
    { label: 'Agents Running', value: liveStats.agentsRunning },
    { label: 'Workflows', value: liveStats.workflowsDeployed },
    { label: 'Events', value: liveStats.events24h },
    { label: 'Clock', value: currentTime },
  ]

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
              OpenRooms is the control plane for deploying and orchestrating AI agents,
              workflows, and autonomous systems across models, APIs, and blockchains.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <a href="#paths" className="px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm sm:text-base font-bold rounded-lg transition-colors duration-150 inline-flex items-center justify-center gap-2">
                <span>Start for Free</span>
                <ChevronRightIcon className="w-5 h-5" />
              </a>
              <Link href="/ecosystem" className="px-6 py-3 bg-white border-2 border-black hover:bg-[#F54E00] hover:border-[#F54E00] text-[#111111] hover:text-white text-sm sm:text-base font-bold rounded-lg transition-colors duration-150 text-center">
                Explore Infrastructure
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Path Cards + Module Chips (same section) ── */}
      <div id="paths" className="bg-[#E8DCC8] py-12 sm:py-16 border-b-2 border-black">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Choose your path</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111111]">Who is OpenRooms for?</h2>
          </div>

          {/* 3 path cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-6">
            {[
              {
                icon: ClientsIcon,
                title: 'Clients',
                description: 'Deploy intelligent agents that research, monitor, and automate tasks for you.',
                href: '/clients',
                cta: 'Explore Rooms',
                bg: 'bg-[#FDA4AF]',
                hoverBg: 'hover:bg-[#fb7185]',
                textColor: 'text-[#111111]',
                iconBg: '',
              },
              {
                icon: DeveloperIcon,
                title: 'Developers',
                description: 'Build, deploy, and orchestrate autonomous agents using APIs, workflows, and tools.',
                href: '/developers',
                cta: 'Open Control Plane',
                bg: 'bg-[#F54E00]',
                hoverBg: 'hover:bg-[#E24600]',
                textColor: 'text-white',
                iconBg: '',
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
                iconBg: '',
              },
            ].map((card, i) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="group bg-[#F5F1E8] border-2 border-[#D4C4A8] rounded-2xl p-6 sm:p-8 flex flex-col hover:border-[#F54E00] hover:shadow-[4px_4px_0px_0px_rgba(245,78,0,0.4)] hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${0.4 + i * 0.1}s` }}
                >
                  <div className="mb-5 transition-transform duration-300 group-hover:scale-105">
                    <div className={`inline-flex items-center justify-center rounded-2xl p-2 ${card.iconBg}`}>
                      <Icon className="w-20 h-20 sm:w-24 sm:h-24" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#111111] mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">{card.description}</p>
                  </div>
                  <Link
                    href={card.href}
                    className={`inline-flex items-center justify-center gap-2 w-full py-3 ${card.bg} ${card.hoverBg} ${card.textColor} text-sm font-bold rounded-xl transition-colors duration-200`}
                  >
                    <span>{card.cta}</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* BUILD / DEPLOY & RUN / OBSERVE & GOVERN — same section, beneath path cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* BUILD — same pill badge style as the others */}
            <div className="bg-[#F5F1E8] border border-[#D4C4A8] rounded-2xl p-5 flex items-start gap-4">
              <BuildIcon className="w-9 h-9 flex-shrink-0" />
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-[#F54E00] text-white rounded text-[10px] font-black tracking-widest mb-1.5">BUILD</span>
                <ul className="space-y-0.5">
                  {['Agents', 'Workflows', 'Tools'].map(item => (
                    <li key={item} className="text-sm text-gray-700 font-medium leading-snug">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {/* DEPLOY & RUN — shape/pill is CTA orange */}
            <div className="bg-[#F5F1E8] border border-[#D4C4A8] rounded-2xl p-5 flex items-start gap-4">
              <RuntimeIcon className="w-9 h-9 flex-shrink-0" />
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-[#F54E00] text-white rounded text-[10px] font-black tracking-widest mb-1.5">DEPLOY &amp; RUN</span>
                <ul className="space-y-0.5">
                  {['Rooms', 'Runtime', 'Automation'].map(item => (
                    <li key={item} className="text-sm text-gray-700 font-medium leading-snug">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {/* OBSERVE & GOVERN — shape/pill is CTA orange */}
            <div className="bg-[#F5F1E8] border border-[#D4C4A8] rounded-2xl p-5 flex items-start gap-4">
              <GovernIcon className="w-9 h-9 flex-shrink-0" />
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-[#F54E00] text-white rounded text-[10px] font-black tracking-widest mb-1.5">OBSERVE &amp; GOVERN</span>
                <ul className="space-y-0.5">
                  {['Live Runs', 'Dashboard', 'Control Plane'].map(item => (
                    <li key={item} className="text-sm text-gray-700 font-medium leading-snug">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live System Status — left-scrolling marquee ── */}
      <div className="bg-[#111111] border-b border-gray-800 py-3 overflow-hidden">
        <div className="relative flex items-center">
          {/* Left label */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 z-10 bg-[#111111] border-r border-gray-700 pr-5 mr-0">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-green-400 uppercase whitespace-nowrap">System Live</span>
          </div>
          {/* Fade left edge */}
          <div className="pointer-events-none absolute left-[120px] top-0 bottom-0 w-12 bg-gradient-to-r from-[#111111] to-transparent z-10" />
          {/* Fade right edge */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#111111] to-transparent z-10" />
          {/* Scrolling items */}
          <div className="flex gap-0 animate-marquee whitespace-nowrap w-max pl-4">
            {[...statusMarqueeItems, ...statusMarqueeItems].map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-5 text-xs font-mono border-r border-gray-800 last:border-r-0">
                <span className="text-gray-500">{s.label}</span>
                <span className={`font-bold ${s.color ?? 'text-white'}`}>{s.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Runtime Capabilities — split layout with vertical ticker ── */}
      <div className="bg-[#111111] py-16 border-b-2 border-black overflow-hidden">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            {/* Left — static content */}
            <div className="lg:w-2/5 flex-shrink-0">
              <span className="text-[10px] font-black tracking-widest text-[#F54E00] uppercase mb-3 inline-block">Runtime Capabilities</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
                Infrastructure<br />That Doesn&apos;t Flinch.
              </h2>
              <p className="text-base text-gray-400 leading-relaxed mb-8 max-w-sm">
                While you sleep, agents run. Every decision logged, every execution auditable, every failure recoverable. Built to operate without supervision.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/control-plane" className="inline-flex items-center gap-2 px-5 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-xl transition-colors duration-200 w-fit">
                  <span>See it in action</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
                <Link href="/live-runs" className="inline-flex items-center gap-2 px-5 py-3 border border-gray-700 hover:border-[#F54E00] text-gray-400 hover:text-white text-sm font-semibold rounded-xl transition-colors duration-200 w-fit">
                  Live Runs
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-xl font-black text-[#F54E00]">∞</div>
                  <div className="text-xs text-gray-500 mt-0.5">Agents per workspace</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-xl font-black text-white">100%</div>
                  <div className="text-xs text-gray-500 mt-0.5">Execution logged</div>
                </div>
              </div>
            </div>
            {/* Right — vertical scrolling ticker */}
            <div className="lg:w-3/5 relative">
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#111111] to-transparent z-10" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111111] to-transparent z-10" />
              <div className="overflow-hidden h-[420px]">
                <div className="animate-scroll-up flex flex-col gap-3">
                  {[...featureHighlights, ...featureHighlights].map((feat, i) => {
                    const Icon = feat.icon
                    return (
                      <div key={`${feat.title}-${i}`} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4 hover:bg-white/10 hover:border-white/20 transition-colors duration-200 flex-shrink-0">
                        <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                          <Icon className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white mb-1">{feat.title}</h3>
                          <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Platform Activity — dark terminal ── */}
      <div className="py-12 border-b-2 border-black bg-[#E8DCC8]">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-8">
          <div className="mb-6">
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Observability</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111111]">Live Platform Activity</h2>
          </div>
          <div className="bg-black rounded-2xl overflow-hidden">
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
                    <div key={index} className="flex items-start gap-3 text-sm" style={{ animationDelay: `${index * 0.08}s` }}>
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

      {/* ── Powered By — scrolling marquee ── */}
      <div className="bg-[#F5F1E8] border-b-2 border-black py-5 overflow-hidden">
        <p className="text-center text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">Powered by</p>
        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F5F1E8] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F5F1E8] to-transparent z-10" />
          {/* Marquee track — duplicated for seamless loop */}
          <div className="flex gap-3 animate-marquee whitespace-nowrap w-max">
            {[...poweredByItems, ...poweredByItems].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center px-4 py-2 bg-[#E8DCC8] border border-[#D4C4A8] rounded-full text-xs font-semibold text-gray-700 flex-shrink-0 hover:border-[#F54E00] hover:bg-[#FDE8D8] transition-colors duration-150 cursor-default"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Dock ── */}
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
                <div className="transition-all duration-300 cursor-pointer hover:scale-125 hover:-translate-y-2 active:scale-95">
                  <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#F54E00] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none group-hover:-translate-y-2 shadow-xl">
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
