'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/PageTransition'
import { ChevronRightIcon } from '@/components/icons'
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
  DashboardIcon,
  LiveRunsIcon,
  LogsIcon,
  APIIcon,
  SDKIcon,
  AgentClustersIcon,
  DistributedExecutionIcon,
  ObservabilityIcon,
  SecurityIcon,
  ComplianceIcon,
  EnterpriseArchitectureIcon,
} from '@/components/icons/system'

const paths = [
  {
    id: 'clients',
    label: 'Client Platform',
    tagline: 'Autonomous intelligence for teams and individuals.',
    accentColor: '#FDA4AF',
    textOnAccent: '#111',
    cta: 'Start Client Path',
    href: '/clients',
    features: [
      { icon: RoomsIcon, title: 'Rooms', desc: 'Coordinated environments where agents work together.', href: '/clients/rooms' },
      { icon: AgentIcon, title: 'Agents', desc: 'Intelligent agents that perceive, reason, and act.', href: '/clients/agents' },
      { icon: WorkflowIcon, title: 'Workflows', desc: 'Multi-step pipelines chaining agents and tools.', href: '/clients/workflows' },
      { icon: AutomationIcon, title: 'Automations', desc: 'Scheduled and event-driven execution.', href: '/clients/automations' },
      { icon: RuntimeIcon, title: 'Live Activity', desc: 'Real-time feed of what your agents are doing.', href: '/clients/activity' },
      { icon: MemoryIcon, title: 'Knowledge', desc: 'Persistent memory that agents build over time.', href: '/clients/knowledge' },
      { icon: ReportsIcon, title: 'Reports', desc: 'Analytics and summaries from completed runs.', href: '/clients/reports' },
      { icon: IntegrationsIcon, title: 'Integrations', desc: 'Connect agents to external APIs and platforms.', href: '/clients/integrations' },
      { icon: ToolIcon, title: 'Tools', desc: 'Pre-built capabilities: search, fetch, compute.', href: '/clients/tools' },
    ],
  },
  {
    id: 'developers',
    label: 'Developer Infrastructure',
    tagline: 'The control plane for building production agent systems.',
    accentColor: '#F54E00',
    textOnAccent: '#fff',
    cta: 'Start Developer Path',
    href: '/developers',
    features: [
      { icon: DashboardIcon, title: 'Control Plane', desc: 'Central interface for managing all infrastructure.', href: '/developers/control-plane' },
      { icon: AgentIcon, title: 'Agents', desc: 'Design agents with goals, tools, and LLM configs.', href: '/developers/agents' },
      { icon: WorkflowIcon, title: 'Workflows', desc: 'Build multi-agent pipelines with branching logic.', href: '/developers/workflows' },
      { icon: ToolIcon, title: 'Tools', desc: 'Register HTTP tools and custom executors.', href: '/developers/tools' },
      { icon: RuntimeIcon, title: 'Runtime', desc: 'BullMQ execution engine with Redis queues.', href: '/developers/runtime' },
      { icon: LiveRunsIcon, title: 'Runs', desc: 'Full execution history and per-run metadata.', href: '/developers/runs' },
      { icon: LogsIcon, title: 'Logs', desc: 'Structured logs with reasoning traces and tool calls.', href: '/developers/logs' },
      { icon: APIIcon, title: 'API', desc: 'REST API for triggering runs and managing state.', href: '/developers/api' },
      { icon: SDKIcon, title: 'SDK', desc: 'Typed TypeScript packages for programmatic access.', href: '/developers/sdk' },
    ],
  },
  {
    id: 'enterprise',
    label: 'Enterprise Capabilities',
    tagline: 'Operate distributed AI infrastructure at scale.',
    accentColor: '#111827',
    textOnAccent: '#fff',
    cta: 'Start Enterprise Path',
    href: '/enterprise',
    features: [
      { icon: RoomsIcon, title: 'Rooms', desc: 'Isolated, audited execution environments.', href: '/enterprise/rooms' },
      { icon: AgentClustersIcon, title: 'Swarms', desc: 'Coordinated multi-agent swarms working in parallel.', href: '/enterprise/swarms' },
      { icon: DistributedExecutionIcon, title: 'Distributed Execution', desc: 'Horizontally scalable worker pools.', href: '/enterprise/execution' },
      { icon: ObservabilityIcon, title: 'Observability', desc: 'Full telemetry across every agent and workflow.', href: '/enterprise/observability' },
      { icon: AutomationIcon, title: 'Automation', desc: 'Enterprise-scale scheduled intelligent workflows.', href: '/enterprise/automation' },
      { icon: IntegrationsIcon, title: 'Integrations', desc: 'Connect to any API, database, or service.', href: '/enterprise/integrations' },
      { icon: SecurityIcon, title: 'Security', desc: 'API key management and execution policies.', href: '/enterprise/security' },
      { icon: ComplianceIcon, title: 'Compliance', desc: 'Immutable audit logs and run history.', href: '/enterprise/compliance' },
      { icon: EnterpriseArchitectureIcon, title: 'Architecture', desc: 'Modular infrastructure, fully customisable.', href: '/enterprise/architecture' },
    ],
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function EcosystemPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#E8DCC8] pb-24">
        {/* Header */}
        <div className="bg-[#F5F1E8] border-b-2 border-black">
          <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-16">
            <span className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-black text-white rounded-full mb-4">
              Platform Ecosystem
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] mb-4 leading-tight max-w-2xl">
              The Operating System for<br />Autonomous AI Systems
            </h1>
            <p className="text-base text-gray-600 max-w-xl leading-relaxed mb-6">
              27 capabilities across three paths — Client, Developer, and Enterprise.
              Every feature connects to the same underlying control plane.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/home" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02]">
                Back to Home
              </Link>
              <Link href="/developers/control-plane" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-black hover:bg-gray-50 text-[#111111] text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02]">
                Open Control Plane
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* All three paths */}
        <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-12 space-y-16">
          {paths.map((path) => (
            <section key={path.id}>
              {/* Section header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-7 rounded-full" style={{ background: path.accentColor }} />
                    <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">{path.label}</h2>
                  </div>
                  <p className="text-sm text-gray-500 pl-4">{path.tagline}</p>
                </div>
                <Link
                  href={path.href}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
                  style={{ background: path.accentColor, color: path.textOnAccent }}
                >
                  <span>{path.cta}</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </div>

              {/* 9-icon grid — display only, no navigation */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-4 sm:gap-5"
              >
                {path.features.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <motion.div key={feature.title} variants={itemVariants} className="flex flex-col items-center gap-2">
                      <Icon className="w-14 h-14 sm:w-16 sm:h-16" />
                      <span className="text-xs font-black text-[#111111] text-center leading-tight">{feature.title}</span>
                    </motion.div>
                  )
                })}
              </motion.div>
            </section>
          ))}
        </div>

        {/* Bottom narrative */}
        <div className="border-t-2 border-black bg-black">
          <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-14 text-center">
            <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-4">The Architecture</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 max-w-xl mx-auto leading-tight">
              Everything connects to a single Control Plane
            </h3>
            <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed mb-8">
              Agents → Workflows → Runtime → Observability. Every capability in every path
              is orchestrated by the same infrastructure underneath.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/developers/control-plane" className="inline-flex items-center gap-2 px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02]">
                <span>Open Control Plane</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <Link href="/docs" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-600 hover:border-white text-gray-400 hover:text-white text-sm font-black rounded-xl transition-colors duration-200">
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
