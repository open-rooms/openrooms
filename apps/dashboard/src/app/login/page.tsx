'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OpenRoomsLogo } from '@/components/openrooms-logo'

const CTA = '#EA580C'
const CTA_HOVER = '#C2410C'

// ─── Chat conversation sequences ─────────────────────────────────────────────
interface ChatMsg {
  from: 'user' | 'agent' | 'system'
  text: string
  delay: number
  icon?: string
}

const CONVERSATIONS: ChatMsg[][] = [
  // Conversation 1 — automation / non-dev
  [
    { from: 'user',   text: 'I want to alert my team every time a payment fails', delay: 0,    icon: '💳' },
    { from: 'system', text: 'Spawning payment-monitor agent…',                    delay: 900  },
    { from: 'agent',  text: 'Connected to Stripe webhook. Watching for failures.', delay: 1800, icon: '🤖' },
    { from: 'system', text: '→ Workflow: failure → Slack DM + email. ✓ Active',   delay: 2600 },
    { from: 'agent',  text: 'First test run passed in 143ms. Your team will know within seconds.', delay: 3400, icon: '🤖' },
    { from: 'user',   text: 'Can it also retry the payment automatically?',       delay: 4400,  icon: '💳' },
    { from: 'agent',  text: 'Sure. Adding a retry node to the workflow…',         delay: 5100,  icon: '🤖' },
    { from: 'system', text: '→ Node added: retry_charge (max 3x, 1h delay). ✓',  delay: 5900 },
    { from: 'agent',  text: 'Done. Fully automated — no code needed.',            delay: 6700,  icon: '🤖' },
  ],
  // Conversation 2 — support triage / business
  [
    { from: 'user',   text: 'Reply to Zendesk tickets automatically when possible', delay: 0,   icon: '🎧' },
    { from: 'system', text: 'Deploying support-triage Room…',                      delay: 800 },
    { from: 'agent',  text: 'Connector registered: Zendesk API. Reading ticket queue.', delay: 1700, icon: '🤖' },
    { from: 'agent',  text: 'Ticket #4821: "How do I reset my password?" → replying…', delay: 2500, icon: '🤖' },
    { from: 'system', text: '→ Reply sent. CSAT predicted: 4.7★. (1.1s)',         delay: 3300 },
    { from: 'user',   text: 'What about complex tickets?',                        delay: 4200,  icon: '🎧' },
    { from: 'agent',  text: 'Those get flagged + routed to your team with full context attached.', delay: 5000, icon: '🤖' },
    { from: 'system', text: '→ 91 tickets resolved today. 0 humans needed.',      delay: 5800 },
  ],
  // Conversation 3 — dev / technical
  [
    { from: 'user',   text: 'Set up a multi-agent pipeline: ingest → classify → route', delay: 0, icon: '⚙️' },
    { from: 'system', text: 'Provisioning Room: data-pipeline…',                  delay: 700 },
    { from: 'agent',  text: 'Agent 1 (ingest) ready. Listening on /webhook/data.', delay: 1600, icon: '🤖' },
    { from: 'agent',  text: 'Agent 2 (classify) loaded GPT-4o. Awaiting events.', delay: 2400, icon: '🤖' },
    { from: 'agent',  text: 'Agent 3 (router) configured: 4 downstream connectors.', delay: 3200, icon: '🤖' },
    { from: 'system', text: '→ Pipeline live. Test event ingested → classified in 890ms', delay: 4000 },
    { from: 'user',   text: 'Add observability — log every decision',             delay: 5000,  icon: '⚙️' },
    { from: 'system', text: '→ Trace logger enabled. All runs streamed to /live-runs', delay: 5700 },
    { from: 'agent',  text: 'Every agent decision is now auditable. No black boxes.', delay: 6500, icon: '🤖' },
  ],
]

// ─── Bot avatar icon ──────────────────────────────────────────────────────────
function BotFace({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
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
      <circle cx="10" cy="26" r="3" fill="#F87171" opacity="0.4"/>
      <circle cx="30" cy="26" r="3" fill="#F87171" opacity="0.4"/>
    </svg>
  )
}

