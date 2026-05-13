'use client'
import { useRouter } from 'next/navigation'
import { CreditCard, Clock, CheckCircle, Banknote, Users, UserCircle, TrendingUp, Plus, ArrowUpRight, ArrowDownRight, DollarSign, Activity, Wallet } from 'lucide-react'
import { useStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { GradientButton } from '@/components/ui/GradientButton'
import { NeumorphicCard } from '@/components/ui/NeumorphicCard'
import { format, parseISO, startOfMonth } from 'date-fns'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts'

export default function Dashboard() {
  const { loans, customers, employees } = useStore()
  const router = useRouter()

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const totalDisbursed = loans.filter(l => l.status === 'disbursed').reduce((s, l) => s + l.amount, 0)
  const totalPending = loans.filter(l => l.status === 'pending').reduce((s, l) => s + l.amount, 0)
  const totalApproved = loans.filter(l => l.status === 'approved').reduce((s, l) => s + l.amount, 0)
  
  // Calculate growth percentages
  const thisMonthLoans = loans.filter(l => {
    const loanMonth = format(parseISO(l.loanDate), 'MMM yy')
    const currentMonth = format(new Date(), 'MMM yy')
    return loanMonth === currentMonth
  }).length
  
  const lastMonthLoans = loans.filter(l => {
    const loanDate = parseISO(l.loanDate)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    return format(loanDate, 'MMM yy') === format(lastMonth, 'MMM yy')
  }).length
  
  const loanGrowth = lastMonthLoans > 0 ? ((thisMonthLoans - lastMonthLoans) / lastMonthLoans * 100).toFixed(1) : '0'
  const isGrowthPositive = Number(loanGrowth) >= 0

  // ── Chart 1: Monthly loan count trend ──────────────────────
  const monthlyMap: Record<string, { month: string; loans: number; amount: number }> = {}
  loans.forEach(l => {
    const key = format(startOfMonth(parseISO(l.loanDate)), 'MMM yy')
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, loans: 0, amount: 0 }
    monthlyMap[key].loans++
    monthlyMap[key].amount += l.amount
  })
  const trendData = Object.values(monthlyMap).slice(-6)

  // ── Chart 2: Status donut ───────────────────────────────────
  const donutData = [
    { name: 'Pending',   value: loans.filter(l => l.status === 'pending').length,   color: '#F59E0B' },
    { name: 'Approved',  value: loans.filter(l => l.status === 'approved').length,  color: '#3B82F6' },
    { name: 'Disbursed', value: loans.filter(l => l.status === 'disbursed').length, color: '#10B981' },
  ].filter(d => d.value > 0)

  // ── Chart 3: Disbursed amount by month ─────────────────────
  const disbursedMap: Record<string, number> = {}
  loans.filter(l => l.status === 'disbursed').forEach(l => {
    const key = format(startOfMonth(parseISO(l.loanDate)), 'MMM yy')
    disbursedMap[key] = (disbursedMap[key] ?? 0) + l.amount
  })
  const barData = Object.entries(disbursedMap).map(([month, amount]) => ({ month, amount })).slice(-6)

  const recentLoans = [...loans].sort((a, b) => b.id - a.id).slice(0, 5)

  // Shared tooltip style
  const tooltipStyle = {
    contentStyle: {
      background: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: '12px',
      color: '#2C2C2C',
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    labelStyle: { color: '#6B6B6B', fontWeight: 600 },
  }

  return (
    <div className="space-y-5 min-h-screen p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Dashboard</h1>
          <p className="text-sm mt-1 text-[#6B6B6B] dark:text-gray-400">
            Welcome back! Here&apos;s your loan overview.
          </p>
        </div>
        <div className="flex gap-3">
          <GradientButton size="sm" variant="outline" onClick={() => router.push('/customers/add')}>
            <Plus size={16} /> Add Customer
          </GradientButton>
          <GradientButton size="sm" onClick={() => router.push('/loans/add')}>
            <Plus size={16} /> Add Loan
          </GradientButton>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Hero Card - Total Earnings (Spans 2 rows on large screens) */}
        <div 
          className="lg:col-span-4 lg:row-span-2 rounded-[20px] p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 glow-orange-strong"
          style={{ 
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)',
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
                <DollarSign size={24} style={{ color: '#FFFFFF' }} />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
                {isGrowthPositive ? <ArrowUpRight size={14} color="#FFFFFF" /> : <ArrowDownRight size={14} color="#FFFFFF" />}
                <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>{Math.abs(Number(loanGrowth))}%</span>
              </div>
            </div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Total Earnings</p>
            <h2 className="text-4xl font-bold mb-1" style={{ color: '#FFFFFF' }}>{formatINR(totalDisbursed)}</h2>
            <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>From {loans.filter(l => l.status === 'disbursed').length} disbursed loans</p>
            
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Pending</p>
                  <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{formatINR(totalPending)}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Approved</p>
                  <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{formatINR(totalApproved)}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Loans */}
          <NeumorphicCard className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300" glass>
            <div className="flex items-start gap-4 p-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                <CreditCard size={22} style={{ color: '#3B82F6' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-3 uppercase tracking-wide text-[#6B6B6B] dark:text-gray-400">Total Loans</p>
                <p className="text-3xl font-bold leading-none text-[#1A1A1A] dark:text-white">{loans.length}</p>
              </div>
            </div>
          </NeumorphicCard>

          {/* Pending */}
          <NeumorphicCard className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300" glass>
            <div className="flex items-start gap-4 p-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                <Clock size={22} style={{ color: '#F59E0B' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-3 uppercase tracking-wide text-[#6B6B6B] dark:text-gray-400">Pending</p>
                <p className="text-3xl font-bold leading-none text-[#1A1A1A] dark:text-white">{loans.filter(l => l.status === 'pending').length}</p>
              </div>
            </div>
          </NeumorphicCard>

          {/* Approved */}
          <NeumorphicCard className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300" glass>
            <div className="flex items-start gap-4 p-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(99, 102, 241, 0.12)' }}>
                <CheckCircle size={22} style={{ color: '#6366F1' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-3 uppercase tracking-wide text-[#6B6B6B] dark:text-gray-400">Approved</p>
                <p className="text-3xl font-bold leading-none text-[#1A1A1A] dark:text-white">{loans.filter(l => l.status === 'approved').length}</p>
              </div>
            </div>
          </NeumorphicCard>

          {/* Disbursed */}
          <NeumorphicCard className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300" glass>
            <div className="flex items-start gap-4 p-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                <Banknote size={22} style={{ color: '#10B981' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-3 uppercase tracking-wide text-[#6B6B6B] dark:text-gray-400">Disbursed</p>
                <p className="text-3xl font-bold leading-none text-[#1A1A1A] dark:text-white">{loans.filter(l => l.status === 'disbursed').length}</p>
              </div>
            </div>
          </NeumorphicCard>
        </div>

        {/* Secondary Stats */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Customers */}
          <NeumorphicCard className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4 p-1">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(168, 85, 247, 0.12)' }}>
                <UserCircle size={26} style={{ color: '#A855F7' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: '#6B6B6B' }}>Total Customers</p>
                <p className="text-3xl font-bold leading-none" style={{ color: '#1A1A1A' }}>{customers.length}</p>
              </div>
            </div>
          </NeumorphicCard>

          {/* Employees */}
          <NeumorphicCard className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4 p-1">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(244, 63, 94, 0.12)' }}>
                <Users size={26} style={{ color: '#F43F5E' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: '#6B6B6B' }}>Total Employees</p>
                <p className="text-3xl font-bold leading-none" style={{ color: '#1A1A1A' }}>{employees.length}</p>
              </div>
            </div>
          </NeumorphicCard>

          {/* Active This Month */}
          <NeumorphicCard className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4 p-1">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(20, 184, 166, 0.12)' }}>
                <Activity size={26} style={{ color: '#14B8A6' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: '#6B6B6B' }}>This Month</p>
                <p className="text-3xl font-bold leading-none" style={{ color: '#1A1A1A' }}>{thisMonthLoans}</p>
              </div>
            </div>
          </NeumorphicCard>
        </div>

        {/* Loan Trend Chart - Wide */}
        <NeumorphicCard className="lg:col-span-8">
          <div className="mb-5">
            <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>Loan Trend</h2>
            <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>Monthly loan count over the last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF6D3D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF5722" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Loans']} />
              <Area type="monotone" dataKey="loans" stroke="#FF6D3D" strokeWidth={3}
                fill="url(#loanGrad)" dot={{ fill: '#FF5722', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </NeumorphicCard>

        {/* Loan Status Donut */}
        <NeumorphicCard className="lg:col-span-4">
          <div className="mb-4">
            <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>Loan Status</h2>
            <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>Distribution by status</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                paddingAngle={4} dataKey="value">
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle.contentStyle}
                labelStyle={tooltipStyle.labelStyle}
                formatter={(v, name) => [v, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-3">
            {donutData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span style={{ color: '#6B6B6B' }}>{d.name}</span>
                </div>
                <span className="font-bold" style={{ color: '#1A1A1A' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </NeumorphicCard>
      </div>

      {/* Disbursed Amount Bar Chart */}
      <NeumorphicCard>
        <div className="mb-5">
          <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>Disbursed Amount</h2>
          <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>Monthly disbursement in ₹</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={40}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#FF6D3D" stopOpacity={1} />
                <stop offset="100%" stopColor="#FF5722" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={(v) => [formatINR(Number(v)), 'Disbursed']} />
            <Bar dataKey="amount" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </NeumorphicCard>

      {/* Recent Loans Table */}
      <NeumorphicCard className="overflow-hidden p-0">
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '2px solid #F4F4F4' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>Recent Loans</h2>
            <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>Latest {recentLoans.length} loan applications</p>
          </div>
          <GradientButton size="sm" variant="outline" onClick={() => router.push('/loans/list')}>
            View All <ArrowUpRight size={14} />
          </GradientButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '2px solid #F4F4F4' }}>
                {['Loan ID', 'Customer', 'Employee', 'Amount', 'Installments', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide"
                    style={{ color: '#6B6B6B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLoans.map((loan, i) => {
                const customer = customers.find(c => c.id === loan.customerId)
                const employee = employees.find(e => e.id === loan.employeeId)
                return (
                  <tr key={loan.id} className="transition-all duration-200 cursor-pointer"
                    style={{ borderBottom: '1px solid #F4F4F4' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 109, 61, 0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-6 py-4 font-bold" style={{ color: '#FF6D3D' }}>{loan.loanNo}</td>
                    <td className="px-6 py-4 font-semibold" style={{ color: '#1A1A1A' }}>{customer?.name ?? '—'}</td>
                    <td className="px-6 py-4" style={{ color: '#6B6B6B' }}>{employee?.name ?? '—'}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: '#1A1A1A' }}>{formatINR(loan.amount)}</td>
                    <td className="px-6 py-4" style={{ color: '#6B6B6B' }}>{loan.installments}</td>
                    <td className="px-6 py-4"><Badge status={loan.status} /></td>
                    <td className="px-6 py-4 text-xs" style={{ color: '#6B6B6B' }}>
                      {format(parseISO(loan.loanDate), 'dd/MM/yyyy')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </NeumorphicCard>
    </div>
  )
}
