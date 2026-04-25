'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createWorkflow, createRoom, createAgent } from '@/lib/api'
import {
  AutomationIcon, AgentIcon, ReportsIcon, MemoryIcon,
  WorkflowIcon, APIIcon, LiveRunsIcon, RoomsIcon,
} from '@/components/icons/system'

// ─── Automation definitions ───────────────────────────────────────────────────
// Each automation is a one-click deploy that creates a room + agent ready to run

const AUTOMATIONS = [
  {
    id: 'morning-briefing',
    emoji: '🌅',
    Icon: ReportsIcon,
    title: 'Morning Briefing',
    who: 'For everyone',
    tagColor: 'bg-yellow-100 text-yellow-800',
    headline: 'Wake up to a summary of weather, news, and your day.',
    description: 'Every morning at 8am, this Room checks the weather forecast, pulls the top 5 news headlines, and sends you a short briefing. Like having a personal assistant who reads the internet for you.',
    example: '☀️ London: 18°C, light clouds\n📰 Top story: Markets rally on Fed decision\n📰 AI regulation bill passes committee\n📰 SpaceX Starship completes ocean landing\n\n→ Today looks productive. No major disruptions.',
    tools: ['weather', 'news_headlines'],
    outputTo: 'Slack, email, or save to memory',
    goal: 'Check the current weather conditions and fetch the top 5 latest news headlines. Summarise both into a short, friendly morning briefing that a person can read in 30 seconds. Start with weather, then news, then a one-sentence observation.',
    schedule: '0 8 * * *',
    accentColor: '#FCD34D',
  },
  {
    id: 'support-bot',
    emoji: '💬',
    Icon: AgentIcon,
    title: 'Support Bot',
    who: 'For startups',
    tagColor: 'bg-blue-100 text-blue-800',
    headline: 'Automatically read and reply to support tickets.',
    description: 'Connect your support inbox. Every new message gets classified, answered if straightforward, or escalated with full context already written. Your team only sees the hard ones.',
    example: 'Ticket: "How do I reset my password?"\n→ Agent: "Hi! Go to Settings → Security → Reset Password. Link sent to your email."\n→ Auto-replied in 4 seconds.',
    tools: ['http_request', 'memory_query', 'calculator'],
    outputTo: 'Webhook to your inbox',
    goal: 'Receive the incoming support request. Read it carefully and classify its type (billing, technical, general). If it is a common question you can answer from the knowledge base, write a complete helpful reply. If it requires human intervention, write a detailed escalation summary with all context. Be friendly and concise.',
    schedule: null,
    accentColor: '#93C5FD',
  },
  {
    id: 'data-reporter',
    emoji: '📊',
    Icon: APIIcon,
    title: 'Weekly Data Report',
    who: 'For teams',
    tagColor: 'bg-emerald-100 text-emerald-800',
    headline: 'Pull data from any API, summarise it, send it every week.',
    description: 'Configure any data source — your CRM, analytics platform, or public API. Every Friday, an agent pulls the numbers, writes a one-page summary, and sends it to Slack or email. No dashboards to open.',
    example: 'Weekly Report — Apr 25\n━━━━━━━━━━━━━\nNew signups: 142 (+18% vs last week)\nRevenue: $12,450\nTop channel: Organic search (41%)\n\n→ Strong week. Continue current SEO push.',
    tools: ['http_request', 'news_headlines', 'calculator'],
    outputTo: 'Slack or email every Friday',
    goal: 'Fetch the latest metrics from the configured data source API. Analyse the numbers and compare to the previous period if available. Write a concise weekly report with: total numbers, percentage changes, key observations, and one actionable recommendation. Keep it under 200 words.',
    schedule: '0 9 * * 5',
    accentColor: '#6EE7B7',
  },
  {
    id: 'holiday-planner',
    emoji: '📅',
    Icon: AutomationIcon,
    title: 'Holiday & Event Planner',
    who: 'For anyone',
    tagColor: 'bg-purple-100 text-purple-800',
    headline: 'Never miss a public holiday, deadline, or key date.',
    description: 'At the start of each month, this Room checks upcoming public holidays, counts working days, and produces a clear calendar brief. Useful for scheduling, payroll, or just planning your life.',
    example: 'May 2025 — Working Calendar\n━━━━━━━━━━━━━\nPublic holidays: 2 (Early May, Late May)\nWorking days: 21\nWeekends: 8\n\n→ May is shorter than average. Plan deadlines accordingly.',
    tools: ['public_holidays', 'calculator'],
    outputTo: 'Slack, email, or memory',
    goal: 'Fetch the public holidays for the current and next month. Count the total working days, non-working days, and weekends. List each holiday with its date and name. Write a short calendar brief explaining what this means for scheduling and productivity. Keep it friendly and clear.',
    schedule: '0 9 1 * *',
    accentColor: '#C4B5FD',
  },
  {
    id: 'price-monitor',
    emoji: '💸',
    Icon: MemoryIcon,
    title: 'Price & Availability Monitor',
    who: 'For shoppers & traders',
    tagColor: 'bg-orange-100 text-orange-800',
    headline: 'Watch any price or stock and alert you when it moves.',
    description: 'Point it at any API that returns a price or count. The agent runs every hour, compares the current value to what it stored in memory last time, and alerts you the moment it changes past your threshold.',
    example: 'BTC Price Alert\n━━━━━━━━━━━━━\nCurrent: $62,450 (was $60,100)\nChange: +$2,350 (+3.9%)\nThreshold: ±3%\n\n⚠️ ALERT: Price moved above threshold.',
    tools: ['http_request', 'memory_query', 'calculator'],
    outputTo: 'Slack or webhook when threshold crossed',
    goal: 'Fetch the current price or value from the configured API endpoint. Read the last recorded value from Room memory. Calculate the percentage change. If the change exceeds 3%, write a clear alert message with the old value, new value, and percentage change. Always write the current value back to memory for the next run. If no change or change is small, write a quiet status update.',
    schedule: '0 * * * *',
    accentColor: '#FCA5A5',
  },
  {
    id: 'content-brief',
    emoji: '✍️',
    Icon: WorkflowIcon,
    title: 'Content Brief Generator',
    who: 'For creators & marketers',
    tagColor: 'bg-pink-100 text-pink-800',
    headline: 'Give it a topic. Get a full content brief in seconds.',
    description: 'Pass a topic via webhook or trigger it manually. The agent researches the space, identifies angles, suggests a structure, and writes a complete content brief your team can use immediately. Replaces 2 hours of research.',
    example: 'Brief: "AI in Healthcare 2025"\n━━━━━━━━━━━━━\nAngle: How hospitals reduce admin load\nAudience: Hospital IT directors\nKey points: 3 case studies, ROI data, risks\nWord count: 1,200\nCall to action: Book a demo\n\n→ Full outline attached.',
    tools: ['news_headlines', 'http_request', 'memory_query'],
    outputTo: 'Webhook, Slack, or memory',
    goal: 'Research the given topic by fetching relevant news and data. Identify the most compelling angle for a content piece. Write a complete content brief including: target audience, key message, 3-5 main points with evidence, suggested structure, recommended word count, and a call to action. Make it immediately usable by a writer.',
    schedule: null,
    accentColor: '#FBCFE8',
  },
]

