'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
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
      { icon: RoomsIcon, title: 'Rooms', desc: 'Coordinated environments where agents work together.' },
      { icon: AgentIcon, title: 'Agents', desc: 'Intelligent agents that perceive, reason, and act.' },
      { icon: WorkflowIcon, title: 'Workflows', desc: 'Multi-step pipelines chaining agents and tools.' },
      { icon: AutomationIcon, title: 'Automations', desc: 'Scheduled and event-driven execution.' },
      { icon: RuntimeIcon, title: 'Live Activity', desc: 'Real-time feed of what your agents are doing.' },
      { icon: MemoryIcon, title: 'Knowledge', desc: 'Persistent memory that agents build over time.' },
      { icon: ReportsIcon, title: 'Reports', desc: 'Analytics and summaries from completed runs.' },
      { icon: IntegrationsIcon, title: 'Integrations', desc: 'Connect agents to external APIs and platforms.' },
      { icon: ToolIcon, title: 'Tools', desc: 'Pre-built capabilities: search, fetch, compute.' },
    ],
  },
  {
    id: 'developers',
    label: 'Developer Infrastructure',
    tagline: 'The control plane for building production agent systems.',
    accentColor: '#EA580C',
    textOnAccent: '#fff',
    cta: 'Start Developer Path',
    href: '/developers',
    features: [
      { icon: DashboardIcon, title: 'Control Plane', desc: 'Central interface for managing all infrastructure.' },
      { icon: AgentIcon, title: 'Agents', desc: 'Design agents with goals, tools, and LLM configs.' },
      { icon: WorkflowIcon, title: 'Workflows', desc: 'Build multi-agent pipelines with branching logic.' },
      { icon: ToolIcon, title: 'Tools', desc: 'Register HTTP tools and custom executors.' },
      { icon: RuntimeIcon, title: 'Runtime', desc: 'BullMQ execution engine with Redis queues.' },
      { icon: LiveRunsIcon, title: 'Runs', desc: 'Full execution history and per-run metadata.' },
      { icon: LogsIcon, title: 'Logs', desc: 'Structured logs with reasoning traces and tool calls.' },
      { icon: APIIcon, title: 'API', desc: 'REST API for triggering runs and managing state.' },
      { icon: SDKIcon, title: 'SDK', desc: 'Typed TypeScript packages for programmatic access.' },
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
      { icon: RoomsIcon, title: 'Rooms', desc: 'Isolated, audited execution environments.' },
      { icon: AgentClustersIcon, title: 'Swarms', desc: 'Coordinated multi-agent swarms in parallel.' },
      { icon: DistributedExecutionIcon, title: 'Distributed Exec', desc: 'Horizontally scalable worker pools.' },
      { icon: ObservabilityIcon, title: 'Observability', desc: 'Full telemetry across every agent.' },
      { icon: AutomationIcon, title: 'Automation', desc: 'Enterprise-scale intelligent workflows.' },
      { icon: IntegrationsIcon, title: 'Integrations', desc: 'Connect to any API, database, or service.' },
      { icon: SecurityIcon, title: 'Security', desc: 'API key management and execution policies.' },
      { icon: ComplianceIcon, title: 'Compliance', desc: 'Immutable audit logs and run history.' },
      { icon: EnterpriseArchitectureIcon, title: 'Architecture', desc: 'Modular infrastructure, fully customisable.' },
    ],
  },
]

// Stagger container
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
}

// Each icon fades + rises
const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.92 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
}

// Scan-line pulse for the active icon tooltip
const tooltipVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const } },
}

// Header title word-by-word reveal
const wordReveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

function IconNode({
  feature,
  accentColor,
}: {
  feature: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }
  accentColor: string
}) {
  const [hovered, setHovered] = useState(false)
  const Icon = feature.icon

  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center gap-2 relative"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Tooltip — appears above on hover */}
      <motion.div
        variants={tooltipVariants}
        initial="hidden"
        animate={hovered ? 'show' : 'hidden'}
        className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >
        <div
          className="px-2.5 py-1.5 rounded-lg text-[10px] font-black leading-snug whitespace-nowrap max-w-[140px] text-center shadow-lg"
          style={{ background: accentColor, color: accentColor === '#FDA4AF' ? '#111' : '#fff' }}
        >
          {feature.desc}
          {/* Caret */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `5px solid ${accentColor}`,
            }}
          />
        </div>
      </motion.div>

      {/* Icon with glow ring + lift on hover */}
      <motion.div
        animate={hovered ? { y: -6, scale: 1.18 } : { y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.34, 1.4, 0.64, 1] }}
        className="relative"
      >
        {/* Subtle glow ring */}
        <motion.div
          animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 rounded-2xl blur-md -z-10"
          style={{ background: accentColor, opacity: 0.35 }}
        />
        <Icon className="w-14 h-14 sm:w-16 sm:h-16 relative z-10" />
      </motion.div>

      {/* Label — highlights on hover */}
      <motion.span
        animate={hovered ? { color: accentColor === '#111827' ? '#111827' : accentColor } : { color: '#111111' }}
        transition={{ duration: 0.15 }}
        className="text-xs font-black text-center leading-tight"
      >
        {feature.title}
      </motion.span>

      {/* Active dot */}
      <motion.div
        animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ duration: 0.15 }}
        className="w-1 h-1 rounded-full"
        style={{ background: accentColor }}
      />
    </motion.div>
  )
}

