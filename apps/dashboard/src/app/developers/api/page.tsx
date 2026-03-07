import { SubPageShell } from '@/components/SubPageShell'
export default function Page() {
  return <SubPageShell path="developers" title="API" description="REST API for triggering agent runs, querying logs, managing tools, and configuring providers. The full platform is programmable via HTTP." accentColor="#F54E00" textOnAccent="#fff" actionLabel="Manage API Keys" actionHref="/settings" />
}
