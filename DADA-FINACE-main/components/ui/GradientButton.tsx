'use client'
import React from 'react'
import { COLORS } from '@/lib/colors'

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
        className={`${baseStyle} ${sizes[size]} bg-white dark:bg-[#2C2C2C] border-2 hover:text-white hover:border-transparent hover:scale-105 hover:shadow-lg ${className}`}
        style={{
          color: COLORS.orange,
          borderColor: COLORS.orange,
          boxShadow: `0 4px 14px ${COLORS.orangeShadowLight}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `linear-gradient(to right, ${COLORS.orange}, ${COLORS.orangeLight})`
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white'
          e.currentTarget.style.color = COLORS.orange
        }}
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
      className={`${baseStyle} ${sizes[size]} text-white hover:scale-105 ${className}`}
      style={{
        background: `linear-gradient(to right, ${COLORS.orange}, ${COLORS.orangeLight})`,
        boxShadow: `0 4px 14px ${COLORS.orangeShadow}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `linear-gradient(to right, ${COLORS.orangeDark}, ${COLORS.orange})`
        e.currentTarget.style.boxShadow = `0 6px 20px ${COLORS.orangeShadow}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `linear-gradient(to right, ${COLORS.orange}, ${COLORS.orangeLight})`
        e.currentTarget.style.boxShadow = `0 4px 14px ${COLORS.orangeShadow}`
      }}
    >
      {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}
