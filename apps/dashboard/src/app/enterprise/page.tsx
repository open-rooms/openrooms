'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@/components/icons'
import {
  AgentsIllustrationIcon,
  WorkflowsIllustrationIcon,
  MetricsIllustrationIcon,
  ToolsIllustrationIcon,
  StorageIllustrationIcon,
  ControlPlaneIllustrationIcon,
  EnterpriseIllustrationIcon,
} from '@/components/icons/openrooms-icons'

const sections = [
  {
    icon: EnterpriseIllustrationIcon,
    title: 'Distributed Agent Systems',
    description: 'Deploy networks of specialized AI agents across isolated execution environments. Each agent operates within its own Room, with defined goals, tools, and memory — coordinated by a central orchestration layer.',
    tags: ['Multi-agent', 'Room Isolation', 'Parallel Execution'],
    color: '#7FA7D8',
  },
  {
    icon: WorkflowsIllustrationIcon,
    title: 'Multi-Room Orchestration',
    description: 'Chain Rooms together into complex workflows that span departments, data sources, and external APIs. Workflow graphs define execution order, branching logic, and agent handoff protocols.',
    tags: ['Workflow Engine', 'Agent Chaining', 'Conditional Branching'],
    color: '#7FA7D8',
  },
  {
    icon: MetricsIllustrationIcon,
    title: 'Observability & Telemetry',
    description: 'Full execution visibility across every agent, workflow, and tool call. Real-time logs, reasoning traces, and event streams give your team complete insight into what systems are doing and why.',
    tags: ['Execution Logs', 'Reasoning Traces', 'Event Streams'],
    color: '#A77DC2',
  },
  {
    icon: ToolsIllustrationIcon,
    title: 'Tool & API Integrations',
    description: 'Connect agents to any external system via the tool registry. HTTP tools, database connectors, blockchain explorers, financial data feeds — agents invoke tools as part of their reasoning loop.',
    tags: ['HTTP Tools', 'Custom APIs', 'Data Connectors'],
    color: '#E0C36A',
  },
  {
    icon: StorageIllustrationIcon,
    title: 'Horizontal Execution Scaling',
    description: 'BullMQ-powered job queues allow agent and workflow runs to scale horizontally. Multiple workers consume from shared queues — no single point of failure, no execution bottlenecks.',
    tags: ['BullMQ Workers', 'Redis Queue', 'Horizontal Scale'],
    color: '#8FA1B3',
  },
  {
    icon: ControlPlaneIllustrationIcon,
    title: 'Infrastructure Control Plane',
    description: 'Full administrative control over agents, workflows, tools, and runtime state. Configure LLM providers, manage API keys, monitor system health, and govern execution policies from a single interface.',
    tags: ['Admin Controls', 'LLM Providers', 'Policy Engine'],
    color: '#E0B35A',
  },
]

const stats = [
  { value: 'Unlimited', label: 'Agents per workspace' },
  { value: 'Real-time', label: 'Execution observability' },
  { value: 'Any LLM', label: 'OpenAI · Anthropic · Custom' },
  { value: 'REST API', label: 'Full programmatic access' },
]

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#E8DCC8]">
      {/* Hero */}
      <div className="bg-[#F5F1E8] border-b-2 border-black">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8 py-14 md:py-20">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase px-3 py-1 bg-gray-200 rounded-full">Enterprise Architecture</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] mt-5 mb-5 leading-tight">
              Operate Distributed<br />Intelligent Infrastructure
            </h1>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8 max-w-2xl">
              OpenRooms gives enterprise teams a control plane for deploying, orchestrating, and observing autonomous AI systems at scale — across teams, APIs, and data pipelines.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/control-plane" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-bold rounded-xl transition-colors">
                <span>Open Control Plane</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <Link href="/rooms" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-black hover:bg-[#F54E00] hover:border-[#F54E00] hover:text-white text-[#111111] text-sm font-bold rounded-xl transition-colors">
                <span>Browse Rooms</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-black border-b-2 border-black py-5">
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

      {/* Capability Sections */}
      <div className="py-14 md:py-20">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#111111] mb-2">Platform Capabilities</h2>
            <p className="text-gray-600 text-base">Everything your team needs to deploy intelligent systems in production.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <div
                  key={section.title}
                  className="bg-[#F5F1E8] border-2 border-[#D4C4A8] rounded-2xl p-6 hover:border-[#F54E00] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="mb-4 transition-transform duration-200 group-hover:scale-110">
                    <Icon className="w-14 h-14" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111111] mb-2">{section.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{section.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {section.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-white border border-[#D4C4A8] rounded-lg text-xs font-semibold text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Architecture Diagram CTA */}
      <div className="py-14 border-t border-[#D4C4A8]">
        <div className="max-w-[95%] 2xl:max-w-[1600px] mx-auto px-6 md:px-8">
          <div className="bg-[#F5F1E8] border-2 border-[#D4C4A8] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <AgentsIllustrationIcon className="w-10 h-10" />
                <h3 className="text-2xl font-bold text-[#111111]">Ready to deploy at scale?</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                Start with a Room, add agents, connect tools, and watch your infrastructure execute autonomously. The control plane gives you full visibility at every step.
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
