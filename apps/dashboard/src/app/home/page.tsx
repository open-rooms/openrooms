'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OpenRoomsLogo } from '@/components/openrooms-logo'
import { getRooms, getAgents, getWorkflows, createRoom, createAgent, createWorkflow } from '@/lib/api'
import type { Room } from '@/lib/api'
import {
  RoomsIcon,
  AgentIcon,
  WorkflowIcon,
  AutomationIcon,
  LiveRunsIcon,
  LogsIcon,
  MemoryIcon,
  SettingsIcon,
  DashboardIcon,
  DeveloperIcon,
  BuildIcon,
  ObservabilityIcon,
  ReportsIcon,
  APIIcon,
  AgentClustersIcon,
  ComplianceIcon,
  IntegrationsIcon,
  SecurityIcon,
  ToolIcon,
  SDKIcon,
  MessageIcon,
} from '@/components/icons/system'
import { ChevronRightIcon, PlayIcon } from '@/components/icons'
import { formatRelativeTime } from '@/lib/utils'

// ─── CTA colour — matches dock SettingsIcon orange, dark-shade depth ──────────
const CTA = '#EA580C'
const CTA_HOVER = '#C2410C'

// ─── Quick-start templates ────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'incident-responder',
    Icon: SecurityIcon,
    title: 'Incident Responder',
    tag: 'Ops · Swarm',
    tagColor: 'bg-red-100 text-red-700',
    accentColor: '#FCA5A5',
    description: 'Multi-agent swarm: a sentinel agent polls health, a triage agent classifies severity, a router agent pages on-call — all in parallel.',
    what: [
      'Agent 1: Polls /health every 60s',
      'Agent 2: Classifies severity + root cause',
      'Agent 3: Creates ticket + fires alert via API',
    ],
    trigger: 'Schedule · or webhook from Alertmanager / PagerDuty',
    workflow: { name: 'Incident Response Flow', agentGoal: 'Check the health status of all registered services, classify any degraded service by severity and likely root cause, create an incident ticket via the API connector, and output a structured incident report with recommended next steps.' },
  },
  {
    id: 'autonomous-support-bot',
    Icon: AgentClustersIcon,
    title: 'Autonomous Support Bot',
    tag: 'Customer Ops · Bot',
    tagColor: 'bg-blue-100 text-blue-700',
    accentColor: '#93C5FD',
    description: 'Deploy a self-contained support bot that classifies intent, queries shared memory for known solutions, and replies or escalates — no human in the loop.',
    what: [
      'Classifies intent: bug / how-to / billing / churn',
      'Queries Room memory for known resolutions',
      'Replies autonomously or escalates with context',
    ],
    trigger: 'Webhook · from Intercom, Zendesk, Slack or any form',
    workflow: { name: 'Support Bot Flow', agentGoal: 'Receive an incoming support request from the webhook payload, classify its intent and urgency, search the knowledge base for matching resolutions, then either draft a complete response or escalate to the appropriate human queue with a detailed context summary.' },
  },
  {
    id: 'llm-orchestration',
    Icon: ReportsIcon,
    title: 'LLM Orchestration Pipeline',
    tag: 'AI · Orchestration',
    tagColor: 'bg-emerald-100 text-emerald-700',
    accentColor: '#6EE7B7',
    description: 'Chain GPT-4o, Claude and your own models in a single Room. Each agent handles a step — extract, reason, verify — using the best model for the task.',
    what: [
      'Agent 1 (GPT-4o): extracts structured data',
      'Agent 2 (Claude): reasons and fact-checks',
      'Agent 3: synthesises and posts result',
    ],
    trigger: 'Webhook or schedule — any signal fires the chain',
    workflow: { name: 'LLM Orchestration Flow', agentGoal: 'Fetch content from the configured URL list, extract key facts, named entities, sentiment, and competitive signals, then synthesise a structured intelligence brief and deliver it via the configured output connector.' },
  },
  {
    id: 'api-pipeline',
    Icon: APIIcon,
    title: 'Multi-API Data Pipeline',
    tag: 'Integration · Automation',
    tagColor: 'bg-indigo-100 text-indigo-700',
    accentColor: '#A5B4FC',
    description: 'Agents chain HTTP calls across N REST APIs, merge the results, resolve conflicts, and push a unified record to any downstream system.',
    what: [
      'Sequential HTTP calls to N configured APIs',
      'Agent resolves conflicts, fills data gaps',
      'Pushes enriched unified record downstream',
    ],
    trigger: 'Webhook · triggered by any upstream system',
    workflow: { name: 'API Pipeline Flow', agentGoal: 'Make sequential HTTP requests to all configured API connectors, cross-reference and enrich the results, resolve any field conflicts using business logic rules, and synthesise a unified structured JSON record highlighting key findings and data gaps.' },
  },
  {
    id: 'compliance-audit',
    Icon: ComplianceIcon,
    title: 'Compliance & Audit Agent',
    tag: 'Governance · Policy',
    tagColor: 'bg-amber-100 text-amber-700',
    accentColor: '#FCD34D',
    description: 'Continuously scans outputs, logs, and API responses against a policy ruleset stored in Room memory. Flags violations, scores conformance, and produces audit trail.',
    what: [
      'Ingests log payload or content via webhook',
      'Agent evaluates against policy rules in memory',
      'Scores conformance 0-100, flags violations',
    ],
    trigger: 'Webhook · from any system producing auditable output',
    workflow: { name: 'Compliance Audit Flow', agentGoal: 'Receive the content or log payload from the webhook, evaluate it against the stored compliance policy rules, score overall conformance from 0-100, identify and quote specific rule violations, and generate a structured audit report with recommended remediation steps.' },
  },
  {
    id: 'agent-swarm',
    Icon: ObservabilityIcon,
    title: 'Research Swarm',
    tag: 'Multi-Agent · Swarm',
    tagColor: 'bg-violet-100 text-violet-700',
    accentColor: '#C4B5FD',
    description: 'Spawn a coordinated swarm of 5 agents that fan out across sources, each researching a sub-topic, then converge into a single synthesised report.',
    what: [
      '5 agents fan out across configured sources',
      'Each agent owns a sub-topic + writes to shared memory',
      'Final agent synthesises all findings into one report',
    ],
    trigger: 'API call or webhook — pass a research topic as payload',
    workflow: { name: 'Research Swarm Flow', agentGoal: 'Decompose the research topic into 5 sub-topics, spawn parallel research threads, fetch and summarise evidence from configured sources for each sub-topic, store findings in shared Room memory, then synthesise all findings into a structured research report with citations, confidence scores, and recommended next steps.' },
  },
]

