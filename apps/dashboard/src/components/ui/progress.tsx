'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden">
      <div className="h-full bg-gradient-to-r from-[#FF9999] via-[#FFCCCC] to-[#FF9999] animate-shimmer shadow-[0_0_10px_rgba(255,153,153,0.6)]" 
           style={{ width: '50%' }} 
      />
    </div>
  )
}

interface ProgressProps {
  value: number
  max?: number
  color?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Progress({ 
  value, 
  max = 100, 
  color = '#FF9999', 
  showLabel = false, 
  size = 'md',
  className 
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('relative w-full bg-white/10 rounded-full overflow-hidden', heights[size])}>
        <div 
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(to right, ${color}, ${color}DD)`,
            boxShadow: `0 0 10px ${color}80`
          }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-gray-500 font-bold">
          {value} / {max} ({percentage.toFixed(0)}%)
        </div>
      )}
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}

export function CircularProgress({ 
  value, 
  max = 100, 
  size = 80, 
  strokeWidth = 8,
  color = '#FF9999',
  className 
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black text-white">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  )
}
