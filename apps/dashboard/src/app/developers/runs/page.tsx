import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="developers"
      title="Runs"
      description="Full history of agent and workflow executions. Every run includes its trigger, step trace, agent outputs, tool calls, token usage, and final status — queryable and exportable."
      accentColor="#F54E00"
      textOnAccent="#fff"
      actionLabel="View All Runs"
      actionHref="/live-runs"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#F54E00"
          stats={[
            { label: 'Retention', value: '90 days', sub: 'Full run history' },
            { label: 'Resolution', value: 'Per Step', sub: 'Every agent step logged' },
            { label: 'Export', value: 'JSON / CSV', sub: 'Full data export' },
          ]}
        />
        <TerminalBlock
          label="run history — recent executions"
          code={`run_id         type        agent/workflow          status    duration  started
─────────────────────────────────────────────────────────────────────────────
run_9xk2m      workflow    DeFiResearchPipeline    SUCCESS   7.3s      2m ago
run_8jh1p      agent       ResearchAgent           SUCCESS   4.1s      3m ago
run_7gf9q      agent       AnalysisAgent           SUCCESS   2.8s      3m ago
run_6de8r      workflow    DeFiResearchPipeline    FAILED    1.2s      1h ago
run_5cb7s      agent       ResearchAgent           FAILED    0.9s      1h ago
run_4ba6t      automation  daily-defi-scan         SUCCESS   8.1s      6h ago
run_3az5u      agent       ReportAgent             SUCCESS   1.4s      6h ago`}
        />
        <CapabilityGrid
          accentColor="#F54E00"
          items={[
            { title: 'Full Trace', desc: 'Each run stores every step, agent decision, tool call, and output in order.' },
            { title: 'Failure Inspection', desc: 'For failed runs, inspect exactly which step failed, the error message, and the agent\'s last state.' },
            { title: 'Token Accounting', desc: 'Per-run token usage broken down by agent and model for cost attribution.' },
            { title: 'Filtering', desc: 'Filter runs by Room, agent, workflow, status, trigger type, or time range.' },
            { title: 'Re-run', desc: 'Re-trigger any past run with the same or modified input payload.' },
            { title: 'Export', desc: 'Export run data to JSON or CSV for external analysis or audit purposes.' },
          ]}
        />
        <ActionRow
          accentColor="#F54E00"
          textOnAccent="#fff"
          actions={[
            { label: 'View All Runs', href: '/live-runs', primary: true },
            { label: 'View Logs', href: '/developers/logs' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
