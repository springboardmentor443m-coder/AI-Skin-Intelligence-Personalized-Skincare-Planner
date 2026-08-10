import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Sparkles, ShieldCheck, LogOut, Menu, X, ArrowRight } from 'lucide-react'
import { useAuth } from '../auth/useAuth'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/#features', label: 'Features' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const userInitials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : user?.name
    ? user.name.slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/15 p-2.5 text-emerald-600 border border-emerald-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 tracking-tight">DermoCare AI</p>
            <p className="text-[11px] font-medium text-emerald-600">Personalized Skin Intelligence</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {user ? (
            /* Logged In Links */
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              <span>Go to Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </NavLink>
          ) : (
            /* Logged Out Links */
            publicLinks.map((link) => (
              <a
                key={link.label}
                href={link.to}
                className="text-xs font-bold text-slate-600 transition hover:text-slate-900"
              >
                {link.label}
              </a>
            ))
          )}
        </nav>

        {/* Auth Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:border-emerald-400 transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white">
                  {userInitials}
                </div>
                <span>{user.full_name || user.name || 'Account'}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-full border border-slate-200 px-5 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600"
              >
                <ShieldCheck className="h-4 w-4" />
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="flex md:hidden rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-500"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-lg">
          {user ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                  {userInitials}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.full_name || user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-emerald-600 py-1.5"
              >
                Go to Workspace Dashboard →
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full text-left text-xs font-bold text-rose-600 py-1.5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {publicLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-bold text-slate-700 py-1.5"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-full border border-slate-200 py-2.5 text-xs font-bold text-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-full bg-emerald-500 py-2.5 text-xs font-bold text-white"
                >
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  )
}
