import { SubPageShell } from '@/components/SubPageShell'
export default function Page() {
  return <SubPageShell path="developers" title="Runs" description="Full execution history with status tracking, duration, and per-run metadata. Every agent run and workflow execution is recorded here." accentColor="#F54E00" textOnAccent="#fff" actionLabel="View Runs" actionHref="/live-runs" />
}
