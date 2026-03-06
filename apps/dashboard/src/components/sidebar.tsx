'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { DashboardIcon } from './icons/DashboardIcon'
import { RoomsIcon } from './icons/RoomsIcon'
import {
  WorkflowsIllustrationIcon,
  AutomationIllustrationIcon,
  RunsIllustrationIcon,
  ToolsIllustrationIcon,
  AgentsIllustrationIcon,
  MetricsIllustrationIcon,
  SettingsIllustrationIcon,
  ControlPlaneIllustrationIcon
} from './icons'
import {
  WorkflowIcon,
  AutomationIcon,
  LiveActivityIcon,
  LiveRunsIcon,
  LogsIcon,
  MemoryIcon,
  RuntimeIcon,
  ToolIcon,
  AgentClustersIcon,
  ObservabilityIcon,
  SecurityIcon,
  ComplianceIcon,
  EnterpriseArchitectureIcon,
  IntegrationsIcon,
  ReportsIcon,
  APIIcon,
} from './icons/system'

type NavItem = { name: string; href: string; Icon: React.ComponentType<{ className?: string }> }

// Always shown at the top
const globalNav: NavItem[] = [
  { name: 'Home', href: '/home', Icon: DashboardIcon },
  { name: 'Settings', href: '/settings', Icon: SettingsIllustrationIcon },
]

// Shown when on /clients
const clientsNav: NavItem[] = [
  { name: 'Clients', href: '/clients', Icon: RoomsIcon },
  { name: 'Rooms', href: '/rooms', Icon: RoomsIcon },
  { name: 'Agents', href: '/agents', Icon: AgentsIllustrationIcon },
  { name: 'Automations', href: '/automation', Icon: AutomationIcon },
  { name: 'Live Activity', href: '/live-runs', Icon: LiveActivityIcon },
  { name: 'Knowledge', href: '/knowledge', Icon: MemoryIcon },
  { name: 'Reports', href: '/reports', Icon: ReportsIcon },
  { name: 'Integrations', href: '/integrations', Icon: IntegrationsIcon },
  { name: 'Tools', href: '/tools', Icon: ToolIcon },
]

// Shown when on /developers
const developersNav: NavItem[] = [
  { name: 'Developers', href: '/developers', Icon: AgentsIllustrationIcon },
  { name: 'Control Plane', href: '/control-plane', Icon: ControlPlaneIllustrationIcon },
  { name: 'Agents', href: '/agents', Icon: AgentsIllustrationIcon },
  { name: 'Workflows', href: '/workflows', Icon: WorkflowIcon },
  { name: 'Tools', href: '/tools', Icon: ToolIcon },
  { name: 'Runtime', href: '/runtime', Icon: RuntimeIcon },
  { name: 'Live Runs', href: '/live-runs', Icon: LiveRunsIcon },
  { name: 'Logs', href: '/logs', Icon: LogsIcon },
  { name: 'API', href: '/api-keys', Icon: APIIcon },
]

// Shown when on /enterprise
const enterpriseNav: NavItem[] = [
  { name: 'Enterprise', href: '/enterprise', Icon: ControlPlaneIllustrationIcon },
  { name: 'Rooms', href: '/rooms', Icon: RoomsIcon },
  { name: 'Agent Clusters', href: '/agent-clusters', Icon: AgentClustersIcon },
  { name: 'Observability', href: '/observability', Icon: ObservabilityIcon },
  { name: 'Automation', href: '/automation', Icon: AutomationIcon },
  { name: 'Integrations', href: '/integrations', Icon: IntegrationsIcon },
  { name: 'Security', href: '/security', Icon: SecurityIcon },
  { name: 'Compliance', href: '/compliance', Icon: ComplianceIcon },
  { name: 'Architecture', href: '/architecture', Icon: EnterpriseArchitectureIcon },
]

// Default developer mode (when not in a specific path)
const devModeNav: NavItem[] = [
  { name: 'Control Plane', href: '/control-plane', Icon: ControlPlaneIllustrationIcon },
  { name: 'Agents', href: '/agents', Icon: AgentsIllustrationIcon },
  { name: 'Workflows', href: '/workflows', Icon: WorkflowsIllustrationIcon },
  { name: 'Automation', href: '/automation', Icon: AutomationIllustrationIcon },
  { name: 'Live Runs', href: '/live-runs', Icon: RunsIllustrationIcon },
  { name: 'Tools', href: '/tools', Icon: ToolsIllustrationIcon },
  { name: 'Runtime', href: '/runtime', Icon: MetricsIllustrationIcon },
]

function NavSection({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <div>
      <p className="px-4 mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'))
          const Icon = item.Icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out',
                isActive ? 'bg-[#FBF7F2] text-gray-900' : 'text-gray-600 hover:bg-[#FBF7F2] hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  const isClients = pathname?.startsWith('/clients') || pathname?.startsWith('/rooms') || pathname?.startsWith('/reports') || pathname?.startsWith('/knowledge')
  const isDevelopers = pathname?.startsWith('/developers') || pathname?.startsWith('/control-plane') || pathname?.startsWith('/agents') || pathname?.startsWith('/workflows') || pathname?.startsWith('/api-keys') || pathname?.startsWith('/logs')
  const isEnterprise = pathname?.startsWith('/enterprise') || pathname?.startsWith('/agent-clusters') || pathname?.startsWith('/observability') || pathname?.startsWith('/security') || pathname?.startsWith('/compliance') || pathname?.startsWith('/architecture')

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#DED8D2] flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[#DED8D2]">
        <Link href="/home" className="flex items-center gap-3 group">
          <AgentsIllustrationIcon className="w-8 h-8" />
          <div>
            <span className="text-base font-semibold text-gray-900">
              OpenRooms
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-4">
        {/* Global */}
        <NavSection label="Navigation" items={globalNav} pathname={pathname} />

        {/* Path-specific */}
        {isClients && <NavSection label="Client Tools" items={clientsNav} pathname={pathname} />}
        {isDevelopers && <NavSection label="Developer Mode" items={developersNav} pathname={pathname} />}
        {isEnterprise && <NavSection label="Enterprise" items={enterpriseNav} pathname={pathname} />}

        {/* Default: show all paths when not in a specific one */}
        {!isClients && !isDevelopers && !isEnterprise && (
          <>
            <NavSection label="Platform" items={[
              { name: 'Clients', href: '/clients', Icon: RoomsIcon },
              { name: 'Developers', href: '/developers', Icon: AgentsIllustrationIcon },
              { name: 'Enterprise', href: '/enterprise', Icon: ControlPlaneIllustrationIcon },
            ]} pathname={pathname} />
            <NavSection label="Developer Mode" items={devModeNav} pathname={pathname} />
          </>
        )}
      </nav>

      <div className="p-4 border-t border-[#DED8D2]">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#FBF7F2] hover:bg-[#F1EBE6] transition-colors duration-150 ease-in-out cursor-pointer">
          <div className="relative">
            <div className="w-8 h-8 bg-[#F54E00] rounded-full flex items-center justify-center text-sm font-black text-white">
              U
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">User</div>
            <div className="text-xs text-gray-600 truncate">workspace-1</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
