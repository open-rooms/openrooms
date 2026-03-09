import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, TerminalBlock, InfoCard, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="clients"
      title="Live Activity"
      description="Monitor agent execution, workflow runs, and system events in real time. Every action taken inside the platform streams here — tool calls, reasoning steps, errors, and completions."
      accentColor="#FDA4AF"
      textOnAccent="#111"
      actionLabel="View Live Runs"
      actionHref="/live-runs"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#FDA4AF"
          stats={[
            { label: 'Latency', value: '<100ms', sub: 'Event stream delay' },
            { label: 'Event Types', value: '12+', sub: 'Agent, workflow, system' },
            { label: 'Retention', value: '30 days', sub: 'Full activity history' },
          ]}
        />
        <TerminalBlock
          label="live activity stream"
          code={`[11:42:03]  AGENT_STARTED   agent=ResearchAgent       room=defi-monitor
[11:42:03]  TOOL_CALL       tool=web_search            input="DeFi yields 2025"
[11:42:04]  TOOL_RESULT     tool=web_search            tokens=412  duration=0.9s
[11:42:05]  REASONING       agent=ResearchAgent        "Filtering results for APY > 8%..."
[11:42:06]  TOOL_CALL       tool=write_to_knowledge    key=yields_2025
[11:42:06]  TOOL_RESULT     tool=write_to_knowledge    status=ok
[11:42:07]  AGENT_COMPLETE  agent=ResearchAgent        duration=4.1s  status=SUCCESS
[11:42:07]  WORKFLOW_STEP   step=2                     status=STARTED
[11:42:07]  AGENT_STARTED   agent=AnalysisAgent        room=defi-monitor
[11:42:09]  TOOL_CALL       tool=read_knowledge        key=yields_2025
[11:42:10]  REASONING       agent=AnalysisAgent        "Ranking protocols by risk-adjusted yield..."`}
        />
        <InfoCard
          heading="What you can monitor"
          body={`Live Activity shows every event inside your Rooms in real time:\n\n• Agent starts, completions, and failures\n• Every tool call and its result\n• Reasoning trace summaries\n• Workflow step transitions\n• Automation trigger events\n• System-level errors and retries\n\nFilter by Room, agent, event type, or time range. Each event links to its full log entry.`}
        />
        <ActionRow
          accentColor="#FDA4AF"
          textOnAccent="#111"
          actions={[
            { label: 'View Live Runs', href: '/live-runs', primary: true },
            { label: 'View Logs', href: '/clients/reports' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
