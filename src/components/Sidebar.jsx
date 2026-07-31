import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, ScanLine, Sparkles, TrendingUp, UserCircle2, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../auth/useAuth'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/analysis', label: 'Analysis', icon: ScanLine },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
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
    <aside className={`hidden h-screen flex-col border-r border-slate-200/80 bg-slate-950/95 px-4 py-5 text-slate-300 shadow-[16px_0_40px_rgba(2,8,23,0.16)] transition-all duration-300 md:flex ${collapsed ? 'w-24' : 'w-72'}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="rounded-2xl bg-emerald-500/15 p-2 text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-white">AI Skin Planner</p>
              <p className="text-xs text-slate-400">Premium insights</p>
            </div>
          )}
        </div>
        <button onClick={onToggle} className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-emerald-500/15 text-white shadow-inner' : 'text-slate-300 hover:bg-white/10 hover:text-white'} ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <Icon className="h-5 w-5" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white">Weekly score</p>
        <p className="mt-2 text-3xl font-semibold text-emerald-400">92</p>
        {!collapsed && <p className="mt-2 text-xs leading-6 text-slate-400">Your routine is trending in the right direction with calmer, better hydrated skin.</p>}
      </div>

      <button type="button" onClick={handleLogout} className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
        <LogOut className="h-4 w-4" />
        {!collapsed && 'Sign out'}
      </button>
    </aside>
  )
}
