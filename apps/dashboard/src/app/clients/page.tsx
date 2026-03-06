'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@/components/icons'
import { FeatureGrid } from '@/components/FeatureCard'
import { PathDock } from '@/components/PathDock'
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
    href: '/rooms',
  },
  {
    icon: AgentIcon,
    title: 'Agents',
    description: 'Intelligent AI agents that perceive, reason, and act autonomously.',
    href: '/agents',
  },
  {
    icon: WorkflowIcon,
    title: 'Workflows',
    description: 'Multi-step automation pipelines that chain agents and tools together.',
    href: '/workflows',
  },
  {
    icon: AutomationIcon,
    title: 'Automations',
    description: 'Scheduled and event-driven tasks that run without manual intervention.',
    href: '/automation',
  },
  {
    icon: RuntimeIcon,
    title: 'Live Activity',
    description: 'Real-time feed showing exactly what your agents are doing right now.',
    href: '/live-runs',
  },
  {
    icon: MemoryIcon,
    title: 'Knowledge',
    description: 'Persistent memory and context that agents build up over time.',
    href: '/rooms',
  },
  {
    icon: ReportsIcon,
    title: 'Reports',
    description: 'Summarised outputs and analytics from completed agent runs.',
    href: '/live-runs',
  },
  {
    icon: IntegrationsIcon,
    title: 'Integrations',
    description: 'Connect agents to external APIs, data sources, and platforms.',
    href: '/tools',
  },
  {
    icon: ToolIcon,
    title: 'Tools',
    description: 'Pre-built capabilities agents can invoke: search, fetch, compute, and more.',
    href: '/tools',
  },
]

const dockItems = [
  { id: 'rooms', name: 'Rooms', icon: RoomsIcon, href: '/rooms' },
  { id: 'agents', name: 'Agents', icon: AgentIcon, href: '/agents' },
  { id: 'workflows', name: 'Workflows', icon: WorkflowIcon, href: '/workflows' },
  { id: 'automation', name: 'Automations', icon: AutomationIcon, href: '/automation' },
  { id: 'live', name: 'Live Activity', icon: RuntimeIcon, href: '/live-runs' },
  { id: 'knowledge', name: 'Knowledge', icon: MemoryIcon, href: '/rooms' },
  { id: 'reports', name: 'Reports', icon: ReportsIcon, href: '/live-runs' },
  { id: 'integrations', name: 'Integrations', icon: IntegrationsIcon, href: '/tools' },
  { id: 'tools', name: 'Tools', icon: ToolIcon, href: '/tools' },
]

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-[#E8DCC8] pb-28">
      {/* Hero */}
      <div className="bg-[#F5F1E8] border-b-2 border-black">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase px-3 py-1 bg-[#E8DCC8] rounded-full animate-hero-enter" style={{ animationDelay: '0s' }}>For Clients</span>
            <h1 className="text-3xl md:text-5xl font-bold text-[#111111] mt-4 mb-4 leading-tight animate-hero-enter" style={{ animationDelay: '0.08s' }}>
              Deploy Intelligent<br />Automation
            </h1>
            <p className="text-base text-gray-600 leading-relaxed mb-6 max-w-xl animate-hero-enter" style={{ animationDelay: '0.16s' }}>
              OpenRooms runs AI agents that research, monitor, and automate tasks on your behalf — inside isolated Rooms built for your goals.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/rooms" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FDA4AF] hover:bg-[#fb7185] text-[#111111] text-sm font-bold rounded-xl transition-colors">
                <span>Browse Rooms</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <Link href="/agents" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-black hover:bg-gray-50 text-[#111111] text-sm font-bold rounded-xl transition-colors">
                View Agents
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#111111] mb-1">What you get</h2>
          <p className="text-sm text-gray-500">Hover any card to learn more. Click to open.</p>
        </div>
        <FeatureGrid features={features} />
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[#D4C4A8] py-12">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8 text-center">
          <h3 className="text-2xl font-bold text-[#111111] mb-3">Ready to launch your first Room?</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">Create a Room, add agents, and watch them automate your workflow in real time.</p>
          <Link href="/rooms?action=create" className="inline-flex items-center gap-2 px-7 py-3 bg-[#FDA4AF] hover:bg-[#fb7185] text-[#111111] font-bold rounded-xl transition-colors">
            <span>Create a Room</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Path Dock */}
      <PathDock items={dockItems} accentColor="#A78BFA" />
    </div>
  )
}
