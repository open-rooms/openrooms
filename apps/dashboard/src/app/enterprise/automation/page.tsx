import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, InfoCard, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="enterprise"
      title="Automation"
      description="Enterprise-scale trigger systems for orchestrating autonomous workflows at high volume. Define complex automation rules across multiple Rooms, environments, and external data sources."
      accentColor="#111827"
      textOnAccent="#fff"
      actionLabel="Create Automation"
      actionHref="/automation"
    >
      <div className="space-y-6">
        <StatGrid
          variant="light"
          accentColor="#111827"
          stats={[
            { label: 'Trigger Volume', value: 'Unlimited', sub: 'No trigger rate limits' },
            { label: 'Environments', value: 'Multi-env', sub: 'Cross-Room trigger routing' },
            { label: 'SLA', value: '<500ms', sub: 'Trigger-to-execution latency' },
          ]}
        />
        <CapabilityGrid
          variant="light"
          accentColor="#111827"
          items={[
            { title: 'Multi-Room Triggers', desc: 'A single trigger can launch workflows across multiple Rooms simultaneously.' },
            { title: 'Event Chaining', desc: 'An agent completion in Room A can automatically trigger a workflow in Room B.' },
            { title: 'External Event Sources', desc: 'Connect enterprise data platforms — Kafka, Pub/Sub, EventBridge — as trigger sources.' },
            { title: 'Priority Classes', desc: 'Mark automations as critical, standard, or background for queue prioritization.' },
            { title: 'Deduplication', desc: 'Idempotency keys prevent duplicate executions when the same event fires multiple times.' },
            { title: 'Audit Logging', desc: 'Every trigger event is logged with its source, payload hash, and resulting runs.' },
          ]}
        />
        <InfoCard
          variant="light"
          heading="Enterprise automation architecture"
          body={`Enterprise automation routes external signals into your agent infrastructure at scale.\n\nIncoming events from Kafka topics, EventBridge buses, or custom webhook sources are normalized by the OpenRooms event router, matched against automation rules, and dispatched to the correct Room workflows with the trigger payload.\n\nThe entire path — from event receipt to agent execution start — is logged and observable.`}
        />
        <ActionRow
          accentColor="#111827"
          textOnAccent="#fff"
          actions={[
            { label: 'Create Automation', href: '/automation', primary: true },
            { label: 'View Observability', href: '/enterprise/observability' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
