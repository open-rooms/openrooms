'use client'

import { TrendUpIcon, TrendDownIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface MetricTrendProps {
  value: number
  previousValue: number
  label: string
  suffix?: string
  inverse?: boolean
  className?: string
}

export function MetricTrend({ 
  value, 
  previousValue, 
  label,
  suffix = '%',
  inverse = false,
  className 
}: MetricTrendProps) {
  const change = previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0
  const isPositive = change > 0
  const isGood = inverse ? !isPositive : isPositive
  
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className={cn(
        'flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-xs tracking-wide',
        isGood 
          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
          : change < 0
          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
      )}>
        {isPositive ? (
          <TrendUpIcon className="w-3 h-3" />
        ) : change < 0 ? (
          <TrendDownIcon className="w-3 h-3" />
        ) : (
          <span className="w-3 h-px bg-current" />
        )}
        <span>{Math.abs(change).toFixed(1)}{suffix}</span>
      </div>
      <span className="text-xs text-gray-500 font-bold">{label}</span>
    </div>
  )
}

interface CompactMetricProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: 'coral' | 'blue' | 'green' | 'yellow' | 'gray'
  className?: string
}

export function CompactMetric({ label, value, icon, color = 'coral', className }: CompactMetricProps) {
  const colorMap = {
    coral: 'text-[#FF9999]',
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    gray: 'text-gray-400',
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {icon && (
        <div className={colorMap[color]}>
          {icon}
        </div>
      )}
      <div>
        <div className="text-xs text-gray-500 font-bold tracking-wider uppercase">{label}</div>
        <div className={cn('text-lg font-black tracking-tight', colorMap[color])}>
          {value}
        </div>
      </div>
    </div>
  )
}
