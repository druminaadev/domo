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
  Wallet, Calculator, Settings, LogOut, User, Bell, HelpCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { COLORS, GRADIENTS } from '@/lib/colors'

interface NavChild { label: string; path: string; icon: React.ElementType; badge?: string }
interface NavGroup {
  label: string
  icon: React.ElementType
  color: string        // accent color for the group icon
  children: NavChild[]
}

const NAV: NavGroup[] = [
  {
    label: 'Employees', icon: Users, color: '#831C91',
    children: [
      { label: 'Add Employee', path: '/employees/add', icon: UserPlus },
      { label: 'Employee List', path: '/employees/list', icon: List },
    ],
  },
  {
    label: 'Customers', icon: UserCircle, color: '#D552A3',
    children: [
      { label: 'Add Customer', path: '/customers/add', icon: UserPlus },
      { label: 'Customer List', path: '/customers/list', icon: UserCheck },
    ],
  },
  {
    label: 'Loans', icon: CreditCard, color: '#462C7D',
    children: [
      { label: 'Add Loan', path: '/loans/add', icon: FilePlus },
      { label: 'All Loans', path: '/loans/list', icon: FileText },
      { label: 'Approved', path: '/loans/approved', icon: CheckCircle },
      { label: 'Disbursed', path: '/loans/disbursed', icon: Banknote },
      { label: 'Pending Approval', path: '/loans/approval', icon: CheckSquare, badge: 'New' },
    ],
  },
  {
    label: 'EMI', icon: Calendar, color: '#831C91',
    children: [
      { label: 'EMI Collection', path: '/emi/collection', icon: ClipboardList },
      { label: 'EMI Calendar', path: '/emi/calendar', icon: Calendar },
    ],
  },
  {
    label: 'Reports', icon: BarChart2, color: '#D552A3',
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
    label: 'Civil Score', icon: Star, color: '#462C7D',
    children: [
      { label: 'Civil Score Board', path: '/civil-score', icon: Star },
    ],
  },
  {
    label: 'Tools', icon: Calculator, color: '#831C91',
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
  const logout = useAuthStore((state) => state.logout)
  const showToast = useUIStore((state) => state.showToast)
  const [expanded, setExpanded] = useState<string[]>(['Loans', 'EMI'])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [masterSetupOpen, setMasterSetupOpen] = useState(false)

  const toggle = (label: string) =>
    setExpanded(p => p.includes(label) ? p.filter(x => x !== label) : [...p, label])

  const isGroupActive = (group: NavGroup) =>
    group.children.some(c => pathname === c.path || pathname.startsWith(c.path + '/'))

  const isDashboard = pathname === '/'

  const handleLogout = () => {
    logout()
    setSettingsOpen(false)
    setMasterSetupOpen(false)
    onClose?.()
    showToast('Logged out successfully', 'info')
    router.replace('/login')
  }

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
          background: GRADIENTS.sidebar,
          borderRight: `1px solid ${COLORS.borderPrimary}`,
          boxShadow: COLORS.shadowSecondary,
        }}
      >
        {/* ── Brand Header ─────────────────────────────────── */}
        <div
          className="flex items-center justify-between shrink-0 px-4 h-16"
          style={{ 
            borderBottom: `1px solid ${COLORS.borderPrimary}`,
            background: COLORS.bgPrimary,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo mark */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ 
                background: GRADIENTS.primary,
                boxShadow: COLORS.shadowPrimary,
              }}
            >
              <Wallet size={16} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div
                  className="text-sm font-bold leading-tight truncate"
                  style={{ 
                    background: GRADIENTS.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Dada Finance
                </div>
                <div
                  className="text-[10px] font-medium mt-0.5 truncate"
                  style={{ color: COLORS.primary }}
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
                style={{ color: COLORS.gray }}
                onMouseEnter={e => (e.currentTarget.style.background = COLORS.bgSecondary)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={15} />
              </button>
            )}
            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg cursor-pointer transition-colors"
              style={{ color: COLORS.gray }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onMouseEnter={e => {
                e.currentTarget.style.background = COLORS.bgSecondary
                e.currentTarget.style.color = COLORS.dark
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = COLORS.gray
              }}
            >
              {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </div>
        </div>

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
              iconColor="#462C7D"
              label="Dashboard"
              collapsed={collapsed}
              onClick={onClose}
            />
          </div>

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
                        background: groupActive ? COLORS.primaryAlpha12 : 'transparent',
                        color: groupActive ? COLORS.primary : COLORS.gray,
                      }}
                      onMouseEnter={e => { if (!groupActive) e.currentTarget.style.background = COLORS.bgSecondary }}
                      onMouseLeave={e => { if (!groupActive) e.currentTarget.style.background = 'transparent' }}
                      onClick={() => {
                        // expand sidebar and open group
                        onToggleCollapse()
                        setExpanded(p => p.includes(group.label) ? p : [...p, group.label])
                      }}
                    >
                      <group.icon size={17} style={{ color: groupActive ? COLORS.primary : group.color, opacity: groupActive ? 1 : 0.7 }} />
                    </button>
                    {/* Tooltip */}
                    <div
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 shadow-lg"
                      style={{ background: COLORS.dark, color: COLORS.white }}
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
                        background: groupActive && !isOpen ? COLORS.primaryAlpha12 : 'transparent',
                      }}
                      onMouseEnter={e => { if (!(groupActive && !isOpen)) e.currentTarget.style.background = COLORS.bgSecondary }}
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
                        style={{ color: groupActive ? COLORS.dark : COLORS.gray }}
                      >
                        {group.label}
                      </span>

                      <ChevronDown
                        size={13}
                        style={{
                          color: COLORS.gray,
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
                      <div className="mt-0.5 ml-3 pl-3 space-y-0.5" style={{ borderLeft: `1px solid ${COLORS.borderLight}` }}>
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
          style={{ borderTop: `1px solid ${COLORS.borderLight}` }}
        >
          {!collapsed ? (
            <>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
                style={{ background: settingsOpen ? COLORS.primaryAlpha12 : 'transparent' }}
                onMouseEnter={e => { if (!settingsOpen) e.currentTarget.style.background = COLORS.bgSecondary }}
                onMouseLeave={e => { if (!settingsOpen) e.currentTarget.style.background = 'transparent' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: COLORS.primaryAlpha12 }}
                >
                  <Settings size={15} style={{ color: COLORS.primary }} />
                </div>
                <span className="flex-1 text-left text-sm font-medium" style={{ color: COLORS.dark }}>
                  Settings
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: COLORS.gray,
                    transition: 'transform 0.2s',
                    transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* Dropdown Menu */}
              {settingsOpen && (
                <div
                  className="absolute bottom-full left-3 right-3 mb-2 rounded-lg shadow-lg overflow-hidden"
                  style={{ background: COLORS.white, border: `1px solid ${COLORS.borderLight}` }}
                >
                  {/* Master Setup with nested dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setMasterSetupOpen(!masterSetupOpen)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors text-left"
                      style={{ color: COLORS.dark }}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.bgSecondary}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Database size={14} style={{ color: COLORS.gray }} />
                      <span className="flex-1 text-sm">Master Setup</span>
                      <ChevronDown
                        size={12}
                        style={{
                          color: COLORS.gray,
                          transition: 'transform 0.2s',
                          transform: masterSetupOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>
                    {/* Master Setup Submenu */}
                    {masterSetupOpen && (
                      <div className="pl-6 py-1" style={{ background: COLORS.bgSecondary }}>
                        {MASTER_SETUP_ITEMS.map(item => (
                          <button
                            key={item.path}
                            onClick={() => { router.push(item.path); setSettingsOpen(false); setMasterSetupOpen(false); onClose?.() }}
                            className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors text-left"
                            style={{ color: COLORS.gray }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = COLORS.primaryAlpha12
                              e.currentTarget.style.color = COLORS.dark
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = COLORS.gray
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
                    style={{ color: COLORS.dark }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.bgSecondary}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={14} style={{ color: COLORS.gray }} />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button
                    onClick={() => { router.push('/notifications'); setSettingsOpen(false); onClose?.() }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors text-left"
                    style={{ color: COLORS.dark }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.bgSecondary}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Bell size={14} style={{ color: COLORS.gray }} />
                    <span className="text-sm">Notifications</span>
                  </button>
                  <button
                    onClick={() => { router.push('/help'); setSettingsOpen(false); onClose?.() }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors text-left"
                    style={{ color: COLORS.dark }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.bgSecondary}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <HelpCircle size={14} style={{ color: COLORS.gray }} />
                    <span className="text-sm">Help & Support</span>
                  </button>
                  <div className="my-1" style={{ borderTop: `1px solid ${COLORS.borderLight}` }} />
                  <button
                    onClick={handleLogout}
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
                style={{ background: 'transparent', color: COLORS.gray }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.bgSecondary}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Settings size={17} style={{ color: COLORS.primary }} />
              </button>
              {/* Tooltip */}
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/settings:opacity-100 transition-opacity z-50 shadow-lg"
                style={{ background: COLORS.dark, color: COLORS.white }}
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
        color: active ? COLORS.dark : COLORS.gray,
        background: active ? COLORS.primaryAlpha12 : 'transparent',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = COLORS.bgSecondary }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      title={collapsed ? label : undefined}
    >
      {/* Active left bar */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
          style={{ background: COLORS.primary }}
        />
      )}

      <Icon
        size={14}
        style={{
          color: active ? COLORS.primary : iconColor,
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
              style={{ background: COLORS.primary }}
            />
          )}
        </>
      )}

      {/* Collapsed tooltip */}
      {collapsed && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/item:opacity-100 transition-opacity z-50 shadow-lg"
          style={{ background: COLORS.dark, color: COLORS.white }}
        >
          {label}
        </div>
      )}
    </Link>
  )
}
