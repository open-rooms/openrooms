'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OpenRoomsLogo } from '@/components/openrooms-logo'

const CTA = '#EA580C'
const CTA_HOVER = '#C2410C'

// ─── Contextual icons for chat messages ──────────────────────────────────────
function IconPayment() {
  return (
    <svg viewBox="0 0 22 22" className="w-4 h-4" fill="none">
      <rect x="2" y="5" width="18" height="12" rx="3" fill="#FBBF24" stroke="#111" strokeWidth="1.3"/>
      <rect x="2" y="9" width="18" height="3" fill="#111" opacity="0.2"/>
      <rect x="5" y="13" width="4" height="1.5" rx="0.75" fill="#111" opacity="0.4"/>
    </svg>
  )
}
function IconSupport() {
  return (
    <svg viewBox="0 0 22 22" className="w-4 h-4" fill="none">
      <circle cx="11" cy="11" r="9" fill="#93C5FD" stroke="#111" strokeWidth="1.3"/>
      <path d="M7 10 Q7 7 11 7 Q15 7 15 10 Q15 13 11 13" stroke="#111" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <circle cx="11" cy="16" r="1.2" fill="#111"/>
    </svg>
  )
}
function IconPipeline() {
  return (
    <svg viewBox="0 0 22 22" className="w-4 h-4" fill="none">
      <rect x="2" y="3" width="5" height="5" rx="1.5" fill="#6EE7B7" stroke="#111" strokeWidth="1.2"/>
      <rect x="8.5" y="3" width="5" height="5" rx="1.5" fill="#6EE7B7" stroke="#111" strokeWidth="1.2"/>
      <rect x="15" y="3" width="5" height="5" rx="1.5" fill="#6EE7B7" stroke="#111" strokeWidth="1.2"/>
      <line x1="7" y1="5.5" x2="8.5" y2="5.5" stroke="#111" strokeWidth="1"/>
      <line x1="13.5" y1="5.5" x2="15" y2="5.5" stroke="#111" strokeWidth="1"/>
      <rect x="5" y="13" width="12" height="5" rx="2" fill="#F4A89A" stroke="#111" strokeWidth="1.2"/>
      <line x1="11" y1="8" x2="11" y2="13" stroke="#111" strokeWidth="1"/>
    </svg>
  )
}
function IconMonitor() {
  return (
    <svg viewBox="0 0 22 22" className="w-4 h-4" fill="none">
      <rect x="2" y="3" width="18" height="13" rx="3" fill="#C4B5FD" stroke="#111" strokeWidth="1.3"/>
      <path d="M5 12 L7 9 L9 11 L12 6 L15 10 L17 8" stroke="#111" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <rect x="8" y="16" width="6" height="2" rx="1" fill="#111" opacity="0.3"/>
    </svg>
  )
}

// Per-conversation user icon
const CONV_ICONS = [<IconPayment key="p"/>, <IconSupport key="s"/>, <IconPipeline key="pi"/>]

// ─── Chat conversation data ───────────────────────────────────────────────────
interface ChatLine { from: 'user' | 'agent' | 'sys'; text: string; delay: number }

const CHATS: ChatLine[][] = [
  [
    { from: 'user',  text: 'Alert my team when a payment fails', delay: 0 },
    { from: 'sys',   text: '→ spawning payment-monitor agent…', delay: 850 },
    { from: 'agent', text: 'Connected to Stripe webhook. Watching for failures.', delay: 1700 },
    { from: 'sys',   text: '→ Workflow: failure → Slack + email. ✓ Active', delay: 2500 },
    { from: 'agent', text: 'First test run passed in 143ms. Your team is covered.', delay: 3300 },
    { from: 'user',  text: 'Can it auto-retry the charge?', delay: 4200 },
    { from: 'agent', text: 'Retry node added — max 3×, 1h delay. Already live.', delay: 5000 },
  ],
  [
    { from: 'user',  text: 'Auto-reply to Zendesk tickets when possible', delay: 0 },
    { from: 'sys',   text: '→ deploying support-triage Room…', delay: 750 },
    { from: 'agent', text: 'Connector: Zendesk registered. Reading ticket queue.', delay: 1600 },
    { from: 'agent', text: 'Ticket #4821 "Reset password?" → reply drafted + sent.', delay: 2400 },
    { from: 'sys',   text: '→ CSAT predicted 4.7★. Resolved in 1.1s', delay: 3100 },
    { from: 'user',  text: 'What about complex tickets?', delay: 4000 },
    { from: 'agent', text: 'Flagged + routed with full context. 91 resolved today.', delay: 4800 },
  ],
  [
    { from: 'user',  text: 'Set up ingest → classify → route pipeline', delay: 0 },
    { from: 'sys',   text: '→ provisioning data-pipeline Room…', delay: 700 },
    { from: 'agent', text: 'Agent 1 (ingest) live on /webhook/data.', delay: 1500 },
    { from: 'agent', text: 'Agent 2 (classify) loaded GPT-4o. Awaiting events.', delay: 2300 },
    { from: 'agent', text: 'Agent 3 (router) — 4 downstream connectors configured.', delay: 3000 },
    { from: 'sys',   text: '→ Test event: classified in 890ms. Pipeline live ✓', delay: 3700 },
    { from: 'user',  text: 'Log every decision for audit trail', delay: 4600 },
    { from: 'agent', text: 'Trace logger on. Every step replayable forever.', delay: 5400 },
  ],
]
const TAB_LABELS = ['Automation', 'Support AI', 'Dev Pipeline']