const heroWords = ['The', 'Operating', 'System', 'for', 'Autonomous', 'AI', 'Systems']

export default function EcosystemPage() {
  useReducedMotion()

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F9F5EF] pb-24 overflow-x-hidden">

        {/* ── Header ── */}
        <div className="bg-white border-b-2 border-black relative overflow-hidden">
          {/* Subtle animated grid lines in background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-16 relative z-10">
            {/* Badge scans in */}
            <motion.span
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-black text-white rounded-full mb-5"
            >
              Platform Ecosystem
            </motion.span>

            {/* Word-by-word headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] mb-4 leading-tight max-w-2xl flex flex-wrap gap-x-3">
              {heroWords.map((word, i) => (
                <motion.span key={word + i} custom={i} variants={wordReveal} initial="hidden" animate="show">
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
              className="text-base text-gray-600 max-w-xl leading-relaxed mb-7"
            >
              27 capabilities across three paths — Client, Developer, and Enterprise.
              Every feature connects to the same underlying control plane.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.4, ease: 'easeOut' }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/home" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02]">
                Back to Home
              </Link>
              <Link href="/developers/control-plane" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#DDD5C8] hover:bg-gray-50 text-[#111111] text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02]">
                Open Control Plane
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ── Counter strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="bg-black border-b border-gray-800"
        >
          <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-4">
            <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto">
              {[
                { val: '27', label: 'Total Capabilities' },
                { val: '3', label: 'Platform Paths' },
                { val: '9', label: 'Per Path' },
                { val: '1', label: 'Control Plane' },
              ].map((s) => (
                <div key={s.label} className="flex-shrink-0 text-center">
                  <div className="text-lg sm:text-xl font-black text-[#EA580C]">{s.val}</div>
                  <div className="text-[10px] text-gray-500 whitespace-nowrap">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Three path sections ── */}
        <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-12 space-y-20">
          {paths.map((path, si) => (
            <motion.section
              key={path.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: si * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Section header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    {/* Animated accent bar */}
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{ background: path.accentColor, transformOrigin: 'top' }}
                      className="w-1 h-7 rounded-full"
                    />
                    <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">{path.label}</h2>
                  </div>
                  <p className="text-sm text-gray-500 pl-4">{path.tagline}</p>
                </div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={path.href}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-black rounded-xl transition-colors duration-150 whitespace-nowrap flex-shrink-0"
                    style={{ background: path.accentColor, color: path.textOnAccent }}
                  >
                    <span>{path.cta}</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>

              {/* 9-icon grid — hover-responsive, non-navigating */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-50px' }}
                className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-6 sm:gap-8"
              >
                {path.features.map((feature) => (
                  <IconNode key={feature.title} feature={feature} accentColor={path.accentColor} />
                ))}
              </motion.div>

              {/* Thin separator line (not on last) */}
              {si < paths.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
                  style={{ transformOrigin: 'left' }}
                  className="mt-16 h-px bg-[#D4C4A8]"
                />
              )}
            </motion.section>
          ))}
        </div>

        {/* ── Bottom control plane narrative ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="border-t-2 border-black bg-black relative overflow-hidden"
        >
          {/* Animated scan line */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
            className="absolute top-0 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-[#EA580C]/60 to-transparent pointer-events-none"
          />

          <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-16 text-center relative z-10">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-4"
            >
              The Architecture
            </motion.p>
            <motion.h3
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="text-2xl sm:text-3xl font-black text-white mb-3 max-w-xl mx-auto leading-tight"
            >
              Everything connects to a single Control Plane
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed mb-8"
            >
              Agents → Workflows → Runtime → Observability. Every capability in every path
              is orchestrated by the same infrastructure underneath.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <Link href="/developers/control-plane" className="inline-flex items-center gap-2 px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02]">
                <span>Open Control Plane</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <Link href="/docs" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-600 hover:border-white text-gray-400 hover:text-white text-sm font-black rounded-xl transition-colors duration-200">
                Read the Docs
              </Link>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </PageTransition>
  )
}