// ─── Deploy one automation ─────────────────────────────────────────────────────
async function deployAutomation(a: typeof AUTOMATIONS[0]): Promise<string> {
  const uid = Date.now().toString(36).slice(-5)
  const wf = await createWorkflow({ name: `${a.title} Flow ${uid}`, description: a.description })
  const room = await createRoom({ name: `${a.title} ${uid}`, description: a.headline, workflowId: wf.id })
  await createAgent({
    name: `${a.title} Agent ${uid}`,
    goal: a.goal,
    roomId: room.id,
    allowedTools: a.tools,
    policyConfig: { maxLoopIterations: 3, maxCostPerExecution: 0.10 },
  })
  return room.id
}

// ─── Automation card ──────────────────────────────────────────────────────────
function AutomationCard({ a, onDeploy, deploying, deployed }: {
  a: typeof AUTOMATIONS[0]
  onDeploy: () => void
  deploying: boolean
  deployed: string | null
}) {
  const [showExample, setShowExample] = useState(false)
  const router = useRouter()

  return (
    <div className="bg-white border-2 border-[#E8E0D0] rounded-2xl overflow-hidden hover:border-[#EA580C]/40 hover:shadow-[0_4px_24px_rgba(234,88,12,0.08)] transition-all duration-200 group flex flex-col">
      {/* Accent top strip */}
      <div className="h-1" style={{ backgroundColor: a.accentColor }} />

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="text-3xl flex-shrink-0">{a.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-base font-black text-[#111]">{a.title}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.tagColor}`}>{a.who}</span>
            </div>
            <p className="text-xs font-semibold text-gray-600">{a.headline}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">{a.description}</p>

        {/* Tools used */}
        <div className="flex flex-wrap gap-1 mb-4">
          {a.tools.map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 bg-[#F9F5EF] border border-[#E8E0D0] rounded font-mono text-gray-500">{t}</span>
          ))}
        </div>

        {/* Example output toggle */}
        <button onClick={() => setShowExample(s => !s)}
          className="text-[10px] font-bold text-[#EA580C] hover:underline text-left mb-3">
          {showExample ? '↑ Hide' : '→ See example output'}
        </button>

        {showExample && (
          <pre className="text-[10px] font-mono text-gray-600 bg-[#F9F5EF] rounded-xl p-3 mb-4 whitespace-pre-wrap leading-relaxed border border-[#E8E0D0]">
            {a.example}
          </pre>
        )}

        {/* Output destination */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-4">
          <span className="text-gray-300">→</span>
          <span>Sends to: <span className="font-semibold text-gray-500">{a.outputTo}</span></span>
        </div>

        {/* CTA */}
        {deployed ? (
          <Link href={`/rooms/${deployed}`}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5">
            <RoomsIcon className="w-4 h-4" />
            Open Room →
          </Link>
        ) : (
          <button onClick={onDeploy} disabled={deploying}
            className="w-full py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
            {deploying
              ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Deploying…</>
              : <>Deploy this Automation →</>
            }
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function AutomationsPage() {
  const router = useRouter()
  const [deploying, setDeploying] = useState<string | null>(null)
  const [deployed, setDeployed] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  async function handleDeploy(a: typeof AUTOMATIONS[0]) {
    setDeploying(a.id)
    setError(null)
    try {
      const roomId = await deployAutomation(a)
      setDeployed(prev => ({ ...prev, [a.id]: roomId }))
      setTimeout(() => router.push(`/rooms/${roomId}`), 800)
    } catch (e: any) {
      setError(e.message || 'Deploy failed — check the API is running.')
    } finally { setDeploying(null) }
  }

  return (
    <div className="min-h-screen bg-[#F9F5EF]">

      {/* Header */}
      <div className="border-b-2 border-black bg-white px-6 md:px-10 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#EA580C] uppercase mb-2">Pre-built automations</p>
              <h1 className="text-3xl md:text-4xl font-black text-[#111] mb-3 leading-tight">
                Deploy an AI worker<br className="hidden md:block" /> in one click.
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                Each automation is a live Room — an agent with a goal, the right tools, and a schedule.
                Click deploy. It's running. No code, no config, no API keys from you.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/playground"
                className="px-5 py-2.5 border border-black hover:bg-black hover:text-white text-sm font-bold rounded-xl transition-all text-center">
                Try the Playground →
              </Link>
              <Link href="/rooms"
                className="px-5 py-2.5 text-xs font-semibold text-gray-500 hover:text-[#111] text-center">
                View my Rooms
              </Link>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold text-sm">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* What you actually get callout */}
      <div className="bg-[#111] px-6 md:px-10 py-5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-6 text-xs text-gray-400">
          <span className="text-white font-bold text-sm">What you get with every automation:</span>
          {['Live execution terminal', 'Full decision trace', 'Persistent memory', 'Webhook trigger URL', 'Cost controls', 'Slack / email output'].map(f => (
            <span key={f} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{f}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {AUTOMATIONS.map(a => (
            <AutomationCard
              key={a.id}
              a={a}
              onDeploy={() => handleDeploy(a)}
              deploying={deploying === a.id}
              deployed={deployed[a.id] ?? null}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 bg-white border-2 border-black rounded-2xl text-center shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <p className="text-lg font-black text-[#111] mb-2">Need something custom?</p>
          <p className="text-sm text-gray-500 mb-5">Build any automation from scratch — deploy agents with your own goals, connect your own APIs, trigger from anywhere.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/rooms" className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-xl text-sm transition-colors">Create a Room →</Link>
            <Link href="/playground" className="px-6 py-3 border border-black hover:bg-black hover:text-white font-bold rounded-xl text-sm transition-all">Try Playground →</Link>
          </div>
        </div>
      </div>

    </div>
  )
}