// ─── Bot face avatar ──────────────────────────────────────────────────────────
function BotAvatar() {
  return (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <rect x="4" y="8" width="32" height="25" rx="8" fill="#F4A89A" stroke="#111" strokeWidth="2"/>
      <rect x="2" y="16" width="4" height="6" rx="2" fill="#E8917F" stroke="#111" strokeWidth="1.5"/>
      <rect x="34" y="16" width="4" height="6" rx="2" fill="#E8917F" stroke="#111" strokeWidth="1.5"/>
      <line x1="20" y1="8" x2="20" y2="3" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="2.5" r="2.5" fill="#F4A89A" stroke="#111" strokeWidth="1.5"/>
      <ellipse cx="13" cy="19" rx="4" ry="4.5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="13" cy="19.5" r="2.3" fill="#111"/>
      <circle cx="14.2" cy="18" r="0.9" fill="white"/>
      <ellipse cx="27" cy="19" rx="4" ry="4.5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="27" cy="19.5" r="2.3" fill="#111"/>
      <circle cx="28.2" cy="18" r="0.9" fill="white"/>
      <path d="M13 28 Q20 33 27 28" stroke="#111" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

// ─── Terminal with WhatsApp-style chat inside ─────────────────────────────────
function AgentTerminal() {
  const [tabIdx, setTabIdx] = useState(0)
  const [shown, setShown] = useState(0)
  const [typing, setTyping] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setShown(0)
    setTyping(false)

    const conv = CHATS[tabIdx]!
    conv.forEach((line, i) => {
      const t = setTimeout(() => {
        if (line.from === 'agent') setTyping(true)
        setTimeout(() => {
          setTyping(false)
          setShown(i + 1)
          bodyRef.current?.scrollTo({ top: 9999, behavior: 'smooth' })
        }, line.from === 'agent' ? 500 : 80)
      }, line.delay)
      timers.current.push(t)
    })

    const last = conv[conv.length - 1]!
    const cycle = setTimeout(() => setTabIdx(i => (i + 1) % CHATS.length), last.delay + 4000)
    timers.current.push(cycle)
    return () => timers.current.forEach(clearTimeout)
  }, [tabIdx])

  const conv = CHATS[tabIdx]!
  const slug = ['payment-monitor', 'support-triage', 'data-pipeline'][tabIdx]!
  const UserIcon = CONV_ICONS[tabIdx]!

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0D0F1A' }}>
      {/* macOS title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8" style={{ background: '#171928' }}>
        <span className="w-3 h-3 rounded-full bg-red-400/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
        <span className="w-3 h-3 rounded-full bg-green-400/80" />
        <div className="flex gap-1 ml-3">
          {TAB_LABELS.map((t, i) => (
            <button key={t} onClick={() => setTabIdx(i)}
              className={`text-[10px] font-mono px-2.5 py-0.5 rounded transition-all ${i === tabIdx ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'}`}>
              {t}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[10px] text-white/25">{slug}</span>
        <span className="flex items-center gap-1 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400">live</span>
        </span>
      </div>

      {/* Chat messages */}
      <div ref={bodyRef} className="p-4 space-y-2.5 overflow-y-auto" style={{ minHeight: 255, maxHeight: 290 }}>
        {conv.slice(0, shown).map((line, i) => {
          if (line.from === 'sys') {
            return (
              <div key={i} className="flex items-center gap-2 py-0.5">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-[10px] font-mono text-white/30 whitespace-nowrap px-1">{line.text}</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
            )
          }
          if (line.from === 'user') {
            return (
              <div key={i} className="flex justify-end items-end gap-1.5">
                <div className="max-w-[76%] px-3 py-2 rounded-2xl rounded-tr-none"
                  style={{ background: '#1E2240', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[11.5px] font-mono leading-snug text-white/80">{line.text}</p>
                </div>
                {/* Contextual user icon */}
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {UserIcon}
                </div>
              </div>
            )
          }
          return (
            <div key={i} className="flex items-end gap-1.5">
              <BotAvatar />
              <div className="max-w-[76%] px-3 py-2 rounded-2xl rounded-tl-none"
                style={{ background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.22)' }}>
                <p className="text-[11.5px] font-mono leading-snug text-[#FCA882]">{line.text}</p>
              </div>
            </div>
          )
        })}
        {typing && (
          <div className="flex items-end gap-1.5">
            <BotAvatar />
            <div className="px-3 py-2.5 rounded-2xl rounded-tl-none"
              style={{ background: 'rgba(234,88,12,0.08)', border: '1px solid rgba(234,88,12,0.18)' }}>
              <div className="flex gap-1">
                {[0,1,2].map(j => (
                  <span key={j} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                    style={{ animationDelay: `${j*0.14}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar — decorative */}
      <div className="px-4 py-2.5 border-t border-white/8 flex items-center gap-2.5">
        <div className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-[11px] font-mono text-white/20">
          Tell your agent what to automate…
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: CTA }}>
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
            <path d="M3 8 L13 8 M9 4 L13 8 L9 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Pitch items ──────────────────────────────────────────────────────────────
const PITCH = [
  {
    icon: (
      <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
        <rect x="2" y="6" width="20" height="13" rx="3" fill="#6EE7B7" stroke="#111" strokeWidth="1.2"/>
        <path d="M2 10 L12 16 L22 10" stroke="#111" strokeWidth="1.2"/>
        <circle cx="19" cy="5" r="3" fill="#F87171" stroke="#111" strokeWidth="1"/>
      </svg>
    ),
    text: 'AI that replies to emails, tickets and Slack — without you staying online.',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
        <circle cx="14" cy="14" r="11" fill="#C4B5FD" stroke="#111" strokeWidth="1.2"/>
        <path d="M9 14 L12.5 17.5 L20 10" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    text: 'Compliance monitors that scan, flag and report in real-time — no cron jobs.',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
        <rect x="3" y="3" width="9" height="9" rx="2.5" fill="#6EE7B7" stroke="#111" strokeWidth="1.2"/>
        <rect x="16" y="3" width="9" height="9" rx="2.5" fill="#6EE7B7" stroke="#111" strokeWidth="1.2"/>
        <rect x="3" y="16" width="9" height="9" rx="2.5" fill="#6EE7B7" stroke="#111" strokeWidth="1.2"/>
        <rect x="16" y="16" width="9" height="9" rx="2.5" fill="#FBBF24" stroke="#111" strokeWidth="1.2"/>
        <line x1="7.5" y1="12" x2="7.5" y2="16" stroke="#111" strokeWidth="1"/>
        <line x1="20.5" y1="12" x2="20.5" y2="16" stroke="#111" strokeWidth="1"/>
        <line x1="12" y1="7.5" x2="16" y2="7.5" stroke="#111" strokeWidth="1"/>
      </svg>
    ),
    text: 'Multi-step workflows chaining APIs, databases and models — wired in minutes.',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
        <rect x="3" y="7" width="22" height="14" rx="4" fill="#FBBF24" stroke="#111" strokeWidth="1.2"/>
        <circle cx="14" cy="14" r="4" fill="#111"/>
        <circle cx="14" cy="14" r="2" fill="#FBBF24"/>
        <path d="M5 14 Q7 10 9 14" stroke="#111" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M19 14 Q21 10 23 14" stroke="#111" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    text: 'Every agent decision traced, every tool call logged — full audit trail by default.',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
        <path d="M14 3 L16.5 10 L24 10.5 L18.5 15.5 L20.5 23 L14 19.5 L7.5 23 L9.5 15.5 L4 10.5 L11.5 10 Z"
          fill="#F4A89A" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    text: 'Trigger any Room from a webhook, schedule, or a single API call — your rules.',
  },
]

// ─── Boot steps ───────────────────────────────────────────────────────────────
const BOOT_STEPS = ['Initialising agent runtime…', 'Connecting to event bus…', 'Provisioning workspace…', 'All systems go.']

// ─── Included icons ───────────────────────────────────────────────────────────
const INCLUDED = [
  {
    icon: (
      <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none">
        <rect x="3" y="5" width="22" height="18" rx="5" fill="#F4A89A" stroke="#111" strokeWidth="1.5"/>
        <line x1="3" y1="11" x2="25" y2="11" stroke="#111" strokeWidth="1.2"/>
        <circle cx="8" cy="8" r="1.5" fill="#111" opacity="0.4"/>
        <circle cx="12" cy="8" r="1.5" fill="#111" opacity="0.4"/>
        <circle cx="16" cy="8" r="1.5" fill="#111" opacity="0.4"/>
        <rect x="7" y="15" width="14" height="2" rx="1" fill="#111" opacity="0.3"/>
        <rect x="7" y="19" width="9" height="2" rx="1" fill="#111" opacity="0.3"/>
      </svg>
    ),
    text: 'Autonomous agents with memory and tool access',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none">
        <path d="M7 4 L4 14 L12 14 L9 24 L24 10 L15 10 L19 4 Z" fill="#FBBF24" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    text: 'Real-time workflow execution + event bus',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none">
        <circle cx="14" cy="12" r="7" fill="#7DD3FC" stroke="#111" strokeWidth="1.5"/>
        <path d="M10 12 C10 10 11.8 8.5 14 8.5 C16.2 8.5 18 10 18 12" stroke="#111" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <rect x="12.2" y="11" width="3.5" height="5" rx="1.5" fill="#111"/>
        <rect x="10" y="20" width="8" height="2" rx="1" fill="#111" opacity="0.3"/>
      </svg>
    ),
    text: 'Register any REST API as an agent-callable tool',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none">
        <rect x="3" y="16" width="5" height="9" rx="2" fill="#6EE7B7" stroke="#111" strokeWidth="1.3"/>
        <rect x="11" y="10" width="5" height="15" rx="2" fill="#6EE7B7" stroke="#111" strokeWidth="1.3"/>
        <rect x="19" y="4" width="5" height="21" rx="2" fill="#6EE7B7" stroke="#111" strokeWidth="1.3"/>
      </svg>
    ),
    text: 'Full observability — every decision traced',
  },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [workspace, setWorkspace] = useState('')
  const [loading, setLoading] = useState(false)
  const [bootStep, setBootStep] = useState(-1)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !workspace.trim()) { setError('Both fields are required.'); return }
    if (!email.includes('@')) { setError('Enter a valid work email.'); return }
    setError('')
    setLoading(true)
    setBootStep(0)
    BOOT_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setBootStep(i)
        if (i === BOOT_STEPS.length - 1) {
          setTimeout(() => {
            localStorage.setItem('or_workspace', JSON.stringify({ name: workspace.trim(), email: email.trim(), token: `demo_${Date.now()}` }))
            router.push('/home')
          }, 600)
        }
      }, i * 750)
    })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#F9F5EF' }}>

      {/* ── LEFT: hero + chat terminal + pitch ──────────────────────────────── */}
      <div className="hidden md:flex flex-col flex-1 px-10 py-10 max-w-[54%] relative overflow-hidden">
        {/* grid texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-20 -left-20 w-80 h-80 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,168,154,0.15) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <OpenRoomsLogo size={44} textSize="text-xl" />
          <p className="mt-1 text-[11px] text-gray-400 font-mono tracking-wide">
            Control plane for AI agents, workflows and autonomous systems.
          </p>
        </div>

        {/* Hero — powerful, dangerous, humble */}
        <div className="relative z-10 mt-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#EA580C] mb-2">OpenRooms</p>
          <h1 className="text-[28px] font-extrabold text-[#111] leading-tight">
            Ship AI systems that<br/>work in prod,<br/>not just in demos.
          </h1>
          <p className="mt-4 text-[13px] text-gray-500 leading-relaxed max-w-xs">
            Orchestrate agents, workflows, APIs and blockchain across any model —
            without babysitting infrastructure. OpenRooms runs it while you sleep.
          </p>
        </div>

        {/* Chat terminal */}
        <div className="relative z-10 mt-7">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Watch it work</p>
            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />live agent
            </span>
          </div>
          <AgentTerminal />
        </div>

        {/* Pitch items */}
        <div className="relative z-10 mt-7 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">What you can build today</p>
          {PITCH.map((p, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-[#E0D6CC] bg-white shadow-sm mt-0.5">
                {p.icon}
              </div>
              <p className="text-[12.5px] text-[#333] leading-snug pt-1.5">{p.text}</p>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="relative z-10 mt-7 flex flex-wrap gap-4 text-[11px] text-gray-400">
          {['Open infrastructure', 'No vendor lock-in', 'Deploy anywhere', 'Full audit trail'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <svg viewBox="0 0 10 10" className="w-3 h-3 flex-shrink-0" fill="none">
                <circle cx="5" cy="5" r="4" fill="#6EE7B7"/>
                <path d="M3 5 L4.5 6.5 L7 3.5" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── RIGHT: form ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 md:max-w-[46%]">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8"><OpenRoomsLogo size={42} textSize="text-xl" /></div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#111]">Get your workspace</h2>
            <p className="mt-2 text-[13px] text-gray-500 leading-relaxed">
              Free to start. Your first Room, agent and workflow are running in under 2 minutes.
            </p>
          </div>

          {!loading ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 tracking-wide uppercase">Work email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#DDD5C8] bg-white text-[14px] text-[#111] focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all placeholder:text-gray-300"/>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 tracking-wide uppercase">Workspace name</label>
                <input type="text" value={workspace}
                  onChange={e => setWorkspace(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="acme-corp"
                  className="w-full px-4 py-3 rounded-xl border border-[#DDD5C8] bg-white text-[14px] text-[#111] focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all placeholder:text-gray-300"/>
                <p className="text-[11px] text-gray-400 mt-1.5">Lowercase + hyphens only. Becomes your Room namespace.</p>
              </div>
              {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
              <button type="submit"
                className="w-full py-3.5 rounded-xl text-white text-[14px] font-bold transition-all hover:opacity-90 mt-2"
                style={{ backgroundColor: CTA }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = CTA_HOVER}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = CTA}>
                Launch my workspace →
              </button>

              {/* Mini code snippet */}
              <div className="mt-3 rounded-xl overflow-hidden border border-[#E0D6CC]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#0D0F1A]">
                  <span className="text-[9px] font-mono text-white/25 tracking-widest">your first room</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400/60" /><span className="w-2 h-2 rounded-full bg-yellow-400/60" /><span className="w-2 h-2 rounded-full bg-green-400/60" />
                  </div>
                </div>
                <pre className="bg-[#0D0F1A] px-4 py-3 font-mono text-[10px] leading-relaxed overflow-x-auto">{[
                  ['text-white/30', '// Deploy an autonomous system in 3 lines'],
                  ['text-[#6EE7B7]', 'const room = await openrooms.create("my-workspace")'],
                  ['text-[#FCA882]', 'await room.deploy({ goal: "Handle support tickets" })'],
                  ['text-white/30', '// ← queued in 143ms, running now'],
                ].map(([cls, txt], i) => (
                  <div key={i} className={cls as string}>{txt as string}</div>
                ))}</pre>
              </div>

              {/* Included section with platform icons */}
              <div className="pt-3 space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Included on day one</p>
                {INCLUDED.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#E0D6CC] bg-white shadow-sm flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-[12px] text-gray-500">{item.text}</span>
                  </div>
                ))}
              </div>
            </form>
          ) : (
            <div className="py-6">
              <div className="rounded-2xl p-6 font-mono text-[12px] space-y-4" style={{ background: '#0D0F1A' }}>
                <p className="text-white/25 text-[10px] mb-2">$ provisioning "{workspace}"</p>
                {BOOT_STEPS.map((s, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ opacity: bootStep >= i ? 1 : 0.2 }}>
                    {bootStep > i ? (
                      <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0" fill="none">
                        <circle cx="8" cy="8" r="7" fill="#6EE7B7" stroke="#1a1a1a" strokeWidth="1"/>
                        <path d="M5 8 L7 10 L11 6" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : bootStep === i ? (
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0"
                        style={{ borderColor: CTA, borderTopColor: 'transparent' }} />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                    )}
                    <span style={{ color: bootStep >= i ? '#6EE7B7' : '#444' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-[11px] text-gray-400">
            Returning?{' '}
            <button onClick={() => {
              const n = prompt('Workspace name?'); const em = prompt('Email?')
              if (n && em) { localStorage.setItem('or_workspace', JSON.stringify({ name: n, email: em, token: `demo_${Date.now()}` })); router.push('/home') }
            }} className="underline hover:text-[#EA580C] transition-colors">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}
