'use client'
type Status = 'pending' | 'approved' | 'disbursed'

const cfg: Record<Status, { dot: string; text: string; bg: string }> = {
  pending: {
    dot: '#F59E0B',
    text: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50/80 dark:bg-amber-900/20',
  },
  approved: {
    dot: '#6366F1',
    text: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50/80 dark:bg-indigo-900/20',
  },
  disbursed: {
    dot: '#10B981',
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50/80 dark:bg-emerald-900/20',
  },
}

export function Badge({ status }: { status: Status }) {
  const item = cfg[status]

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${item.bg} ${item.text}`}>
      <span className="h-2 w-2 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,0.85)]" style={{ background: item.dot }} />
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  )
}
