import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    const result = login(email, password)
    if (!result.ok) {
      setError(result.message)
      return
    }

    navigate(location.state?.from || '/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#f0fdf4_100%)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:flex-row">
        <div className="flex-1 bg-slate-950 p-8 text-white sm:p-10 lg:p-12">
          <div className="inline-flex rounded-2xl bg-emerald-500/15 p-2 text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">Welcome back to your skincare workspace.</h1>
          <p className="mt-4 max-w-md text-base leading-8 text-slate-300">Sign in to view your dashboard, routines, and progress updates in one secure place.</p>
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-6">
            <p className="text-sm text-slate-300">Today’s focus</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">Hydration + barrier repair</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">A calm routine designed to help your skin feel balanced and resilient.</p>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-600">Login</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Sign in to continue</h2>
            </div>
            <Link to="/" className="text-sm font-medium text-slate-500 hover:text-emerald-600">Back home</Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Lock className="h-5 w-5 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full bg-transparent text-sm outline-none" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400 transition hover:text-slate-700">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-700">Forgot password?</Link>
            </div>

            {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600">
              Sign In <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
            Don’t have an account? <Link to="/register" className="font-semibold text-emerald-600">Create one</Link>
          </div>

          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600">
            <span className="text-base">G</span> Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
