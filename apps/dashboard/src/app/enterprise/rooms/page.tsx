import { SubPageShell } from '@/components/SubPageShell'
export default function Page() {
  return <SubPageShell path="enterprise" title="Rooms" description="Isolated execution environments that contain agents, memory, and workflows at runtime. Enterprise Rooms are scoped, audited, and access-controlled." accentColor="#111827" textOnAccent="#fff" actionLabel="Create Room" actionHref="/rooms/new" />
}
