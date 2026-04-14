'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/PageTransition'
import { ChevronRightIcon } from '@/components/icons'

const sections = [
  {
    id: 'control-plane',
    badge: 'Core Concept',
    badgeColor: '#EA580C',
    title: 'The Control Plane',
    description: 'OpenRooms is not an agent tool. It is infrastructure for autonomous systems.',
    content: [
      {
        heading: 'What is the Control Plane?',
        body: `The OpenRooms Control Plane is the central orchestration layer that coordinates every agent, workflow, tool, and execution across the platform. It is the single source of truth for all runtime state.

When you deploy an agent, it does not run in isolation. It runs inside a Room — a scoped execution environment managed by the Control Plane. The Control Plane tracks its goals, tool calls, memory, and outputs in real time.`,
      },
      {
        heading: 'Architecture',
        body: `Control Plane
    ↓
Agents (reasoning units)
    ↓
Workflows (orchestration graphs)
    ↓
Automations (triggers)
    ↓
Runtime Execution (BullMQ workers)
    ↓
Observability (logs, traces, runs)`,
        code: true,
      },
    ],
    links: [
      { label: 'Open Control Plane', href: '/developers/control-plane' },
      { label: 'Runtime Docs', href: '/developers/runtime' },
    ],
  },
  {
    id: 'client-path',
    badge: 'Client Path',
    badgeColor: '#FDA4AF',
    title: 'Client Path',
    description: 'For individuals and teams deploying intelligent automation.',
    content: [
      {
        heading: 'What Clients do on OpenRooms',
        body: `Clients create Rooms and populate them with agents that act on their behalf. A Room is an isolated workspace where agents collaborate — sharing context, memory, and tools — toward a defined goal.

Clients do not write code. They configure agents, define goals, connect integrations, and observe results. The platform handles orchestration automatically.`,
      },
      {
        heading: 'Client capabilities',
        body: `Rooms → Agents → Workflows → Automations → Live Activity → Knowledge → Reports → Integrations → Tools`,
        code: true,
      },
      {
        heading: 'Autonomous Agent Runtime',
        body: `Every agent in the Client path runs on the same BullMQ-powered runtime as Developer and Enterprise agents. The difference is the interface — Clients get a goal-oriented UX rather than raw infrastructure controls.`,
      },
    ],
    links: [
      { label: 'Start Client Path', href: '/clients' },
      { label: 'Create a Room', href: '/clients/rooms' },
    ],
  },
  {
    id: 'developer-path',
    badge: 'Developer Path',
    badgeColor: '#EA580C',
    title: 'Developer Path',
    description: 'For engineers building, deploying, and operating agent infrastructure.',
    content: [
      {
        heading: 'What Developers do on OpenRooms',
        body: `Developers interact with the full control plane. They design agents with custom LLM providers, register tools via the HTTP tool registry, compose workflow DAGs, configure execution policies, and observe every run.

The platform exposes a REST API and TypeScript SDK for fully programmatic access to every resource.`,
      },
      {
        heading: 'Developer capabilities',
        body: `Control Plane → Agents → Workflows → Tools → Runtime → Runs → Logs → API → SDK`,
        code: true,
      },
      {
        heading: 'Trigger an agent run',
        body: `POST /api/agents/:id/run
Content-Type: application/json

{
  "maxIterations": 5,
  "goal": "Research BTC price and summarise"
}`,
        code: true,
      },
    ],
    links: [
      { label: 'Start Developer Path', href: '/developers' },
      { label: 'Open Control Plane', href: '/developers/control-plane' },
    ],
  },
  {
    id: 'enterprise-path',
    badge: 'Enterprise Path',
    badgeColor: '#111827',
    title: 'Enterprise Path',
    description: 'For teams operating distributed AI infrastructure at scale.',
    content: [
      {
        heading: 'What Enterprise does on OpenRooms',
        body: `Enterprise deployments use OpenRooms as the infrastructure layer for large-scale autonomous systems. This means deploying agent swarms — coordinated clusters of specialised agents that divide work, share context, and execute concurrently across BullMQ worker pools.

Every operation is policy-enforced, access-isolated, and fully auditable.`,
      },
      {
        heading: 'Enterprise capabilities',
        body: `Rooms → Swarms → Distributed Execution → Observability → Automation → Integrations → Security → Compliance → Architecture`,
        code: true,
      },
      {
        heading: 'Agent Swarms',
        body: `Swarms are networks of specialised agents deployed across multiple Rooms, coordinated by the Control Plane via the event bus. Each agent in a swarm can call tools, invoke sub-workflows, and emit signals that other agents respond to — all in real time.`,
      },
      {
        heading: 'Memory Graph',
        body: `The Knowledge system provides a persistent memory graph scoped to each Room. Agents read and write to this graph during execution. Over time it compounds — forming a structured knowledge base that accelerates future runs and provides context continuity across sessions.`,
      },
    ],
    links: [
      { label: 'Start Enterprise Path', href: '/enterprise' },
      { label: 'Deploy Swarms', href: '/enterprise/swarms' },
    ],
  },
]

export default function DocsPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F9F5EF] pb-24">
        {/* Header */}
        <div className="bg-white border-b-2 border-black">
          <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
            <span className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-black text-white rounded-full mb-4">
              Platform Docs
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#111111] mb-3 leading-tight">
              How OpenRooms works
            </h1>
            <p className="text-base text-gray-600 max-w-lg leading-relaxed">
              Internal documentation on the three paths and how they connect to the Control Plane.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-10">
          {sections.map((section, si) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: si * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-[#DDD5C8] rounded-2xl overflow-hidden"
            >
              {/* Section header */}
              <div className="px-6 sm:px-8 py-5 border-b border-[#D4C4A8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span
                    className="inline-block text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full mb-2"
                    style={{ background: section.badgeColor, color: section.badgeColor === '#FDA4AF' ? '#111' : '#fff' }}
                  >
                    {section.badge}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#111111]">{section.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#D4C4A8] hover:border-[#EA580C] text-xs font-black text-[#111111] rounded-lg transition-colors duration-150 whitespace-nowrap"
                    >
                      {link.label}
                      <ChevronRightIcon className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Content blocks */}
              <div className="px-6 sm:px-8 py-6 space-y-6">
                {section.content.map((block, bi) => (
                  <div key={bi}>
                    <h3 className="text-sm font-black text-[#111111] mb-2">{block.heading}</h3>
                    {block.code ? (
                      <pre className="bg-[#111111] text-[#86EFAC] text-xs font-mono p-4 rounded-xl overflow-x-auto leading-relaxed whitespace-pre">
                        {block.body}
                      </pre>
                    ) : (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{block.body}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 pb-4">
          <div className="bg-black rounded-2xl p-8 text-center">
            <h3 className="text-xl font-black text-white mb-2">Ready to explore the platform?</h3>
            <p className="text-sm text-gray-400 mb-6">See the system map for a visual overview of how all components connect.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/system" className="inline-flex items-center gap-2 px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-black rounded-xl transition-all hover:scale-[1.02]">
                <span>View System Map</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <Link href="/ecosystem" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-600 hover:border-white text-gray-400 hover:text-white text-sm font-black rounded-xl transition-colors">
                All 27 Capabilities
              </Link>
              <Link href="/developers/control-plane" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-600 hover:border-white text-gray-400 hover:text-white text-sm font-black rounded-xl transition-colors">
                Open Control Plane
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
