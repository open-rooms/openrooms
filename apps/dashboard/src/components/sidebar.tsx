'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { OpenRoomsLogo } from './openrooms-logo'
import {
  RoomsIcon,
  AgentIcon,
  WorkflowIcon,
  AutomationIcon,
  LiveRunsIcon,
  LogsIcon,
  MemoryIcon,
  SettingsIcon,
  DashboardIcon,
  ToolIcon,
  ReportsIcon,
  APIIcon,
  AgentClustersIcon,
  DistributedExecutionIcon,
  ObservabilityIcon,
  SecurityIcon,
  ComplianceIcon,
  EnterpriseArchitectureIcon,
  IntegrationsIcon,
  SDKIcon,
  DeveloperIcon,
  ClientsIcon,
} from './icons/system'

type NavItem = { name: string; href: string; Icon: React.ComponentType<{ className?: string }> }

// Core platform — only routes with real pages
const platformNav: NavItem[] = [
  { name: 'Rooms',        href: '/rooms',        Icon: RoomsIcon },
  { name: 'Agents',       href: '/agents',       Icon: AgentIcon },
  { name: 'Workflows',    href: '/workflows',    Icon: WorkflowIcon },
  { name: 'Connectors',   href: '/connectors',   Icon: APIIcon },
  { name: 'Live Runs',    href: '/live-runs',    Icon: LiveRunsIcon },
  { name: 'Tools',        href: '/tools',        Icon: ToolIcon },
  { name: 'Runtime',      href: '/runtime',      Icon: ObservabilityIcon },
  { name: 'Control Plane',href: '/control-plane',Icon: DashboardIcon },
]

// Shown when on /clients
const clientsNav: NavItem[] = [
  { name: 'Clients',      href: '/clients',              Icon: ClientsIcon },
  { name: 'Rooms',        href: '/clients/rooms',        Icon: RoomsIcon },
  { name: 'Agents',       href: '/clients/agents',       Icon: AgentIcon },
  { name: 'Workflows',    href: '/clients/workflows',    Icon: WorkflowIcon },
  { name: 'Automations',  href: '/clients/automations',  Icon: AutomationIcon },
  { name: 'Live Activity',href: '/clients/activity',     Icon: LiveRunsIcon },
  { name: 'Knowledge',    href: '/clients/knowledge',    Icon: MemoryIcon },
  { name: 'Reports',      href: '/clients/reports',      Icon: ReportsIcon },
  { name: 'Integrations', href: '/clients/integrations', Icon: IntegrationsIcon },
  { name: 'Tools',        href: '/clients/tools',        Icon: ToolIcon },
]

// Shown when on /developers
const developersNav: NavItem[] = [
  { name: 'Developers',   href: '/developers',              Icon: DeveloperIcon },
  { name: 'Control Plane',href: '/developers/control-plane',Icon: DashboardIcon },
  { name: 'Agents',       href: '/developers/agents',       Icon: AgentIcon },
  { name: 'Workflows',    href: '/developers/workflows',    Icon: WorkflowIcon },
  { name: 'Tools',        href: '/developers/tools',        Icon: ToolIcon },
  { name: 'Runtime',      href: '/developers/runtime',      Icon: ObservabilityIcon },
  { name: 'Live Runs',    href: '/developers/runs',         Icon: LiveRunsIcon },
  { name: 'Logs',         href: '/developers/logs',         Icon: LogsIcon },
  { name: 'API',          href: '/developers/api',          Icon: APIIcon },
  { name: 'SDK',          href: '/developers/sdk',          Icon: SDKIcon },
]

// Shown when on /enterprise
const enterpriseNav: NavItem[] = [
  { name: 'Enterprise',           href: '/enterprise',              Icon: AgentClustersIcon },
  { name: 'Rooms',                href: '/enterprise/rooms',        Icon: RoomsIcon },
  { name: 'Swarms',               href: '/enterprise/swarms',       Icon: AgentClustersIcon },
  { name: 'Distributed Exec',     href: '/enterprise/execution',    Icon: DistributedExecutionIcon },
  { name: 'Observability',        href: '/enterprise/observability', Icon: ObservabilityIcon },
  { name: 'Automation',           href: '/enterprise/automation',   Icon: AutomationIcon },
  { name: 'Integrations',         href: '/enterprise/integrations', Icon: IntegrationsIcon },
  { name: 'Security',             href: '/enterprise/security',     Icon: SecurityIcon },
  { name: 'Compliance',           href: '/enterprise/compliance',   Icon: ComplianceIcon },
  { name: 'Architecture',         href: '/enterprise/architecture', Icon: EnterpriseArchitectureIcon },
]

function NavSection({ label, items, pathname, accentColor }: { label: string; items: NavItem[]; pathname: string; accentColor?: string }) {
  return (
    <div>
      <p className="px-4 mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
      <div className="space-y-0.5">
        {items.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'))
          const Icon = item.Icon
          return (
            <Link key={item.name} href={item.href}
              className={cn(
                'group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative',
                isActive
                  ? 'bg-[#FBF7F2] text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-[#FBF7F2] hover:text-gray-900'
              )}
            >
              {isActive && accentColor && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ backgroundColor: accentColor }} />
              )}
              <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-150 group-hover:scale-110" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const isClients    = pathname?.startsWith('/clients')
  const isDevelopers = pathname?.startsWith('/developers')
  const isEnterprise = pathname?.startsWith('/enterprise')
  const isPlatform   = !isClients && !isDevelopers && !isEnterprise

  function handleSignOut() {
    localStorage.removeItem('or_workspace')
    router.push('/login')
  }

  const workspaceName = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('or_workspace') || '{}')?.name ?? 'Workspace'
    : 'Workspace'

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#DED8D2] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#DED8D2]">
        <Link href="/home">
          <OpenRoomsLogo size={38} textSize="text-[15px]" />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-4">
        {/* Global */}
        <NavSection label="Navigation" items={[
          { name: 'Home',     href: '/home',     Icon: DashboardIcon },
          { name: 'Settings', href: '/settings', Icon: SettingsIcon },
        ]} pathname={pathname} />

        {/* Path-specific */}
        {isClients    && <NavSection label="Client Tools"   items={clientsNav}    pathname={pathname} accentColor="#FDA4AF" />}
        {isDevelopers && <NavSection label="Developer Mode" items={developersNav} pathname={pathname} accentColor="#F5A623" />}
        {isEnterprise && <NavSection label="Enterprise"     items={enterpriseNav} pathname={pathname} accentColor="#111111" />}

        {/* Default platform nav */}
        {isPlatform && (
          <NavSection label="Platform" items={platformNav} pathname={pathname} accentColor="#F5A623" />
        )}
      </nav>

      {/* Workspace / user footer */}
      <div className="p-4 border-t border-[#DED8D2]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#FBF7F2] group">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-[#F5A623] rounded-full flex items-center justify-center text-sm font-black text-white">
              {workspaceName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{workspaceName}</div>
            <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