// ─── Chat bubble component ────────────────────────────────────────────────────
function ChatBubble({ msg, visible }: { msg: ChatMsg; visible: boolean }) {
  if (!visible) return null
  if (msg.from === 'system') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 animate-fadeSlideDown">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] font-mono text-white/40 whitespace-nowrap">{msg.text}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    )
  }
  if (msg.from === 'user') {
    return (
      <div className="flex items-end gap-2 justify-start animate-fadeSlideDown">
        <div className="w-7 h-7 rounded-full bg-[#E8E0D0] flex items-center justify-center text-sm flex-shrink-0">
          {msg.icon || '👤'}
        </div>
        <div className="max-w-[75%] bg-[#1E2235] border border-white/10 rounded-2xl rounded-tl-none px-3.5 py-2.5">
          <p className="text-[12px] text-white/85 leading-snug font-mono">{msg.text}</p>
        </div>
      </div>
    )
  }
  // agent
  return (
    <div className="flex items-end gap-2 justify-end animate-fadeSlideDown">
      <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl rounded-tr-none" style={{ background: 'rgba(234,88,12,0.15)', border: '1px solid rgba(234,88,12,0.3)' }}>
        <p className="text-[12px] text-[#FCA882] leading-snug font-mono">{msg.text}</p>
      </div>
      <div className="flex-shrink-0">
        <BotFace size={28} />
      </div>
    </div>
  )
}

