import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, InfoCard, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="enterprise"
      title="Security"
      description="Role-based access control, scoped permissions, encrypted credentials, network isolation, and audit logging. Security is enforced at every layer of the OpenRooms infrastructure."
      accentColor="#111827"
      textOnAccent="#fff"
      actionLabel="Manage Access"
      actionHref="/settings"
    >
      <div className="space-y-6">
        <StatGrid
          variant="light"
          accentColor="#111827"
          stats={[
            { label: 'Auth Model', value: 'RBAC', sub: 'Role-based per resource' },
            { label: 'Encryption', value: 'AES-256 / TLS', sub: 'At rest and in transit' },
            { label: 'Compliance', value: 'SOC 2 Ready', sub: 'Audit log on all actions' },
          ]}
        />
        <CapabilityGrid
          variant="light"
          accentColor="#111827"
          items={[
            { title: 'Role-Based Access', desc: 'Define roles with granular permissions — Reader, Operator, Admin — per Room or org-wide.' },
            { title: 'SSO Integration', desc: 'Connect Okta, Azure AD, or Google Workspace via SAML 2.0 or OIDC for enterprise login.' },
            { title: 'API Key Scoping', desc: 'Issue API keys with fine-grained scope — limit to specific Rooms, actions, or time windows.' },
            { title: 'Credential Vault', desc: 'Integration secrets are encrypted at rest. Never exposed to agents or LLM providers.' },
            { title: 'Network Controls', desc: 'Restrict API access by IP allowlist. Optionally deploy in a private VPC.' },
            { title: 'Session Management', desc: 'Control session duration, enforce MFA, and revoke access instantly from the admin panel.' },
          ]}
        />
        <InfoCard
          variant="light"
          heading="Security model"
          body={`OpenRooms enforces security at every layer:\n\n• Authentication: SSO or API key, with MFA enforcement\n• Authorization: RBAC scoped to Room, workflow, agent, or integration\n• Data: All credentials and knowledge encrypted at rest (AES-256), all API traffic over TLS 1.3\n• Audit: Every action — reads, writes, triggers, configuration changes — is logged with actor, timestamp, and resource\n• Network: IP allowlisting, VPC deployment, and outbound firewall for tool calls`}
        />
        <ActionRow
          accentColor="#111827"
          textOnAccent="#fff"
          actions={[
            { label: 'Manage Access', href: '/settings', primary: true },
            { label: 'Compliance', href: '/enterprise/compliance' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
