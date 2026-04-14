import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="developers"
      title="API"
      description="The OpenRooms REST API gives you full programmatic control over every platform resource — Rooms, agents, workflows, tools, runs, and logs. Build integrations, automate deployments, and query the control plane from any system."
      accentColor="#EA580C"
      textOnAccent="#fff"
      actionLabel="View API Docs"
      actionHref="/settings"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#EA580C"
          stats={[
            { label: 'Protocol', value: 'REST', sub: 'JSON over HTTPS' },
            { label: 'Auth', value: 'API Key', sub: 'Bearer token in header' },
            { label: 'Rate Limit', value: '1,000 req/min', sub: 'Per API key' },
          ]}
        />
        <TerminalBlock
          label="quick start — launch a workflow via API"
          code={`# Trigger a workflow run via the API
curl -X POST https://api.openrooms.io/v1/workflows/trigger \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflow_id": "wf_defi_research",
    "room_id": "room_defi_monitor",
    "payload": {
      "query": "Top DeFi yields above 8% APY"
    }
  }'

# Response
{
  "run_id": "run_9xk2m",
  "status": "queued",
  "workflow_id": "wf_defi_research",
  "room_id": "room_defi_monitor",
  "created_at": "2025-01-15T11:42:01Z"
}`}
        />
        <CapabilityGrid
          accentColor="#EA580C"
          items={[
            { title: 'Rooms API', desc: 'Create, list, update, and delete Rooms programmatically.' },
            { title: 'Agents API', desc: 'Deploy agents, update configs, and trigger direct agent runs.' },
            { title: 'Workflows API', desc: 'Trigger workflow runs, poll status, and retrieve outputs.' },
            { title: 'Runs API', desc: 'Query run history, retrieve traces, and export execution data.' },
            { title: 'Tools API', desc: 'Register custom tools and manage the tool registry.' },
            { title: 'Events API', desc: 'Subscribe to platform event streams via webhooks or Server-Sent Events.' },
          ]}
        />
        <ActionRow
          accentColor="#EA580C"
          textOnAccent="#fff"
          actions={[
            { label: 'View API Reference', href: '/settings', primary: true },
            { label: 'Get API Key', href: '/settings' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
