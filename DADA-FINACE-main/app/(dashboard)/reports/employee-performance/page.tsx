'use client'
import { useMemo } from 'react'
import { BadgeIndianRupee, ReceiptText, UserCheck, UsersRound } from 'lucide-react'
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

export default function EmployeePerformancePage() {
  const { employees, loans, customers, emis } = useStore()

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const data = useMemo(() => employees.map(emp => {
    const empLoans = loans.filter(l => l.employeeId === emp.id)
    const disbursed = empLoans.filter(l => l.status === 'disbursed')
    const totalDisbursed = disbursed.reduce((s, l) => s + l.amount, 0)
    const empLoanIds = empLoans.map(l => l.id)
    const collected = emis.filter(e => empLoanIds.includes(e.loanId) && (e.status === 'paid' || e.status === 'paid_late')).reduce((s, e) => s + (e.paidAmount ?? 0), 0)
    const overdueCount = emis.filter(e => empLoanIds.includes(e.loanId) && e.status === 'overdue').length
    const customersAdded = customers.filter(c => c.employeeId === emp.id).length
    return { emp, loans: empLoans.length, disbursedCount: disbursed.length, totalDisbursed, collected, overdueCount, customersAdded }
  }), [employees, loans, customers, emis])

  const totalDisbursed = data.reduce((s, d) => s + d.totalDisbursed, 0)
  const totalCollected = data.reduce((s, d) => s + d.collected, 0)
  const totalCustomers = data.reduce((s, d) => s + d.customersAdded, 0)

  return (
    <ReportPage>
      <ReportHero
        title="Employee Performance Report"
        subtitle="Measure employee output across customer acquisition, loan volume, disbursement, collection, and overdue handling."
        meta={`${employees.length} employees`}
        icon={<UserCheck size={22} />}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportStatCard label="Customers Added" value={totalCustomers} tone="primary" icon={<UsersRound size={18} />} />
        <ReportStatCard label="Total Disbursed" value={fmt(totalDisbursed)} tone="green" icon={<BadgeIndianRupee size={18} />} />
        <ReportStatCard label="EMI Collected" value={fmt(totalCollected)} tone="pink" icon={<ReceiptText size={18} />} />
      </div>

      <ReportPanel title="Employee Scorecard" subtitle="Operational performance by employee and role.">
        <ReportTable headers={['Employee', 'Role', 'Customers Added', 'Total Loans', 'Disbursed', 'Total Disbursed', 'EMI Collected', 'Overdue EMIs']}>
          {data.map((d, i) => (
            <tr key={d.emp.id} className={`${reportRowClass} ${i % 2 === 1 ? 'bg-[#FFF5F8]/35 dark:bg-[#100B18]/30' : ''}`}>
              <td className="px-4 py-3">
                <div className="font-bold text-[#1A1A1A] dark:text-[#FFF5F8]">{d.emp.name}</div>
                <div className="text-xs font-semibold text-[#831C91] dark:text-[#D552A3]">{d.emp.code}</div>
              </td>
              <td className={reportCellClass}>{d.emp.role}</td>
              <td className="px-4 py-3 text-center font-bold text-[#831C91] dark:text-[#D552A3]">{d.customersAdded}</td>
              <td className={`${reportCellClass} text-center`}>{d.loans}</td>
              <td className="px-4 py-3 text-center font-bold text-emerald-600 dark:text-emerald-300">{d.disbursedCount}</td>
              <td className={reportStrongCellClass}>{fmt(d.totalDisbursed)}</td>
              <td className="px-4 py-3 font-bold text-[#462C7D] dark:text-[#D552A3]">{fmt(d.collected)}</td>
              <td className="px-4 py-3 text-center">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${d.overdueCount > 0 ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>
                  {d.overdueCount}
                </span>
              </td>
            </tr>
          ))}
        </ReportTable>
      </ReportPanel>
    </ReportPage>
  )
}
