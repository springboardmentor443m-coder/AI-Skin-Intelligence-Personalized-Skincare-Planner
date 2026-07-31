import { motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-2 text-sm font-medium text-emerald-700 shadow-sm">
            <BrainCircuit className="h-4 w-4" />
            AI-assisted skincare planning for modern routines
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Understand your skin. Build a smarter routine.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Discover personalized skincare recommendations, track progress over time, and create routines that fit your unique skin profile.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
              View demo dashboard
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="rounded-[1.5rem] bg-slate-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300">Skin health snapshot</p>
                <h2 className="mt-1 text-3xl font-semibold">92/100</h2>
              </div>
              <div className="rounded-full bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-300">Balanced</div>
            </div>
            <div className="mt-6 rounded-2xl bg-white/10 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Hydration</span>
                <span>87%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 w-[87%] rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-slate-300">Recommended routine</p>
                <p className="mt-2 font-semibold">Ceramide + Niacinamide</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-slate-300">Next review</p>
                <p className="mt-2 font-semibold">7 days</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
