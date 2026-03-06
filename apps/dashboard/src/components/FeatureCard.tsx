'use client'

import Link from 'next/link'

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href?: string
  accent?: string
}

export function FeatureCard({ icon: Icon, title, description, href, accent = '#F54E00' }: FeatureCardProps) {
  const inner = (
    <div className="group relative bg-[#F5F1E8] border-2 border-[#D4C4A8] rounded-2xl p-6 flex flex-col items-center text-center
                    hover:border-[#F54E00] hover:-translate-y-1.5 hover:shadow-[4px_4px_0px_0px_rgba(245,78,0,0.3)]
                    transition-all duration-200 cursor-pointer overflow-hidden h-full">
      {/* Icon */}
      <div className="mb-4 transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-1">
        <Icon className="w-16 h-16" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-[#111111] mb-2 leading-tight">{title}</h3>

      {/* Description — slides in on hover */}
      <p className="text-xs text-gray-500 leading-relaxed
                    max-h-0 overflow-hidden opacity-0
                    group-hover:max-h-20 group-hover:opacity-100
                    transition-all duration-300 ease-out">
        {description}
      </p>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F54E00] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
    </div>
  )

  if (href) {
    return <Link href={href} className="block h-full">{inner}</Link>
  }
  return inner
}

interface FeatureGridProps {
  features: FeatureCardProps[]
}

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5">
      {features.map((feature, i) => (
        <div
          key={feature.title}
          className="animate-slide-up"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <FeatureCard {...feature} />
        </div>
      ))}
    </div>
  )
}
