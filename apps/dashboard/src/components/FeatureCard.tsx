'use client'

import Link from 'next/link'

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href?: string
  accent?: string
  variant?: 'cream' | 'light'
}

export function FeatureCard({ icon: Icon, title, description, href, variant = 'cream' }: FeatureCardProps) {
  const base = variant === 'light'
    ? 'bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md'
    : 'bg-[#F5F1E8] border border-[#D4C4A8] hover:border-[#F54E00] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]'

  const accentLine = variant === 'light'
    ? 'bg-gray-900'
    : 'bg-[#F54E00]'

  const inner = (
    <div className={`group relative ${base} rounded-2xl p-6 flex flex-col items-center text-center
                    hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden h-full`}>
      <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
        <Icon className="w-16 h-16" />
      </div>
      <h3 className="text-sm font-bold text-[#111111] mb-2 leading-tight">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed
                    max-h-0 overflow-hidden opacity-0
                    group-hover:max-h-20 group-hover:opacity-100
                    transition-all duration-300 ease-out">
        {description}
      </p>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accentLine} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </div>
  )

  if (href) {
    return <Link href={href} className="block h-full">{inner}</Link>
  }
  return inner
}

interface FeatureGridProps {
  features: Omit<FeatureCardProps, 'variant'>[]
  variant?: 'cream' | 'light'
}

export function FeatureGrid({ features, variant = 'cream' }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5">
      {features.map((feature, i) => (
        <div
          key={feature.title}
          className="animate-card-pop"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <FeatureCard {...feature} variant={variant} />
        </div>
      ))}
    </div>
  )
}
