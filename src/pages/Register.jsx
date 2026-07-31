import { User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setError('Complete every field to create your account.')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const result = register(formData.name, formData.email, formData.password)
    if (!result.ok) {
      setError(result.message)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#eff6ff_100%)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:flex-row">
        <div className="flex-1 bg-emerald-600 p-8 text-white sm:p-10 lg:p-12">
          <div className="inline-flex rounded-2xl bg-white/15 p-2 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">Create your plan for healthier skin.</h1>
          <p className="mt-4 max-w-md text-base leading-8 text-emerald-50">Build your skincare profile, explore personalized recommendations, and stay consistent with guided progress tracking.</p>
          <div className="mt-10 rounded-3xl border border-white/20 bg-white/10 p-6">
            <p className="text-sm text-emerald-50">Starter benefits</p>
            <ul className="mt-4 space-y-3 text-sm text-emerald-50/90">
              <li>• Personalized routine recommendations</li>
              <li>• Skin analysis workflow and progress timeline</li>
              <li>• Premium, medical-inspired dashboard experience</li>
            </ul>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-600">Register</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create your account</h2>
            </div>
            <Link to="/" className="text-sm font-medium text-slate-500 hover:text-emerald-600">Back home</Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <User className="h-5 w-5 text-slate-400" />
                <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Alex Morgan" className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Lock className="h-5 w-5 text-slate-400" />
                <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="Create a strong password" className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Lock className="h-5 w-5 text-slate-400" />
                <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" placeholder="Repeat your password" className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>

            {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600">
              Register <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
            Already registered? <Link to="/login" className="font-semibold text-emerald-600">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
