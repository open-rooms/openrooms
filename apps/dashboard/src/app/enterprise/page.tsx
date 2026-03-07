'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@/components/icons'
import { FeatureGrid } from '@/components/FeatureCard'
import { PathDock } from '@/components/PathDock'
import { PageTransition } from '@/components/PageTransition'
import {
  RoomsIcon,
  AgentClustersIcon,
  DistributedExecutionIcon,
  ObservabilityIcon,
  AutomationIcon,
  IntegrationsIcon,
  SecurityIcon,
  ComplianceIcon,
  EnterpriseArchitectureIcon,
} from '@/components/icons/system'

const features = [
  {
    icon: RoomsIcon,
    title: 'Rooms',
    description: 'Isolated execution environments that contain agents, memory, and workflows at runtime.',
    href: '/enterprise/rooms',
  },
  {
    icon: AgentClustersIcon,
    title: 'Swarms',
    description: 'Deploy coordinated swarms of specialised agents that work in parallel across shared tasks.',
    href: '/enterprise/swarms',
  },
  {
    icon: DistributedExecutionIcon,
    title: 'Distributed Execution',
    description: 'BullMQ worker pools that scale horizontally — no bottlenecks, no single point of failure.',
    href: '/enterprise/execution',
  },
  {
    icon: ObservabilityIcon,
    title: 'Observability',
    description: 'Full telemetry across every agent action, tool call, reasoning trace, and workflow step.',
    href: '/enterprise/observability',
  },
  {
    icon: AutomationIcon,
    title: 'Automation',
    description: 'Schedule and trigger intelligent workflows across teams, time zones, and data pipelines.',
    href: '/enterprise/automation',
  },
  {
    icon: IntegrationsIcon,
    title: 'Integrations',
    description: 'Connect your infrastructure to any external API, database, or service via the tool registry.',
    href: '/enterprise/integrations',
  },
  {
    icon: SecurityIcon,
    title: 'Security',
    description: 'API key management, execution policies, and room-level access isolation built in.',
    href: '/enterprise/security',
  },
  {
    icon: ComplianceIcon,
    title: 'Compliance',
    description: 'Structured audit logs, execution records, and immutable run history for every operation.',
    href: '/enterprise/compliance',
  },
  {
    icon: EnterpriseArchitectureIcon,
    title: 'Architecture',
    description: 'Modular infrastructure: swap LLM providers, extend tool registries, and customise runtime.',
    href: '/enterprise/architecture',
  },
]

const stats = [
  { value: 'Unlimited', label: 'Agents per workspace' },
  { value: 'Real-time', label: 'Execution observability' },
  { value: 'Any LLM', label: 'OpenAI · Anthropic · Custom' },
  { value: 'REST API', label: 'Fully programmable' },
]

const dockItems = [
  { id: 'rooms', name: 'Rooms', icon: RoomsIcon, href: '/enterprise/rooms' },
  { id: 'clusters', name: 'Swarms', icon: AgentClustersIcon, href: '/enterprise/swarms' },
  { id: 'dist', name: 'Distributed Exec', icon: DistributedExecutionIcon, href: '/enterprise/execution' },
  { id: 'obs', name: 'Observability', icon: ObservabilityIcon, href: '/enterprise/observability' },
  { id: 'auto', name: 'Automation', icon: AutomationIcon, href: '/enterprise/automation' },
  { id: 'int', name: 'Integrations', icon: IntegrationsIcon, href: '/enterprise/integrations' },
  { id: 'sec', name: 'Security', icon: SecurityIcon, href: '/enterprise/security' },
  { id: 'comp', name: 'Compliance', icon: ComplianceIcon, href: '/enterprise/compliance' },
  { id: 'arch', name: 'Architecture', icon: EnterpriseArchitectureIcon, href: '/enterprise/architecture' },
]

export default function EnterprisePage() {
  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* Coloured accent bar */}
      <div className="h-1 w-full bg-gray-900 animate-accent-expand" />

      {/* Hero — clean white */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">

            {/* Left: copy */}
            <div className="max-w-2xl">
              <span
                className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-gray-100 text-gray-600 rounded-full mb-5 animate-hero-enter"
                style={{ animationDelay: '0s' }}
              >
                For Enterprise
              </span>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-5 leading-tight animate-hero-enter"
                style={{ animationDelay: '0.08s' }}
              >
                Operate Distributed<br />Intelligent Infrastructure
              </h1>
              <p
                className="text-base md:text-lg text-gray-500 leading-relaxed mb-8 max-w-xl animate-hero-enter"
                style={{ animationDelay: '0.16s' }}
              >
                OpenRooms gives enterprise teams a control plane for deploying, orchestrating, and observing autonomous AI systems at scale — across teams, APIs, and data pipelines.
              </p>
              <div className="flex flex-wrap gap-3 animate-hero-enter" style={{ animationDelay: '0.22s' }}>
                <Link
                  href="/control-plane"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-700 text-white text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Open Control Plane</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="/rooms"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Browse Rooms
                </Link>
              </div>
            </div>

            {/* Right: 2×2 stats grid (desktop) */}
            <div className="hidden md:grid grid-cols-2 gap-3 flex-shrink-0 w-72 animate-hero-enter" style={{ animationDelay: '0.3s' }}>
              {stats.map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-base font-black text-gray-900">{s.value}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip — dark, full-width, mobile + desktop */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="text-center animate-hero-enter"
                style={{ animationDelay: `${0.1 + i * 0.06}s` }}
              >
                <div className="text-lg md:text-xl font-black text-white">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="mb-8 animate-section-enter" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 rounded-full bg-gray-900" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Platform capabilities</h2>
          </div>
          <p className="text-sm text-gray-500 pl-4">Everything your team needs to deploy intelligent systems in production.</p>
        </div>
        <FeatureGrid features={features} variant="light" />
      </div>

      {/* Bottom CTA */}
      <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 pb-4">
        <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1">Ready to deploy at scale?</h3>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Start with a Room, add agents, connect your tools, and observe every step.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/agents/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <span>Create an Agent</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
            <Link
              href="/workflows"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white text-sm font-black rounded-xl transition-colors duration-200 whitespace-nowrap"
            >
              View Workflows
            </Link>
          </div>
        </div>
      </div>

      {/* Path Dock */}
      <PathDock items={dockItems} accentColor="#111111" />
    </div>
    </PageTransition>
  )
}
