'use client'
import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Building2, CreditCard, Landmark, ReceiptText, Siren } from 'lucide-react'
import { useStore } from '@/store/appStore'
import { ReportHero, ReportPage, ReportPanel, ReportStatCard } from '@/components/reports/ReportUI'

export default function BranchPerformancePage() {
  const { branches, loans, customers, emis } = useStore()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const data = useMemo(() => branches.map(b => {
    const branchCustomerIds = customers.filter(c => c.branchId === b.id).map(c => c.id)
    const branchLoans = loans.filter(l => branchCustomerIds.includes(l.customerId))
    const disbursed = branchLoans.filter(l => l.status === 'disbursed').reduce((s, l) => s + l.amount, 0)
    const branchLoanIds = branchLoans.map(l => l.id)
    const collected = emis.filter(e => branchLoanIds.includes(e.loanId) && (e.status === 'paid' || e.status === 'paid_late')).reduce((s, e) => s + (e.paidAmount ?? 0), 0)
    const overdue = emis.filter(e => branchLoanIds.includes(e.loanId) && e.status === 'overdue').length
    return { name: b.name.replace(' Branch', '').replace(' Main', ''), disbursed, collected, overdue, loans: branchLoans.length }
  }), [branches, loans, customers, emis])

  const tooltipStyle = {
    contentStyle: {
      background: isDark ? 'var(--card)' : '#FFFFFF',
      border: `1px solid ${isDark ? 'var(--border)' : '#F0E6ED'}`,
      borderRadius: '14px',
      color: isDark ? 'var(--text-primary)' : '#1A1A1A',
      fontSize: '12px',
    },
    labelStyle: { color: isDark ? 'var(--text-secondary)' : '#64748B', fontWeight: 700 },
  }

  return (
    <ReportPage>
      <ReportHero
        title="Branch Performance Report"
        subtitle="Compare branch-level disbursement, collection strength, loan count, and overdue exposure."
        meta={`${data.length} branches`}
        icon={<Building2 size={22} />}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.map(b => (
          <ReportPanel key={b.name} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-[#1A1A1A] dark:text-[#FFF5F8]">{b.name}</h2>
              <span className="rounded-full bg-[#D552A3]/12 px-2 py-0.5 text-xs font-bold text-[#831C91] dark:text-[#D552A3]">{b.loans} loans</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-[#64748B] dark:text-[var(--text-secondary)]">Disbursed</span><span className="font-bold text-emerald-600 dark:text-emerald-300">{fmt(b.disbursed)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#64748B] dark:text-[var(--text-secondary)]">Collected</span><span className="font-bold text-[#462C7D] dark:text-[#D552A3]">{fmt(b.collected)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#64748B] dark:text-[var(--text-secondary)]">Overdue EMIs</span><span className="font-bold text-red-600 dark:text-red-300">{b.overdue}</span></div>
            </div>
          </ReportPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <ReportStatCard label="Total Branch Loans" value={data.reduce((s, b) => s + b.loans, 0)} icon={<CreditCard size={18} />} />
        <ReportStatCard label="Disbursed" value={fmt(data.reduce((s, b) => s + b.disbursed, 0))} tone="green" icon={<Landmark size={18} />} />
        <ReportStatCard label="Collected" value={fmt(data.reduce((s, b) => s + b.collected, 0))} tone="pink" icon={<ReceiptText size={18} />} />
        <ReportStatCard label="Overdue EMIs" value={data.reduce((s, b) => s + b.overdue, 0)} tone="red" icon={<Siren size={18} />} />
      </div>

      <ReportPanel title="Disbursed vs Collected by Branch" subtitle="Theme-colored comparison of principal disbursed and EMI cash-in.">
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 6, right: 8, left: -10, bottom: 0 }} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'var(--border)' : '#F0E6ED'} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? 'var(--text-secondary)' : '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? 'var(--text-secondary)' : '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} cursor={{ fill: isDark ? 'rgba(213,82,163,0.08)' : 'rgba(213,82,163,0.10)' }} formatter={(v, name) => [fmt(Number(v)), name]} />
              <Legend wrapperStyle={{ fontSize: '12px', color: isDark ? '#D9C8E2' : '#64748B' }} />
              <Bar dataKey="disbursed" name="Disbursed" fill="#D552A3" radius={[10, 10, 3, 3]} />
              <Bar dataKey="collected" name="Collected" fill="#462C7D" radius={[10, 10, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportPanel>
    </ReportPage>
  )
}
