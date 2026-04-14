'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  RoomsIcon, AgentIcon, WorkflowIcon, APIIcon, LiveRunsIcon,
  ToolIcon, SettingsIcon, DashboardIcon, MemoryIcon, AutomationIcon,
  ObservabilityIcon, SecurityIcon, ComplianceIcon,
} from '@/components/icons/system'

interface Cmd {
  id: string
  label: string
  desc: string
  Icon: React.ComponentType<{ className?: string }>
  href: string
  group: string
  keywords?: string[]
}

const COMMANDS: Cmd[] = [
  // Core
  { id: 'home',          label: 'Home',          desc: 'Product overview & quick launch',  Icon: DashboardIcon,   href: '/home',          group: 'Navigate' },
  { id: 'rooms',         label: 'Rooms',         desc: 'All execution environments',        Icon: RoomsIcon,       href: '/rooms',         group: 'Navigate', keywords: ['execution','environment'] },
  { id: 'agents',        label: 'Agents',         desc: 'Deploy and manage agents',          Icon: AgentIcon,       href: '/agents',        group: 'Navigate' },
  { id: 'workflows',     label: 'Workflows',      desc: 'Orchestration graphs',              Icon: WorkflowIcon,    href: '/workflows',     group: 'Navigate' },
  { id: 'connectors',    label: 'Connectors',     desc: 'REST API & blockchain tools',       Icon: APIIcon,         href: '/connectors',    group: 'Navigate' },
  { id: 'live-runs',     label: 'Live Runs',      desc: 'Active executions & history',       Icon: LiveRunsIcon,    href: '/live-runs',     group: 'Navigate', keywords: ['logs','history','runs'] },
  { id: 'tools',         label: 'Tools',          desc: 'Registered tool registry',          Icon: ToolIcon,        href: '/tools',         group: 'Navigate' },
  { id: 'automation',    label: 'Automation',     desc: 'Triggers, schedules, events',       Icon: AutomationIcon,  href: '/automation',    group: 'Navigate' },
  { id: 'runtime',       label: 'Runtime',        desc: 'Worker pool & queue metrics',       Icon: ObservabilityIcon,href: '/runtime',      group: 'Navigate' },
  { id: 'control-plane', label: 'Control Plane',  desc: 'System health & configuration',     Icon: DashboardIcon,   href: '/control-plane', group: 'Navigate', keywords: ['health','config','settings','system'] },
  // Create actions
  { id: 'new-room',      label: 'New Room',       desc: 'Create a new execution environment',Icon: RoomsIcon,       href: '/rooms',         group: 'Actions',  keywords: ['create','new','launch'] },
  { id: 'new-agent',     label: 'Deploy Agent',   desc: 'Create a new agent',                Icon: AgentIcon,       href: '/agents/create', group: 'Actions',  keywords: ['create','deploy','new'] },
  { id: 'new-workflow',  label: 'New Workflow',   desc: 'Create an orchestration workflow',   Icon: WorkflowIcon,    href: '/workflows',     group: 'Actions',  keywords: ['create','build','new'] },
  // Platform
  { id: 'memory',        label: 'Memory',         desc: 'Shared agent memory & vector store', Icon: MemoryIcon,     href: '/runtime',       group: 'Platform' },
  { id: 'security',      label: 'Security',       desc: 'Enterprise security settings',       Icon: SecurityIcon,   href: '/enterprise/security', group: 'Platform' },
  { id: 'compliance',    label: 'Compliance',     desc: 'Audit logs and policy rules',        Icon: ComplianceIcon, href: '/enterprise/compliance', group: 'Platform' },
  { id: 'settings',      label: 'Settings',       desc: 'Workspace preferences',              Icon: SettingsIcon,   href: '/settings',      group: 'Settings' },
]

export function CommandPalette() {
  const [isOpen, setIsOpen]           = useState(false)
  const [search, setSearch]           = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router   = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = search.trim()
    ? COMMANDS.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.desc.toLowerCase().includes(search.toLowerCase()) ||
        c.keywords?.some(k => k.includes(search.toLowerCase()))
      )
    : COMMANDS

  // Group results
  const groups = filtered.reduce<Record<string, Cmd[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = []
    acc[cmd.group].push(cmd)
    return acc
  }, {})
  const flatFiltered = Object.values(groups).flat()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setIsOpen(p => !p) }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (isOpen) { inputRef.current?.focus(); setSelectedIndex(0); setSearch('') }
  }, [isOpen])

  function select(cmd: Cmd) {
    router.push(cmd.href)
    setIsOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setSelectedIndex(p => Math.min(p + 1, flatFiltered.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIndex(p => Math.max(p - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (flatFiltered[selectedIndex]) select(flatFiltered[selectedIndex]) }
    else if (e.key === 'Escape') setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none" style={{ zIndex: 39 }}>
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 bg-[#111] border border-[#333] rounded-xl text-xs text-gray-300 hover:text-white hover:border-[#555] transition-all duration-200 shadow-lg font-semibold"
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 opacity-60" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Quick Navigation
          <kbd className="px-1.5 py-0.5 bg-[#222] border border-[#444] rounded text-[10px] font-bold text-gray-400">⌘K</kbd>
        </button>
      </div>
    )
  }

  let globalIdx = 0

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        <div className="w-full max-w-xl bg-[#111] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden animate-[fadeSlideDown_0.2s_ease_both]">

          {/* Search bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#222]">
            <svg viewBox="0 0 16 16" className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Go to page or action…"
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedIndex(0) }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-base text-white placeholder-gray-600 focus:outline-none font-medium"
            />
            <kbd className="px-2 py-1 bg-[#1a1a1a] border border-[#333] rounded text-[10px] text-gray-500 font-bold">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[420px] overflow-y-auto py-2">
            {flatFiltered.length === 0 ? (
              <div className="text-center py-12 text-gray-600 text-sm">No results for &ldquo;{search}&rdquo;</div>
            ) : (
              Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <p className="px-5 pt-3 pb-1 text-[10px] font-bold tracking-widest text-gray-600 uppercase">{group}</p>
                  {items.map(cmd => {
                    const idx = globalIdx++
                    const isSelected = idx === selectedIndex
                    const Icon = cmd.Icon
                    return (
                      <button
                        key={cmd.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => select(cmd)}
                        className={cn(
                          'w-full flex items-center gap-3.5 px-5 py-2.5 text-left transition-colors',
                          isSelected ? 'bg-[#EA580C]/10' : 'hover:bg-white/[0.04]'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                          isSelected ? 'bg-[#EA580C]/20' : 'bg-white/[0.06]'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-semibold', isSelected ? 'text-white' : 'text-gray-200')}>{cmd.label}</p>
                          <p className="text-xs text-gray-600 truncate">{cmd.desc}</p>
                        </div>
                        {isSelected && (
                          <kbd className="px-2 py-0.5 bg-[#EA580C]/20 border border-[#EA580C]/30 rounded text-[10px] text-[#EA580C] font-bold flex-shrink-0">↵</kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#222] px-5 py-2.5 flex items-center gap-4 text-[10px] text-gray-600 font-medium bg-[#0d0d0d]">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-[#1a1a1a] border border-[#333] rounded font-bold">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-[#1a1a1a] border border-[#333] rounded font-bold">↵</kbd> open</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-[#1a1a1a] border border-[#333] rounded font-bold">ESC</kbd> close</span>
            <span className="ml-auto">{flatFiltered.length} result{flatFiltered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </>
  )
}
