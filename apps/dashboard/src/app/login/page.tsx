'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OpenRoomsLogo } from '@/components/openrooms-logo'

const CTA = '#EA580C'
const CTA_HOVER = '#C2410C'

// ─── Chat messages inside a terminal shell (WhatsApp style, but dark terminal) ──
interface ChatLine {
  from: 'user' | 'agent' | 'sys'
  text: string
  delay: number
}

const CHATS: ChatLine[][] = [
  // Automation use-case
  [
    { from: 'user',  text: 'Alert my team when a payment fails', delay: 0 },
    { from: 'sys',   text: '→ spawning payment-monitor agent…',   delay: 850 },
    { from: 'agent', text: 'Connected to Stripe webhook. Watching.', delay: 1700 },
    { from: 'sys',   text: '→ Workflow: failure → Slack + email. ✓', delay: 2500 },
    { from: 'agent', text: 'First test run passed in 143ms. Done.', delay: 3200 },
    { from: 'user',  text: 'Can it auto-retry the charge too?',   delay: 4100 },
    { from: 'agent', text: 'Added retry node (max 3×, 1h delay). Live.', delay: 5000 },
  ],
  // Support triage use-case
  [
    { from: 'user',  text: 'Auto-reply to Zendesk tickets when possible', delay: 0 },
    { from: 'sys',   text: '→ deploying support-triage Room…',    delay: 750 },
    { from: 'agent', text: 'Connector: Zendesk registered. Reading queue.', delay: 1600 },
    { from: 'agent', text: 'Ticket #4821: "Reset password?" → replied.', delay: 2400 },
    { from: 'sys',   text: '→ CSAT predicted 4.7★. Time: 1.1s',   delay: 3100 },
    { from: 'user',  text: 'What about complex tickets?',         delay: 4000 },
    { from: 'agent', text: 'Flagged + routed with full context attached.', delay: 4700 },
    { from: 'sys',   text: '→ 91 tickets resolved today. 0 humans needed.', delay: 5400 },
  ],
  // Dev pipeline use-case
  [
    { from: 'user',  text: 'Set up ingest → classify → route pipeline', delay: 0 },
    { from: 'sys',   text: '→ provisioning data-pipeline Room…',   delay: 700 },
    { from: 'agent', text: 'Agent 1 (ingest) live on /webhook/data.', delay: 1500 },
    { from: 'agent', text: 'Agent 2 (classify) loaded. GPT-4o ready.', delay: 2300 },
    { from: 'agent', text: 'Agent 3 (router): 4 connectors configured.', delay: 3000 },
    { from: 'sys',   text: '→ Test event: classified in 890ms. ✓',  delay: 3700 },
    { from: 'user',  text: 'Log every agent decision for audit',   delay: 4600 },
    { from: 'agent', text: 'Trace logger on. Every step is replayable.', delay: 5400 },
  ],
]

const TAB_LABELS = ['Automation', 'Support AI', 'Dev Pipeline']

// ─── Bot face for agent bubble ────────────────────────────────────────────────
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

