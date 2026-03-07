// Shared sub-page template for all path/* routes
// Each sub-page imports this and passes its config

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/PageTransition'
import { ChevronRightIcon } from '@/components/icons'

interface SubPageProps {
  path: 'clients' | 'developers' | 'enterprise'
  title: string
  description: string
  accentColor: string
  textOnAccent: string
  actionLabel?: string
  actionHref?: string
  children?: React.ReactNode
}

const pathLabel: Record<string, string> = {
  clients: 'For Clients',
  developers: 'For Developers',
  enterprise: 'For Enterprise',
}

export function SubPageShell({
  path,
  title,
  description,
  accentColor,
  textOnAccent,
  actionLabel,
  actionHref,
  children,
}: SubPageProps) {
  return (
    <PageTransition>
      <div className="min-h-screen pb-24" style={{ background: path === 'enterprise' ? '#f9fafb' : '#E8DCC8' }}>
        {/* Accent bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ background: accentColor, transformOrigin: 'left' }}
          className="h-1 w-full"
        />

        {/* Header */}
        <div style={{ background: path === 'enterprise' ? '#fff' : '#F5F1E8', borderBottom: path === 'enterprise' ? '1px solid #e5e7eb' : '2px solid #000' }}>
          <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
              <Link href={`/${path}`} className="hover:text-gray-700 transition-colors font-medium capitalize">{path}</Link>
              <ChevronRightIcon className="w-3 h-3" />
              <span className="text-gray-700 font-semibold">{title}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span
                  className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-3"
                  style={{ background: accentColor, color: textOnAccent }}
                >
                  {pathLabel[path]}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight" style={{ color: path === 'enterprise' ? '#111827' : '#111111' }}>
                  {title}
                </h1>
                <p className="mt-2 text-sm text-gray-500 max-w-lg leading-relaxed">{description}</p>
              </div>

              {actionLabel && actionHref && (
                <Link
                  href={actionHref}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-black rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
                  style={{ background: accentColor, color: textOnAccent }}
                >
                  <span>{actionLabel}</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[95%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10">
          {children || (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-400">Coming soon</p>
              <p className="text-xs text-gray-300 mt-1">This section is under active development.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
