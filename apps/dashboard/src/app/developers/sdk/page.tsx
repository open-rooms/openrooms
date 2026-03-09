import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="developers"
      title="SDK"
      description="Client libraries for integrating OpenRooms into your applications. The SDK wraps the REST API with typed clients, event subscription helpers, and workflow trigger utilities."
      accentColor="#F54E00"
      textOnAccent="#fff"
      actionLabel="View SDK Docs"
      actionHref="/docs"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#F54E00"
          stats={[
            { label: 'Languages', value: 'TypeScript', sub: 'JavaScript / Node.js compatible' },
            { label: 'Install', value: 'npm / pnpm', sub: '@openrooms/sdk' },
            { label: 'Type Safety', value: '100% Typed', sub: 'Full TypeScript types for all resources' },
          ]}
        />
        <TerminalBlock
          label="quick start — TypeScript SDK"
          code={`import { OpenRooms } from '@openrooms/sdk'

const client = new OpenRooms({ apiKey: process.env.OPENROOMS_API_KEY })

// Trigger a workflow
const run = await client.workflows.trigger({
  workflowId: 'wf_defi_research',
  roomId: 'room_defi_monitor',
  payload: { query: 'Top DeFi yields above 8% APY' },
})

console.log(run.id) // run_9xk2m

// Poll until complete
const result = await client.runs.waitUntilComplete(run.id)
console.log(result.status)   // "SUCCESS"
console.log(result.outputs)  // { report: "..." }

// Subscribe to live events
client.events.subscribe('room_defi_monitor', (event) => {
  console.log(event.type, event.data)
})`}
        />
        <CapabilityGrid
          accentColor="#F54E00"
          items={[
            { title: 'TypeScript First', desc: 'Full type safety with generated types for every resource, run, and event.' },
            { title: 'Workflow Trigger', desc: 'One-line function to trigger any workflow with a typed payload.' },
            { title: 'Run Polling', desc: 'Built-in `waitUntilComplete` helper with configurable timeout and interval.' },
            { title: 'Event Streaming', desc: 'Subscribe to Room events in real time using Server-Sent Events under the hood.' },
            { title: 'Agent Client', desc: 'Directly invoke agents and retrieve structured outputs from your application.' },
            { title: 'Error Handling', desc: 'Typed error classes for every failure mode — rate limits, auth, not found, timeouts.' },
          ]}
        />
        <ActionRow
          accentColor="#F54E00"
          textOnAccent="#fff"
          actions={[
            { label: 'View SDK Docs', href: '/docs', primary: true },
            { label: 'API Reference', href: '/developers/api' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
