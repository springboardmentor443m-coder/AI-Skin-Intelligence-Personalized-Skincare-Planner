'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { Sidebar } from './sidebar'

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(216,156,139,0.16),_transparent_24%),linear-gradient(180deg,#fff8f3_0%,#fffdfb_100%)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#d89c8b] border-t-transparent"></div>
          <p className="text-[#8a736f]">Preparing your skincare workspace...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,156,139,0.14),_transparent_24%),linear-gradient(180deg,#fff8f3_0%,#fffdfb_100%)]">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
