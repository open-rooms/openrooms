import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'shimmer'
}

export function Skeleton({ className, variant = 'shimmer' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white/5 rounded-lg animate-pulse',
        variant === 'shimmer' && 'shimmer',
        className
      )}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="border border-white/10 rounded-xl p-6 space-y-4 animate-slide-in">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

export function MetricSkeleton() {
  return (
    <div className="border border-white/10 rounded-xl p-6 space-y-4 animate-slide-in">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-3 w-full" />
    </div>
  )
}
