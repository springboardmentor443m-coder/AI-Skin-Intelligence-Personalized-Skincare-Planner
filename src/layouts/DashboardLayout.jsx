import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import {
  BellRing,
  PanelLeftOpen,
  Search,
  LayoutGrid,
  ScanLine,
  CalendarDays,
  TrendingUp,
  History as HistoryIcon,
  Sparkles,
  UserCircle2,
  Menu,
  X,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import FloatingAIAssistant from '../components/FloatingAIAssistant'

const mobileNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/analysis', label: 'Analyze Skin', icon: ScanLine },
  { to: '/weekly-plan', label: 'Weekly Plan', icon: CalendarDays },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/recommendations', label: 'Products', icon: Sparkles },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {/* Top Header Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
            <div className="flex items-center gap-3">
              {/* Desktop collapse toggle */}
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="hidden md:flex rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600"
                title="Toggle Sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>

              {/* Mobile menu toggle button */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="flex md:hidden rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">DermoCare Workspace</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    Clinical AI
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Clean, healthcare-grade personalized skin intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 sm:flex">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search routines & active ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 w-48"
                />
              </div>

              <button
                className="relative rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600"
                title="Notifications"
              >
                <BellRing className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500" />
              </button>
            </div>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mb-6 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white space-y-1 shadow-lg">
              {mobileNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-300 hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 text-emerald-400" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          )}

          {/* Render Active Route */}
          <Outlet />

          {/* Global Floating AI Dermatology Assistant (Accessible on every authenticated page) */}
          <FloatingAIAssistant />
        </main>
      </div>
    </div>
  )
}
