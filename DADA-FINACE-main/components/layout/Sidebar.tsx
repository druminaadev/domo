'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Database, Users, UserCircle, CreditCard,
  ChevronDown, MapPin, Building2, Landmark, Tag, UserPlus,
  List, UserCheck, FilePlus, FileText, CheckSquare, CheckCircle,
  Banknote, X, Calendar, BarChart2, TrendingUp, AlertTriangle,
  Star, ClipboardList, Activity, PanelLeftClose, PanelLeftOpen,
  Plus, Wallet, Calculator, Settings, LogOut, User, Bell, HelpCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NavChild { label: string; path: string; icon: React.ElementType; badge?: string }
interface NavGroup {
  label: string
  icon: React.ElementType
  color: string        // accent color for the group icon
  children: NavChild[]
}

const NAV: NavGroup[] = [
  {
    label: 'Employees', icon: Users, color: '#0EA5E9',
    children: [
      { label: 'Add Employee', path: '/employees/add', icon: UserPlus },
      { label: 'Employee List', path: '/employees/list', icon: List },
    ],
  },
  {
    label: 'Customers', icon: UserCircle, color: '#10B981',
    children: [
      { label: 'Add Customer', path: '/customers/add', icon: UserPlus },
      { label: 'Customer List', path: '/customers/list', icon: UserCheck },
    ],
  },
  {
    label: 'Loans', icon: CreditCard, color: '#F59E0B',
    children: [
      { label: 'Add Loan', path: '/loans/add', icon: FilePlus },
      { label: 'All Loans', path: '/loans/list', icon: FileText },
      { label: 'Approved', path: '/loans/approved', icon: CheckCircle },
      { label: 'Disbursed', path: '/loans/disbursed', icon: Banknote },
      { label: 'Pending Approval', path: '/loans/approval', icon: CheckSquare, badge: 'New' },
    ],
  },
  {
    label: 'EMI', icon: Calendar, color: '#EF4444',
    children: [
      { label: 'EMI Collection', path: '/emi/collection', icon: ClipboardList },
      { label: 'EMI Calendar', path: '/emi/calendar', icon: Calendar },
    ],
  },
  {
    label: 'Reports', icon: BarChart2, color: '#6366F1',
    children: [
      { label: 'Daily Collection', path: '/reports/daily-collection', icon: Activity },
      { label: 'Transaction History', path: '/reports/transaction-history', icon: FileText },
      { label: 'Loan Portfolio', path: '/reports/portfolio', icon: ClipboardList },
      { label: 'Branch Performance', path: '/reports/branch-performance', icon: Building2 },
      { label: 'Employee Performance', path: '/reports/employee-performance', icon: Users },
      { label: 'Outstanding Dues', path: '/reports/outstanding', icon: AlertTriangle },
      { label: 'Business Trend', path: '/reports/business-trend', icon: TrendingUp },
    ],
  },
  {
    label: 'Civil Score', icon: Star, color: '#F97316',
    children: [
      { label: 'Civil Score Board', path: '/civil-score', icon: Star },
    ],
  },
  {
    label: 'Tools', icon: Calculator, color: '#14B8A6',
    children: [
      { label: 'EMI Calculator', path: '/tools/emi-calculator', icon: Calculator },
    ],
  },
]

// Master Setup items for Settings dropdown only
const MASTER_SETUP_ITEMS: NavChild[] = [
  { label: 'States', path: '/master/states', icon: MapPin },
  { label: 'Cities', path: '/master/cities', icon: Building2 },
  { label: 'Areas', path: '/master/areas', icon: MapPin },
  { label: 'Branches', path: '/master/branches', icon: Landmark },
  { label: 'Loan Types', path: '/master/loan-types', icon: Tag },
  { label: 'Banks', path: '/master/banks', icon: Landmark },
]

interface SidebarProps {
  open: boolean
  onClose?: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [expanded, setExpanded] = useState<string[]>(['Loans', 'EMI'])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [masterSetupOpen, setMasterSetupOpen] = useState(false)

  const toggle = (label: string) =>
    setExpanded(p => p.includes(label) ? p.filter(x => x !== label) : [...p, label])

  const isGroupActive = (group: NavGroup) =>
    group.children.some(c => pathname === c.path || pathname.startsWith(c.path + '/'))

  const isDashboard = pathname === '/'

