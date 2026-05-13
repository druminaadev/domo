'use client'
import React from 'react'
interface CardProps { title?: string; children: React.ReactNode; className?: string }
export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`} style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)' }}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[#FFF5F2] dark:from-[#2C2C2C] to-white dark:to-[#1A1A1A]">
          <h3 className="text-sm font-bold flex items-center gap-2 text-[#1A1A1A] dark:text-white">
            <span className="w-1 h-5 bg-gradient-to-b from-[#FFA726] to-[#FFB74D] rounded-full shadow-lg shadow-orange-400/50"></span>
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
