'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  action: () => void
  keywords?: string[]
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Go to dashboard',
      icon: '📊',
      action: () => router.push('/'),
      keywords: ['home', 'overview'],
    },
    {
      id: 'rooms',
      label: 'Rooms',
      description: 'View all rooms',
      icon: '🏠',
      action: () => router.push('/rooms'),
      keywords: ['execution', 'environments'],
    },
    {
      id: 'workflows',
      label: 'Workflows',
      description: 'View workflows',
      icon: '⚡',
      action: () => router.push('/workflows'),
      keywords: ['templates', 'orchestration'],
    },
    {
      id: 'logs',
      label: 'Logs',
      description: 'View global logs',
      icon: '📝',
      action: () => router.push('/logs'),
      keywords: ['execution', 'debug'],
    },
    {
      id: 'tools',
      label: 'Tools',
      description: 'View tool plugins',
      icon: '🔧',
      action: () => router.push('/tools'),
      keywords: ['plugins', 'utilities'],
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'System settings',
      icon: '⚙️',
      action: () => router.push('/settings'),
      keywords: ['config', 'configuration'],
    },
  ]

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some((kw) => kw.includes(searchLower))
    )
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSelectedIndex(0)
      setSearch('')
    }
  }, [isOpen])

  const handleSelect = (command: CommandItem) => {
    command.action()
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm font-bold"
        >
          <span>Quick Navigation</span>
          <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-black">⌘K</kbd>
        </button>
      </div>
    )
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] animate-slide-in">
        <div className="w-full max-w-2xl mx-4 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-lg text-gray-900 placeholder-gray-400 focus:outline-none font-bold"
            />
          </div>
          
          <div className="max-h-[400px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-bold">
                No commands found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCommands.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className={cn(
                      'w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-150',
                      idx === selectedIndex
                        ? 'bg-[#FF9999]/10 border border-[#FF9999]/30'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <span className="text-2xl">{cmd.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-black text-gray-900">{cmd.label}</div>
                      {cmd.description && (
                        <div className="text-xs text-gray-500 font-bold">{cmd.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 p-3 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-black shadow-sm">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-black shadow-sm">↵</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-black shadow-sm">ESC</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
