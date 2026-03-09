import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, StepList, InfoCard, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="enterprise"
      title="Rooms"
      description="Multi-environment orchestration workspaces. Enterprise Rooms support team access control, environment segregation, cross-room agent communication, and production-grade isolation."
      accentColor="#111827"
      textOnAccent="#fff"
      actionLabel="Create Room"
      actionHref="/rooms/new"
    >
      <div className="space-y-6">
        <StatGrid
          variant="light"
          accentColor="#111827"
          stats={[
            { label: 'Environments', value: 'Isolated', sub: 'Dev / Staging / Production' },
            { label: 'Access Control', value: 'Role-Based', sub: 'Per Room permissions' },
            { label: 'Capacity', value: 'Unlimited', sub: 'Rooms per organization' },
          ]}
        />
        <StepList
          variant="light"
          accentColor="#111827"
          steps={[
            { step: '1', title: 'Define Environment', body: 'Create Rooms for each environment — dev, staging, production. Each Room is fully isolated.' },
            { step: '2', title: 'Assign Roles', body: 'Control who can read, write, trigger, or administer each Room via role-based access.' },
            { step: '3', title: 'Connect Agents and Workflows', body: 'Deploy agents and workflows into the Room with environment-specific tool configurations.' },
            { step: '4', title: 'Monitor Across Rooms', body: 'Use the Enterprise observability layer to monitor all Rooms from a single view.' },
          ]}
        />
        <InfoCard
          variant="light"
          heading="Enterprise Room features"
          body={`Beyond the standard Room, enterprise deployments add:\n\n• Environment segregation (dev/staging/prod namespaces)\n• Team-level role-based access control\n• Cross-room event routing for distributed architectures\n• Audit logging for every state change\n• Room-level resource quotas and rate limits`}
        />
        <ActionRow
          accentColor="#111827"
          textOnAccent="#fff"
          actions={[
            { label: 'Create Room', href: '/rooms/new', primary: true },
            { label: 'Manage Access', href: '/enterprise/security' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
