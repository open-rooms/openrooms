'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@/components/icons'
import { FeatureGrid } from '@/components/FeatureCard'
import { PathDock } from '@/components/PathDock'
import { PageTransition } from '@/components/PageTransition'
import {
  RoomsIcon,
  AgentIcon,
  WorkflowIcon,
  AutomationIcon,
  RuntimeIcon,
  MemoryIcon,
  ReportsIcon,
  IntegrationsIcon,
  ToolIcon,
} from '@/components/icons/system'

const features = [
  {
    icon: RoomsIcon,
    title: 'Rooms',
    description: 'Coordinated environments where agents work together on your tasks.',
    href: '/clients/rooms',
  },
  {
    icon: AgentIcon,
    title: 'Agents',
    description: 'Intelligent AI agents that perceive, reason, and act autonomously.',
    href: '/clients/agents',
  },
  {
    icon: WorkflowIcon,
    title: 'Workflows',
    description: 'Multi-step automation pipelines that chain agents and tools together.',
    href: '/clients/workflows',
  },
  {
    icon: AutomationIcon,
    title: 'Automations',
    description: 'Scheduled and event-driven tasks that run without manual intervention.',
    href: '/clients/automations',
  },
  {
    icon: RuntimeIcon,
    title: 'Live Activity',
    description: 'Real-time feed showing exactly what your agents are doing right now.',
    href: '/clients/activity',
  },
  {
    icon: MemoryIcon,
    title: 'Knowledge',
    description: 'Persistent memory and context that agents build up over time.',
    href: '/clients/knowledge',
  },
  {
    icon: ReportsIcon,
    title: 'Reports',
    description: 'Summarised outputs and analytics from completed agent runs.',
    href: '/clients/reports',
  },
  {
    icon: IntegrationsIcon,
    title: 'Integrations',
    description: 'Connect agents to external APIs, data sources, and platforms.',
    href: '/clients/integrations',
  },
  {
    icon: ToolIcon,
    title: 'Tools',
    description: 'Pre-built capabilities agents can invoke: search, fetch, compute, and more.',
    href: '/clients/tools',
  },
]

const highlights = [
  { value: 'Autonomous', label: 'Agents working for you' },
  { value: 'Real-time', label: 'Activity visibility' },
  { value: 'No-code', label: 'Workflow builder' },
  { value: 'Any task', label: 'Research · Monitor · Automate' },
]

const dockItems = [
  { id: 'rooms', name: 'Rooms', icon: RoomsIcon, href: '/clients/rooms' },
  { id: 'agents', name: 'Agents', icon: AgentIcon, href: '/clients/agents' },
  { id: 'workflows', name: 'Workflows', icon: WorkflowIcon, href: '/clients/workflows' },
  { id: 'automation', name: 'Automations', icon: AutomationIcon, href: '/clients/automations' },
  { id: 'live', name: 'Live Activity', icon: RuntimeIcon, href: '/clients/activity' },
  { id: 'knowledge', name: 'Knowledge', icon: MemoryIcon, href: '/clients/knowledge' },
  { id: 'reports', name: 'Reports', icon: ReportsIcon, href: '/clients/reports' },
  { id: 'integrations', name: 'Integrations', icon: IntegrationsIcon, href: '/clients/integrations' },
  { id: 'tools', name: 'Tools', icon: ToolIcon, href: '/clients/tools' },
]

export default function ClientsPage() {
  return (
    <PageTransition>
    <div className="min-h-screen bg-[#F9F5EF] pb-32">

      {/* Coloured accent bar */}
      <div className="h-1 w-full bg-[#FDA4AF] animate-accent-expand" />

      {/* Hero */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            {/* Left: copy */}
            <div className="max-w-xl">
              <span
                className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-4 animate-hero-enter"
                style={{ background: '#FDA4AF', color: '#111', animationDelay: '0s' }}
              >
                For Clients
              </span>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] mb-4 leading-tight animate-hero-enter"
                style={{ animationDelay: '0.08s' }}
              >
                Deploy Intelligent<br />Automation
              </h1>
              <p
                className="text-base text-gray-600 leading-relaxed mb-8 animate-hero-enter"
                style={{ animationDelay: '0.16s' }}
              >
                OpenRooms runs AI agents that research, monitor, and automate tasks on your behalf — inside isolated Rooms built for your goals.
              </p>
              <div className="flex flex-wrap gap-3 animate-hero-enter" style={{ animationDelay: '0.22s' }}>
                <Link
                  href="/rooms"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: '#FDA4AF', color: '#111111' }}
                >
                  <span>Browse Rooms</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-[#DDD5C8] hover:bg-gray-50 text-[#111111] text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  View Agents
                </Link>
              </div>
            </div>

            {/* Right: stats strip (desktop only) */}
            <div className="hidden md:grid grid-cols-2 gap-3 flex-shrink-0 w-64 animate-hero-enter" style={{ animationDelay: '0.3s' }}>
              {highlights.map((h) => (
                <div key={h.label} className="bg-white border border-[#D4C4A8] rounded-xl p-4 text-center">
                  <div className="text-base font-black text-[#111]">{h.value}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">{h.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile stats strip */}
      <div className="md:hidden bg-black border-b border-gray-800">
        <div className="grid grid-cols-2 divide-x divide-gray-800">
          {highlights.map((h) => (
            <div key={h.label} className="px-4 py-3 text-center">
              <div className="text-sm font-black text-white">{h.value}</div>
              <div className="text-[10px] text-gray-400 leading-snug">{h.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="mb-8 animate-section-enter" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 rounded-full" style={{ background: '#FDA4AF' }} />
            <h2 className="text-xl sm:text-2xl font-black text-[#111111]">What you get</h2>
          </div>
          <p className="text-sm text-gray-500 pl-4">Everything you need to deploy autonomous intelligence.</p>
        </div>
        <FeatureGrid features={features} />
      </div>

      {/* Bottom CTA */}
      <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 pb-4">
        <div
          className="rounded-2xl border border-[#DDD5C8] p-6 sm:p-8 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ background: '#FDA4AF' }}
        >
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#111111] mb-1">Ready to launch your first Room?</h3>
            <p className="text-sm text-[#333] max-w-sm">Create a Room, add agents, and watch them automate your workflow in real time.</p>
          </div>
          <Link
            href="/rooms?action=create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] hover:bg-black text-white text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
          >
            <span>Create a Room</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Path Dock */}
      <PathDock items={dockItems} accentColor="#FDA4AF" />
    </div>
    </PageTransition>
  )
}
