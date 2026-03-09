import { SubPageShell } from '@/components/SubPageShell'
import { StatGrid, CapabilityGrid, TerminalBlock, ActionRow } from '@/components/PageContent'

export default function Page() {
  return (
    <SubPageShell
      path="clients"
      title="Tools"
      description="Tools are the capabilities your agents use to interact with the world — calling APIs, running code, querying databases, searching the web, and executing blockchain transactions."
      accentColor="#FDA4AF"
      textOnAccent="#111"
      actionLabel="Browse Tools"
      actionHref="/tools"
    >
      <div className="space-y-6">
        <StatGrid
          accentColor="#FDA4AF"
          stats={[
            { label: 'Tool Types', value: '6+', sub: 'API, Code, DB, Web, Chain, Custom' },
            { label: 'Execution', value: 'Sandboxed', sub: 'Isolated per agent call' },
            { label: 'Schema', value: 'JSON Schema', sub: 'Typed inputs and outputs' },
          ]}
        />
        <CapabilityGrid
          accentColor="#FDA4AF"
          items={[
            { title: 'Web Search', desc: 'Agents search the open web and return structured results in real time.' },
            { title: 'Page Scraper', desc: 'Extract structured data from any public URL — product pages, news articles, documentation.' },
            { title: 'Code Runner', desc: 'Execute Python snippets in a sandboxed environment for data processing and analysis.' },
            { title: 'Database Query', desc: 'Agents run SQL queries against connected databases and return results as JSON.' },
            { title: 'API Caller', desc: 'Make authenticated HTTP requests to any registered integration endpoint.' },
            { title: 'Blockchain Action', desc: 'Read on-chain state or submit transactions to EVM or Solana networks.' },
          ]}
        />
        <TerminalBlock
          label="tool call — code runner"
          code={`[Tool: code_runner]
Input:
  language: python
  code: |
    import json
    data = [{"protocol":"Aave","apy":11.2},{"protocol":"Morpho","apy":9.8}]
    top = sorted(data, key=lambda x: x["apy"], reverse=True)
    print(json.dumps(top[0]))

Output:
  stdout: {"protocol": "Aave", "apy": 11.2}
  exit_code: 0
  duration: 0.3s`}
        />
        <ActionRow
          accentColor="#FDA4AF"
          textOnAccent="#111"
          actions={[
            { label: 'Browse Tools', href: '/tools', primary: true },
            { label: 'Add Integration', href: '/clients/integrations' },
          ]}
        />
      </div>
    </SubPageShell>
  )
}
