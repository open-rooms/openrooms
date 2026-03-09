import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="enterprise"
      title="Distributed Execution"
      description="Cluster-based execution infrastructure that distributes agent workloads across worker pools, manages queue pressure, auto-scales resources, and maintains reliability at production scale."
      accentColor="#111827"
      textOnAccent="#fff"
      actionLabel="View Runtime"
      actionHref="/runtime"
    >
      <div className="space-y-6">
        <StatGrid
          variant="light"
          accentColor="#111827"
          stats={[
            { label: 'Scheduler', value: 'BullMQ', sub: 'Redis-backed priority queue' },
            { label: 'Worker Model', value: 'Pool-based', sub: 'Horizontal auto-scaling' },
            { label: 'Fault Tolerance', value: 'Retry + DLQ', sub: 'Dead letter queue for failures' },
          ]}
        />
        <TerminalBlock
          label="execution cluster — worker status"
          code={`Cluster: production
────────────────────────────────────────────────────
Worker Nodes      8 active / 10 max
Queue Depth       47 jobs pending
Processing Rate   12 jobs/min
Avg Latency       340ms (p50)   |  820ms (p99)
────────────────────────────────────────────────────
Node        Status    Jobs/min   Memory    CPU
────────────────────────────────────────────────────
w-node-01   ACTIVE    2.1        42%       18%
w-node-02   ACTIVE    1.8        38%       15%
w-node-03   ACTIVE    2.3        45%       22%
w-node-04   ACTIVE    1.9        41%       17%
w-node-05   ACTIVE    2.0        39%       19%
w-node-06   ACTIVE    1.7        37%       14%
w-node-07   ACTIVE    0.2        12%        4%   ← scaling down
w-node-08   ACTIVE    0.1        10%        3%   ← scaling down`}
        />
        <CapabilityGrid
          variant="light"
          accentColor="#111827"
          items={[
            { title: 'Priority Queues', desc: 'Assign execution priority to workflows. High-priority runs skip to the front of the queue.' },
            { title: 'Auto-scaling', desc: 'Worker pools scale up when queue depth increases and scale down during idle periods.' },
            { title: 'Dead Letter Queue', desc: 'Failed jobs after all retries go to DLQ for manual inspection and reprocessing.' },
            { title: 'Job Deduplication', desc: 'Prevent duplicate job submissions for idempotent workflow triggers.' },
            { title: 'Resource Quotas', desc: 'Set per-Room or per-workflow CPU, memory, and concurrency limits.' },
            { title: 'Cross-region', desc: 'Route execution to the geographically closest worker cluster for latency reduction.' },
          ]}
        />
        <ActionRow
          accentColor="#111827"
          textOnAccent="#fff"
          actions={[
            { label: 'View Runtime Status', href: '/runtime', primary: true },
            { label: 'Observability', href: '/enterprise/observability' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