// ─── Animated chat terminal ───────────────────────────────────────────────────
function AgentChatTerminal() {
  const [convIdx, setConvIdx] = useState(0)
  const [visibleCount, setVisibleCount] = useState(0)
  const [typing, setTyping] = useState(false)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    setVisibleCount(0)
    setTyping(false)

    const conv = CONVERSATIONS[convIdx]!
    conv.forEach((msg, i) => {
      const t = setTimeout(() => {
        if (msg.from === 'agent') setTyping(true)
        setTimeout(() => {
          setTyping(false)
          setVisibleCount(i + 1)
          scrollRef.current?.scrollTo({ top: 9999, behavior: 'smooth' })
        }, msg.from === 'agent' ? 600 : 100)
      }, msg.delay)
      timeouts.current.push(t)
    })

    // Next conversation after last message + 4s
    const last = conv[conv.length - 1]!
    const cycleT = setTimeout(() => {
      setConvIdx(c => (c + 1) % CONVERSATIONS.length)
    }, last.delay + 4500)
    timeouts.current.push(cycleT)

    return () => timeouts.current.forEach(clearTimeout)
  }, [convIdx])

  const conv = CONVERSATIONS[convIdx]!
  const tabLabels = ['Automation', 'Support AI', 'Dev Pipeline']

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col" style={{ background: '#0F111A', minHeight: 380 }}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10" style={{ background: '#1A1D2E' }}>
        <span className="w-3 h-3 rounded-full bg-red-400/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
        <span className="w-3 h-3 rounded-full bg-green-400/70" />
        <div className="flex gap-1 ml-3">
          {tabLabels.map((tab, i) => (
            <button key={tab} onClick={() => setConvIdx(i)}
              className={`text-[10px] font-mono px-2.5 py-0.5 rounded transition-all ${i === convIdx ? 'text-white bg-white/10' : 'text-white/30 hover:text-white/60'}`}>
              {tab}
            </button>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400">Agent Live</span>
        </span>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 300 }}>
        {conv.slice(0, visibleCount).map((msg, i) => (
          <ChatBubble key={`${convIdx}-${i}`} msg={msg} visible={true} />
        ))}
        {/* Typing indicator */}
        {typing && (
          <div className="flex items-end gap-2 justify-end animate-fadeSlideDown">
            <div className="px-4 py-3 rounded-2xl rounded-tr-none" style={{ background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.2)' }}>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
            <BotFace size={28} />
          </div>
        )}
      </div>

      {/* Input bar — decorative */}
      <div className="px-4 py-2.5 border-t border-white/10 flex items-center gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono text-white/20">
          Tell your agent what to do…
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EA580C' }}>
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
            <path d="M2 8 L14 8 M10 4 L14 8 L10 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#1A1D2E] border border-white/10 rounded-xl px-4 py-3 hover:border-orange-400/40 transition-all duration-200 group cursor-default">
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 group-hover:bg-orange-500/10 transition-colors flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[12px] font-bold text-white">{label}</p>
        <p className="text-[10px] text-white/40 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ─── Quick-start install section ──────────────────────────────────────────────
function QuickStart() {
  const [copied, setCopied] = useState(false)
  const cmd = 'npx @openrooms/cli init my-workspace'

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#1A1D2E' }}>
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
        <span className="text-[10px] font-mono text-white/40">Quick Start</span>
        <span className="ml-auto text-[10px] font-mono text-white/30">npm · pnpm · bun</span>
      </div>
      <div className="px-4 py-3 flex items-center gap-3">
        <span className="text-green-400 font-mono text-[13px]">$</span>
        <code className="flex-1 text-[13px] font-mono text-white/80 select-all">{cmd}</code>
        <button onClick={() => { navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="px-3 py-1 rounded-lg text-[11px] font-bold transition-all"
          style={{ background: copied ? '#10B981' : '#EA580C', color: 'white' }}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="px-4 pb-3 text-[10px] font-mono text-white/25">
        Creates your workspace, deploys a demo Room, connects a sample agent. 90 seconds.
      </div>
    </div>
  )
}

// ─── Boot sequence ────────────────────────────────────────────────────────────
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
  const [step, setStep] = useState(-1)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !workspace.trim()) { setError('Both fields are required.'); return }
    if (!email.includes('@')) { setError('Enter a valid work email.'); return }
    setError('')
    setLoading(true)
    setStep(0)
    BOOT_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setStep(i)
        if (i === BOOT_STEPS.length - 1) {
          setTimeout(() => {
            localStorage.setItem('or_workspace', JSON.stringify({
              name: workspace.trim(),
              email: email.trim(),
              token: `demo_${Date.now()}`,
            }))
            router.push('/home')
          }, 700)
        }
      }, i * 750)
    })
  }

  // SVG feature icons — unique, non-generic
  const FEATURES = [
    {
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><rect x="2" y="6" width="20" height="13" rx="3" fill="#6EE7B7" stroke="#111" strokeWidth="1.2"/><path d="M2 10 L12 16 L22 10" stroke="#111" strokeWidth="1.2"/><circle cx="19" cy="5" r="3" fill="#F87171" stroke="#111" strokeWidth="1"/></svg>,
      label: 'Email & Slack automations',
      sub: 'Reply, triage, escalate — on autopilot',
    },
    {
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#FBBF24" stroke="#111" strokeWidth="1.2"/><path d="M7 12 L10 15 L17 8" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      label: 'Payment failure workflows',
      sub: 'Alert → retry → escalate, automatically',
    },
    {
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><circle cx="12" cy="12" r="9" fill="#C4B5FD" stroke="#111" strokeWidth="1.2"/><path d="M8 12 Q12 8 16 12 Q12 16 8 12Z" fill="#111" opacity="0.5"/><circle cx="12" cy="12" r="2" fill="#111"/></svg>,
      label: 'Multi-agent pipelines',
      sub: 'Ingest → classify → route → act',
    },
    {
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><rect x="2" y="4" width="9" height="7" rx="2.5" fill="#F4A89A" stroke="#111" strokeWidth="1.2"/><rect x="13" y="4" width="9" height="7" rx="2.5" fill="#F4A89A" stroke="#111" strokeWidth="1.2"/><rect x="7.5" y="13" width="9" height="7" rx="2.5" fill="#EA580C" stroke="#111" strokeWidth="1.2"/><line x1="6.5" y1="11" x2="12" y2="13" stroke="#111" strokeWidth="1"/><line x1="17.5" y1="11" x2="12" y2="13" stroke="#111" strokeWidth="1"/></svg>,
      label: 'Workflow orchestration',
      sub: 'Sequential, parallel, conditional branches',
    },
    {
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><rect x="3" y="10" width="18" height="11" rx="3" fill="#7DD3FC" stroke="#111" strokeWidth="1.2"/><path d="M7 10 L7 7 Q7 3 12 3 Q17 3 17 7 L17 10" stroke="#111" strokeWidth="1.5" fill="none"/><circle cx="12" cy="15.5" r="2" fill="#111"/></svg>,
      label: 'Connect any API or webhook',
      sub: 'Stripe, Zendesk, your own backend — anything',
    },
    {
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><circle cx="12" cy="12" r="9" fill="#6EE7B7" stroke="#111" strokeWidth="1.2"/><path d="M8 12 L10.5 14.5 L16 9" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      label: 'Full observability & traces',
      sub: 'Every decision logged, auditable, replayable',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#F9F5EF' }}>

      {/* ── LEFT — hero / chat ─────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col flex-1 px-10 py-10 max-w-[54%] relative overflow-hidden">
        {/* background texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-24 -left-24 w-96 h-96 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,168,154,0.15) 0%, transparent 70%)' }} />

        {/* Logo + tagline */}
        <div className="relative z-10">
          <OpenRoomsLogo size={44} textSize="text-xl" />
          <p className="mt-1.5 text-[11px] text-gray-400 font-mono tracking-wider ml-1">Run AI systems. Not scripts.</p>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 mt-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#EA580C] mb-2">What OpenRooms does</p>
          <h1 className="text-[28px] font-extrabold text-[#111] leading-tight">
            Your business runs on<br/>autopilot. Seriously.
          </h1>
          <p className="mt-3 text-[13px] text-gray-500 leading-relaxed max-w-sm">
            OpenRooms deploys AI agents that watch your systems, reply to customers,
            process data and trigger actions — without anyone writing code or staying online.
          </p>
        </div>

        {/* Agent chat terminal */}
        <div className="relative z-10 mt-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Live agent chat</p>
          <AgentChatTerminal />
        </div>

        {/* Quick-start CLI */}
        <div className="relative z-10 mt-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Developer quick start</p>
          <QuickStart />
        </div>

        {/* Feature grid */}
        <div className="relative z-10 mt-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">What you can build today</p>
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map(f => (
              <FeaturePill key={f.label} icon={f.icon} label={f.label} sub={f.sub} />
            ))}
          </div>
        </div>

        {/* Social proof strip */}
        <div className="relative z-10 mt-5 flex flex-wrap gap-4 text-[11px] text-gray-400">
          {['Open infrastructure', 'No vendor lock-in', 'Deploy anywhere', 'Full audit trail'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <svg viewBox="0 0 10 10" className="w-3 h-3"><circle cx="5" cy="5" r="4" fill="#6EE7B7"/><path d="M3 5 L4.5 6.5 L7 3.5" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── RIGHT — auth form ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 md:max-w-[46%] relative">
        {/* subtle right-side accent */}
        <div className="absolute inset-0 pointer-events-none hidden md:block"
          style={{ background: 'linear-gradient(135deg, transparent 60%, rgba(244,168,154,0.06) 100%)' }} />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="md:hidden mb-8">
            <OpenRoomsLogo size={42} textSize="text-xl" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#111]">Get your workspace</h2>
            <p className="mt-2 text-[13px] text-gray-500 leading-relaxed">
              Free forever to start. Your first Room, agent, and workflow are ready in under 2 minutes.
            </p>
          </div>

          {!loading ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 tracking-wide uppercase">Work email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#DDD5C8] bg-white text-[14px] text-[#111] focus:outline-none focus:ring-2 transition-all placeholder:text-gray-300"
                  style={{ focusRingColor: CTA } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 tracking-wide uppercase">Workspace slug</label>
                <input type="text" value={workspace} onChange={e => setWorkspace(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="acme-corp"
                  className="w-full px-4 py-3 rounded-xl border border-[#DDD5C8] bg-white text-[14px] text-[#111] focus:outline-none focus:ring-2 transition-all placeholder:text-gray-300"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">Lowercase, hyphens only. Used as your Room namespace.</p>
              </div>

              {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}

              <button type="submit"
                className="w-full py-3.5 rounded-xl text-white text-[14px] font-bold transition-all duration-150 mt-2 hover:opacity-90"
                style={{ backgroundColor: CTA }}>
                Launch my workspace →
              </button>

              {/* What's included */}
              <div className="pt-4 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">What's included</p>
                {[
                  { icon: '🤖', text: 'Unlimited autonomous agents' },
                  { icon: '⚡', text: 'Real-time workflow execution' },
                  { icon: '🔌', text: 'REST API + webhook connectors' },
                  { icon: '📊', text: 'Full observability & run traces' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2.5">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-[12px] text-gray-500">{item.text}</span>
                  </div>
                ))}
              </div>
            </form>
          ) : (
            /* Boot sequence */
            <div className="py-6">
              <div className="rounded-2xl p-6 font-mono text-[12px] space-y-4" style={{ background: '#0F111A' }}>
                <p className="text-white/25 text-[10px] mb-2">$ provisioning "{workspace}"</p>
                {BOOT_STEPS.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 transition-all duration-300"
                    style={{ opacity: step >= i ? 1 : 0.2 }}>
                    {step > i ? (
                      <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0" fill="none">
                        <circle cx="8" cy="8" r="7" fill="#6EE7B7" stroke="#1a1a1a" strokeWidth="1"/>
                        <path d="M5 8 L7 10 L11 6" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : step === i ? (
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: CTA, borderTopColor: 'transparent' }} />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                    )}
                    <span style={{ color: step >= i ? '#6EE7B7' : '#444' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-[11px] text-gray-400">
            Returning?{' '}
            <button onClick={() => {
              const n = prompt('Workspace name?')
              const e = prompt('Email?')
              if (n && e) {
                localStorage.setItem('or_workspace', JSON.stringify({ name: n, email: e, token: `demo_${Date.now()}` }))
                router.push('/home')
              }
            }} className="underline hover:text-[#EA580C] transition-colors">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}