  return (
    <>
      {/* Mobile overlay */}
      {open && onClose && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-40 flex flex-col',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-[68px]' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F5 100%)',
          borderRight: '1px solid rgba(255, 109, 61, 0.1)',
          boxShadow: '4px 0 24px rgba(255, 109, 61, 0.08)',
        }}
      >
        {/* ── Brand Header ─────────────────────────────────── */}
        <div
          className="flex items-center justify-between shrink-0 px-4 h-16"
          style={{ 
            borderBottom: '1px solid rgba(255, 109, 61, 0.15)',
            background: 'linear-gradient(135deg, rgba(255, 109, 61, 0.05) 0%, rgba(255, 183, 153, 0.05) 100%)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo mark */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ 
                background: 'linear-gradient(135deg, #FF6D3D 0%, #FF8A5B 100%)',
                boxShadow: '0 4px 12px rgba(255, 109, 61, 0.3)',
              }}
            >
              <Wallet size={16} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div
                  className="text-sm font-bold leading-tight truncate"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6D3D 0%, #FF8A5B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Dada Finance
                </div>
                <div
                  className="text-[10px] font-medium mt-0.5 truncate"
                  style={{ color: '#FF6D3D' }}
                >
                  Loan Management
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Mobile close */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg cursor-pointer transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={15} />
              </button>
            )}
            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg cursor-pointer transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────── */}
        {/* {!collapsed && (
          <div className="px-3 pt-3 pb-3 flex gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => { router.push('/customers/add'); onClose?.() }}
              className="w-1/2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              style={{
                background: 'var(--accent-tint)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)', (e.currentTarget.style.color = '#fff'))}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-tint)', (e.currentTarget.style.color = 'var(--accent)'))}
            >
              <UserPlus size={12} /> Customer
            </button>
            <button
              onClick={() => { router.push('/loans/add'); onClose?.() }}
              className="w-1/2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all text-white"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              <Plus size={12} /> Add Loan
            </button>
          </div>
        )} */}

        {/* Collapsed quick-add icon
        {collapsed && (
          <div className="px-2 pt-3 pb-3 flex flex-col gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => router.push('/loans/add')}
              className="w-full flex items-center justify-center p-2 rounded-lg cursor-pointer transition-colors text-white"
              style={{ background: 'var(--accent)' }}
              title="Add Loan"
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              <Plus size={15} />
            </button>
          </div>
        )} */}

        {/* ── Navigation ───────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto py-3"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Dashboard */}
          <div className={collapsed ? 'px-2 mb-1' : 'px-3 mb-1'}>
            <NavItem
              href="/"
              active={isDashboard}
              icon={LayoutDashboard}
              iconColor="#5B7FA6"
              label="Dashboard"
              collapsed={collapsed}
              onClick={onClose}
            />
          </div>

          {/* Divider */}
          {/* <div className="mx-3 my-2" style={{ borderTop: '1px solid var(--border)' }} /> */}

          {/* Groups */}
          {NAV.map((group) => {
            const groupActive = isGroupActive(group)
            const isOpen = expanded.includes(group.label)

            return (
              <div key={group.label} className={collapsed ? 'px-2 mb-1' : 'px-3 mb-1'}>
                {collapsed ? (
                  /* Collapsed: show group icon as tooltip trigger */
                  <div className="relative group/tip">
                    <button
                      className="w-full flex items-center justify-center p-2.5 rounded-lg cursor-pointer transition-colors"
                      style={{
                        background: groupActive ? 'var(--accent-tint)' : 'transparent',
                        color: groupActive ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                      onMouseEnter={e => { if (!groupActive) e.currentTarget.style.background = 'var(--hover)' }}
                      onMouseLeave={e => { if (!groupActive) e.currentTarget.style.background = 'transparent' }}
                      onClick={() => {
                        // expand sidebar and open group
                        onToggleCollapse()
                        setExpanded(p => p.includes(group.label) ? p : [...p, group.label])
                      }}
                    >
                      <group.icon size={17} style={{ color: groupActive ? 'var(--accent)' : group.color, opacity: groupActive ? 1 : 0.7 }} />
                    </button>
                    {/* Tooltip */}
                    <div
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 shadow-lg"
                      style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
                    >
                      {group.label}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Group header button */}
                    <button
                      onClick={() => toggle(group.label)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors group/header"
                      style={{
                        background: groupActive && !isOpen ? 'var(--accent-tint)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!(groupActive && !isOpen)) e.currentTarget.style.background = 'var(--hover)' }}
                      onMouseLeave={e => { if (!(groupActive && !isOpen)) e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Colored icon container */}
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: `${group.color}18` }}
                      >
                        <group.icon size={13} style={{ color: group.color }} />
                      </div>

                      <span
                        className="flex-1 text-left text-xs font-semibold uppercase tracking-wider truncate"
                        style={{ color: groupActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                      >
                        {group.label}
                      </span>

                      <ChevronDown
                        size={13}
                        style={{
                          color: 'var(--text-secondary)',
                          transition: 'transform 0.2s',
                          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                          flexShrink: 0,
                        }}
                      />
                    </button>

                    {/* Children */}
                    <div
                      className="overflow-hidden transition-all duration-200 ease-in-out"
                      style={{ maxHeight: isOpen ? '600px' : '0', opacity: isOpen ? 1 : 0 }}
                    >
                      <div className="mt-0.5 ml-3 pl-3 space-y-0.5" style={{ borderLeft: '1px solid var(--border)' }}>
                        {group.children.map(child => {
                          const childActive = pathname === child.path || pathname.startsWith(child.path + '/')
                          return (
                            <NavItem
                              key={child.path}
                              href={child.path}
                              active={childActive}
                              icon={child.icon}
                              iconColor={group.color}
                              label={child.label}
                              badge={child.badge}
                              collapsed={false}
                              onClick={onClose}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </nav>

        {/* ── Settings Dropdown (Stuck at Bottom) ───────────────────────────────────────── */}
        <div
          className="px-3 py-3 shrink-0 relative"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {!collapsed ? (
            <>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
                style={{ background: settingsOpen ? 'var(--accent-tint)' : 'transparent' }}
                onMouseEnter={e => { if (!settingsOpen) e.currentTarget.style.background = 'var(--hover)' }}
                onMouseLeave={e => { if (!settingsOpen) e.currentTarget.style.background = 'transparent' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-tint)' }}
                >
                  <Settings size={15} style={{ color: 'var(--accent)' }} />
                </div>
                <span className="flex-1 text-left text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Settings
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--text-secondary)',
                    transition: 'transform 0.2s',
                    transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* Dropdown Menu */}
              {settingsOpen && (
                <div
                  className="absolute bottom-full left-3 right-3 mb-2 rounded-lg shadow-lg overflow-hidden"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  {/* Master Setup with nested dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setMasterSetupOpen(!masterSetupOpen)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors text-left"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Database size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span className="flex-1 text-sm">Master Setup</span>
                      <ChevronDown
                        size={12}
                        style={{
                          color: 'var(--text-secondary)',
                          transition: 'transform 0.2s',
                          transform: masterSetupOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>
                    {/* Master Setup Submenu */}
                    {masterSetupOpen && (
                      <div className="pl-6 py-1" style={{ background: 'var(--hover)' }}>
                        {MASTER_SETUP_ITEMS.map(item => (
                          <button
                            key={item.path}
                            onClick={() => { router.push(item.path); setSettingsOpen(false); setMasterSetupOpen(false); onClose?.() }}
                            className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors text-left"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'var(--accent-tint)'
                              e.currentTarget.style.color = 'var(--text-primary)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = 'var(--text-secondary)'
                            }}
                          >
                            <item.icon size={12} />
                            <span className="text-xs">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { router.push('/profile'); setSettingsOpen(false); onClose?.() }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors text-left"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button
                    onClick={() => { router.push('/notifications'); setSettingsOpen(false); onClose?.() }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors text-left"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Bell size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm">Notifications</span>
                  </button>
                  <button
                    onClick={() => { router.push('/help'); setSettingsOpen(false); onClose?.() }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors text-left"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <HelpCircle size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm">Help & Support</span>
                  </button>
                  <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
                  <button
                    onClick={() => { /* Add logout logic */ setSettingsOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors text-left"
                    style={{ color: '#EF4444' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={14} />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Collapsed Settings Icon */
            <div className="relative group/settings">
              <button
                onClick={() => {
                  onToggleCollapse()
                  setSettingsOpen(true)
                }}
                className="w-full flex items-center justify-center p-2.5 rounded-lg cursor-pointer transition-colors"
                style={{ background: 'transparent', color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Settings size={17} style={{ color: 'var(--accent)' }} />
              </button>
              {/* Tooltip */}
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/settings:opacity-100 transition-opacity z-50 shadow-lg"
                style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
              >
                Settings
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

/* ── NavItem ─────────────────────────────────────────────────── */
interface NavItemProps {
  href: string
  active: boolean
  icon: React.ElementType
  iconColor: string
  label: string
  badge?: string
  collapsed: boolean
  onClick?: () => void
}

function NavItem({ href, active, icon: Icon, iconColor, label, badge, collapsed, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 group/item"
      style={{
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-tint)' : 'transparent',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--hover)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      title={collapsed ? label : undefined}
    >
      {/* Active left bar */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
          style={{ background: 'var(--accent)' }}
        />
      )}

      <Icon
        size={14}
        style={{
          color: active ? 'var(--accent)' : iconColor,
          opacity: active ? 1 : 0.65,
          flexShrink: 0,
          transition: 'color 0.15s',
        }}
      />

      {!collapsed && (
        <>
          <span className="flex-1 text-sm leading-none truncate">{label}</span>

          {badge && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
              style={{ background: '#EF444420', color: '#EF4444' }}
            >
              {badge}
            </span>
          )}

          {active && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: 'var(--accent)' }}
            />
          )}
        </>
      )}

      {/* Collapsed tooltip */}
      {collapsed && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/item:opacity-100 transition-opacity z-50 shadow-lg"
          style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
        >
          {label}
        </div>
      )}
    </Link>
  )
}
