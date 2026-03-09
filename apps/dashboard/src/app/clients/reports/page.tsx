import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, InfoCard, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="clients"
      title="Reports"
      description="Summarized analytics and performance reports for your Rooms, agents, and workflows. Understand what your system accomplished, where it spent time, and where it failed."
      accentColor="#FDA4AF"
      textOnAccent="#111"
      actionLabel="View Reports"
      actionHref="/live-runs"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#FDA4AF"
          stats={[
            { label: 'Report Types', value: '6', sub: 'Run, agent, workflow, error, usage, audit' },
            { label: 'Export', value: 'JSON / CSV', sub: 'Full data export' },
            { label: 'Cadence', value: 'Daily / Weekly', sub: 'Auto-generated summaries' },
          ]}
        />
        <CapabilityGrid
          accentColor="#FDA4AF"
          items={[
            { title: 'Run Summary', desc: 'Overview of all workflow and agent runs — total, completed, failed, avg duration.' },
            { title: 'Agent Performance', desc: 'Per-agent stats: tasks completed, tokens consumed, tools called, error rate.' },
            { title: 'Workflow Analytics', desc: 'Step-by-step breakdown of workflow execution — duration, success rate, bottleneck steps.' },
            { title: 'Error Reports', desc: 'Aggregated failures grouped by type, frequency, and agent/workflow/tool origin.' },
            { title: 'Resource Usage', desc: 'Token consumption, API call volume, compute time, and cost estimates per Room.' },
            { title: 'Audit Trail', desc: 'Immutable history of every action taken — who triggered it, what ran, and what changed.' },
          ]}
        />
        <InfoCard
          heading="Built for accountability"
          body={`Reports give you a clear picture of system activity over any time period.\n\nWhether you're reviewing yesterday's automation runs, investigating a failure, or presenting usage metrics to stakeholders — all the data is here, exportable, and filterable by Room, agent, workflow, or time range.`}
        />
        <ActionRow
          accentColor="#FDA4AF"
          textOnAccent="#111"
          actions={[
            { label: 'View Reports', href: '/live-runs', primary: true },
            { label: 'Live Activity', href: '/clients/live-activity' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
