'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/PageTransition'

const LAYERS = [
  {
    id: 'client',
    label: 'CLIENT INTERFACES',
    color: '#FDA4AF',
    textOnColor: '#111',
    nodes: [
      { title: 'Rooms', sub: 'Execution workspaces', href: '/clients/rooms' },
      { title: 'Agents', sub: 'Autonomous actors', href: '/clients/agents' },
      { title: 'Workflows', sub: 'Agent pipelines', href: '/clients/workflows' },
      { title: 'Tools', sub: 'Capabilities', href: '/clients/tools' },
      { title: 'Knowledge', sub: 'Memory graph', href: '/clients/knowledge' },
      { title: 'Integrations', sub: 'External APIs', href: '/clients/integrations' },
    ],
  },
  {
    id: 'orchestration',
    label: 'ORCHESTRATION LAYER',
    color: '#F54E00',
    textOnColor: '#fff',
    nodes: [
      { title: 'Control Plane', sub: 'System overview', href: '/developers/control-plane' },
      { title: 'Automation', sub: 'Trigger engine', href: '/clients/automations' },
      { title: 'Event Bus', sub: 'Internal pub/sub', href: '/developers/control-plane' },
      { title: 'Job Queue', sub: 'BullMQ scheduler', href: '/developers/runtime' },
    ],
  },
  {
    id: 'runtime',
    label: 'EXECUTION RUNTIME',
    color: '#111827',
    textOnColor: '#fff',
    nodes: [
      { title: 'Runtime', sub: 'Worker pool engine', href: '/developers/runtime' },
      { title: 'Runs', sub: 'Execution history', href: '/developers/runs' },
      { title: 'Logs', sub: 'System log stream', href: '/developers/logs' },
      { title: 'Distributed Exec', sub: 'Cluster execution', href: '/enterprise/execution' },
      { title: 'Swarms', sub: 'Multi-agent systems', href: '/enterprise/swarms' },
    ],
  },
  {
    id: 'observability',
    label: 'OBSERVABILITY & GOVERNANCE',
    color: '#4B5563',
    textOnColor: '#fff',
    nodes: [
      { title: 'Observability', sub: 'Metrics + telemetry', href: '/enterprise/observability' },
      { title: 'Live Activity', sub: 'Real-time stream', href: '/clients/activity' },
      { title: 'Reports', sub: 'Analytics', href: '/clients/reports' },
      { title: 'Security', sub: 'RBAC + access', href: '/enterprise/security' },
      { title: 'Compliance', sub: 'Audit + governance', href: '/enterprise/compliance' },
    ],
  },
]

const PATHS = [
  { label: 'Clients', href: '/clients', color: '#FDA4AF', textOn: '#111' },
  { label: 'Developers', href: '/developers', color: '#F54E00', textOn: '#fff' },
  { label: 'Enterprise', href: '/enterprise', color: '#111827', textOn: '#fff' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const layerVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
}

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
}

function ArrowDown({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      whileInView={{ opacity: 1, scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center my-1"
      style={{ transformOrigin: 'top' }}
    >
      <div className="w-px h-8" style={{ background: color }} />
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
        <path d="M6 8L0.803848 0.5L11.1962 0.5L6 8Z" fill={color} />
      </svg>
    </motion.div>
  )
}

export default function SystemMapPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0B] text-white pb-24">
        {/* Header */}
        <div className="border-b border-gray-800">
          <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-xs font-black tracking-widest uppercase text-gray-400">System Map</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4">
                OpenRooms{' '}
                <span className="text-gray-500">Infrastructure</span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                A visual map of how the OpenRooms control plane operates. Every layer connects — from client interfaces down through orchestration, runtime execution, and observability.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                {PATHS.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all hover:scale-[1.03] active:scale-[0.97]"
                    style={{ background: p.color, color: p.textOn }}
                  >
                    {p.label} Path
                  </Link>
                ))}
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border border-gray-700 text-gray-300 hover:border-gray-500 transition-all"
                >
                  Documentation
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* System Graph */}
        <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="space-y-0"
          >
            {LAYERS.map((layer, li) => (
              <div key={layer.id}>
                <motion.div variants={layerVariants} className="relative">
                  {/* Layer header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gray-800" />
                    <span
                      className="text-[10px] font-black tracking-widest px-3 py-1 rounded-full"
                      style={{ background: layer.color, color: layer.textOnColor }}
                    >
                      {layer.label}
                    </span>
                    <div className="h-px flex-1 bg-gray-800" />
                  </div>

                  {/* Nodes */}
                  <motion.div
                    variants={containerVariants}
                    className="flex flex-wrap justify-center gap-3 sm:gap-4"
                  >
                    {layer.nodes.map((node) => (
                      <motion.div key={node.title} variants={nodeVariants}>
                        <Link
                          href={node.href}
                          className="group flex flex-col items-center gap-1 px-5 py-4 rounded-2xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] min-w-[110px] text-center"
                        >
                          <div className="w-2 h-2 rounded-full mb-1" style={{ background: layer.color }} />
                          <span className="text-sm font-black text-white group-hover:text-white">{node.title}</span>
                          <span className="text-[10px] text-gray-500 leading-tight">{node.sub}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Arrow connector between layers */}
                {li < LAYERS.length - 1 && (
                  <ArrowDown color={LAYERS[li + 1].color} />
                )}
              </div>
            ))}
          </motion.div>

          {/* Bottom narrative */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 border border-gray-800 rounded-2xl p-8 sm:p-10 bg-gray-950 relative overflow-hidden"
          >
            {/* Scan line */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'linear', repeatDelay: 1 }}
              className="absolute top-0 left-0 w-1/3 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #F54E00, transparent)' }}
            />
            <p className="text-[10px] font-black tracking-widest uppercase text-gray-600 mb-3">The operating system for autonomous AI</p>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-4 max-w-2xl">
              Every component is observable, programmable, and connected through the control plane.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mb-6">
              OpenRooms is not an agent tool. It is the infrastructure layer that orchestrates agents, workflows, tools, and knowledge into coordinated autonomous systems — deployable at any scale, across any model, API, or blockchain.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/developers/control-plane"
                className="px-5 py-2.5 rounded-xl text-sm font-black bg-[#F54E00] text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Explore the Control Plane
              </Link>
              <Link
                href="/ecosystem"
                className="px-5 py-2.5 rounded-xl text-sm font-black border border-gray-700 text-gray-300 hover:border-gray-500 transition-all"
              >
                All 27 Capabilities
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
