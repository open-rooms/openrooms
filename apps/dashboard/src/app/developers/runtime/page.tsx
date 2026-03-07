import { SubPageShell } from '@/components/SubPageShell'

export default function Page() {
  return (
    <SubPageShell
      path="developers"
      title="Autonomous Agent Runtime"
      description="BullMQ-powered execution engine with Redis queues, worker processes, and job management. The runtime is the heartbeat of every agent and workflow execution on OpenRooms."
      accentColor="#F54E00"
      textOnAccent="#fff"
      actionLabel="View Live Runs"
      actionHref="/developers/runs"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Queue Engine', value: 'BullMQ', sub: 'Redis-backed job queue' },
            { label: 'Execution Model', value: 'Worker Pool', sub: 'Horizontally scalable' },
            { label: 'Job Retry', value: 'Automatic', sub: 'Configurable backoff' },
          ].map((s) => (
            <div key={s.label} className="bg-[#F5F1E8] border border-[#D4C4A8] rounded-xl p-5 text-center">
              <div className="text-lg font-black text-[#111]">{s.value}</div>
              <div className="text-xs font-bold text-[#F54E00] mt-0.5">{s.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="bg-[#111111] rounded-2xl p-6">
          <p className="text-[10px] font-black tracking-widest text-[#F54E00] uppercase mb-3">Runtime Architecture</p>
          <pre className="text-xs text-[#86EFAC] font-mono leading-relaxed overflow-x-auto">{`Agent Run Triggered
    ↓
Job enqueued → BullMQ Queue (Redis)
    ↓
Worker picks up job
    ↓
Agent reasoning loop starts
    ↓
Tool calls dispatched
    ↓
Results captured → Logs
    ↓
Run marked complete → Observability`}</pre>
        </div>
      </div>
    </SubPageShell>
  )
}
