import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="enterprise"
      title="Observability"
      description="Full-stack telemetry and system monitoring for your agent infrastructure. Track latencies, error rates, token consumption, queue depth, and worker health across every Room and execution layer."
      accentColor="#111827"
      textOnAccent="#fff"
      actionLabel="Open Observability"
      actionHref="/live-runs"
    >
      <div className="space-y-6">
        <StatGrid
          variant="light"
          accentColor="#111827"
          stats={[
            { label: 'Metrics', value: '40+', sub: 'Per layer telemetry' },
            { label: 'Alerting', value: 'Threshold', sub: 'Error rate / latency / queue' },
            { label: 'Export', value: 'OpenTelemetry', sub: 'Grafana / Datadog / Prometheus' },
          ]}
        />
        <TerminalBlock
          label="observability snapshot — system metrics"
          code={`System Observability  |  last 60 minutes
──────────────────────────────────────────────────────
API Gateway     p50: 22ms   p99: 87ms   errors: 0.1%
Job Queue       depth: 12   processed: 847   dlq: 2
Worker Pool     active: 6   idle: 2     cpu_avg: 24%
Agent Runs      total: 312  success: 308  failed: 4
Token Usage     total: 4.2M gpt-4o: 3.1M  claude: 1.1M
Knowledge       writes: 89  reads: 412  nodes: 1,204
Event Bus       published: 2,841  delivered: 2,841  lag: 0ms
──────────────────────────────────────────────────────
Alerts          None active`}
        />
        <CapabilityGrid
          variant="light"
          accentColor="#111827"
          items={[
            { title: 'Infrastructure Metrics', desc: 'CPU, memory, queue depth, worker saturation, and API latencies across every node.' },
            { title: 'Agent Telemetry', desc: 'Per-agent run counts, success rates, token spend, and average step duration.' },
            { title: 'Error Tracking', desc: 'Aggregate error rates by type, agent, workflow, and time window with drill-down.' },
            { title: 'Alerting Rules', desc: 'Set threshold-based alerts on any metric. Notify via webhook, email, or Slack.' },
            { title: 'OpenTelemetry Export', desc: 'Export all traces and metrics to Grafana, Datadog, Prometheus, or any OTLP receiver.' },
            { title: 'SLA Dashboards', desc: 'Pre-built dashboards for error rate, p99 latency, and uptime SLA reporting.' },
          ]}
        />
        <ActionRow
          accentColor="#111827"
          textOnAccent="#fff"
          actions={[
            { label: 'Open Observability', href: '/live-runs', primary: true },
            { label: 'Architecture Overview', href: '/enterprise/architecture' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
