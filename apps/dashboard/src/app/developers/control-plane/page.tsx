import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="developers"
      title="Control Plane"
      description="The OpenRooms Control Plane is the central orchestration layer for your entire autonomous system infrastructure — Rooms, agents, workers, and runtime execution, all from one view."
      accentColor="#F54E00"
      textOnAccent="#fff"
      actionLabel="Open Control Plane"
      actionHref="/control-plane"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#F54E00"
          stats={[
            { label: 'Components', value: '7 Layers', sub: 'Rooms → Runtime → Observability' },
            { label: 'Status', value: 'Live', sub: 'Real-time system health' },
            { label: 'Access', value: 'API + UI', sub: 'Programmatic or visual control' },
          ]}
        />
        <TerminalBlock
          label="control plane — system status"
          code={`OpenRooms Control Plane  v0.4.0
────────────────────────────────────────────
Rooms Active         4        ✓ healthy
Agents Running       2        ✓ healthy
Worker Nodes         3/3      ✓ all online
Job Queue (BullMQ)   7 jobs   ✓ processing
Event Bus            ✓ live   12 events/min
API Gateway          ✓ live   p99: 34ms
Knowledge Graph      ✓ live   1,204 nodes
────────────────────────────────────────────
Last heartbeat: 800ms ago`}
        />
        <CapabilityGrid
          accentColor="#F54E00"
          items={[
            { title: 'System Health', desc: 'Real-time status of every platform component — workers, queues, API, and event bus.' },
            { title: 'Room Management', desc: 'Create, configure, and terminate Rooms programmatically via the control plane API.' },
            { title: 'Agent Orchestration', desc: 'Deploy agents, assign tools, and manage execution from the infrastructure layer.' },
            { title: 'Runtime Control', desc: 'Scale worker nodes, drain queues, and manage job priorities in real time.' },
            { title: 'Event Bus', desc: 'Publish and subscribe to platform events. Drive automation from infrastructure signals.' },
            { title: 'Observability', desc: 'Full telemetry for every layer — latencies, error rates, token usage, and execution traces.' },
          ]}
        />
        <ActionRow
          accentColor="#F54E00"
          textOnAccent="#fff"
          actions={[
            { label: 'Open Control Plane', href: '/control-plane', primary: true },
            { label: 'View Runtime', href: '/developers/runtime' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
