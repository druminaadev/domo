'use client'
import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format, parseISO, startOfMonth } from 'date-fns'
import { BadgeIndianRupee, LineChart, ReceiptText, TrendingUp } from 'lucide-react'
import { useStore } from '@/store/appStore'
import { ReportHero, ReportPage, ReportPanel, ReportStatCard } from '@/components/reports/ReportUI'

export default function BusinessTrendPage() {
  const { loans, emis } = useStore()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; disbursed: number; collected: number; interest: number; fileCharges: number }> = {}
    loans.forEach(l => {
      const key = format(startOfMonth(parseISO(l.loanDate)), 'MMM yy')
      if (!map[key]) map[key] = { month: key, disbursed: 0, collected: 0, interest: 0, fileCharges: 0 }
      map[key].disbursed += l.amount
      map[key].interest += l.interestAmount
      map[key].fileCharges += l.fileCharges + l.otherCharges
    })
    emis.filter(e => e.paidDate).forEach(e => {
      const key = format(startOfMonth(parseISO(e.paidDate!)), 'MMM yy')
      if (!map[key]) map[key] = { month: key, disbursed: 0, collected: 0, interest: 0, fileCharges: 0 }
      map[key].collected += e.paidAmount ?? 0
    })
    return Object.values(map).slice(-12)
  }, [loans, emis])

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

  const totalInterest = loans.reduce((s, l) => s + l.interestAmount, 0)
  const totalCharges = loans.reduce((s, l) => s + l.fileCharges + l.otherCharges, 0)
  const totalCollected = emis.filter(e => e.status === 'paid' || e.status === 'paid_late').reduce((s, e) => s + (e.paidAmount ?? 0), 0)

  return (
    <ReportPage>
      <ReportHero
        title="Business Trend Report"
        subtitle="Track disbursement, EMI collection, interest income, and charges across recent months."
        meta={`${monthlyData.length} months`}
        icon={<TrendingUp size={22} />}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportStatCard label="Total Interest Income" value={fmt(totalInterest)} tone="green" icon={<LineChart size={18} />} />
        <ReportStatCard label="File/Other Charges" value={fmt(totalCharges)} tone="primary" icon={<BadgeIndianRupee size={18} />} />
        <ReportStatCard label="EMI Collected" value={fmt(totalCollected)} tone="pink" icon={<ReceiptText size={18} />} />
      </div>

      <ReportPanel title="Monthly Disbursement vs Collection" subtitle="Trend view using the product palette instead of generic chart colors.">
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="disbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D552A3" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="#D552A3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#462C7D" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#462C7D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'var(--border)' : '#F0E6ED'} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? 'var(--text-secondary)' : '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? 'var(--text-secondary)' : '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v, name) => [fmt(Number(v)), name]} />
              <Area type="monotone" dataKey="disbursed" name="Disbursed" stroke="#D552A3" strokeWidth={3} fill="url(#disbGrad)" />
              <Area type="monotone" dataKey="collected" name="Collected" stroke="#462C7D" strokeWidth={3} fill="url(#collGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ReportPanel>
    </ReportPage>
  )
}
