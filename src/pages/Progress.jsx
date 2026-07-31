import { motion } from 'framer-motion'
import { CalendarDays, TrendingUp, BarChart3, Sparkles } from 'lucide-react'
import ProgressChart from '../components/ProgressChart'

const timeline = [
  { week: 'Week 1', note: 'Hydration improved after a simpler routine.', score: '72 → 76' },
  { week: 'Week 2', note: 'Barrier felt calmer and less reactive.', score: '76 → 84' },
  { week: 'Week 3', note: 'Texture looked smoother and more even.', score: '84 → 92' },
]

export default function Progress() {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Progress tracker</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">A clear timeline for your skin journey.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Track weekly improvements, compare monthly trends, and keep a calm record of what supports your skin health.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
          <ProgressChart />
        </div>

        <div className="space-y-4">
          <motion.div whileHover={{ y: -3 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-50 p-2 text-sky-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">Monthly trend</p>
                <p className="text-sm text-slate-500">Steady upward movement</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-700">Hydration</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">+14%</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm font-semibold text-sky-700">Texture</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">+9%</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-emerald-500 to-sky-600 p-6 text-white shadow-[0_20px_50px_rgba(16,185,129,0.16)]">
            <div className="flex items-center gap-2 text-emerald-100">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm font-semibold">Skin score timeline</p>
            </div>
            <p className="mt-4 text-4xl font-semibold">92</p>
            <p className="mt-2 text-sm text-emerald-50">Consistent care and a calmer routine are showing through in your score.</p>
          </motion.div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-2 text-amber-600">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Weekly timeline</p>
            <p className="text-sm text-slate-500">Key milestones that show continued improvement.</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {timeline.map((item) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item.week} className="flex flex-col gap-2 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{item.week}</p>
                <p className="text-sm text-slate-600">{item.note}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-emerald-700">
                <TrendingUp className="h-4 w-4" />
                {item.score}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