const poweredByItems = [
  'Deterministic Runtime', 'Event-Driven Automation', 'Multi-Model LLM Execution',
  'Vector Memory', 'BullMQ Job Queue', 'PostgreSQL', 'Redis', 'Fastify API',
  'Next.js Dashboard', 'OpenAI Compatible', 'Webhook Triggers',
  'Real-time Observability', 'Blockchain Integrations', 'Horizontal Scaling',
  'API-First Design', 'pnpm Monorepo',
]

const HOW_IT_WORKS = [
  { step: '01', Icon: RoomsIcon,      title: 'Create a Room',      desc: 'Rooms are isolated namespaces. Give one a name — it becomes your autonomous system boundary.' },
  { step: '02', Icon: AgentIcon,      title: 'Deploy Agents',       desc: 'Agents run inside the Room, share its memory, and loop until their goal is reached or budget is spent.' },
  { step: '03', Icon: IntegrationsIcon, title: 'Wire in Your APIs',  desc: 'Register any REST API or blockchain contract as a tool. Agents call it by name, handle errors, retry automatically.' },
  { step: '04', Icon: LiveRunsIcon,   title: 'Fire & Observe',      desc: 'Trigger via webhook, schedule, or the dashboard. Every reasoning step, tool call, and decision streams live.' },
]

const WHO_FOR = [
  {
    Icon: DeveloperIcon,
    title: 'Developers',
    description: 'Register any REST API or blockchain contract as an agent-callable tool in one step. Write a goal in plain English. Get a webhook URL back. No SDK required.',
    cta: 'Open Control Plane',
    href: '/control-plane',
  },
  {
    Icon: BuildIcon,
    title: 'Builders & PMs',
    description: 'Go from idea to a live autonomous system in under 5 minutes using a template. Customise agent goals, swap tools, and watch execution in real time — no code needed.',
    cta: 'Run a Live Action',
    href: '#templates',
  },
  {
    Icon: SDKIcon,
    title: 'Platform Teams',
    description: 'Enforce cost caps, rate limits, and execution policies at the infrastructure layer. Full audit trail, replay-able runs, horizontal scaling — built in, not bolted on.',
    cta: 'View Runtime',
    href: '/runtime',
  },
]

const CAPABILITIES = [
  { Icon: ComplianceIcon,    title: 'Zero-Drift Execution',    desc: 'Every token, tool call, and decision is logged. Full replay on any run, forever.' },
  { Icon: AutomationIcon,    title: 'Trigger From Anything',   desc: 'Webhooks, cron schedules, blockchain events, or a single API call — any signal fires a Room.' },
  { Icon: AgentClustersIcon, title: 'Parallel Agent Networks', desc: 'Multiple agents in one Room share memory and divide work. They cooperate, not compete.' },
  { Icon: ObservabilityIcon, title: 'Execution X-Ray',         desc: 'Stream every reasoning iteration live. Filter, search, and replay any historical run.' },
  { Icon: MemoryIcon,        title: 'Persistent Shared Memory', desc: 'Agents read and write to a shared store. What one learns, all know. Context survives across runs.' },
  { Icon: SDKIcon,           title: 'Any Model, Any Provider', desc: 'OpenAI, Anthropic, or your own endpoint. Swap models per-agent without changing a line of goal code.' },
]

// Dock — only 8 icons, each routes to a real distinct working page
const dockApps = [
  { id: 'rooms',      name: 'Rooms',        Icon: RoomsIcon,      href: '/rooms',         desc: 'Your live systems' },
  { id: 'agents',     name: 'Agents',       Icon: AgentIcon,      href: '/agents',        desc: 'Deploy AI agents' },
  { id: 'workflows',  name: 'Workflows',    Icon: WorkflowIcon,   href: '/workflows',     desc: 'Orchestration graphs' },
  { id: 'connectors', name: 'Connectors',   Icon: APIIcon,        href: '/connectors',    desc: 'APIs & webhooks' },
  { id: 'live-runs',  name: 'Live Runs',    Icon: LiveRunsIcon,   href: '/live-runs',     desc: 'Execution stream' },
  { id: 'tools',      name: 'Tools',        Icon: ToolIcon,       href: '/tools',         desc: 'Agent tool registry' },
  { id: 'runtime',    name: 'Runtime',      Icon: ObservabilityIcon, href: '/runtime',    desc: 'Engine & health' },
  { id: 'settings',   name: 'Settings',     Icon: SettingsIcon,   href: '/settings',      desc: 'Configuration' },
]

