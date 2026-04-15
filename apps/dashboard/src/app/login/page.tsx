'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OpenRoomsLogo } from '@/components/openrooms-logo'

const CTA = '#EA580C'
const CTA_HOVER = '#C2410C'

// ─── Per-message contextual icons ────────────────────────────────────────────
// Agent action icons — shown inline with each agent message
function IconEnvelope() {
  return (
    <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 flex-shrink-0" fill="none">
      <rect x="1" y="4" width="16" height="10" rx="2.5" fill="#6EE7B7" stroke="#111" strokeWidth="1.1"/>
      <path d="M1 7 L9 11.5 L17 7" stroke="#111" strokeWidth="1.1"/>
    </svg>
  )
}
function IconMemory() {
  return (
    <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 flex-shrink-0" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="2.5" fill="#C4B5FD" stroke="#111" strokeWidth="1.1"/>
      <path d="M5 7 L9 10 L13 7" stroke="#111" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="5" y1="11" x2="13" y2="11" stroke="#111" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}
function IconTrace() {
  return (
    <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 flex-shrink-0" fill="none">
      <rect x="2" y="2" width="14" height="14" rx="2.5" fill="#FCA5A5" stroke="#111" strokeWidth="1.1"/>
      <path d="M4 11 L6 8 L8 10 L11 5 L14 8" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}
function IconRoute() {
  return (
    <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 flex-shrink-0" fill="none">
      <circle cx="9" cy="9" r="7.5" fill="#FDE68A" stroke="#111" strokeWidth="1.1"/>
      <path d="M6 7 L9 5 L12 7" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 11 L9 13 L12 11" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9" y1="5" x2="9" y2="13" stroke="#111" strokeWidth="1" strokeLinecap="round" opacity="0.35"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 flex-shrink-0" fill="none">
      <circle cx="9" cy="9" r="7.5" fill="#6EE7B7" stroke="#111" strokeWidth="1.1"/>
      <path d="M5.5 9 L8 11.5 L12.5 6.5" stroke="#111" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconAlert() {
  return (
    <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 flex-shrink-0" fill="none">
      <rect x="2" y="5" width="14" height="10" rx="2.5" fill="#FCA5A5" stroke="#111" strokeWidth="1.1"/>
      <rect x="2" y="9" width="14" height="2.5" fill="#111" opacity="0.12"/>
      <circle cx="13.5" cy="5" r="3" fill="#FBBF24" stroke="#111" strokeWidth="1"/>
      <line x1="13.5" y1="3.5" x2="13.5" y2="6" stroke="#111" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}
// User-side contextual icons (per conversation tab)
function IconUserMsg() {
  return (
    <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 flex-shrink-0" fill="none">
      <circle cx="9" cy="7" r="4" fill="#FCA5A5" stroke="#111" strokeWidth="1.1"/>
      <path d="M3 15.5 C3 12 15 12 15 15.5" stroke="#111" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
function IconUserDev() {
  return (
    <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 flex-shrink-0" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="2.5" fill="#93C5FD" stroke="#111" strokeWidth="1.1"/>
      <path d="M6 9 L4.5 10.5 L6 12" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 9 L13.5 10.5 L12 12" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9.5" y1="8" x2="8.5" y2="13" stroke="#111" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

// Per-message agent icon — maps each line index to a platform icon
type AgentIconMap = Record<number, React.ReactNode>
const AGENT_ICONS: AgentIconMap[] = [
  // Conv 0: Automation / Memory
  { 2: <IconEnvelope />, 4: <IconMemory />, 6: <IconCheck /> },
  // Conv 1: Support AI / Trace
  { 2: <IconTrace />, 3: <IconTrace />, 6: <IconCheck /> },
  // Conv 2: Dev Pipeline / Cost Routing
  { 2: <IconRoute />, 3: <IconRoute />, 5: <IconAlert />, 7: <IconCheck /> },
]
// User icons per tab
const USER_ICONS = [<IconUserMsg key="u0"/>, <IconEnvelope key="u1"/>, <IconUserDev key="u2"/>]

// ─── Chat conversation data — written as live production output ───────────────
interface ChatLine { from: 'user' | 'agent' | 'sys'; text: string; delay: number }

const CHATS: ChatLine[][] = [
  [
    { from: 'user',  text: 'My support agent needs to remember each customer', delay: 0 },
    { from: 'sys',   text: '→ loading workspace memory · 1,247 vectors indexed', delay: 800 },
    { from: 'agent', text: 'Ready. I already know Sarah opened 3 tickets this week.', delay: 1700 },
    { from: 'sys',   text: '→ memory.recall: 12ms · confidence 0.94', delay: 2400 },
    { from: 'agent', text: 'Escalation patterns from yesterday — stored. Won\'t repeat.', delay: 3200 },
    { from: 'user',  text: 'Can it auto-draft replies using that context?', delay: 4100 },
    { from: 'agent', text: 'Draft sent. Personalised from memory. Resolved in 900ms.', delay: 5000 },
  ],
  [
    { from: 'user',  text: 'Why did the agent decline that refund request?', delay: 0 },
    { from: 'sys',   text: '→ fetching trace run-7a2c · 8 steps logged', delay: 750 },
    { from: 'agent', text: 'Step 3: policy check returned "over 30-day window". Declined.', delay: 1600 },
    { from: 'agent', text: 'Replaying with updated refund policy now…', delay: 2350 },
    { from: 'sys',   text: '→ replay complete · 1 decision changed · diff saved', delay: 3050 },
    { from: 'user',  text: 'Apply the new policy to all future runs', delay: 3900 },
    { from: 'agent', text: 'Policy v2 live. Every run replayable from this point.', delay: 4750 },
  ],
  [
    { from: 'user',  text: 'Keep costs under $50/month across all rooms', delay: 0 },
    { from: 'sys',   text: '→ applying spend policy to 8 rooms…', delay: 700 },
    { from: 'agent', text: 'Routing to gpt-4o-mini where quality holds. 78% cheaper.', delay: 1550 },
    { from: 'agent', text: 'Projected this month: $11.20. Well inside budget.', delay: 2300 },
    { from: 'sys',   text: '→ 6 rooms re-routed · cheapest-pass policy active', delay: 3000 },
    { from: 'user',  text: 'Pause any room that spikes above $8', delay: 3850 },
    { from: 'agent', text: 'Spend alerts armed. Auto-pause on cap breach. Done.', delay: 4700 },
  ],
]
const TAB_LABELS = ['Memory', 'Trace Replay', 'Cost Routing']

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
  const slug = ['memory-room', 'trace-replay', 'cost-router'][tabIdx]!
  const UserIcon = USER_ICONS[tabIdx]!
  const agentIconMap = AGENT_ICONS[tabIdx]!

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
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {UserIcon}
                </div>
              </div>
            )
          }
          // Agent message — show contextual platform icon badge alongside bot avatar
          const actionIcon = agentIconMap[i]
          return (
            <div key={i} className="flex items-end gap-1.5">
              <BotAvatar />
              <div className="max-w-[76%] flex flex-col gap-1">
                <div className="px-3 py-2 rounded-2xl rounded-tl-none"
                  style={{ background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.22)' }}>
                  <p className="text-[11.5px] font-mono leading-snug text-[#FCA882]">{line.text}</p>
                </div>
                {actionIcon && (
                  <div className="flex items-center gap-1.5 px-1">
                    {actionIcon}
                    <span className="text-[9px] font-mono text-white/20">action complete</span>
                  </div>
                )}
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

    // Register workspace with backend — persists to PostgreSQL, falls back gracefully
    fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: workspace.trim(), email: email.trim() }),
    })
      .then(res => res.json())
      .catch(() => ({ token: `demo_${Date.now()}`, name: workspace.trim() }))
      .then(data => {
        const token = data.token || `demo_${Date.now()}`
        const wsName = data.name || workspace.trim()
        BOOT_STEPS.forEach((_, i) => {
          setTimeout(() => {
            setBootStep(i)
            if (i === BOOT_STEPS.length - 1) {
              setTimeout(() => {
                localStorage.setItem('or_workspace', JSON.stringify({ name: wsName, email: email.trim(), token, id: data.id || null }))
                router.push('/home')
              }, 600)
            }
          }, i * 750)
        })
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

        {/* ── Three live-feature terminal previews ────────────────────────── */}
        <div className="relative z-10 mt-8">
          <div className="grid grid-cols-3 gap-2">

            {/* Terminal 1: Persistent Memory */}
            <div className="rounded-xl overflow-hidden border border-[#2A2D3E] select-none pointer-events-none">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#0D0F1A]">
                <span className="text-[8px] font-mono text-white/20 tracking-widest truncate">memory-room</span>
                <div className="flex gap-0.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400/40"/><span className="w-1.5 h-1.5 rounded-full bg-yellow-400/40"/><span className="w-1.5 h-1.5 rounded-full bg-green-400/40"/>
                </div>
              </div>
              <div className="bg-[#0D0F1A] px-2.5 py-2.5 font-mono text-[8.5px] leading-[1.7] space-y-0.5">
                <div className="text-white/25">// workspace memory · live</div>
                <div className="text-[#6EE7B7]">room.memory.write(<span className="text-[#FCA882]">&quot;sarah&quot;</span>, ctx)</div>
                <div className="text-[#6EE7B7]">room.memory.recall(<span className="text-[#FCA882]">&quot;vip churn&quot;</span>)</div>
                <div className="text-white/40">→ 12ms · <span className="text-[#6EE7B7]">0.94</span> confidence</div>
                <div className="text-white/25">// 1,247 vectors · always on</div>
              </div>
            </div>

            {/* Terminal 2: Trace Replay */}
            <div className="rounded-xl overflow-hidden border border-[#2A2D3E] select-none pointer-events-none">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#0D0F1A]">
                <span className="text-[8px] font-mono text-white/20 tracking-widest truncate">trace-replay</span>
                <div className="flex gap-0.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400/40"/><span className="w-1.5 h-1.5 rounded-full bg-yellow-400/40"/><span className="w-1.5 h-1.5 rounded-full bg-green-400/40"/>
                </div>
              </div>
              <div className="bg-[#0D0F1A] px-2.5 py-2.5 font-mono text-[8.5px] leading-[1.7] space-y-0.5">
                <div className="text-white/25">// every decision replayable</div>
                <div className="text-[#C4B5FD]">runs.trace(<span className="text-[#FCA882]">&quot;run-7a2c&quot;</span>)</div>
                <div className="text-white/40">step 3 → <span className="text-[#FCA882]">declined</span> · policy v1</div>
                <div className="text-[#C4B5FD]">trace.replay(<span className="text-[#FCA882]">&#123; policy: <span className="text-[#6EE7B7]">&quot;v2&quot;</span> &#125;</span>)</div>
                <div className="text-white/40">→ <span className="text-[#6EE7B7]">approved ✓</span> · diff saved</div>
              </div>
            </div>

            {/* Terminal 3: Cost Routing */}
            <div className="rounded-xl overflow-hidden border border-[#2A2D3E] select-none pointer-events-none">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#0D0F1A]">
                <span className="text-[8px] font-mono text-white/20 tracking-widest truncate">cost-router</span>
                <div className="flex gap-0.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400/40"/><span className="w-1.5 h-1.5 rounded-full bg-yellow-400/40"/><span className="w-1.5 h-1.5 rounded-full bg-green-400/40"/>
                </div>
              </div>
              <div className="bg-[#0D0F1A] px-2.5 py-2.5 font-mono text-[8.5px] leading-[1.7] space-y-0.5">
                <div className="text-white/25">// model routing · active</div>
                <div className="text-[#FCA882]">room.policy(<span className="text-[#6EE7B7]">&quot;cheapest-pass&quot;</span>)</div>
                <div className="text-white/40">→ <span className="text-[#C4B5FD]">gpt-4o-mini</span> · $0.0018/run</div>
                <div className="text-[#FCA882]">room.alerts.cap(<span className="text-[#6EE7B7]">8.00</span>)</div>
                <div className="text-white/25">// auto-pause on breach ✓</div>
              </div>
            </div>

          </div>
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
