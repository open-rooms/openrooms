'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AgentIcon } from '@/components/icons/system'

const PUBLIC_PATHS = ['/login']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const [authed, setAuthed]   = useState(false)

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some(p => pathname?.startsWith(p))
    if (isPublic) { setAuthed(true); setChecked(true); return }

    try {
      const raw = localStorage.getItem('or_workspace')
      if (raw) {
        const ws = JSON.parse(raw)
        // Accept real tokens (or_ prefix), demo tokens, and any valid workspace
        const tok = String(ws.token)
        if (ws?.name && ws?.token && (tok.startsWith('or_') || tok.startsWith('demo'))) {
          setAuthed(true)
          setChecked(true)
          return
        }
      }
    } catch {}

    // Not authenticated — redirect to login
    router.replace('/login')
    setChecked(true)
  }, [pathname, router])

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#F9F5EF] flex items-center justify-center">
        <div className="text-center">
          <AgentIcon className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-gray-400">Loading workspace…</p>
        </div>
      </div>
    )
  }

  if (!authed) return null

  return <>{children}</>
}
