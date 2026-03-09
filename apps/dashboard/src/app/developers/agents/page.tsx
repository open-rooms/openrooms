import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="developers"
      title="Agents"
      description="Configure agent schemas, assign LLM models, define system prompts, attach tools, and set execution permissions. The developer agent interface gives you infrastructure-level control over every autonomous actor in the system."
      accentColor="#F54E00"
      textOnAccent="#fff"
      actionLabel="Configure Agent"
      actionHref="/agents"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#F54E00"
          stats={[
            { label: 'LLM Support', value: 'Any Model', sub: 'OpenAI, Anthropic, Gemini, custom' },
            { label: 'Tool Slots', value: 'Unlimited', sub: 'Per agent config' },
            { label: 'Execution Mode', value: 'Sync / Async', sub: 'Via BullMQ queue' },
          ]}
        />
        <TerminalBlock
          label="agent schema — JSON config"
          code={`{
  "id": "agent_research_01",
  "name": "ResearchAgent",
  "model": "gpt-4o",
  "system_prompt": "You are a research agent...",
  "tools": ["web_search", "scrape_page", "write_to_knowledge"],
  "max_steps": 20,
  "memory": true,
  "room_id": "room_defi_monitor",
  "permissions": {
    "web": true,
    "blockchain": false,
    "code_execution": false
  }
}`}
        />
        <CapabilityGrid
          accentColor="#F54E00"
          items={[
            { title: 'Model Assignment', desc: 'Bind any supported LLM to an agent. Switch models without changing tool configs.' },
            { title: 'System Prompt', desc: 'Define the agent\'s persona, constraints, and goal framing at the infrastructure level.' },
            { title: 'Tool Permissions', desc: 'Grant or restrict specific tools per agent — web access, code execution, blockchain.' },
            { title: 'Memory Toggle', desc: 'Enable Room memory so agents persist discoveries and recall context across runs.' },
            { title: 'Step Limits', desc: 'Set a maximum number of reasoning steps to prevent runaway execution.' },
            { title: 'Async Execution', desc: 'Queue agents as background jobs. Results are delivered via event bus or webhook.' },
          ]}
        />
        <ActionRow
          accentColor="#F54E00"
          textOnAccent="#fff"
          actions={[
            { label: 'Configure Agent', href: '/agents', primary: true },
            { label: 'View Runs', href: '/developers/runs' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
