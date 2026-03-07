'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type DockItem = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

export function PathDock({ items, accentColor = '#F54E00' }: { items: DockItem[]; accentColor?: string }) {
  const [open, setOpen] = useState(true)
  const dockRef = useRef<HTMLDivElement>(null)

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const tooltipColor = accentColor === '#111111' ? '#fff' : '#111'

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-3 sm:px-4">
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={dockRef}
            key="dock-open"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto bg-white/95 backdrop-blur-md border-2 border-black rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-end gap-1.5 sm:gap-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto max-w-full"
          >
            {items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group relative flex flex-col items-center flex-shrink-0"
                >
                  {/* Tooltip */}
                  <div
                    className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-10"
                    style={{ backgroundColor: accentColor, color: tooltipColor }}
                  >
                    {item.name}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rotate-45"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.32, y: -8 }}
                    whileTap={{ scale: 1.05 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="cursor-pointer"
                  >
                    <Icon className="w-7 h-7 sm:w-9 sm:h-9" />
                  </motion.div>
                </Link>
              )
            })}

            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="flex-shrink-0 ml-1 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors self-center"
              aria-label="Close dock"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ) : (
          /* Collapsed toggle */
          <motion.button
            key="dock-closed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setOpen(true)}
            className="pointer-events-auto w-10 h-10 rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Open dock"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
