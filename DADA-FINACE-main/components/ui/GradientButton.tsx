'use client'
import React from 'react'

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function GradientButton({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  children, 
  className = '', 
  disabled, 
  ...props 
}: GradientButtonProps) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }

  const baseStyle = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

  if (variant === 'outline') {
    return (
      <button
        {...props}
        disabled={disabled || loading}
        className={`${baseStyle} ${sizes[size]} bg-white dark:bg-[#2C2C2C] text-[#FFA726] border-2 border-[#FFA726] hover:bg-gradient-to-r hover:from-[#FFA726] hover:to-[#FFB74D] hover:text-white hover:border-transparent hover:scale-105 hover:shadow-lg hover:shadow-orange-400/30 ${className}`}
      >
        {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {children}
      </button>
    )
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseStyle} ${sizes[size]} bg-gradient-to-r from-[#FFA726] to-[#FFB74D] text-white hover:from-[#FF9800] hover:to-[#FFA726] hover:scale-105 shadow-lg shadow-orange-400/30 hover:shadow-xl hover:shadow-orange-400/40 ${className}`}
    >
      {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}
