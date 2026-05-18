'use client'
import { useMemo, useState } from 'react'
import { BadgeIndianRupee, ClipboardList, Clock, CreditCard, Filter, Layers } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { useStore } from '@/store/appStore'
import {
  ReportHero,
  ReportPage,
  ReportPanel,
  ReportStatCard,
  ReportTable,
  reportCellClass,
  reportRowClass,
  reportStrongCellClass,
} from '@/components/reports/ReportUI'

export default function LoanPortfolioPage() {
  const { loans, customers, loanTypes, branches, emis } = useStore()
  const [filterBranch, setFilterBranch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() => loans.filter(l => {
    const c = customers.find(x => x.id === l.customerId)
    if (filterBranch && c?.branchId !== Number(filterBranch)) return false
    if (filterType && l.loanTypeId !== Number(filterType)) return false
    if (filterStatus && l.status !== filterStatus) return false
    return true
  }), [loans, customers, filterBranch, filterType, filterStatus])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const getOutstanding = (loanId: number) => {
    const loanEmis = emis.filter(e => e.loanId === loanId && e.status !== 'paid' && e.status !== 'paid_late')
    return loanEmis.reduce((s, e) => s + e.emiAmount, 0)
  }

  return (
    <ReportPage>
      <ReportHero
        title="Loan Portfolio Report"
        subtitle="Scan loan exposure by branch, type, status, amount, and outstanding EMI position."
        meta={`${filtered.length} visible loans`}
        icon={<ClipboardList size={22} />}
      />

      <ReportPanel className="p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#462C7D] dark:text-[#D552A3]">
          <Filter size={15} /> Portfolio Filters
        </div>
        <div className="flex flex-wrap gap-3">
          <Select label="Branch" placeholder="All Branches" options={branches.map(b => ({ value: b.id, label: b.name }))}
            value={filterBranch} onChange={e => setFilterBranch(e.target.value)} />
          <Select label="Loan Type" placeholder="All Types" options={loanTypes.map(t => ({ value: t.id, label: t.name }))}
            value={filterType} onChange={e => setFilterType(e.target.value)} />
          <Select label="Status" placeholder="All Status" options={['pending', 'approved', 'disbursed'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)} />
        </div>
      </ReportPanel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReportStatCard label="Total Loans" value={filtered.length} tone="primary" icon={<CreditCard size={18} />} />
        <ReportStatCard label="Total Amount" value={fmt(filtered.reduce((s, l) => s + l.amount, 0))} tone="green" icon={<BadgeIndianRupee size={18} />} />
        <ReportStatCard label="Active Disbursed" value={filtered.filter(l => l.status === 'disbursed').length} tone="pink" icon={<Layers size={18} />} />
        <ReportStatCard label="Pending Approval" value={filtered.filter(l => l.status === 'pending').length} tone="blue" icon={<Clock size={18} />} />
      </div>

      <ReportPanel title="Portfolio Ledger" subtitle="Filtered loan list with amount, outstanding balance, installments, and status.">
        <ReportTable headers={['Loan No', 'Customer', 'Type', 'Amount', 'Outstanding', 'Installments', 'Status']}>
          {filtered.map((l, i) => {
            const c = customers.find(x => x.id === l.customerId)
            const lt = loanTypes.find(x => x.id === l.loanTypeId)
            const outstanding = getOutstanding(l.id)
            return (
              <tr key={l.id} className={`${reportRowClass} ${i % 2 === 1 ? 'bg-[#FFF5F8]/35 dark:bg-[#100B18]/30' : ''}`}>
                <td className="px-4 py-3 font-bold text-[#462C7D] dark:text-[#D552A3]">{l.loanNo}</td>
                <td className={reportStrongCellClass}>{c?.name ?? '-'}</td>
                <td className={reportCellClass}>{lt?.name ?? '-'}</td>
                <td className={reportStrongCellClass}>{fmt(l.amount)}</td>
                <td className="px-4 py-3 font-bold text-[#831C91] dark:text-[#D552A3]">{outstanding > 0 ? fmt(outstanding) : '-'}</td>
                <td className={reportCellClass}>{l.installments}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${l.status === 'disbursed' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : l.status === 'approved' ? 'bg-[#462C7D]/10 text-[#462C7D] dark:text-[#FFF5F8]' : 'bg-[#D552A3]/12 text-[#831C91] dark:text-[#D552A3]'}`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            )
          })}
        </ReportTable>
      </ReportPanel>
    </ReportPage>
  )
}
