import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="developers"
      title="Tools"
      description="Build, register, and manage tools that agents call during execution. Each tool is a typed, sandboxed capability — from API calls and code runners to database queries and blockchain operations."
      accentColor="#EA580C"
      textOnAccent="#fff"
      actionLabel="Build a Tool"
      actionHref="/tools"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#EA580C"
          stats={[
            { label: 'Definition', value: 'JSON Schema', sub: 'Typed inputs and outputs' },
            { label: 'Execution', value: 'Sandboxed', sub: 'Isolated per agent invocation' },
            { label: 'Scope', value: 'Global / Room', sub: 'Shared or room-scoped tools' },
          ]}
        />
        <TerminalBlock
          label="tool definition — JSON Schema"
          code={`{
  "name": "web_search",
  "description": "Search the open web and return top results.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "The search query." },
      "limit": { "type": "number", "default": 5 }
    },
    "required": ["query"]
  },
  "output_schema": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "url":   { "type": "string" },
        "snippet": { "type": "string" }
      }
    }
  },
  "execution": { "type": "api", "endpoint": "/tools/web-search" }
}`}
        />
        <CapabilityGrid
          accentColor="#EA580C"
          items={[
            { title: 'Custom Tools', desc: 'Register any HTTP endpoint as a tool with a JSON Schema input/output definition.' },
            { title: 'Sandboxed Code', desc: 'Tools that run code execute in isolated containers — no host access.' },
            { title: 'Versioning', desc: 'Tools are versioned. Agents can pin a specific version for stability.' },
            { title: 'Shared Registry', desc: 'Publish tools to the Room or global registry for all agents to discover.' },
            { title: 'Auth Passthrough', desc: 'Tools that require auth receive scoped credentials at call time — never at definition.' },
            { title: 'Result Caching', desc: 'Cache tool outputs for a TTL to reduce duplicate API calls across agent steps.' },
          ]}
        />
        <ActionRow
          accentColor="#EA580C"
          textOnAccent="#fff"
          actions={[
            { label: 'Build a Tool', href: '/tools', primary: true },
            { label: 'Add Integration', href: '/developers/api' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
