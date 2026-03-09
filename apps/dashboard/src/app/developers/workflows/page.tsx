import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="developers"
      title="Workflows"
      description="Infrastructure-level workflow definitions and orchestration. Define steps, data contracts between agents, branching logic, and error handling policies directly via the developer interface."
      accentColor="#F54E00"
      textOnAccent="#fff"
      actionLabel="Define Workflow"
      actionHref="/workflows"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#F54E00"
          stats={[
            { label: 'Step Types', value: '4', sub: 'Agent, Tool, Transform, Branch' },
            { label: 'Concurrency', value: 'Parallel', sub: 'Fan-out / fan-in patterns' },
            { label: 'Error Policy', value: 'Configurable', sub: 'Fail-fast or retry-with-backoff' },
          ]}
        />
        <TerminalBlock
          label="workflow definition — DSL"
          code={`workflow: DeFiResearchPipeline
version: "1.0"
trigger: manual | cron("0 8 * * *")

steps:
  - id: research
    agent: ResearchAgent
    input: "{{ trigger.payload }}"
    on_error: retry(max=3, backoff=2s)

  - id: analysis
    agent: AnalysisAgent
    depends_on: research
    input: "{{ steps.research.output }}"

  - id: report
    agent: ReportAgent
    depends_on: analysis
    input: "{{ steps.analysis.output }}"
    output_to: knowledge.reports`}
        />
        <CapabilityGrid
          accentColor="#F54E00"
          items={[
            { title: 'DAG Execution', desc: 'Steps are executed as a directed acyclic graph. Parallel steps run concurrently.' },
            { title: 'Data Contracts', desc: 'Each step output is typed and validated before passing to the next step.' },
            { title: 'Branching Logic', desc: 'Add conditional branches based on agent output values or runtime flags.' },
            { title: 'Error Policies', desc: 'Configure retry logic, fallback steps, or fail-fast behavior per step.' },
            { title: 'Versioning', desc: 'Workflow definitions are versioned. Roll back to a previous version at any time.' },
            { title: 'Observability', desc: 'Each run emits a full execution trace — step durations, agent outputs, and errors.' },
          ]}
        />
        <ActionRow
          accentColor="#F54E00"
          textOnAccent="#fff"
          actions={[
            { label: 'Define Workflow', href: '/workflows', primary: true },
            { label: 'View Runs', href: '/developers/runs' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