// ─── Per-status live log lines ────────────────────────────────────────────────
const RUNNING_LINES = [
  ['text-emerald-400', '● agents dispatched'],
  ['text-blue-400',    '→ tool: http_request'],
  ['text-yellow-400',  '← 200 OK · data received'],
  ['text-purple-400',  '→ tool: memory_query'],
  ['text-blue-400',    '← match found in memory'],
  ['text-red-400',     '⚠ decision threshold met'],
  ['text-emerald-300', '→ tool: http_request(POST /alert)'],
  ['text-emerald-300', '← alert queued · id: ALT-91'],
  ['text-gray-500',    '· reasoning iter 4/5…'],
  ['text-emerald-400', '✓ run completed'],
]
const IDLE_LINES = [
  ['text-gray-600', '○ idle — awaiting trigger'],
  ['text-gray-700', '  no active run'],
  ['text-gray-700', '  last run: completed'],
  ['text-gray-600', '  POST /webhook to fire'],
]
const COMPLETED_LINES = [
  ['text-emerald-400', '✓ execution complete'],
  ['text-blue-400',    '  2 agents · 6 tool calls'],
  ['text-gray-500',    '  tokens: 1,240 · $0.003'],
  ['text-gray-600',    '  output: logged'],
]

function useCyclingLog(lines: string[][], intervalMs = 900) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % Math.max(1, lines.length - 3)), intervalMs)
    return () => clearInterval(t)
  }, [lines, intervalMs])
  return lines.slice(idx, idx + 4)
}

