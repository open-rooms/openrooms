import { SubPageShell } from '@/components/SubPageShell'
export default function Page() {
  return <SubPageShell path="enterprise" title="Swarms" description="Deploy coordinated swarms of specialised agents that work in parallel across shared tasks. Swarms scale horizontally and coordinate via the OpenRooms event bus." accentColor="#111827" textOnAccent="#fff" actionLabel="Deploy Swarm" actionHref="/agents" />
}
