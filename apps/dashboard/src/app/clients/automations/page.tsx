import { SubPageShell } from '@/components/SubPageShell'
export default function Page() {
  return <SubPageShell path="clients" title="Automations" description="Scheduled and event-driven tasks that run without manual intervention. Trigger workflows via cron, webhooks, or API events." accentColor="#FDA4AF" textOnAccent="#111" actionLabel="Create Automation" actionHref="/automation" />
}
