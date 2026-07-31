import { ArrowLeft, Mail, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email.trim()) {
      setMessage('Enter the email address associated with your account.')
      return
    }
    setMessage('If an account exists for this email, recovery instructions would be sent in a production environment.')
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#f0fdf4_100%)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-12">
        <div className="inline-flex rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.32em] text-emerald-600">Password recovery</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Reset your password</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">Enter your email address and we will guide you through the recovery process.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none" />
            </div>
          </label>
          {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
          <button type="submit" className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600">Send recovery instructions</button>
        </form>

        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  )
}
