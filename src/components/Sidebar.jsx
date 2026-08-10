import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  ScanLine,
  CalendarDays,
  TrendingUp,
  History,
  Sparkles,
  UserCircle2,
  ChevronLeft,
  LogOut,
  HeartPulse,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/analysis', label: 'Analyze Skin', icon: ScanLine },
  { to: '/weekly-plan', label: 'Weekly Plan', icon: CalendarDays },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/history', label: 'History', icon: History },
  { to: '/recommendations', label: 'Products', icon: Sparkles },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside
      className={`hidden h-screen flex-col border-r border-slate-200/80 bg-slate-950/95 px-4 py-5 text-slate-300 shadow-[16px_0_40px_rgba(2,8,23,0.16)] transition-all duration-300 md:flex ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="rounded-2xl bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30">
            <HeartPulse className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-white tracking-wide">DermoCare AI</p>
              <p className="text-[11px] text-emerald-400 font-medium">Healthcare Grade</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="rounded-full border border-white/10 p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1.5 overflow-y-auto pr-1 text-xs">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-white border border-emerald-500/40 shadow-inner'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Skin Health Badge in Sidebar */}
      {!collapsed && (
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Skin Health Score</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              Good
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-400">92 / 100</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Weekly progress is trending upwards by +8%.
          </p>
        </div>
      )}

      {/* Sign out Button */}
      <button
        type="button"
        onClick={handleLogout}
        className={`mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 ${
          collapsed ? 'w-full' : ''
        }`}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && 'Sign out'}
      </button>
    </aside>
  )
}

