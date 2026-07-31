import { motion } from 'framer-motion'
import { ArrowRight, Activity, Camera, CalendarDays, Droplets, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProgressChart from '../components/ProgressChart'

const routine = ['Gentle cleanse', 'Niacinamide serum', 'Moisturizer', 'Sunscreen']
const recentAnalysis = [
  { title: 'Hydration', detail: 'Improved by 12% this week', tone: 'text-emerald-600' },
  { title: 'Barrier support', detail: 'Calmer and less reactive', tone: 'text-sky-600' },
]
const quickActions = [
  { title: 'Run analysis', path: '/analysis', icon: Camera },
  { title: 'See recommendations', path: '/recommendations', icon: Sparkles },
  { title: 'View progress', path: '/progress', icon: Activity },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-500 via-emerald-600 to-sky-600 p-6 text-white shadow-[0_25px_70px_rgba(16,185,129,0.16)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-100">Welcome back</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Your skin plan feels calmer, clearer, and easier to follow.</h1>
            <p className="mt-3 text-sm leading-7 text-emerald-50 sm:text-base">A calmer view of your routine, insights, and next best step for healthier skin.</p>
          </div>
          <Link to="/analysis" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-emerald-50">
            Start new analysis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Skin health score</p>
              <p className="text-sm text-slate-500">Balanced and improving over time</p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">+8% this week</div>
          </div>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-emerald-500/20 bg-slate-50 text-3xl font-semibold text-emerald-600">
              92
            </div>
            <div className="flex-1 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Hydration</span>
                  <span className="font-semibold text-slate-900">87%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-[87%] rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Barrier comfort</span>
                  <span className="font-semibold text-slate-900">91%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-[91%] rounded-full bg-sky-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="flex items-center gap-2 text-emerald-600">
            <Droplets className="h-5 w-5" />
            <p className="text-sm font-semibold">Today’s routine</p>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">Simple, barrier-friendly essentials</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            {routine.map((item) => (
              <li key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span>{item}</span>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Recent analysis</p>
              <p className="text-sm text-slate-500">A quick snapshot of what improved</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">2 days ago</div>
          </div>
          <div className="mt-5 space-y-3">
            {recentAnalysis.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.detail}</p>
                </div>
                <span className={`text-sm font-semibold ${item.tone}`}>Stable</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="flex items-center gap-2 text-sky-600">
            <CalendarDays className="h-5 w-5" />
            <p className="text-sm font-semibold">Quick actions</p>
          </div>
          <div className="mt-5 space-y-3">
            {quickActions.map(({ title, path, icon: Icon }) => (
              <Link key={title} to={path} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700">
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {title}
                </span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <ProgressChart />
      </div>
    </div>
  )
}
