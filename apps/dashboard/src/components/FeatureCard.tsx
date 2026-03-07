'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href?: string
  variant?: 'cream' | 'light'
}

export function FeatureCard({ icon: Icon, title, description, href, variant = 'cream' }: FeatureCardProps) {
  const base = variant === 'light'
    ? 'bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg'
    : 'bg-[#F5F1E8] border border-[#D4C4A8] hover:border-[#F54E00] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]'

  const accentLine = variant === 'light' ? 'bg-gray-900' : 'bg-[#F54E00]'

  const inner = (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group relative ${base} rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer overflow-hidden h-full transition-colors duration-200`}
    >
      {/* Icon */}
      <motion.div
        className="mb-3 flex-shrink-0"
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Icon className="w-14 h-14" />
      </motion.div>

      {/* Title — always visible */}
      <h3 className="text-sm font-black text-[#111111] mb-1.5 leading-tight">{title}</h3>

      {/* Description — always visible */}
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accentLine} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </motion.div>
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

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export function FeatureGrid({ features, variant = 'cream' }: FeatureGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5"
    >
      {features.map((feature) => (
        <motion.div key={feature.title} variants={cardVariants} className="h-full">
          <FeatureCard {...feature} variant={variant} />
        </motion.div>
      ))}
    </motion.div>
  )
}
