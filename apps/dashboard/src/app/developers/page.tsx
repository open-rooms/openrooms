'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@/components/icons'
import { FeatureGrid } from '@/components/FeatureCard'
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
    href: '/control-plane',
  },
  {
    icon: AgentIcon,
    title: 'Agents',
    description: 'Design autonomous agents with custom goals, tools, LLM providers, and policy configs.',
    href: '/agents',
  },
  {
    icon: WorkflowIcon,
    title: 'Workflows',
    description: 'Build multi-agent pipelines with branching logic, parallel nodes, and chained steps.',
    href: '/workflows',
  },
  {
    icon: ToolIcon,
    title: 'Tools',
    description: 'Register HTTP tools and custom executors that agents invoke during their reasoning loop.',
    href: '/tools',
  },
  {
    icon: RuntimeIcon,
    title: 'Runtime',
    description: 'BullMQ-powered execution engine with Redis queues, worker processes, and job management.',
    href: '/runtime',
  },
  {
    icon: LiveRunsIcon,
    title: 'Runs',
    description: 'Full execution history with status tracking, duration, and per-run metadata.',
    href: '/live-runs',
  },
  {
    icon: LogsIcon,
    title: 'Logs',
    description: 'Structured execution logs with event types, reasoning traces, and tool call records.',
    href: '/live-runs',
  },
  {
    icon: APIIcon,
    title: 'API',
    description: 'REST API for triggering agent runs, querying logs, managing tools, and configuring providers.',
    href: '/settings',
  },
  {
    icon: SDKIcon,
    title: 'SDK',
    description: 'Programmatic access to OpenRooms infrastructure via typed workspace packages.',
    href: '/docs',
  },
]

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[#E8DCC8]">
      {/* Hero */}
      <div className="bg-[#F5F1E8] border-b-2 border-black">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase px-3 py-1 bg-[#E8DCC8] rounded-full">For Developers</span>
            <h1 className="text-3xl md:text-5xl font-bold text-[#111111] mt-4 mb-4 leading-tight">
              Build Agent<br />Infrastructure
            </h1>
            <p className="text-base text-gray-600 leading-relaxed mb-6 max-w-xl">
              OpenRooms is a full control plane. Design agents, compose workflows, register tools, and observe execution — all through a programmable runtime.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/control-plane" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-xl transition-colors">
                <span>Open Control Plane</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <Link href="/agents/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-black hover:bg-gray-50 text-[#111111] text-sm font-bold rounded-xl transition-colors">
                Create an Agent
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#111111] mb-1">Developer tools</h2>
          <p className="text-sm text-gray-500">Hover any card to learn more. Click to open.</p>
        </div>
        <FeatureGrid features={features} />
      </div>

      {/* API quick-start */}
      <div className="border-t border-[#D4C4A8] py-12">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8">
          <div className="bg-black rounded-2xl p-6 md:p-8">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Quick Start</p>
            <h3 className="text-xl font-bold text-white mb-4">Trigger an agent run via API</h3>
            <pre className="text-sm text-[#86EFAC] font-mono overflow-x-auto leading-relaxed">
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
            <div className="mt-6 flex gap-3">
              <Link href="/agents" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-xl transition-colors">
                <span>Browse Agents</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <Link href="/settings" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-600 hover:border-white text-gray-400 hover:text-white text-sm font-bold rounded-xl transition-colors">
                Configure Providers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
