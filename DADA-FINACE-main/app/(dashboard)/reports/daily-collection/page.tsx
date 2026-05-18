'use client'
import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Banknote, CalendarDays, Landmark, Smartphone, Wallet } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { useStore } from '@/store/appStore'
import {
  ReportEmpty,
  ReportHero,
  ReportPage,
  ReportPanel,
  ReportStatCard,
  ReportTable,
  reportCellClass,
  reportRowClass,
  reportStrongCellClass,
} from '@/components/reports/ReportUI'

export default function DailyCollectionPage() {
  const { emis, loans, customers, employees, branches } = useStore()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const collected = useMemo(() => emis.filter(e => e.paidDate === date), [emis, date])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const total = collected.reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const byCash = collected.filter(e => e.paymentMode === 'Cash').reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const byUPI = collected.filter(e => e.paymentMode === 'UPI').reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const byBank = collected.filter(e => e.paymentMode === 'Bank Transfer').reduce((s, e) => s + (e.paidAmount ?? 0), 0)

  const branchTotals = useMemo(() => {
    const map: Record<number, number> = {}
    collected.forEach(e => {
      const loan = loans.find(l => l.id === e.loanId)
      const customer = loan ? customers.find(c => c.id === loan.customerId) : null
      if (customer) map[customer.branchId] = (map[customer.branchId] ?? 0) + (e.paidAmount ?? 0)
    })
    return map
  }, [collected, loans, customers])

  return (
    <ReportPage>
      <ReportHero
        title="Daily Collection Report"
        subtitle="Review every EMI collected for the selected business day, split by payment mode and branch."
        meta={format(parseISO(date), 'dd MMM yyyy')}
        icon={<CalendarDays size={22} />}
      />

      <ReportPanel className="max-w-xs p-4">
        <Input label="Select Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
      </ReportPanel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReportStatCard label="Total Collected" value={fmt(total)} tone="green" icon={<Wallet size={18} />} />
        <ReportStatCard label="Cash" value={fmt(byCash)} tone="primary" icon={<Banknote size={18} />} />
        <ReportStatCard label="UPI" value={fmt(byUPI)} tone="pink" icon={<Smartphone size={18} />} />
        <ReportStatCard label="Bank Transfer" value={fmt(byBank)} tone="blue" icon={<Landmark size={18} />} />
      </div>

      {branches.length > 0 && (
        <ReportPanel title="Branch-wise Breakdown" subtitle="Collections mapped from borrowers to their branch.">
          <div className="flex flex-wrap gap-3 p-4">
            {branches.map(b => (
              <div key={b.id} className="rounded-xl border border-[#D552A3]/20 bg-[#FFF5F8]/70 px-4 py-3 dark:border-[var(--border)] dark:bg-[#100B18]/45">
                <div className="text-xs font-semibold text-[#64748B] dark:text-[var(--text-secondary)]">{b.name}</div>
                <div className="mt-1 text-sm font-black text-[#462C7D] dark:text-[#D552A3]">{fmt(branchTotals[b.id] ?? 0)}</div>
              </div>
            ))}
          </div>
        </ReportPanel>
      )}

      <ReportPanel title={`Collection Details (${collected.length} entries)`} subtitle="Loan, customer, EMI, payment mode, and collector details.">
        {collected.length === 0 ? (
          <ReportEmpty>No collections on {format(parseISO(date), 'dd MMM yyyy')}</ReportEmpty>
        ) : (
          <ReportTable headers={['Loan No', 'Customer', 'EMI #', 'Amount', 'Mode', 'Collected By']}>
            {collected.map((e, i) => {
              const loan = loans.find(l => l.id === e.loanId)
              const customer = loan ? customers.find(c => c.id === loan.customerId) : null
              const emp = employees.find(x => x.id === e.collectedBy)
              return (
                <tr key={e.id} className={`${reportRowClass} ${i % 2 === 1 ? 'bg-[#FFF5F8]/35 dark:bg-[#100B18]/30' : ''}`}>
                  <td className="px-4 py-3 font-bold text-[#462C7D] dark:text-[#D552A3]">{loan?.loanNo ?? '-'}</td>
                  <td className={reportStrongCellClass}>{customer?.name ?? '-'}</td>
                  <td className={reportCellClass}>{e.instNo}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-300">{fmt(e.paidAmount ?? 0)}</td>
                  <td className={reportCellClass}>{e.paymentMode}</td>
                  <td className={reportCellClass}>{emp?.name ?? '-'}</td>
                </tr>
              )
            })}
          </ReportTable>
        )}
      </ReportPanel>
    </ReportPage>
  )
}
