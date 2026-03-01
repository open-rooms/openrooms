import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const variantStyles = {
  default: 'bg-[#F54E00] text-white hover:bg-[#E24600] active:bg-[#D03D00]',
  secondary: 'bg-surface-active text-text-primary hover:bg-[#F1EBE6]',
  outline: 'border border-[#DED8D2] bg-transparent hover:bg-[#FBF7F2] text-text-primary',
  ghost: 'hover:bg-[#FBF7F2] hover:text-text-primary text-text-secondary',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
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
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-120 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F54E00] focus-visible:ring-offset-2',
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
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-120 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F54E00] focus-visible:ring-offset-2',
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
