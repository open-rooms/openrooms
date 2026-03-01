'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ProgressBar } from '@/components/ui/progress'
import { CommandPalette } from '@/components/command-palette'

const themeMap: Record<string, string> = {
  dashboard: 'dashboard',
  workflows: 'workflows',
  rooms: 'rooms',
  tools: 'tools',
  logs: 'logs',
  home: 'home',
  settings: 'settings',
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === '/home' || pathname === '/'

  useEffect(() => {
    const root = document.documentElement
    
    // Determine page theme from pathname
    let pageTheme = 'dashboard' // default
    
    for (const [key, theme] of Object.entries(themeMap)) {
      if (pathname.startsWith(`/${key}`)) {
        pageTheme = theme
        break
      }
    }
    
    if (pathname === '/home' || pathname === '/') {
      pageTheme = 'home'
    }
    
    // Apply page theme
    root.setAttribute('data-page-theme', pageTheme)
  }, [pathname])

  return (
    <>
      <ProgressBar />
      <CommandPalette />
      {!isHomePage && (
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 ml-64">
            {children}
          </main>
        </div>
      )}
      {isHomePage && (
        <main className="min-h-screen">
          {children}
        </main>
      )}
    </>
  )
}
