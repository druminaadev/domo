'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Footer } from '@/components/layout/Footer'
import { ToastContainer } from '@/components/ui/Toast'
import { Chatbot } from '@/components/ui/Chatbot'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const router = useRouter()

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  // Step 1: Handle Mounting to prevent Hydration errors
  useEffect(() => {
    setMounted(true)

    return () => {
      setMounted(false)
    }
  }, [])

  // Step 2: Handle Authentication Redirect
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login')
    }
  }, [mounted, isAuthenticated, router])

  // Step 3: Only render content if mounted AND authenticated
  if (!mounted || !isAuthenticated) {
    return (
      <div
        className="min-h-screen"
        style={{ background: 'var(--surface)' }}
      />
    )
  }

  return (
    <>
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: 'var(--surface)' }}
      >
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev: boolean) => !prev)}
        />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar onMenuToggle={() => setSidebarOpen((prev: boolean) => !prev)} />

          <main className="flex-1 overflow-y-auto p-4 lg:p-6 focus:outline-none">
            {children}
          </main>

          <Footer />
        </div>
      </div>

      <ToastContainer />
      <Chatbot />
    </>
  )
}