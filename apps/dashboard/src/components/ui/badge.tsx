import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'secondary' | 'coral'
}

const variantStyles = {
  default: 'bg-blue-50 border-blue-200 text-blue-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  error: 'bg-red-50 border-red-200 text-red-700',
  secondary: 'bg-gray-100 border-gray-200 text-gray-700',
  coral: 'bg-[#FF9999]/10 border-[#FF9999]/30 text-[#FF6666] animate-pulse-slow',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold transition-all duration-200 hover:scale-105',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export function StatusBadge({ 
  status,
  size = 'default',
  showDot = true,
}: { 
  status: string
  size?: 'sm' | 'default' | 'lg'
  showDot?: boolean
}) {
  const variant = {
    IDLE: 'secondary',
    RUNNING: 'coral',
    COMPLETED: 'success',
    FAILED: 'error',
    PAUSED: 'warning',
    CANCELLED: 'secondary',
  }[status] as BadgeProps['variant'] || 'secondary'

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  const dotColors: Record<string, string> = {
    RUNNING: 'bg-[#FF6666]',
    COMPLETED: 'bg-green-500',
    FAILED: 'bg-red-500',
    IDLE: 'bg-gray-400',
    PAUSED: 'bg-yellow-500',
    CANCELLED: 'bg-gray-400',
  }

  const dotColor = dotColors[status] || 'bg-gray-400'

  return (
    <Badge variant={variant} className={cn('tracking-wider', sizeClasses[size])}>
      <div className="flex items-center gap-1.5">
        {showDot && (
          <span className="relative flex h-2 w-2">
            {status === 'RUNNING' && (
              <span className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColor
              )} />
            )}
            <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColor)} />
          </span>
        )}
        <span className="font-black">{status}</span>
      </div>
    </Badge>
  )
}
