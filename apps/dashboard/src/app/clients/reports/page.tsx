import { SubPageShell } from '@/components/SubPageShell'
export default function Page() {
  return <SubPageShell path="clients" title="Reports" description="Summarised outputs and analytics from completed agent runs. See what your agents accomplished, what tools they used, and how long tasks took." accentColor="#FDA4AF" textOnAccent="#111" actionLabel="View Reports" actionHref="/live-runs" />
}
