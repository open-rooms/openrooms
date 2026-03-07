import { SubPageShell } from '@/components/SubPageShell'
export default function Page() {
  return <SubPageShell path="clients" title="Rooms" description="Coordinated environments where agents work together on your tasks. A Room contains agents, workflows, tools, and knowledge — all scoped to a single goal." accentColor="#FDA4AF" textOnAccent="#111" actionLabel="Create a Room" actionHref="/rooms/new" />
}
