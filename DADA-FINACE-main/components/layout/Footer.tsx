'use client'
import { useSyncExternalStore } from 'react'
import { format } from 'date-fns'

function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000)
  return () => clearInterval(timer)
}

function getSnapshot() {
  return Date.now()
}

function getServerSnapshot() {
  return 0
}

export function Footer() {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const date = now ? new Date(now) : null

  return (
    <footer className="h-9 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shrink-0">
      <span className="text-xs text-slate-500 dark:text-slate-400">Copyright © 2025 Dada Finance Corporation. All rights reserved.</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {date ? `Date: ${format(date, 'dd-M-yyyy')} | Time: ${format(date, 'h:mm:ss aa')}` : ''}
      </span>
    </footer>
  )
}
