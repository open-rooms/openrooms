import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="enterprise"
      title="Compliance"
      description="Audit logs, data governance controls, and policy enforcement for regulated deployments. Every action on the platform is logged immutably and exportable for compliance reporting."
      accentColor="#111827"
      textOnAccent="#fff"
      actionLabel="View Audit Log"
      actionHref="/live-runs"
    >
      <div className="space-y-6">
        <StatGrid
          variant="light"
          accentColor="#111827"
          stats={[
            { label: 'Log Retention', value: '1 Year', sub: 'Immutable audit trail' },
            { label: 'Standards', value: 'SOC 2 / GDPR', sub: 'Export-ready audit data' },
            { label: 'Coverage', value: '100%', sub: 'Every action logged' },
          ]}
        />
        <TerminalBlock
          label="audit log — sample entries"
          code={`timestamp           actor              action               resource             result
─────────────────────────────────────────────────────────────────────────────────────────
2025-01-15 11:42:01  user:alice         WORKFLOW_TRIGGERED   wf_defi_research     SUCCESS
2025-01-15 11:42:01  system             JOB_ENQUEUED         job:run_9xk2m        SUCCESS
2025-01-15 11:42:02  agent:ResearchAgent TOOL_CALLED         tool:web_search      SUCCESS
2025-01-15 11:42:06  agent:ResearchAgent KNOWLEDGE_WRITE     room:defi-monitor    SUCCESS
2025-01-15 11:42:07  system             WORKFLOW_COMPLETED   wf_defi_research     SUCCESS
2025-01-15 11:45:00  user:bob           ROOM_CREATED         room:new-analysis    SUCCESS
2025-01-15 12:00:00  automation:daily   TRIGGER_FIRED        cron:daily-scan      SUCCESS`}
        />
        <CapabilityGrid
          variant="light"
          accentColor="#111827"
          items={[
            { title: 'Immutable Audit Trail', desc: 'Every action is append-only. Logs cannot be edited or deleted, ensuring audit integrity.' },
            { title: 'Actor Attribution', desc: 'Every log entry is tagged with the actor — user, agent, automation, or system — for clear accountability.' },
            { title: 'Data Residency', desc: 'Choose the region where logs and data are stored to meet data sovereignty requirements.' },
            { title: 'Export & SIEM', desc: 'Export audit logs to CSV or stream to a SIEM system (Splunk, Elastic, Sentinel) in real time.' },
            { title: 'Retention Policies', desc: 'Configure log retention periods per data category to meet legal hold requirements.' },
            { title: 'Policy Enforcement', desc: 'Define data access policies — restrict which agents can read knowledge or call external tools.' },
          ]}
        />
        <ActionRow
          accentColor="#111827"
          textOnAccent="#fff"
          actions={[
            { label: 'View Audit Log', href: '/live-runs', primary: true },
            { label: 'Security Settings', href: '/enterprise/security' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
