'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthGateProps {
  feature: string
  children: React.ReactNode
}

// Simple in-memory auth check — replace with real session check when auth is wired up
function useIsAuthenticated() {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('or_session')
}

export function AuthGate({ feature, children }: AuthGateProps) {
  const isAuthenticated = useIsAuthenticated()
  const [dismissed, setDismissed] = useState(false)

  if (isAuthenticated || dismissed) return <>{children}</>

  return (
    <AnimatePresence>
      <div className="relative min-h-screen">
        {/* Blurred background */}
        <div className="pointer-events-none select-none blur-sm opacity-40">
          {children}
        </div>

        {/* Modal overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full p-8 text-center"
          >
            <div className="w-12 h-12 bg-[#F54E00] rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-sm text-gray-500 mb-7 leading-relaxed">
              Sign in to deploy {feature} and run workflows on the OpenRooms control plane.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/settings"
                className="w-full inline-flex items-center justify-center px-5 py-3 bg-[#F54E00] hover:bg-[#E24600] text-white text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </Link>
              <Link
                href="/settings"
                className="w-full inline-flex items-center justify-center px-5 py-3 bg-white border-2 border-black hover:bg-gray-50 text-gray-900 text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Free Account
              </Link>
              <button
                onClick={() => setDismissed(true)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
              >
                Continue browsing
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
