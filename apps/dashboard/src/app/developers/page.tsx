'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@/components/icons'
import { FeatureGrid } from '@/components/FeatureCard'
import { PathDock } from '@/components/PathDock'
import { PageTransition } from '@/components/PageTransition'
import {
  DashboardIcon,
  AgentIcon,
  WorkflowIcon,
  ToolIcon,
  RuntimeIcon,
  LiveRunsIcon,
  LogsIcon,
  APIIcon,
  SDKIcon,
} from '@/components/icons/system'

const features = [
  {
    icon: DashboardIcon,
    title: 'Control Plane',
    description: 'Central admin interface for managing agents, workflows, tools and execution state.',
    href: '/developers/control-plane',
  },
  {
    icon: AgentIcon,
    title: 'Agents',
    description: 'Design autonomous agents with custom goals, tools, LLM providers, and policy configs.',
    href: '/developers/agents',
  },
  {
    icon: WorkflowIcon,
    title: 'Workflows',
    description: 'Build multi-agent pipelines with branching logic, parallel nodes, and chained steps.',
    href: '/developers/workflows',
  },
  {
    icon: ToolIcon,
    title: 'Tools',
    description: 'Register HTTP tools and custom executors that agents invoke during their reasoning loop.',
    href: '/developers/tools',
  },
  {
    icon: RuntimeIcon,
    title: 'Runtime',
    description: 'BullMQ-powered execution engine with Redis queues, worker processes, and job management.',
    href: '/developers/runtime',
  },
  {
    icon: LiveRunsIcon,
    title: 'Runs',
    description: 'Full execution history with status tracking, duration, and per-run metadata.',
    href: '/developers/runs',
  },
  {
    icon: LogsIcon,
    title: 'Logs',
    description: 'Structured execution logs with event types, reasoning traces, and tool call records.',
    href: '/developers/logs',
  },
  {
    icon: APIIcon,
    title: 'API',
    description: 'REST API for triggering agent runs, querying logs, managing tools, and configuring providers.',
    href: '/developers/api',
  },
  {
    icon: SDKIcon,
    title: 'SDK',
    description: 'Programmatic access to OpenRooms infrastructure via typed workspace packages.',
    href: '/developers/sdk',
  },
]

const highlights = [
  { value: 'REST API', label: 'Fully programmable' },
  { value: 'BullMQ', label: 'Distributed runtime' },
  { value: 'Any LLM', label: 'OpenAI · Anthropic · Custom' },
  { value: 'TypeScript', label: 'Typed SDK included' },
]

const dockItems = [
  { id: 'control-plane', name: 'Control Plane', icon: DashboardIcon, href: '/developers/control-plane' },
  { id: 'agents', name: 'Agents', icon: AgentIcon, href: '/developers/agents' },
  { id: 'workflows', name: 'Workflows', icon: WorkflowIcon, href: '/developers/workflows' },
  { id: 'tools', name: 'Tools', icon: ToolIcon, href: '/developers/tools' },
  { id: 'runtime', name: 'Runtime', icon: RuntimeIcon, href: '/developers/runtime' },
  { id: 'runs', name: 'Live Runs', icon: LiveRunsIcon, href: '/developers/runs' },
  { id: 'logs', name: 'Logs', icon: LogsIcon, href: '/developers/logs' },
  { id: 'api', name: 'API', icon: APIIcon, href: '/developers/api' },
  { id: 'sdk', name: 'SDK', icon: SDKIcon, href: '/developers/sdk' },
]

export default function DevelopersPage() {
  return (
    <PageTransition>
    <div className="min-h-screen bg-[#F9F5EF] pb-32">

      {/* Coloured accent bar */}
      <div className="h-1 w-full bg-[#EA580C] animate-accent-expand" />

      {/* Hero */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            {/* Left: copy */}
            <div className="max-w-xl">
              <span
                className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-4 animate-hero-enter"
                style={{ background: '#EA580C', color: '#fff', animationDelay: '0s' }}
              >
                For Developers
              </span>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] mb-4 leading-tight animate-hero-enter"
                style={{ animationDelay: '0.08s' }}
              >
                Build Agent<br />Infrastructure
              </h1>
              <p
                className="text-base text-gray-600 leading-relaxed mb-8 animate-hero-enter"
                style={{ animationDelay: '0.16s' }}
              >
                OpenRooms is a full control plane. Design agents, compose workflows, register tools, and observe execution — all through a programmable runtime.
              </p>
              <div className="flex flex-wrap gap-3 animate-hero-enter" style={{ animationDelay: '0.22s' }}>
                <Link
                  href="/control-plane"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Open Control Plane</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="/agents/create"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-[#DDD5C8] hover:bg-gray-50 text-[#111111] text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create an Agent
                </Link>
              </div>
            </div>

            {/* Right: stats grid (desktop only) */}
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
            <div className="w-1 h-6 rounded-full bg-[#EA580C]" />
            <h2 className="text-xl sm:text-2xl font-black text-[#111111]">Developer tools</h2>
          </div>
          <p className="text-sm text-gray-500 pl-4">Everything you need to build production agent systems.</p>
        </div>
        <FeatureGrid features={features} />
      </div>

      {/* API quick-start */}
      <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 pb-4">
        <div className="bg-[#111111] rounded-2xl border border-[#DDD5C8] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-black border-b border-gray-800">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
            <span className="ml-2 text-[11px] text-gray-500 font-mono">openrooms — quick start</span>
          </div>
          <div className="p-5 sm:p-8">
            <p className="text-[10px] font-black tracking-widest text-[#EA580C] uppercase mb-3">API Quick Start</p>
            <h3 className="text-lg sm:text-xl font-black text-white mb-4">Trigger an agent run</h3>
            <pre className="text-xs sm:text-sm text-[#86EFAC] font-mono overflow-x-auto leading-relaxed bg-black/40 rounded-xl p-4 sm:p-5">
{`POST /api/agents/:id/run
Content-Type: application/json

{
  "maxIterations": 5,
  "goal": "Research BTC price and summarise"
}

// Response
{
  "runId": "uuid",
  "status": "queued"
}`}
            </pre>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Browse Agents</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-600 hover:border-white text-gray-400 hover:text-white text-sm font-black rounded-xl transition-colors duration-200"
              >
                Configure Providers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Path Dock */}
      <PathDock items={dockItems} accentColor="#EA580C" />
    </div>
    </PageTransition>
  )
}
