import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow'
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const isActive = props['data-state'] === 'active'
  
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200 ease-out',
        isActive
          ? 'bg-accent-soft border-accent/20 shadow-md'
          : 'bg-surface border-border',
        variant === 'glass' && 'bg-surface/50 backdrop-blur-sm',
        variant === 'glow' && 'shadow-sm hover:shadow-md',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const isActive = props['data-state'] === 'active'
  
  return (
    <div 
      className={cn(
        'flex flex-col space-y-1.5 transition-all duration-200 ease-out',
        isActive
          ? 'h-16 p-6 bg-accent text-accent-foreground rounded-t-xl'
          : 'p-6',
        className
      )} 
      {...props} 
    />
  )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm opacity-90', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}