// Room status badge colours (all light palette)
function statusBadge(status: string) {
  if (status === 'RUNNING')   return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (status === 'COMPLETED') return 'bg-blue-100 text-blue-700 border-blue-200'
  if (status === 'FAILED')    return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

// ─── Live terminal card ────────────────────────────────────────────────────────
function RoomTerminalCard({ room, cardIndex }: { room: Room; cardIndex: number }) {
  const lines = room.status === 'RUNNING' ? RUNNING_LINES : room.status === 'COMPLETED' ? COMPLETED_LINES : IDLE_LINES
  const visibleLines = useCyclingLog(lines, room.status === 'RUNNING' ? 850 : 2200)
  // Every 3rd card shows a MessageIcon notification on the screen
  const showMessage = cardIndex % 3 === 2

  return (
    <div className="bg-[#0a0a0a] relative overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#141414] border-b border-[#1e1e1e]">
        <span className="w-2 h-2 rounded-full bg-[#FF5F56]" />
        <span className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
        <span className="w-2 h-2 rounded-full bg-[#27C93F]" />
        <span className="ml-2 text-[8px] text-gray-600 font-mono truncate flex-1 lowercase">
          {room.name.replace(/\s+/g, '-').toLowerCase()}
        </span>
        {room.status === 'RUNNING' && (
          <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 flex-shrink-0">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />LIVE
          </span>
        )}
      </div>

      {/* Content row */}
      <div className="px-3 pt-2.5 pb-2 flex items-start gap-2.5">
        {/* Bot face */}
        <div className="flex-shrink-0 relative">
          <svg viewBox="0 0 44 44" className="w-11 h-11" fill="none">
            <rect x="6" y="10" width="32" height="24" rx="8"
              fill={room.status === 'RUNNING' ? '#5EEAD4' : room.status === 'COMPLETED' ? '#86EFAC' : '#A78BFA'}
              stroke="#fff" strokeWidth="1.8"/>
            <rect x="11" y="17" width="7" height="8" rx="2" fill="#fff"
              className={room.status === 'RUNNING' ? 'animate-pulse' : ''}/>
            <rect x="26" y="17" width="7" height="8" rx="2" fill="#fff"
              className={room.status === 'RUNNING' ? 'animate-pulse' : ''}/>
            <circle cx="14.5" cy="21" r="2" fill="#111"/>
            <circle cx="29.5" cy="21" r="2" fill="#111"/>
            {room.status === 'RUNNING'
              ? <path d="M14 30 Q22 35 30 30" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              : room.status === 'COMPLETED'
                ? <path d="M14 30 Q22 34 30 30" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                : <line x1="14" y1="30" x2="30" y2="30" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            }
            <line x1="22" y1="10" x2="22" y2="6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="22" cy="5" r="2.5"
              fill={room.status === 'RUNNING' ? '#5EEAD4' : '#A78BFA'}
              stroke="#fff" strokeWidth="1.4"
              className={room.status === 'RUNNING' ? 'animate-pulse' : ''}/>
          </svg>
          {/* Message icon badge on every 3rd card */}
          {showMessage && (
            <div className="absolute -top-1 -right-1">
              <MessageIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Log lines — cycling */}
        <div className="flex-1 font-mono space-y-0.5 min-w-0 pt-0.5">
          {visibleLines.map(([color, text], li) => (
            <div key={li} className={`text-[8.5px] truncate ${color} transition-opacity duration-300`}>
              {text}
            </div>
          ))}
          {room.status === 'RUNNING' && (
            <div className="flex items-center gap-1 text-[8px] text-gray-600 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-gray-600 animate-pulse" />
              <span className="animate-pulse">processing…</span>
            </div>
          )}
        </div>
      </div>

      {/* CRT scanlines */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.01) 3px,rgba(255,255,255,0.01) 4px)' }}/>

      {/* Nameplate — compact */}
      <div className="bg-[#F2EDE6] border-t border-[#E8E0D0] px-3 py-1.5 flex items-center justify-between">
        <h3 className="font-bold text-[#111] text-xs truncate group-hover:text-[#EA580C] transition-colors">{room.name}</h3>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${statusBadge(room.status)}`}>{room.status}</span>
          <span className="text-[9px] text-gray-400 font-mono">{formatRelativeTime(room.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [stats, setStats]               = useState({ rooms: 0, agents: 0, workflows: 0 })
  const [rooms, setRooms]               = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [showRooms, setShowRooms]       = useState(false)
  const [showAllRooms, setShowAllRooms] = useState(false)
  const [launching, setLaunching]       = useState<string | null>(null)
  const [launched, setLaunched]         = useState<string | null>(null)
  const [launchError, setLaunchError]   = useState<string | null>(null)

  const ROOMS_PAGE_SIZE = 6
  const visibleRooms = showAllRooms ? rooms : rooms.slice(0, ROOMS_PAGE_SIZE)

  async function loadAll() {
    try {
      const [r, a, w] = await Promise.all([
        getRooms().catch(() => ({ rooms: [] })),
        getAgents().catch(() => ({ agents: [], count: 0 })),
        getWorkflows().catch(() => ({ workflows: [] })),
      ])
      const roomList = r.rooms || []
      setRooms(roomList)
      setStats({
        rooms: roomList.length,
        agents: a.count ?? (a.agents || []).length,
        workflows: (w.workflows || []).length,
      })
    } catch { /* silent */ }
  }

  useEffect(() => { loadAll() }, [])

  async function useTemplate(t: typeof TEMPLATES[0]) {
    setLaunching(t.id)
    setLaunchError(null)
    try {
      // Step 1: create workflow (nodes auto-provisioned by backend self-heal)
      const wf = await createWorkflow({
        name: t.workflow.name,
        description: t.description,
      })
      // Step 2: create room bound to this workflow
      const room = await createRoom({ name: t.title, description: t.description, workflowId: wf.id })
      // Step 3: deploy agent with goal into the room
      await createAgent({
        name: `${t.title} Agent`,
        goal: t.workflow.agentGoal,
        roomId: room.id,
        allowedTools: ['calculator', 'http_request', 'memory_query'],
        policyConfig: { provider: 'openai', model: 'gpt-4o', maxLoopIterations: 5 },
      })
      setLaunched(t.id)
      // Navigate to the live room view
      setTimeout(() => router.push(`/rooms/${room.id}`), 1200)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setLaunchError(`Could not deploy system: ${msg}. Make sure the API backend is running.`)
    } finally {
      setLaunching(null)
    }
  }

  async function handleStartFree() {
    setShowRooms(true)
    setRoomsLoading(true)
    try {
      const r = await getRooms()
      setRooms(r.rooms || [])
    } catch { /* keep empty */ }
    finally { setRoomsLoading(false) }
    setTimeout(() => {
      document.getElementById('rooms-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  return (
    <div className="min-h-screen bg-[#F9F5EF] pb-28 font-sans">

      {/* ── Top nav ──────────────────────────────────────────────────────────── */}
      <nav className="bg-[#F9F5EF] border-b border-[#E8E0D0] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <OpenRoomsLogo size={36} textSize="text-lg" />
          <div className="flex items-center gap-5">
            <Link href="/rooms"      className="text-sm font-medium text-gray-500 hover:text-[#111] transition-colors hidden sm:block">Rooms</Link>
            <Link href="/agents"     className="text-sm font-medium text-gray-500 hover:text-[#111] transition-colors hidden md:block">Agents</Link>
            <Link href="/workflows"  className="text-sm font-medium text-gray-500 hover:text-[#111] transition-colors hidden md:block">Workflows</Link>
            <Link href="/live-runs"  className="text-sm font-medium text-gray-500 hover:text-[#111] transition-colors hidden lg:block">Live Runs</Link>
            <Link href="/rooms"
              className="px-4 py-2 text-white text-sm font-bold rounded-xl transition-all"
              style={{ backgroundColor: CTA }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = CTA_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = CTA)}
            >
              Start for free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="bg-[#F9F5EF] border-b border-[#E8E0D0]">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-block mb-5 text-xs font-bold tracking-widest text-[#888] uppercase bg-[#EDE8DF] px-3 py-1 rounded-full">
              Autonomous AI Control Plane
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111111] mb-5 leading-tight tracking-tight">
              Run intelligent systems<br />that act for you.
            </h1>
            <p className="text-base md:text-lg text-gray-500 mb-8 leading-relaxed">
              OpenRooms is a control plane for AI agents, workflows, and real-time automation —
              across models, APIs, and blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartFree}
                className="px-6 py-3 text-white font-bold rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{ backgroundColor: CTA }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = CTA_HOVER)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = CTA)}
              >
                Start for free
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              <a href="#features"
                className="px-6 py-3 border border-[#D4C9B8] hover:border-[#111111] text-[#111111] font-semibold rounded-lg text-sm transition-colors text-center bg-white">
                Explore features
              </a>
            </div>

            {/* Live stats chips */}
            <div className="flex items-center gap-3 mt-8 flex-wrap">
              {[
                { label: `${stats.rooms} Rooms`, dot: 'bg-emerald-400' },
                { label: `${stats.agents} Agents`, dot: 'bg-blue-400' },
                { label: `${stats.workflows} Workflows`, dot: 'bg-purple-400' },
              ].map(s => (
                <span key={s.label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-white border border-[#E8E0D0] px-3 py-1.5 rounded-full">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Rooms Grid (shown when Start for Free is clicked) ─────────────────── */}
      {showRooms && (
        <div id="rooms-grid" className="bg-[#F9F5EF] border-b border-[#E8E0D0] py-12 animate-[fadeSlideDown_0.3s_ease]"
          style={{ animationFillMode: 'both' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-[#111111]">Your Rooms</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {rooms.length > 0 ? `${rooms.length} room${rooms.length !== 1 ? 's' : ''} — click any to open it` : 'Select a room to open it, or create a new one.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/rooms"
                  className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-[#D4C9B8] hover:border-[#111] text-[#111] bg-white transition-colors">
                  View all
                </Link>
                <Link href="/rooms"
                  className="px-4 py-2.5 text-white text-sm font-bold rounded-lg transition-colors inline-flex items-center gap-2"
                  style={{ backgroundColor: CTA }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = CTA_HOVER)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = CTA)}
                >
                  + New Room
                </Link>
              </div>
            </div>

            {roomsLoading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading your rooms…</span>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#E8E0D0] rounded-2xl">
                <RoomsIcon className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-gray-600 font-semibold mb-1">No rooms found</p>
                <p className="text-sm text-gray-400 mb-6">
                  {stats.rooms > 0
                    ? 'Could not reach the API — make sure the server is running on port 3001.'
                    : 'Create your first room from a template below, or go to your Rooms dashboard.'}
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Link href="/rooms"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-lg transition-colors"
                    style={{ backgroundColor: CTA }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = CTA_HOVER)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = CTA)}
                  >
                    Open Rooms Dashboard
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                  <a href="#templates"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#D4C9B8] hover:border-[#111] text-[#111] text-sm font-semibold rounded-lg transition-colors bg-white">
                    Use a template
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleRooms.map((room, i) => (
                    <Link key={room.id} href={`/rooms/${room.id}`}
                      className="group flex flex-col"
                      style={{ animation: `fadeSlideDown 0.35s ease both`, animationDelay: `${i * 60}ms` }}>
                      <div className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:-translate-y-1 ${
                        room.status === 'RUNNING'
                          ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                          : 'border-[#D4C9B8] group-hover:border-[#F5A623] group-hover:shadow-lg'
                      }`}>
                        <RoomTerminalCard room={room} cardIndex={i} />
                      </div>
                    </Link>
                  ))}
                </div>
                {rooms.length > ROOMS_PAGE_SIZE && (
                  <div className="mt-5 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setShowAllRooms(v => !v)}
                      className="px-5 py-2.5 border border-[#D4C9B8] hover:border-[#111] text-sm font-semibold rounded-xl transition-colors bg-white text-[#111]"
                    >
                      {showAllRooms ? `Show less` : `View all ${rooms.length} rooms`}
                    </button>
                    <Link href="/rooms"
                      className="px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-colors"
                      style={{ backgroundColor: CTA }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = CTA_HOVER)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = CTA)}
                    >
                      Manage in Rooms →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Rooms are living systems ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8E0D0] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start">

            {/* Left — what they really are */}
            <div className="lg:w-1/2">
              <span className="text-xs font-bold tracking-widest text-[#F5A623] uppercase mb-3 inline-block">How Rooms Work</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#111111] mb-4 leading-tight">
                Rooms are living systems.<br />Not pages. Not configs.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                Drop agents into a Room. Connect any REST API or blockchain contract as a callable tool.
                Fire it from anywhere — a webhook, a cron job, a smart contract event, a button.
                Every agent shares memory, every decision is logged, every run is replayable.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-7">
                No glue code. No infrastructure wiring. No observability gap.
                You define the goal. Rooms execute, reason, and report back — with a full trace of every step.
              </p>
              <div className="space-y-3">
                {[
                  { Icon: AgentIcon,      label: 'Multi-agent execution',  desc: 'Deploy N agents into one room — they cooperate, share memory, and divide the work' },
                  { Icon: SecurityIcon,   label: 'Policy enforcement',      desc: 'Rate limits, cost caps, and execution policies enforced at runtime — not in your code' },
                  { Icon: LiveRunsIcon,   label: 'Full execution trace',    desc: 'Every token, every tool call, every decision — logged and queryable' },
                  { Icon: AutomationIcon, label: 'Trigger from anything',   desc: 'Webhook, schedule, blockchain event, API call — any signal can fire a Room' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="p-2 bg-[#F9F5EF] border border-[#E8E0D0] rounded-xl flex-shrink-0">
                      <item.Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111111]">{item.label}</p>
                      <p className="text-xs text-gray-400 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live execution terminal showing something powerful */}
            <div className="lg:w-1/2">
              <div className="bg-[#111111] rounded-2xl overflow-hidden border border-[#2a2a2a] shadow-xl">
                {/* Terminal title bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a]">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs text-gray-500 font-mono">openrooms — threat-detection-room — RUNNING</span>
                  <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE
                  </span>
                </div>

                {/* Execution log */}
                <div className="p-4 font-mono text-[11px] space-y-1.5">
                  <div className="text-gray-500"># Room triggered via blockchain event — tx: 0x4f2a…d91c</div>
                  <div className="text-emerald-400">● <span className="text-gray-300">Agent[0] SecurityScanner</span> <span className="text-gray-500">→ DISPATCHED</span></div>
                  <div className="text-emerald-400">● <span className="text-gray-300">Agent[1] ChainReader</span> <span className="text-gray-500">→ DISPATCHED</span></div>
                  <div className="text-blue-400">&nbsp;&nbsp;→ tool: blockchain_read("0xC02a…6Cc2", "balanceOf")</div>
                  <div className="text-blue-400">&nbsp;&nbsp;← result: 847.33 ETH (abnormal — 3σ above baseline)</div>
                  <div className="text-yellow-400">&nbsp;&nbsp;→ tool: http_request(POST /alerts/escalate)</div>
                  <div className="text-yellow-400">&nbsp;&nbsp;← 200 OK · alert_id: ALT-9182</div>
                  <div className="text-purple-400">● <span className="text-gray-300">Agent[0] SecurityScanner</span> <span className="text-gray-500">REASONING iteration 4/5</span></div>
                  <div className="text-gray-500">&nbsp;&nbsp;cross-referencing shared memory: last_seen_balance, tx_pattern…</div>
                  <div className="text-red-400 font-bold">⚠ DECISION: potential wash-trading detected — confidence 0.91</div>
                  <div className="text-emerald-300">&nbsp;&nbsp;→ tool: http_request(POST /risk/flag-address)</div>
                  <div className="text-emerald-300">&nbsp;&nbsp;← address flagged · run_id: RUN-a04b8…</div>
                  <div className="text-gray-600 mt-2 border-t border-[#2a2a2a] pt-2">
                    execution_time: 1.84s · tokens_used: 1,240 · cost: $0.0031
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center gap-3 text-[10px]">
                  <span className="text-gray-500">POST /api/rooms/:id/webhook</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-gray-500">2 agents · 4 tools · 0 manual steps</span>
                  <Link href="/live-runs" className="ml-auto text-[#F5A623] font-bold hover:underline">Watch live →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Actions ──────────────────────────────────────────────────────── */}
      <div id="features" className="bg-[#F9F5EF] border-b border-[#E8E0D0] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 inline-block">Live Actions</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#111111]">Deploy a working system right now</h2>
            <p className="text-gray-400 text-sm mt-1">
              One click creates a Room, provisions a Workflow, and deploys an Agent with a goal. Real infrastructure — not a demo.
            </p>
          </div>

          {/* Inline error instead of alert() */}
          {launchError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <svg viewBox="0 0 20 20" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">{launchError}</p>
                <p className="text-xs text-red-600 mt-1">
                  Start the backend: <code className="font-mono bg-red-100 px-1 rounded">pnpm dev --filter @openrooms/api</code>
                </p>
              </div>
              <button onClick={() => setLaunchError(null)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">✕</button>
            </div>
          )}

          {/* ── Non-tech quick actions (6 cards with SVG icons) ── */}
          <div className="mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">For everyone — no code needed</p>
            <p className="text-xs text-gray-400 mb-5">Click to deploy a real Room + Workflow + Agent. Live in seconds.</p>
            <div className="space-y-2.5">
              {[
                { id: 'email-auto', num: '01', color: '#6EE7B7', badge: 'Messaging', label: 'Auto-reply to emails',
                  sub: 'AI reads, classifies and replies to customer emails around the clock.',
                  icon: (<svg viewBox="0 0 28 28" className="w-6 h-6" fill="none"><rect x="2" y="6" width="24" height="16" rx="4" fill="#6EE7B7" stroke="#111" strokeWidth="1.4"/><path d="M2 10 L14 17 L26 10" stroke="#111" strokeWidth="1.4"/><circle cx="21" cy="8" r="3.5" fill="#F87171" stroke="#111" strokeWidth="1"/><path d="M19.5 8 L20.5 9 L22.5 7" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>),
                  workflow: { name: 'Email Automation', agentGoal: 'Read incoming emails, classify each by intent (support, sales, billing, spam), draft and send an appropriate reply or forward to the right team. Prioritise urgent requests.' } },
                { id: 'pay-alert', num: '02', color: '#FCA5A5', badge: 'Finance', label: 'Payment failure alerts',
                  sub: 'Agents watch Stripe events and notify your team the moment something fails.',
                  icon: (<svg viewBox="0 0 28 28" className="w-6 h-6" fill="none"><rect x="2" y="7" width="24" height="14" rx="4" fill="#FCA5A5" stroke="#111" strokeWidth="1.4"/><rect x="2" y="11" width="24" height="3.5" fill="#111" opacity="0.15"/><circle cx="21" cy="8" r="4" fill="#FBBF24" stroke="#111" strokeWidth="1"/><path d="M21 6 L21 9" stroke="#111" strokeWidth="1.3" strokeLinecap="round"/><circle cx="21" cy="10.5" r="0.6" fill="#111"/></svg>),
                  workflow: { name: 'Payment Monitor', agentGoal: 'Monitor payment events, detect failures or disputes, immediately notify the team via the configured connector, and log each event with amount, customer, and error code.' } },
                { id: 'uptime', num: '03', color: '#93C5FD', badge: 'Ops', label: 'Uptime monitor',
                  sub: 'Know when your website is down before your customers do. Alerts in 60s.',
                  icon: (<svg viewBox="0 0 28 28" className="w-6 h-6" fill="none"><circle cx="14" cy="14" r="11" fill="#93C5FD" stroke="#111" strokeWidth="1.4"/><circle cx="14" cy="14" r="6" fill="none" stroke="#111" strokeWidth="1" opacity="0.3"/><circle cx="14" cy="14" r="2.5" fill="#111"/><path d="M14 14 L18 9" stroke="#111" strokeWidth="1.4" strokeLinecap="round"/></svg>),
                  workflow: { name: 'Uptime Monitor', agentGoal: 'Periodically check the configured health endpoints, measure response times, detect any 4xx/5xx responses or timeouts, and immediately alert via the notification connector.' } },
                { id: 'daily-brief', num: '04', color: '#C4B5FD', badge: 'Analytics', label: 'Daily business brief',
                  sub: 'AI pulls metrics, spots trends, posts a summary to Slack every morning.',
                  icon: (<svg viewBox="0 0 28 28" className="w-6 h-6" fill="none"><rect x="3" y="3" width="22" height="22" rx="5" fill="#C4B5FD" stroke="#111" strokeWidth="1.4"/><rect x="6" y="18" width="4" height="4" rx="1" fill="#111" opacity="0.35"/><rect x="12" y="13" width="4" height="9" rx="1" fill="#111" opacity="0.35"/><rect x="18" y="7" width="4" height="15" rx="1" fill="#111" opacity="0.5"/></svg>),
                  workflow: { name: 'Daily Briefing', agentGoal: 'Pull key business metrics from the configured API connectors, summarise trends, flag anomalies, and post a structured daily brief to the notification channel.' } },
                { id: 'lead-qualify', num: '05', color: '#FDE68A', badge: 'Sales', label: 'Qualify leads automatically',
                  sub: 'Scores inbound leads and routes hot ones to your CRM or sales channel.',
                  icon: (<svg viewBox="0 0 28 28" className="w-6 h-6" fill="none"><circle cx="10" cy="9" r="5" fill="#FDE68A" stroke="#111" strokeWidth="1.4"/><path d="M4 22 C4 17 16 17 16 22" stroke="#111" strokeWidth="1.4" strokeLinecap="round" fill="none"/><path d="M18 12 L20 14 L24 10" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
                  workflow: { name: 'Lead Qualification', agentGoal: 'Receive inbound lead data, score each lead based on company size, intent signals and fit criteria, route high-score leads to CRM via API connector, and send a qualification summary to the sales channel.' } },
                { id: 'data-sync', num: '06', color: '#A7F3D0', badge: 'Data', label: 'Sync data across apps',
                  sub: 'Connect any two systems and let AI keep them in sync — no ETL scripts.',
                  icon: (<svg viewBox="0 0 28 28" className="w-6 h-6" fill="none"><rect x="2" y="4" width="10" height="10" rx="3" fill="#A7F3D0" stroke="#111" strokeWidth="1.4"/><rect x="16" y="14" width="10" height="10" rx="3" fill="#A7F3D0" stroke="#111" strokeWidth="1.4"/><path d="M12 9 Q20 9 20 14" stroke="#111" strokeWidth="1.3" fill="none" strokeLinecap="round"/><path d="M18 12 L20 14 L22 12" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 19 Q8 19 8 14" stroke="#111" strokeWidth="1.3" fill="none" strokeLinecap="round"/><path d="M6 16 L8 14 L10 16" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
                  workflow: { name: 'Data Sync Agent', agentGoal: 'Fetch records from the source API connector, transform and map fields to the destination schema, push updates to the destination connector, and log all sync operations with timestamps and change counts.' } },
              ].map(a => {
                const isLaunching = launching === a.id
                const isDone = launched === a.id
                return (
                  <button key={a.id}
                    onClick={() => useTemplate({ id: a.id, Icon: AgentIcon, title: a.label, tag: 'Quick Action', tagColor: '', accentColor: a.color, description: a.sub, what: [], trigger: 'On demand or scheduled', workflow: a.workflow })}
                    disabled={isLaunching || isDone}
                    className="w-full bg-white border border-[#E8E0D0] rounded-2xl p-4 text-left flex items-center gap-4 hover:border-[#EA580C] hover:shadow-md transition-all duration-200 disabled:opacity-70 group">
                    <span className="text-[11px] font-black font-mono w-7 flex-shrink-0 text-gray-200 group-hover:text-[#EA580C]/30 transition-colors">{a.num}</span>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ background: a.color + '30', border: `1.5px solid ${a.color}` }}>
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-extrabold text-[#111] group-hover:text-[#EA580C] transition-colors">{a.label}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F0EAE0] text-gray-500">{a.badge}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-snug">{a.sub}</p>
                    </div>
                    <div className="flex-shrink-0 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      style={{ color: isDone ? '#10B981' : '#EA580C' }}>
                      {isDone ? '✓ Live' : isLaunching
                        ? <div className="w-3.5 h-3.5 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
                        : <>Deploy<svg viewBox="0 0 12 12" className="w-3 h-3 ml-0.5" fill="none"><path d="M2 6 L10 6 M7 3 L10 6 L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Advanced / agentic blueprints ── */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">For developers &amp; teams — advanced systems</p>
          <p className="text-xs text-gray-400 mb-4">Orchestration, swarms, bots and autonomous pipelines. Real backend — runs in prod.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TEMPLATES.map(t => {
              const isLaunching = launching === t.id
              const isDone      = launched === t.id
              const TIcon       = t.Icon
              return (
                <div key={t.id} className="bg-[#F9F5EF] border border-[#E8E0D0] rounded-2xl p-6 flex flex-col hover:border-[#F5A623] hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <TIcon className="w-10 h-10" />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.tagColor}`}>{t.tag}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#111111] mb-2">{t.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">{t.description}</p>
                  <ul className="space-y-1.5 mb-4">
                    {t.what.map(w => (
                      <li key={w} className="flex items-start gap-2 text-xs text-gray-500">
                        <span className="font-bold mt-0.5" style={{ color: CTA }}>→</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                  <div className="text-[10px] text-gray-400 mb-4 pb-4 border-b border-[#E8E0D0]">
                    {t.trigger}
                  </div>
                  <button
                    onClick={() => useTemplate(t)}
                    disabled={isLaunching || isDone}
                    className="w-full py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-white disabled:opacity-60"
                    style={{ backgroundColor: isDone ? '#10B981' : CTA }}
                    onMouseEnter={e => { if (!isDone) e.currentTarget.style.backgroundColor = CTA_HOVER }}
                    onMouseLeave={e => { if (!isDone) e.currentTarget.style.backgroundColor = CTA }}
                  >
                    {isDone ? (
                      <>&#10003; Opening room…</>
                    ) : isLaunching ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deploying to backend…</>
                    ) : (
                      <><PlayIcon className="w-3.5 h-3.5" /> Run this system</>
                    )}
                  </button>
                  {!isDone && !isLaunching && (
                    <p className="text-[10px] text-center text-gray-400 mt-2">Creates Room + Workflow + Agent via API</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 p-5 bg-[#F9F5EF] border border-[#E8E0D0] rounded-2xl">
            <div className="flex-1">
              <p className="font-bold text-[#111111] text-sm">Start from scratch</p>
              <p className="text-xs text-gray-400 mt-0.5">Create an empty Room, add your own agents and connectors.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/rooms"
                className="px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-colors"
                style={{ backgroundColor: CTA }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = CTA_HOVER)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = CTA)}
              >
                New Room
              </Link>
              <Link href="/connectors" className="px-5 py-2.5 border border-[#E8E0D0] hover:border-[#111111] text-sm font-bold rounded-xl transition-colors bg-white">
                Add Connector
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <div className="bg-[#F9F5EF] border-b border-[#E8E0D0] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 inline-block">Getting started</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#111111]">From zero to autonomous system in four steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map(({ step, Icon, title, desc }) => (
              <div key={step} className="bg-white border border-[#E8E0D0] rounded-2xl p-6 hover:border-[#F5A623] hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl font-black text-gray-100 group-hover:text-[#F5A623]/20 transition-colors">{step}</span>
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="font-extrabold text-[#111111] mb-2 text-sm">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Capabilities grid ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8E0D0] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 inline-block">Built for production</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#111111]">Infrastructure that doesn&apos;t flinch.</h2>
            <p className="text-gray-400 text-sm mt-1 max-w-lg">
              While you sleep, agents run. Every decision logged, every execution auditable, every failure recoverable.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-[#F9F5EF] border border-[#E8E0D0] rounded-2xl p-6 flex items-start gap-4 hover:border-[#F5A623] hover:shadow-md transition-all group">
                <div className="p-2.5 bg-white border border-[#E8E0D0] rounded-xl flex-shrink-0 group-hover:border-[#F5A623] transition-colors">
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#111111] text-sm mb-1">{title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: '∞',    label: 'Agents per workspace' },
              { value: '100%', label: 'Execution logged' },
              { value: '<1s',  label: 'Webhook response' },
              { value: '3',    label: 'Supported chains' },
            ].map(s => (
              <div key={s.label} className="bg-[#F9F5EF] border border-[#E8E0D0] rounded-xl p-4 text-center">
                <div className="text-xl font-black text-[#111111]">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Who is it for ────────────────────────────────────────────────────── */}
      <div className="bg-[#F9F5EF] border-b border-[#E8E0D0] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2 inline-block">Who uses OpenRooms</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#111111]">Powerful for any team that moves fast and needs AI to keep up</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WHO_FOR.map(card => (
              <div key={card.title} className="bg-white border border-[#E8E0D0] hover:border-[#F5A623] rounded-2xl p-7 flex flex-col hover:shadow-md transition-all group">
                <card.Icon className="w-14 h-14 mb-5" />
                <h3 className="text-lg font-extrabold text-[#111111] mb-2">{card.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-1">{card.description}</p>
                <Link href={card.href} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111111] group-hover:text-[#F5A623] transition-colors">
                  {card.cta} <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA footer ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8E0D0] py-14">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#111111] mb-3">Ready to launch your first Room?</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Create a room, deploy an agent, connect a tool, trigger it — all in under 5 minutes.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleStartFree}
              className="px-7 py-3.5 text-white font-bold rounded-xl text-sm transition-all inline-flex items-center gap-2"
              style={{ backgroundColor: CTA }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = CTA_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = CTA)}
            >
              Start for free <ChevronRightIcon className="w-4 h-4" />
            </button>
            <a href="#features" className="px-7 py-3.5 border border-[#E8E0D0] hover:border-[#111111] text-[#111111] font-semibold rounded-xl text-sm transition-colors bg-[#F9F5EF]">
              Explore features
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom dock ──────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4">
        <div className="bg-white border border-[#E8E0D0] rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-5 shadow-lg hover:shadow-xl transition-all duration-300 overflow-x-auto">
          {dockApps.map(app => {
            const Icon = app.Icon
            return (
              <Link key={app.id} href={app.href} className="group relative flex-shrink-0">
                <div className="transition-all duration-200 hover:scale-125 hover:-translate-y-3 active:scale-95">
                  <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                {/* Tooltip with desc */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#111] text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                  <p className="text-[11px] font-bold">{app.name}</p>
                  <p className="text-[10px] text-white/50">{app.desc}</p>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#111] rotate-45" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
