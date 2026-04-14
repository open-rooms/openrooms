// Shared content blocks reused across all sub-pages
'use client'

import Link from 'next/link'

interface StatBlock {
  label: string
  value: string
  sub?: string
}

interface StepItem {
  step: string
  title: string
  body: string
}

interface CodeBlock {
  label: string
  code: string
}

interface InfoBlock {
  heading: string
  body: string
}

interface CapabilityItem {
  title: string
  desc: string
}

// 3-column stat cards
export function StatGrid({
  stats,
  accentColor,
  variant = 'cream',
}: {
  stats: StatBlock[]
  accentColor: string
  variant?: 'cream' | 'light'
}) {
  const bg = variant === 'light' ? 'bg-white border-gray-200' : 'bg-white border-[#D4C4A8]'
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`${bg} border rounded-xl p-5 text-center`}>
          <div className="text-lg font-black" style={{ color: variant === 'light' ? '#111827' : '#111111' }}>
            {s.value}
          </div>
          <div className="text-xs font-bold mt-0.5" style={{ color: accentColor }}>
            {s.label}
          </div>
          {s.sub && <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>}
        </div>
      ))}
    </div>
  )
}

// Dark terminal code block
export function TerminalBlock({ label, code }: CodeBlock) {
  return (
    <div className="bg-[#111111] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-black border-b border-gray-800">
        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
        <span className="ml-2 text-[11px] text-gray-500 font-mono">{label}</span>
      </div>
      <pre className="text-xs text-[#86EFAC] font-mono overflow-x-auto leading-relaxed p-5 whitespace-pre">
        {code}
      </pre>
    </div>
  )
}

// Light info card
export function InfoCard({
  heading,
  body,
  variant = 'cream',
}: InfoBlock & { variant?: 'cream' | 'light' }) {
  const bg = variant === 'light' ? 'bg-white border-gray-200' : 'bg-white border-[#D4C4A8]'
  return (
    <div className={`${bg} border rounded-xl p-6`}>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{heading}</p>
      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{body}</p>
    </div>
  )
}

// Numbered steps
export function StepList({
  steps,
  accentColor,
  variant = 'cream',
}: {
  steps: StepItem[]
  accentColor: string
  variant?: 'cream' | 'light'
}) {
  const bg = variant === 'light' ? 'bg-white border-gray-200' : 'bg-white border-[#D4C4A8]'
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={i} className={`${bg} border rounded-xl p-5 flex gap-4`}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
            style={{ background: accentColor, color: accentColor === '#FDA4AF' ? '#111' : '#fff' }}
          >
            {i + 1}
          </div>
          <div>
            <div className="text-sm font-black mb-0.5" style={{ color: variant === 'light' ? '#111827' : '#111111' }}>
              {s.title}
            </div>
            <div className="text-xs text-gray-500 leading-relaxed">{s.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Capability grid (2-col)
export function CapabilityGrid({
  items,
  accentColor,
  variant = 'cream',
}: {
  items: CapabilityItem[]
  accentColor: string
  variant?: 'cream' | 'light'
}) {
  const bg = variant === 'light' ? 'bg-white border-gray-200' : 'bg-white border-[#D4C4A8]'
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.title} className={`${bg} border rounded-xl p-4`}>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: accentColor }} />
            <div>
              <div className="text-sm font-black mb-0.5" style={{ color: variant === 'light' ? '#111827' : '#111111' }}>
                {item.title}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Quick action CTA row
export function ActionRow({
  actions,
  accentColor,
  textOnAccent,
}: {
  actions: { label: string; href: string; primary?: boolean }[]
  accentColor: string
  textOnAccent: string
}) {
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={
            a.primary
              ? { background: accentColor, color: textOnAccent }
              : { background: 'white', border: '2px solid #000', color: '#111111' }
          }
        >
          {a.label}
        </Link>
      ))}
    </div>
  )
}
