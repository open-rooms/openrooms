import { SubPageShell } from '@/components/SubPageShell'

export default function Page() {
  return (
    <SubPageShell
      path="enterprise"
      title="Agent Swarms"
      description="Deploy coordinated swarms of specialised agents that work in parallel across shared tasks. Swarms scale horizontally and coordinate via the OpenRooms event bus in real time."
      accentColor="#111827"
      textOnAccent="#fff"
      actionLabel="Deploy Agents"
      actionHref="/agents"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Coordination', value: 'Event Bus', sub: 'Real-time agent signalling' },
            { label: 'Scaling', value: 'Horizontal', sub: 'BullMQ worker pools' },
            { label: 'Specialisation', value: 'Per Agent', sub: 'Goal + tool configs' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <div className="text-lg font-black text-gray-900">{s.value}</div>
              <div className="text-xs font-bold text-gray-600">{s.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 rounded-xl p-6">
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Swarm Architecture</p>
          <pre className="text-xs text-[#86EFAC] font-mono leading-relaxed overflow-x-auto">{`Orchestrator Agent
    ├─ Research Agent   → Knowledge Graph
    ├─ Analysis Agent   → Tool: code-exec
    └─ Output Agent     → Tool: notify
         ↓
    Event Bus (signals)
         ↓
    Shared Room Context`}</pre>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">How Swarms work</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            A Swarm is a network of specialised agents deployed across one or more Rooms, coordinated by the Control Plane. Each agent in the swarm has its own goal, tools, and LLM config — but they share the Room&apos;s Knowledge graph and can emit events that other agents respond to in real time.
          </p>
        </div>
      </div>
    </SubPageShell>
  )
}
