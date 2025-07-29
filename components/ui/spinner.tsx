import React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  className?: string
  text?: string
  showText?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const variantClasses = {
  default: 'border-gray-300 border-t-gray-600',
  primary: 'border-blue-200 border-t-blue-600',
  success: 'border-green-200 border-t-green-600',
  warning: 'border-yellow-200 border-t-yellow-600',
  error: 'border-red-200 border-t-red-600'
}

export function Spinner({ 
  size = 'md', 
  variant = 'default', 
  className,
  text,
  showText = false
}: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-solid',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {showText && text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )
}

// Button spinner for loading states
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <div className={cn('animate-spin rounded-full border-2 border-solid border-white border-t-transparent', sizeClasses[size])} />
  )
}

// Page loading spinner
export function PageSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 animate-pulse">{text}</p>
      </div>
    </div>
  )
}

// Card loading spinner
export function CardSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  )
}

// Inline spinner for small loading states
export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <div className={cn('inline-block animate-spin rounded-full border-2 border-solid border-gray-300 border-t-gray-600', sizeClasses[size])} />
  )
} 