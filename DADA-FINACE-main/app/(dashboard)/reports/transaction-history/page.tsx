'use client'
import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowDownUp, CalendarRange, ReceiptText, Wallet } from 'lucide-react'
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

export default function TransactionHistoryPage() {
  const { emis, loans, customers, employees } = useStore()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const collected = useMemo(() => {
    return emis.filter(e => (e.status === 'paid' || e.status === 'paid_late') && e.paidDate)
      .filter(e => {
        if (from && e.paidDate! < from) return false
        if (to && e.paidDate! > to) return false
        return true
      })
      .sort((a, b) => (b.paidDate ?? '').localeCompare(a.paidDate ?? ''))
  }, [emis, from, to])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const total = collected.reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const late = collected.filter(e => e.status === 'paid_late').length

  return (
    <ReportPage>
      <ReportHero
        title="Transaction History"
        subtitle="Audit paid EMI transactions across a custom date range with collector and payment-mode context."
        meta={from || to ? `${from || 'Start'} to ${to || 'Today'}` : 'All transactions'}
        icon={<ReceiptText size={22} />}
      />

      <ReportPanel className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Input label="From Date" type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <Input label="To Date" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </ReportPanel>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportStatCard label="Transactions" value={collected.length} tone="primary" icon={<ArrowDownUp size={18} />} />
        <ReportStatCard label="Total Collected" value={fmt(total)} tone="green" icon={<Wallet size={18} />} />
        <ReportStatCard label="Late Payments" value={late} tone="pink" icon={<CalendarRange size={18} />} />
      </div>

      <ReportPanel title="Transaction Ledger" subtitle="Chronological payment records for the selected range.">
        {collected.length === 0 ? (
          <ReportEmpty>No transactions found for selected range</ReportEmpty>
        ) : (
          <ReportTable headers={['Date', 'Loan No', 'Customer', 'EMI #', 'Amount', 'Mode', 'Collected By', 'Status']}>
            {collected.map((e, i) => {
              const loan = loans.find(l => l.id === e.loanId)
              const customer = loan ? customers.find(c => c.id === loan.customerId) : null
              const emp = employees.find(x => x.id === e.collectedBy)
              return (
                <tr key={e.id} className={`${reportRowClass} ${i % 2 === 1 ? 'bg-[#FFF5F8]/35 dark:bg-[#100B18]/30' : ''}`}>
                  <td className={reportCellClass}>{e.paidDate ? format(parseISO(e.paidDate), 'dd/MM/yyyy') : '-'}</td>
                  <td className="px-4 py-3 font-bold text-[#462C7D] dark:text-[#D552A3]">{loan?.loanNo ?? '-'}</td>
                  <td className={reportStrongCellClass}>{customer?.name ?? '-'}</td>
                  <td className={reportCellClass}>{e.instNo}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-300">{fmt(e.paidAmount ?? 0)}</td>
                  <td className={reportCellClass}>{e.paymentMode ?? '-'}</td>
                  <td className={reportCellClass}>{emp?.name ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${e.status === 'paid' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-[#D552A3]/12 text-[#831C91] dark:text-[#D552A3]'}`}>
                      {e.status === 'paid' ? 'On Time' : 'Late'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </ReportTable>
        )}
      </ReportPanel>
    </ReportPage>
  )
}
