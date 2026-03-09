import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, StepList, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="clients"
      title="Workflows"
      description="Define multi-step agent orchestration pipelines. Workflows coordinate multiple agents in sequence or in parallel, passing data between steps and handling errors automatically."
      accentColor="#FDA4AF"
      textOnAccent="#111"
      actionLabel="Build Workflow"
      actionHref="/workflows"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#FDA4AF"
          stats={[
            { label: 'Execution Model', value: 'Pipeline', sub: 'Sequential or parallel' },
            { label: 'Error Handling', value: 'Auto-Retry', sub: 'Up to 3× with backoff' },
            { label: 'Trigger Types', value: '4 Types', sub: 'Manual, Schedule, Event, API' },
          ]}
        />
        <StepList
          accentColor="#FDA4AF"
          steps={[
            { step: '1', title: 'Define Steps', body: 'Each step maps to an agent, tool call, or transformation. Steps can branch based on conditions.' },
            { step: '2', title: 'Connect Agents', body: 'Assign an agent to each step. The output of one step becomes the input context for the next.' },
            { step: '3', title: 'Set a Trigger', body: 'Run manually, on a cron schedule, on a webhook event, or via the API.' },
            { step: '4', title: 'Monitor the Run', body: 'Watch every step execute in real time. Inspect outputs, retry failures, and view logs.' },
          ]}
        />
        <TerminalBlock
          label="workflow run — DeFi Research Pipeline"
          code={`Workflow: DeFiResearchPipeline  |  run_id: wf_9xk2m
Step 1  →  ResearchAgent    [RUNNING]  "Scanning top protocols..."
Step 2  →  AnalysisAgent    [PENDING]  Waiting on Step 1 output
Step 3  →  ReportAgent      [PENDING]  Waiting on Step 2 output

─── Step 1 completed (3.1s) ───────────────────────────
Step 2  →  AnalysisAgent    [RUNNING]  "Scoring by risk/yield..."
Step 3  →  ReportAgent      [PENDING]  Waiting on Step 2 output

─── Step 2 completed (2.8s) ───────────────────────────
Step 3  →  ReportAgent      [RUNNING]  "Generating summary report..."
─── Step 3 completed (1.4s) ───────────────────────────

[WORKFLOW COMPLETE]  Total: 7.3s  |  Steps: 3/3 passed`}
        />
        <ActionRow
          accentColor="#FDA4AF"
          textOnAccent="#111"
          actions={[
            { label: 'Build Workflow', href: '/workflows', primary: true },
            { label: 'View Runs', href: '/clients/live-activity' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
