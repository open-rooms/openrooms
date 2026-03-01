'use client'

import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#DED8D2] bg-white flex items-center px-8 sticky top-0 z-10">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-[#111111]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </header>
  )
}
