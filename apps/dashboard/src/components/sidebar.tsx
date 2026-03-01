'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { RoomsIcon } from '@/components/icons/RoomsIcon'
import { AgentIcon } from '@/components/icons/AgentIcon'
import { WorkflowIcon } from '@/components/icons/WorkflowIcon'
import { LogsIcon } from '@/components/icons/LogsIcon'
import { MemoryIcon } from '@/components/icons/MemoryIcon'
import { DashboardIcon } from '@/components/icons/DashboardIcon'
import { ToolIcon, SettingsIcon } from '@/components/icons'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', Icon: DashboardIcon },
  { name: 'Rooms', href: '/rooms', Icon: RoomsIcon },
  { name: 'Workflows', href: '/workflows', Icon: WorkflowIcon },
  { name: 'Logs', href: '/logs', Icon: LogsIcon },
  { name: 'Tools', href: '/tools', Icon: ToolIcon },
  { name: 'Settings', href: '/settings', Icon: SettingsIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border flex flex-col">
      {/* Logo - Agent icon direct render */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <AgentIcon className="w-10 h-10" />
          <div>
            <span className="text-lg font-black text-brand">
              OpenRooms
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.Icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200',
                isActive
                  ? 'bg-surface-active text-text-primary'
                  : 'text-text-secondary hover:bg-surface-active hover:text-text-primary'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section - Uses brand color */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-active hover:bg-surface-active/80 transition-colors duration-200 cursor-pointer">
          <div className="relative">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm font-black text-brand-foreground">
              U
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-surface" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate">User</div>
            <div className="text-xs text-text-secondary truncate">workspace-1</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
