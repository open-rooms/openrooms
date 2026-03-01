'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        
        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-400 hover:text-[#FF9999] transition-colors font-bold tracking-wide"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(
                'font-black tracking-wide',
                isLast ? 'text-white' : 'text-gray-400'
              )}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            )}
          </div>
        )
      })}
    </nav>
  )
}
