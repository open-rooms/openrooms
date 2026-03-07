import { SubPageShell } from '@/components/SubPageShell'

export default function Page() {
  return (
    <SubPageShell
      path="clients"
      title="Agent Memory Graph"
      description="Persistent memory and context that agents build up over time. Knowledge is scoped to Rooms and shared across agents — forming a structured memory graph that compounds with every run."
      accentColor="#FDA4AF"
      textOnAccent="#111"
      actionLabel="Open Rooms"
      actionHref="/clients/rooms"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Scope', value: 'Per Room', sub: 'Isolated per environment' },
            { label: 'Persistence', value: 'Permanent', sub: 'Survives across sessions' },
            { label: 'Access', value: 'All Agents', sub: 'Shared within the Room' },
          ].map((s) => (
            <div key={s.label} className="bg-[#F5F1E8] border border-[#D4C4A8] rounded-xl p-5 text-center">
              <div className="text-lg font-black text-[#111]">{s.value}</div>
              <div className="text-xs font-bold" style={{ color: '#FDA4AF' }}>{s.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="bg-[#F5F1E8] border border-[#D4C4A8] rounded-xl p-6">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">How the Memory Graph works</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Every time an agent executes inside a Room, it reads from and writes to the Room&apos;s Knowledge graph. This includes facts it discovered, summaries it produced, tool outputs it received, and context it built.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            The next agent — or the same agent in a future run — picks up exactly where the last left off. Over time this forms a compound knowledge base that makes every subsequent run smarter and faster.
          </p>
        </div>
      </div>
    </SubPageShell>
  )
}
