import { SubPageShell } from '@/components/SubPageShell'
export default function Page() {
  return <SubPageShell path="clients" title="Live Activity" description="Real-time feed showing exactly what your agents are doing right now. Monitor reasoning steps, tool calls, and execution state as it happens." accentColor="#FDA4AF" textOnAccent="#111" actionLabel="View Live Runs" actionHref="/live-runs" />
}
