'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@/components/icons'
import { FeatureGrid } from '@/components/FeatureCard'
import {
  RoomsIcon,
  AgentClustersIcon,
  WorkflowIcon,
  LiveActivityIcon,
  AutomationIcon,
  IntegrationsIcon,
  SecurityIcon,
  ComplianceIcon,
  ArchitectureIcon,
} from '@/components/icons/system'

const features = [
  {
    icon: RoomsIcon,
    title: 'Rooms',
    description: 'Isolated execution environments that contain agents, memory, and workflows at runtime.',
    href: '/rooms',
  },
  {
    icon: AgentClustersIcon,
    title: 'Agent Clusters',
    description: 'Deploy networks of specialised agents that coordinate across shared tasks and data.',
    href: '/agents',
  },
  {
    icon: WorkflowIcon,
    title: 'Distributed Execution',
    description: 'BullMQ worker pools that scale horizontally — no bottlenecks, no single point of failure.',
    href: '/runtime',
  },
  {
    icon: LiveActivityIcon,
    title: 'Observability',
    description: 'Full telemetry across every agent action, tool call, reasoning trace, and workflow step.',
    href: '/live-runs',
  },
  {
    icon: AutomationIcon,
    title: 'Automation',
    description: 'Schedule and trigger intelligent workflows across teams, time zones, and data pipelines.',
    href: '/automation',
  },
  {
    icon: IntegrationsIcon,
    title: 'Integrations',
    description: 'Connect your infrastructure to any external API, database, or service via the tool registry.',
    href: '/tools',
  },
  {
    icon: SecurityIcon,
    title: 'Security',
    description: 'API key management, execution policies, and room-level access isolation built in.',
    href: '/settings',
  },
  {
    icon: ComplianceIcon,
    title: 'Compliance',
    description: 'Structured audit logs, execution records, and immutable run history for every operation.',
    href: '/live-runs',
  },
  {
    icon: ArchitectureIcon,
    title: 'Architecture',
    description: 'Modular infrastructure: swap LLM providers, extend tool registries, and customise runtime.',
    href: '/control-plane',
  },
]

const stats = [
  { value: 'Unlimited', label: 'Agents per workspace' },
  { value: 'Real-time', label: 'Execution observability' },
  { value: 'Any LLM', label: 'OpenAI · Anthropic · Custom' },
  { value: 'REST API', label: 'Fully programmable' },
]

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#E8DCC8]">
      {/* Hero */}
      <div className="bg-[#F5F1E8] border-b-2 border-black">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8 py-12 md:py-20">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase px-3 py-1 bg-[#E8DCC8] rounded-full">For Enterprise</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#111111] mt-5 mb-5 leading-tight">
              Operate Distributed<br />Intelligent Infrastructure
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl">
              OpenRooms gives enterprise teams a control plane for deploying, orchestrating, and observing autonomous AI systems at scale — across teams, APIs, and data pipelines.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/control-plane" className="inline-flex items-center gap-2 px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-xl transition-colors">
                <span>Open Control Plane</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <Link href="/rooms" className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-black hover:bg-gray-50 text-[#111111] text-sm font-bold rounded-xl transition-colors">
                Browse Rooms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-black py-5 border-b-2 border-black">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg md:text-xl font-bold text-[#F54E00]">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#111111] mb-1">Platform capabilities</h2>
          <p className="text-sm text-gray-500">Everything your team needs to deploy intelligent systems in production.</p>
        </div>
        <FeatureGrid features={features} />
      </div>

      {/* CTA */}
      <div className="border-t border-[#D4C4A8] py-12">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8">
          <div className="bg-[#F5F1E8] border-2 border-[#D4C4A8] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold text-[#111111] mb-3">Ready to deploy at scale?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Start with a Room, add agents, connect your tools, and observe every step. The control plane gives your team complete visibility.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link href="/agents/create" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap">
                <span>Create an Agent</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <Link href="/workflows" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-black hover:bg-gray-50 text-[#111111] text-sm font-bold rounded-xl transition-colors whitespace-nowrap">
                View Workflows
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
