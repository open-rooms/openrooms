'use client'

import Link from 'next/link'

type DockItem = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

export function PathDock({ items, accentColor = '#F54E00' }: { items: DockItem[]; accentColor?: string }) {
  return (
    <div className="sticky bottom-4 sm:bottom-6 z-40 flex justify-center pointer-events-none px-3 sm:px-4 animate-dock-rise" style={{ animationDelay: '0.4s' }}>
      <div
        className="pointer-events-auto bg-white/95 backdrop-blur-md border-2 border-black rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-end gap-2 sm:gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto max-w-full scrollbar-none"
        style={{ boxShadow: `4px 4px 0px 0px rgba(0,0,0,1)` }}
      >
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              href={item.href}
              className="group relative flex flex-col items-center flex-shrink-0 animate-card-pop"
              style={{ animationDelay: `${0.5 + i * 0.04}s` }}
            >
              {/* Tooltip */}
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-10"
                style={{ backgroundColor: accentColor, color: accentColor === '#111111' ? '#fff' : '#111' }}
              >
                {item.name}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rotate-45"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
              <div className="transition-all duration-200 hover:scale-[1.3] hover:-translate-y-2 cursor-pointer active:scale-[1.1]">
                <Icon className="w-7 h-7 sm:w-9 sm:h-9" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
