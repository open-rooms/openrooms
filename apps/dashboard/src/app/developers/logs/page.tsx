import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, InfoCard, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="developers"
      title="Logs"
      description="Detailed system logs including agent reasoning traces, tool call inputs and outputs, errors, retries, and infrastructure events. The full unfiltered stream of everything the platform did."
      accentColor="#EA580C"
      textOnAccent="#fff"
      actionLabel="Open Logs"
      actionHref="/live-runs"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#EA580C"
          stats={[
            { label: 'Log Levels', value: '4', sub: 'DEBUG / INFO / WARN / ERROR' },
            { label: 'Retention', value: '30 days', sub: 'Searchable full-text' },
            { label: 'Streaming', value: 'Real-time', sub: 'Sub-100ms latency' },
          ]}
        />
        <TerminalBlock
          label="system log — debug view"
          code={`[DEBUG]  [11:42:01.003]  room=defi-monitor  Workflow queued: DeFiResearchPipeline  job=wf_9xk2m
[INFO]   [11:42:01.011]  room=defi-monitor  Worker picked up job  worker=w-node-02
[INFO]   [11:42:01.014]  agent=ResearchAgent  Step 1 started
[DEBUG]  [11:42:01.015]  agent=ResearchAgent  Calling tool: web_search  args={query:"DeFi yields 2025"}
[INFO]   [11:42:01.912]  agent=ResearchAgent  Tool result: web_search  items=10  duration=897ms
[DEBUG]  [11:42:02.001]  agent=ResearchAgent  Reasoning: "Filtering results for APY > 8%..."
[DEBUG]  [11:42:02.400]  agent=ResearchAgent  Calling tool: write_to_knowledge  key=yields_2025
[INFO]   [11:42:02.412]  agent=ResearchAgent  Tool result: write_to_knowledge  status=ok
[INFO]   [11:42:02.414]  agent=ResearchAgent  COMPLETE  steps=5  tokens=1842  duration=4.1s
[INFO]   [11:42:02.415]  room=defi-monitor  Workflow step 1 → DONE. Advancing to step 2.`}
        />
        <InfoCard
          heading="Log structure"
          body={`Each log line includes:\n\n• Timestamp (ms precision)\n• Log level (DEBUG / INFO / WARN / ERROR)\n• Room and run context\n• Agent or worker identity\n• Event type (tool_call, reasoning, system, error)\n• Structured payload (key-value pairs)\n\nLogs are searchable by any field. Use the filter bar to narrow by room, agent, log level, or time range.`}
        />
        <ActionRow
          accentColor="#EA580C"
          textOnAccent="#fff"
          actions={[
            { label: 'Open Logs', href: '/live-runs', primary: true },
            { label: 'View Runs', href: '/developers/runs' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
