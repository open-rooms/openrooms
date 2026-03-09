import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, InfoCard, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="clients"
      title="Integrations"
      description="Connect OpenRooms to the external services, APIs, and data platforms your agents need to operate. Integrations give agents secure, scoped access to real-world systems."
      accentColor="#FDA4AF"
      textOnAccent="#111"
      actionLabel="Add Integration"
      actionHref="/tools"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#FDA4AF"
          stats={[
            { label: 'Protocols', value: 'REST / GraphQL', sub: 'HTTP-based integrations' },
            { label: 'Auth Types', value: 'OAuth / API Key', sub: 'Secure credential storage' },
            { label: 'Scope', value: 'Per Room', sub: 'Isolated access per workspace' },
          ]}
        />
        <CapabilityGrid
          accentColor="#FDA4AF"
          items={[
            { title: 'REST APIs', desc: 'Connect any REST endpoint. Define request schemas and map responses into agent context.' },
            { title: 'OAuth Services', desc: 'Authenticate with Google, Slack, Notion, GitHub, and other OAuth providers.' },
            { title: 'Database Connections', desc: 'Query Postgres, MySQL, or MongoDB directly from agent tool calls.' },
            { title: 'Webhook Receivers', desc: 'Accept inbound webhooks from Stripe, Shopify, GitHub, and any other platform.' },
            { title: 'Blockchain Nodes', desc: 'Connect to EVM chains, Solana, or custom RPC endpoints for on-chain agent actions.' },
            { title: 'Custom Connectors', desc: 'Build your own integration using the OpenRooms Tool API and register it for all agents.' },
          ]}
        />
        <InfoCard
          heading="How Integrations work"
          body={`Integrations are registered at the platform level and scoped to individual Rooms or agents.\n\nWhen an agent calls a tool, OpenRooms resolves the integration credentials, makes the request on behalf of the agent, and returns the result — no credential exposure, no manual plumbing.\n\nCredentials are encrypted at rest and never sent to LLM providers.`}
        />
        <ActionRow
          accentColor="#FDA4AF"
          textOnAccent="#111"
          actions={[
            { label: 'Add Integration', href: '/tools', primary: true },
            { label: 'Browse Tools', href: '/clients/tools' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
