'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { AuthGuard } from '@/components/auth-guard'
import { ProgressBar } from '@/components/ui/progress'
import { CommandPalette } from '@/components/command-palette'
import { motion, AnimatePresence } from 'framer-motion'

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
  const isLoginPage = pathname === '/login'
  const isHomePage  = !isLoginPage && (pathname === '/home' || pathname === '/' || pathname === '/ecosystem' || pathname === '/system')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    const root = document.documentElement
    let pageTheme = 'dashboard'
    for (const [key, theme] of Object.entries(themeMap)) {
      if (pathname.startsWith(`/${key}`)) {
        pageTheme = theme
        break
      }
    }
    if (pathname === '/home' || pathname === '/') pageTheme = 'home'
    root.setAttribute('data-page-theme', pageTheme)
  }, [pathname])

  if (isLoginPage) {
    return <main className="min-h-screen">{children}</main>
  }

  if (isHomePage) {
    return (
      <AuthGuard>
        <ProgressBar />
        <CommandPalette />
        <main className="min-h-screen">{children}</main>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <>
      <ProgressBar />
      <CommandPalette />

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-white border-b border-[#DED8D2] md:hidden">
        <span className="text-base font-bold text-gray-900">OpenRooms</span>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={mobileSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              key="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64 md:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main content — offset for desktop sidebar, top-bar on mobile */}
        <main className="flex-1 md:ml-64 pt-14 md:pt-0">
          {children}
        </main>
      </div>
      </>
    </AuthGuard>
  )
}
