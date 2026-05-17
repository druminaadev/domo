'use client'
import React from 'react'
import { COLORS } from '@/lib/colors'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; required?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className = '', style, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-[#6B6B6B] dark:text-gray-300">
          {label}{required && <span style={{ color: COLORS.orange }} className="ml-0.5">*</span>}
        </label>
      )}
      <input ref={ref} {...props}
        className={`h-11 px-4 text-sm rounded-xl outline-none transition-all bg-white dark:bg-[var(--form-field)] text-[#2C2C2C] dark:text-[var(--text-primary)] ${className}`}
        style={{
          border: `1.5px solid ${error ? COLORS.orange : 'var(--border)'}`,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          ...style,
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = COLORS.orange
          e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.orangeTint}`
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = error ? COLORS.orange : 'var(--border)'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)'
        }}
      />
      {error && <p className="text-xs" style={{ color: COLORS.orange }}>{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
