import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const variantStyles = {
  default: 'bg-brand text-brand-foreground hover:bg-brand/90',
  secondary: 'bg-surface-active text-text-primary hover:bg-surface-active/80',
  outline: 'border border-border bg-transparent hover:bg-surface-active text-text-primary',
  ghost: 'hover:bg-surface-active hover:text-text-primary text-text-secondary',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeStyles = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-xl px-3 text-xs',
  lg: 'h-11 rounded-xl px-8',
  icon: 'h-10 w-10',
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  disabled,
  asChild,
  children,
  ...props
}: ButtonProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
        (children as React.ReactElement<any>).props.className
      ),
    })
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
