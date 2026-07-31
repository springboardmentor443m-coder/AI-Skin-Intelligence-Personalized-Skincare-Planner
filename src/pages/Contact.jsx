import { Mail, MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'

export default function Contact() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[1.75rem] bg-slate-950 p-8 text-white sm:p-10">
          <MessageCircle className="h-7 w-7 text-emerald-400" />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Contact</p>
          <h1 className="mt-3 text-4xl font-semibold">We would like to hear from you.</h1>
          <p className="mt-5 text-sm leading-7 text-slate-300">Share feedback about the planner, report a project issue, or ask about the educational recommendation flow.</p>
          <div className="mt-8 flex items-center gap-3 text-sm text-slate-300">
            <Mail className="h-4 w-4 text-emerald-400" />
            support@aiskinintelligence.local
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
              <input required type="text" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
              <input required type="email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Message</span>
              <textarea required rows="6" className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            </label>
            {sent && <p role="status" className="text-sm text-emerald-700">Thanks. Your message has been recorded for this project demo.</p>}
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600">
              Send message
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
