import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="clients"
      title="Agents"
      description="Deploy autonomous agents that perceive goals, reason over available tools, and take sequential actions to complete tasks. Agents run inside Rooms and integrate with any API, model, or data source."
      accentColor="#FDA4AF"
      textOnAccent="#111"
      actionLabel="Deploy Agent"
      actionHref="/agents"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#FDA4AF"
          stats={[
            { label: 'Execution', value: 'Autonomous', sub: 'Reason + Act loop' },
            { label: 'Models', value: 'Any LLM', sub: 'OpenAI, Anthropic, Gemini' },
            { label: 'Tools', value: 'Unlimited', sub: 'APIs, DBs, Blockchain' },
          ]}
        />
        <CapabilityGrid
          accentColor="#FDA4AF"
          items={[
            { title: 'Goal-Directed', desc: 'Agents operate toward a defined objective and break it into sub-tasks dynamically.' },
            { title: 'Tool Use', desc: 'Agents call registered tools — APIs, scrapers, code runners, or blockchain nodes.' },
            { title: 'Memory Access', desc: 'Agents read from and write to the Room\'s knowledge graph between runs.' },
            { title: 'Multi-Model', desc: 'Each agent can use a different LLM. Mix GPT-4, Claude, and Gemini in one workflow.' },
            { title: 'Reasoning Traces', desc: 'Every decision step is logged so you can inspect exactly how an agent reached a conclusion.' },
            { title: 'Parallel Execution', desc: 'Multiple agents can run simultaneously inside a Room for collaborative task completion.' },
          ]}
        />
        <TerminalBlock
          label="agent execution trace"
          code={`[Agent: ResearchAgent]  goal: "Find top 5 DeFi yields > 8% APY"
[Step 1]  tool_call: web_search("DeFi yield farming protocols 2025")
[Step 2]  tool_call: scrape_page("https://defillama.com/yields")
[Step 3]  reasoning: "Filtering results where APY > 8%..."
[Step 4]  tool_call: write_to_knowledge({ key: "yields_2025", data: [...] })
[Step 5]  result: Found 7 protocols. Top: Aave V3 (11.2%), Morpho (9.8%), Euler (8.6%)
[Status]  COMPLETED  |  duration: 4.2s  |  tokens: 1,842`}
        />
        <ActionRow
          accentColor="#FDA4AF"
          textOnAccent="#111"
          actions={[
            { label: 'Deploy Agent', href: '/agents', primary: true },
            { label: 'View Agent Runs', href: '/clients/live-activity' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
