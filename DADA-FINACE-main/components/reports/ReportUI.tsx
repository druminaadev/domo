'use client'

import React from 'react'
import { FileBarChart2 } from 'lucide-react'

type ReportPageProps = {
  children: React.ReactNode
}

type ReportHeroProps = {
  title: string
  subtitle: string
  meta?: string
  icon?: React.ReactNode
}

type ReportStatCardProps = {
  label: string
  value: React.ReactNode
  tone?: 'primary' | 'pink' | 'green' | 'red' | 'blue'
  icon?: React.ReactNode
}

type ReportPanelProps = {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

type ReportTableProps = {
  headers: string[]
  children: React.ReactNode
}

const toneClasses = {
  primary: 'text-[#462C7D] dark:text-[#D552A3]',
  pink: 'text-[#831C91] dark:text-[#D552A3]',
  green: 'text-emerald-600 dark:text-emerald-300',
  red: 'text-red-600 dark:text-red-300',
  blue: 'text-[#462C7D] dark:text-[#FFF5F8]',
}

export function ReportPage({ children }: ReportPageProps) {
  return <div className="space-y-5">{children}</div>
}

export function ReportHero({ title, subtitle, meta, icon }: ReportHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#D552A3]/25 bg-white p-5 shadow-[0_18px_45px_rgba(70,44,125,0.10)] dark:border-[var(--border)] dark:bg-[var(--card)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.30)] sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(213,82,163,0.16),transparent_32%),linear-gradient(135deg,#FFFFFF_0%,#FFF5F8_64%,#F5E6F0_100%)] dark:bg-[radial-gradient(circle_at_14%_18%,rgba(213,82,163,0.18),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(70,44,125,0.28),transparent_32%),linear-gradient(135deg,#241833_0%,#1B1326_58%,#100B18_100%)]" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#462C7D]/10 text-[#462C7D] dark:bg-[#D552A3]/15 dark:text-[#FFF5F8]">
            {icon ?? <FileBarChart2 size={22} />}
          </span>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-[#FFF5F8]">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748B] dark:text-[var(--text-secondary)]">{subtitle}</p>
          </div>
        </div>
        {meta && (
          <div className="w-fit rounded-full border border-[#D552A3]/30 bg-white/75 px-3 py-1.5 text-xs font-bold text-[#462C7D] shadow-sm backdrop-blur dark:bg-[#100B18]/55 dark:text-[#FFF5F8]">
            {meta}
          </div>
        )}
      </div>
    </section>
  )
}

export function ReportStatCard({ label, value, tone = 'primary', icon }: ReportStatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#D552A3]/20 bg-white p-4 shadow-[0_10px_28px_rgba(70,44,125,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(70,44,125,0.12)] dark:border-[var(--border)] dark:bg-[var(--card)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.24)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#462C7D] via-[#831C91] to-[#D552A3]" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-[var(--text-secondary)]">{label}</div>
          <div className={`mt-2 text-xl font-black ${toneClasses[tone]}`}>{value}</div>
        </div>
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF5F8] text-[#462C7D] dark:bg-[#D552A3]/12 dark:text-[#D552A3]">
            {icon}
          </span>
        )}
      </div>
    </div>
  )
}

export function ReportPanel({ children, title, subtitle, className = '' }: ReportPanelProps) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-[#D552A3]/20 bg-white shadow-[0_10px_28px_rgba(70,44,125,0.08)] dark:border-[var(--border)] dark:bg-[var(--card)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.24)] ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-[#D552A3]/15 px-5 py-4 dark:border-[var(--border)]">
          {title && <h2 className="text-sm font-black text-[#1A1A1A] dark:text-[#FFF5F8]">{title}</h2>}
          {subtitle && <p className="mt-1 text-xs text-[#64748B] dark:text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

export function ReportTable({ headers, children }: ReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#D552A3]/15 bg-[#FFF5F8] dark:border-[var(--border)] dark:bg-[#100B18]/55">
            {headers.map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-[#462C7D] dark:text-[#D552A3]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0E6ED] dark:divide-[var(--border)]">
          {children}
        </tbody>
      </table>
    </div>
  )
}

export function ReportEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-36 items-center justify-center px-5 py-10 text-center text-sm font-semibold text-[#64748B] dark:text-[var(--text-secondary)]">
      {children}
    </div>
  )
}

export const reportRowClass = 'transition-colors hover:bg-[#FFF5F8]/75 dark:hover:bg-[#D552A3]/8'
export const reportCellClass = 'px-4 py-3 text-[#393E46] dark:text-[var(--text-secondary)]'
export const reportStrongCellClass = 'px-4 py-3 font-bold text-[#1A1A1A] dark:text-[#FFF5F8]'
