'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Upload,
  History,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Analyze Skin', icon: Upload },
  { href: '/history', label: 'History', icon: History },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-[#f3e3da] bg-[linear-gradient(180deg,#fff8f3_0%,#fffdfb_100%)] lg:flex">
      <div className="flex w-full flex-col">
        <div className="border-b border-[#f3e3da] p-6">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-[20px] border border-[#f3e3da] bg-white/80 p-3 shadow-[0_10px_35px_rgba(59,47,47,0.06)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#d89c8b] to-[#f2c6b4] text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#3b2f2f]">AI Skin</h1>
              <p className="text-xs text-[#8a736f]">Intelligence Studio</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#d89c8b] text-white shadow-[0_10px_30px_rgba(216,156,139,0.2)]'
                    : 'text-[#3b2f2f] hover:bg-white hover:shadow-sm'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-0 rounded-[16px] bg-[#d89c8b]"
                    transition={{ type: 'spring', damping: 20 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-[#f3e3da] p-4">
          <div className="rounded-[16px] border border-[#f3e3da] bg-white/80 p-3 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a736f]">Logged in as</p>
            <p className="mt-1 truncate text-sm font-medium text-[#3b2f2f]">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-medium text-[#d66a5a] transition hover:bg-[#fff2eb]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