// ─── Terminal with chat bubbles inside ───────────────────────────────────────
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
        }, line.from === 'agent' ? 550 : 80)
      }, line.delay)
      timers.current.push(t)
    })

    // cycle to next conversation
    const last = conv[conv.length - 1]!
    const cycle = setTimeout(() => setTabIdx(i => (i + 1) % CHATS.length), last.delay + 4000)
    timers.current.push(cycle)

    return () => timers.current.forEach(clearTimeout)
  }, [tabIdx])

  const conv = CHATS[tabIdx]!
  const slug = ['payment-monitor', 'support-triage', 'data-pipeline'][tabIdx]!

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ background: '#0D0F1A' }}>
      {/* title bar — macOS style */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10" style={{ background: '#171928' }}>
        <span className="w-3 h-3 rounded-full bg-red-400/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
        <span className="w-3 h-3 rounded-full bg-green-400/80" />
        {/* tab switcher */}
        <div className="flex gap-1 ml-4 overflow-hidden">
          {TAB_LABELS.map((t, i) => (
            <button key={t} onClick={() => setTabIdx(i)}
              className={`text-[10px] font-mono px-2.5 py-0.5 rounded transition-all ${
                i === tabIdx ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
              }`}>
              {t}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[10px] text-white/30">{slug}</span>
        <span className="flex items-center gap-1 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400">live</span>
        </span>
      </div>

      {/* chat body */}
      <div ref={bodyRef} className="p-4 space-y-2.5 overflow-y-auto" style={{ minHeight: 260, maxHeight: 300 }}>
        {conv.slice(0, shown).map((line, i) => {
          if (line.from === 'sys') {
            return (
              <div key={i} className="flex items-center gap-2 py-0.5">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-[10px] font-mono text-white/35 whitespace-nowrap px-1">{line.text}</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
            )
          }
          if (line.from === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-tr-none"
                  style={{ background: '#1E2240', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[12px] font-mono leading-snug" style={{ color: 'rgba(255,255,255,0.8)' }}>{line.text}</p>
                </div>
              </div>
            )
          }
          return (
            <div key={i} className="flex items-end gap-2">
              <BotAvatar />
              <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-tl-none"
                style={{ background: 'rgba(234,88,12,0.13)', border: '1px solid rgba(234,88,12,0.25)' }}>
                <p className="text-[12px] font-mono leading-snug text-[#FCA882]">{line.text}</p>
              </div>
            </div>
          )
        })}

        {/* typing indicator */}
        {typing && (
          <div className="flex items-end gap-2">
            <BotAvatar />
            <div className="px-3 py-2.5 rounded-2xl rounded-tl-none"
              style={{ background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.2)' }}>
              <div className="flex gap-1">
                {[0,1,2].map(j => (
                  <span key={j} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                    style={{ animationDelay: `${j*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* fake input bar */}
      <div className="px-4 py-2.5 border-t border-white/8 flex items-center gap-2.5">
        <div className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-[11px] font-mono text-white/20">
          Tell your agent what to automate…
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: CTA }}>
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
            <path d="M3 8 L13 8 M9 4 L13 8 L9 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Pitch items (restored from previous version) ─────────────────────────────
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
    text: 'Trigger any Room from a webhook, a schedule, or a single API call — your rules.',
  },
]

// ─── Boot steps ───────────────────────────────────────────────────────────────
const BOOT_STEPS = [
  'Initialising agent runtime…',
  'Connecting to event bus…',
  'Provisioning workspace…',
  'All systems go.',
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
            localStorage.setItem('or_workspace', JSON.stringify({
              name: workspace.trim(),
              email: email.trim(),
              token: `demo_${Date.now()}`,
            }))
            router.push('/home')
          }, 600)
        }
      }, i * 750)
    })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#F9F5EF' }}>

      {/* ── LEFT: terminal + pitch ───────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col flex-1 px-10 py-10 max-w-[54%] relative overflow-hidden">
        {/* subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-20 -left-20 w-80 h-80 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,168,154,0.15) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <OpenRoomsLogo size={44} textSize="text-xl" />
          <p className="mt-1.5 text-[11px] text-gray-400 font-mono tracking-wider">
            AI agents that work while you sleep.
          </p>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 mt-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#EA580C] mb-2">What OpenRooms does</p>
          <h1 className="text-[26px] font-extrabold text-[#111] leading-tight">
            Your business on autopilot.<br/>For real this time.
          </h1>
          <p className="mt-3 text-[13px] text-gray-500 leading-relaxed max-w-xs">
            Deploy AI agents that watch your systems, handle customers,
            process data and trigger actions — no code, no babysitting.
          </p>
        </div>

        {/* Chat terminal (WhatsApp-style bubbles inside dark terminal shell) */}
        <div className="relative z-10 mt-7">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Watch it work</p>
            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              live agent
            </span>
          </div>
          <AgentTerminal />
        </div>

        {/* Pitch items (restored style) */}
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
          {/* Mobile logo */}
          <div className="md:hidden mb-8">
            <OpenRoomsLogo size={42} textSize="text-xl" />
          </div>

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
                  className="w-full px-4 py-3 rounded-xl border border-[#DDD5C8] bg-white text-[14px] text-[#111] focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 tracking-wide uppercase">Workspace name</label>
                <input type="text" value={workspace} onChange={e => setWorkspace(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="acme-corp"
                  className="w-full px-4 py-3 rounded-xl border border-[#DDD5C8] bg-white text-[14px] text-[#111] focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all placeholder:text-gray-300"
                />
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

              <div className="pt-3 space-y-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Included on day one</p>
                {[
                  { icon: '🤖', t: 'Autonomous agents with memory and tool access' },
                  { icon: '⚡', t: 'Real-time workflow execution + event bus' },
                  { icon: '🔌', t: 'Register any REST API as an agent tool' },
                  { icon: '📊', t: 'Full observability — every decision traced' },
                ].map(item => (
                  <div key={item.t} className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[12px] text-gray-500">{item.t}</span>
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
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: CTA, borderTopColor: 'transparent' }} />
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
              const n = prompt('Workspace name?')
              const em = prompt('Email?')
              if (n && em) {
                localStorage.setItem('or_workspace', JSON.stringify({ name: n, email: em, token: `demo_${Date.now()}` }))
                router.push('/home')
              }
            }} className="underline hover:text-[#EA580C] transition-colors">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}
