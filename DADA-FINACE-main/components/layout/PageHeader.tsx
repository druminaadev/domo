'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import React from 'react'

interface PageHeaderProps {
  title: string
  action?: { label: string; onClick: () => void; icon?: React.ReactNode }
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Dashboard', master: 'Master', states: 'States', cities: 'Cities',
  areas: 'Areas', branches: 'Branches', 'loan-types': 'Loan Types', banks: 'Banks',
  employees: 'Employees', add: 'Add', list: 'List', customers: 'Customers',
  details: 'Details', loans: 'Loans', approval: 'Approval',
  approved: 'Approved', disbursed: 'Disbursed',
}

export function PageHeader({ title, action }: PageHeaderProps) {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean)
  const crumbs = [
    { label: 'Dashboard', path: '/' },
    ...parts.map((p, i) => ({ label: ROUTE_LABELS[p] ?? p, path: '/' + parts.slice(0, i + 1).join('/') }))
  ]

  return (
    <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{title}</h1>
        <nav className="flex items-center gap-1 mt-2">
          {crumbs.map((c, i) => (
            <span key={c.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} className="text-gray-400 dark:text-gray-600" />}
              {i === crumbs.length - 1
                ? <span className="text-xs font-medium text-[#FF6D3D]">{c.label}</span>
                : <Link href={c.path} className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#FF6D3D] transition-colors">{c.label}</Link>}
            </span>
          ))}
        </nav>
      </div>
      {action && <Button onClick={action.onClick} size="sm">{action.icon}{action.label}</Button>}
    </div>
  )
}
