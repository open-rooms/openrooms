'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sparkline } from '@/components/charts'

interface StatCardProps {
  title: string
  value: number | string
  change?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  icon?: React.ReactNode
  color?: 'coral' | 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  sparklineData?: number[]
  suffix?: string
  className?: string
}

const colorMap = {
  coral: {
    gradient: 'from-[#FF9999] to-[#FFCCCC]',
    bg: 'bg-[#FF9999]/10',
    text: 'text-[#FF9999]',
    sparkline: '#FF9999',
    shadow: 'shadow-[0_0_20px_rgba(255,153,153,0.3)]',
  },
  blue: {
    gradient: 'from-blue-400 to-cyan-400',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    sparkline: '#3b82f6',
    shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  },
  green: {
    gradient: 'from-green-400 to-emerald-400',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    sparkline: '#22c55e',
    shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
  },
  yellow: {
    gradient: 'from-yellow-400 to-orange-400',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    sparkline: '#eab308',
    shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
  },
  red: {
    gradient: 'from-red-400 to-rose-400',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    sparkline: '#ef4444',
    shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  },
  gray: {
    gradient: 'from-gray-400 to-gray-500',
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    sparkline: '#9ca3af',
    shadow: 'shadow-[0_0_20px_rgba(156,163,175,0.3)]',
  },
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'coral', 
  sparklineData,
  suffix = '',
  className 
}: StatCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const colors = colorMap[color]

  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0
      const end = value
      const duration = 1000
      const increment = end / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setAnimatedValue(end)
          clearInterval(timer)
        } else {
          setAnimatedValue(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [value])

  const displayValue = typeof value === 'number' ? animatedValue : value

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-[#E7E2DC] bg-white hover:shadow-md p-6 transition-shadow duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-2">{title}</p>
          <h3 className={cn('text-3xl font-semibold tracking-tight bg-gradient-to-r bg-clip-text text-transparent', colors.gradient)}>
            {displayValue}{suffix}
          </h3>
        </div>
        {icon && (
          <div className={colors.text}>
            {icon}
          </div>
        )}
      </div>

      {change && (
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            'flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg',
            change.direction === 'up' ? 'bg-green-500/10 text-green-400' :
            change.direction === 'down' ? 'bg-red-500/10 text-red-400' :
            'bg-gray-500/10 text-gray-400'
          )}>
            {change.direction === 'up' && '↗'}
            {change.direction === 'down' && '↘'}
            {change.direction === 'neutral' && '→'}
            <span>{change.value}%</span>
          </div>
          {change.label && (
            <span className="text-xs text-gray-500 font-medium">{change.label}</span>
          )}
        </div>
      )}

      {sparklineData && (
        <div className="mt-4">
          <Sparkline value={typeof value === 'number' ? value : 0} max={Math.max(...sparklineData, 10)} color={colors.sparkline} />
        </div>
      )}
    </div>
  )
}
