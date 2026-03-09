import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, InfoCard, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="enterprise"
      title="Integrations"
      description="Enterprise data platforms and service connections. Connect ERP systems, data warehouses, identity providers, communication platforms, and blockchain networks to your agent infrastructure."
      accentColor="#111827"
      textOnAccent="#fff"
      actionLabel="Add Integration"
      actionHref="/tools"
    >
      <div className="space-y-6">
        <StatGrid
          variant="light"
          accentColor="#111827"
          stats={[
            { label: 'Connector Types', value: '20+', sub: 'Data, identity, comms, chain' },
            { label: 'Auth', value: 'SSO / OAuth 2.0', sub: 'Enterprise identity support' },
            { label: 'Encryption', value: 'AES-256', sub: 'Credentials at rest' },
          ]}
        />
        <CapabilityGrid
          variant="light"
          accentColor="#111827"
          items={[
            { title: 'Enterprise SaaS', desc: 'Salesforce, HubSpot, Snowflake, Databricks, Notion, Confluence — direct API connectors.' },
            { title: 'Identity Providers', desc: 'Authenticate via Okta, Azure AD, or Google Workspace using SAML or OIDC.' },
            { title: 'Data Platforms', desc: 'Stream data from BigQuery, Redshift, or S3 as context for agent runs.' },
            { title: 'Messaging & Comms', desc: 'Agents can send to Slack, Teams, email, or SMS via built-in connectors.' },
            { title: 'Blockchain Networks', desc: 'Read on-chain data or submit transactions via EVM, Solana, or custom RPC connectors.' },
            { title: 'Custom Enterprise APIs', desc: 'Register any internal API endpoint as a tool with custom auth and schema validation.' },
          ]}
        />
        <InfoCard
          variant="light"
          heading="Enterprise credential management"
          body={`All integration credentials are stored encrypted (AES-256) and scoped to the Room or organization level.\n\nCredentials are never sent to LLM providers. At execution time, OpenRooms resolves the credential, makes the API call on behalf of the agent, and returns only the response data.\n\nAccess to integrations is governed by the same RBAC system as Rooms and agents.`}
        />
        <ActionRow
          accentColor="#111827"
          textOnAccent="#fff"
          actions={[
            { label: 'Add Integration', href: '/tools', primary: true },
            { label: 'Manage Security', href: '/enterprise/security' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
