import { motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-sm">
            <BrainCircuit className="h-4 w-4" />
            AI-Powered Personalized Skin Care
          </div>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Understand your skin. Build a smarter routine.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Discover personalized skincare recommendations, track progress over time, and receive clinical AI guidance tailored to your skin barrier profile.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={user ? '/analysis' : '/register'}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 hover:scale-[1.02]"
            >
              <span>Start Free Analysis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 hover:scale-[1.02]"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Explore Features</span>
            </a>
          </div>
        </motion.div>

        {/* Interactive Graphic Card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur"
        >
          <div className="rounded-[1.5rem] bg-slate-900 p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Clinical AI Snapshot</p>
                <h2 className="mt-1 text-3xl font-extrabold text-white">92 / 100</h2>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                Optimal Barrier
              </span>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Hydration Index</span>
                <span className="font-bold text-emerald-400">87%</span>
              </div>
              <div className="mt-2.5 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[87%] rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Recommended Active</p>
                <p className="mt-1 text-sm font-bold text-white">Niacinamide 5%</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 border border-white/10">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Weekly Status</p>
                <p className="mt-1 text-sm font-bold text-emerald-300">+8% Improvement</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
