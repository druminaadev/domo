'use client'
import React from 'react'
import { COLORS } from '@/lib/colors'

type Variant = 'primary' | 'success' | 'danger' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary: `bg-gradient-to-r from-[${COLORS.orange}] to-[${COLORS.orangeLight}] hover:from-[${COLORS.orangeDark}] hover:to-[${COLORS.orange}] text-white border-0 shadow-lg hover:shadow-xl hover:scale-105`,
  success: 'bg-gradient-to-r from-[#1A1A1A] to-[#2C2C2C] hover:from-[#2C2C2C] hover:to-[#3C3C3C] text-white border-0 shadow-lg hover:scale-105',
  danger:  'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/30 hover:scale-105',
  outline: `bg-white dark:bg-transparent hover:bg-gradient-to-r hover:from-[${COLORS.orange}] hover:to-[${COLORS.orangeLight}] text-[${COLORS.orange}] hover:text-white border-2 border-[${COLORS.orange}] hover:border-transparent transition-all duration-300`,
  ghost:   'bg-transparent hover:bg-gradient-to-r hover:from-[#F4F4F4] hover:to-[#EEEEEE] dark:hover:from-[#2C2C2C] dark:hover:to-[#3C3C3C] text-[#1A1A1A] dark:text-white border border-transparent hover:scale-105',
}
const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      style={{
        boxShadow: variant === 'primary' ? `0 4px 14px ${COLORS.orangeShadowLight}` : undefined,
      }}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}
