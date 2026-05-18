'use client'
import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { AlertTriangle, BadgeIndianRupee, CalendarClock, UsersRound } from 'lucide-react'
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

export default function OutstandingDuesPage() {
  const { emis, loans, customers } = useStore()
  const today = new Date().toISOString().split('T')[0]

  const overdueEmis = useMemo(() => emis.filter(e => e.status === 'overdue'), [emis])

  const grouped = useMemo(() => {
    const map: Record<number, { customer: typeof customers[0] | undefined; loan: typeof loans[0] | undefined; emis: typeof overdueEmis; totalOverdue: number; daysOverdue: number }> = {}
    overdueEmis.forEach(e => {
      const loan = loans.find(l => l.id === e.loanId)
      if (!loan) return
      if (!map[loan.customerId]) {
        map[loan.customerId] = { customer: customers.find(c => c.id === loan.customerId), loan, emis: [], totalOverdue: 0, daysOverdue: 0 }
      }
      map[loan.customerId].emis.push(e)
      map[loan.customerId].totalOverdue += e.emiAmount
      const days = Math.floor((new Date(today).getTime() - new Date(e.dueDate).getTime()) / 86400000)
      map[loan.customerId].daysOverdue = Math.max(map[loan.customerId].daysOverdue, days)
    })
    return Object.values(map)
  }, [overdueEmis, loans, customers, today])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <ReportPage>
      <ReportHero
        title="Outstanding Dues Report"
        subtitle="Prioritize overdue customers by unpaid EMI count, amount at risk, and oldest due date."
        meta={`${grouped.length} overdue accounts`}
        icon={<AlertTriangle size={22} />}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportStatCard label="Overdue Accounts" value={grouped.length} tone="red" icon={<UsersRound size={18} />} />
        <ReportStatCard label="Total Overdue EMIs" value={overdueEmis.length} tone="pink" icon={<CalendarClock size={18} />} />
        <ReportStatCard label="Total Overdue Amount" value={fmt(grouped.reduce((s, g) => s + g.totalOverdue, 0))} tone="red" icon={<BadgeIndianRupee size={18} />} />
      </div>

      <ReportPanel title="Overdue Accounts" subtitle="Sorted by maximum days overdue for collection follow-up.">
        {grouped.length === 0 ? (
          <ReportEmpty>No overdue accounts found</ReportEmpty>
        ) : (
          <ReportTable headers={['Customer', 'Mobile', 'Loan No', 'Overdue EMIs', 'Overdue Amount', 'Days Overdue', 'Oldest Due Date']}>
            {grouped.sort((a, b) => b.daysOverdue - a.daysOverdue).map((g, i) => (
              <tr key={i} className={`${reportRowClass} ${i % 2 === 1 ? 'bg-[#FFF5F8]/35 dark:bg-[#100B18]/30' : ''}`}>
                <td className={reportStrongCellClass}>{g.customer?.name ?? '-'}</td>
                <td className={reportCellClass}>{g.customer?.mobile ?? '-'}</td>
                <td className="px-4 py-3 font-bold text-[#462C7D] dark:text-[#D552A3]">{g.loan?.loanNo ?? '-'}</td>
                <td className="px-4 py-3 text-center font-bold text-[#831C91] dark:text-[#D552A3]">{g.emis.length}</td>
                <td className="px-4 py-3 font-bold text-red-600 dark:text-red-300">{fmt(g.totalOverdue)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${g.daysOverdue > 30 ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-[#D552A3]/12 text-[#831C91] dark:text-[#D552A3]'}`}>
                    {g.daysOverdue} days
                  </span>
                </td>
                <td className={reportCellClass}>
                  {format(parseISO(g.emis.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0].dueDate), 'dd/MM/yyyy')}
                </td>
              </tr>
            ))}
          </ReportTable>
        )}
      </ReportPanel>
    </ReportPage>
  )
}
