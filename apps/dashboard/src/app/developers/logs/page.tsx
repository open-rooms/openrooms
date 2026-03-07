import { SubPageShell } from '@/components/SubPageShell'
export default function Page() {
  return <SubPageShell path="developers" title="Logs" description="Structured execution logs with event types, reasoning traces, and tool call records. Every decision an agent makes is captured and queryable." accentColor="#F54E00" textOnAccent="#fff" actionLabel="View Logs" actionHref="/live-runs" />
}
