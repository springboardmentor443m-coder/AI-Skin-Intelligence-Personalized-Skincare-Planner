'use client'

import { ProtectedLayout } from '@/components/protected-layout'
import { useLatestAnalysis, useAnalysisHistory } from '@/hooks/use-skin-analysis'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Calendar, AlertCircle, CheckCircle, Sparkles, Droplets, SunMedium, ShieldCheck } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

const mockData = [
  { date: 'Mon', score: 65 },
  { date: 'Tue', score: 70 },
  { date: 'Wed', score: 68 },
  { date: 'Thu', score: 75 },
  { date: 'Fri', score: 72 },
  { date: 'Sat', score: 78 },
  { date: 'Sun', score: 80 },
]

export default function DashboardPage() {
  const { analysis: latestAnalysis } = useLatestAnalysis()
  const { history } = useAnalysisHistory()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <ProtectedLayout>
      <div className="mx-auto max-w-6xl space-y-8 p-6 sm:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 rounded-[28px] border border-[#f3e3da] bg-[linear-gradient(135deg,#fffdfb_0%,#fff8f3_100%)] p-6 shadow-[0_18px_50px_rgba(59,47,47,0.06)] sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <span className="section-kicker">Skin intelligence overview</span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#3b2f2f] sm:text-4xl">
              Welcome back to your skincare ritual dashboard
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#8a736f] sm:text-base">
              Your analysis history, confidence trends, and next-step recommendations are ready in one calm, premium view.
            </p>
          </div>
          <Link href="/upload" className="premium-button w-full sm:w-auto">
            Analyze Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="glass-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-[#8a736f]">Total analyses</p>
                <h3 className="text-3xl font-semibold text-[#3b2f2f]">{history.length}</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#f8ede7] text-[#d89c8b]">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-[#8a736f]">A steady record of your skin journey</p>
          </motion.div>

          <motion.div variants={item} className="glass-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-[#8a736f]">Latest score</p>
                <h3 className="text-3xl font-semibold text-[#3b2f2f]">{latestAnalysis ? Math.round(latestAnalysis.confidence * 100) : '--'}%</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#fff2eb] text-[#c98b72]">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-[#8a736f]">Confidence score from the latest scan</p>
          </motion.div>

          <motion.div variants={item} className="glass-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-[#8a736f]">Primary concern</p>
                <h3 className="truncate text-lg font-semibold text-[#3b2f2f]">{latestAnalysis?.skin_type || 'Not analyzed'}</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#fff6e7] text-[#d7a35a]">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-[#8a736f]">Based on your most recent scan</p>
          </motion.div>

          <motion.div variants={item} className="glass-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm text-[#8a736f]">Status</p>
                <h3 className="text-lg font-semibold text-[#3b2f2f]">Monitoring</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#eef8f2] text-[#7a9d8e]">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-[#8a736f]">Your routine is actively being tracked</p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            className="glass-card p-6 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#3b2f2f]">Skin health trend</h3>
                <p className="mt-1 text-sm text-[#8a736f]">A soft view of your progress over the last week</p>
              </div>
              <div className="rounded-full border border-[#f3e3da] bg-[#fff8f3] px-3 py-1 text-xs font-medium text-[#8a736f]">
                Weekly insight
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d89c8b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d89c8b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e3da" />
                <XAxis dataKey="date" stroke="#8a736f" />
                <YAxis stroke="#8a736f" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fffdfb',
                    border: '1px solid #f3e3da',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: '#3b2f2f' }}
                />
                <Area type="monotone" dataKey="score" stroke="#d89c8b" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#d89c8b]" />
              <h3 className="text-xl font-semibold text-[#3b2f2f]">Daily essentials</h3>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Hydration', desc: 'Use moisturizer twice daily', icon: Droplets },
                { title: 'Sun protection', desc: 'Apply SPF 30+ every morning', icon: SunMedium },
                { title: 'Consistency', desc: 'Continue weekly analysis', icon: ShieldCheck },
              ].map((tip, i) => {
                const Icon = tip.icon
                return (
                  <div key={i} className="rounded-[16px] border border-[#f3e3da] bg-[#fffdfb] p-3 transition hover:-translate-y-0.5 hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#fff2eb] text-[#d89c8b]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3b2f2f]">{tip.title}</p>
                        <p className="mt-1 text-xs text-[#8a736f]">{tip.desc}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {history.length > 0 && (
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#3b2f2f]">Recent analyses</h3>
                <p className="mt-1 text-sm text-[#8a736f]">A polished journal of your latest skincare check-ins</p>
              </div>
              <Link href="/history" className="text-sm font-medium text-[#d89c8b] transition hover:opacity-80">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {history.slice(0, 3).map((analysis) => (
                <div key={analysis.id} className="flex flex-col gap-3 rounded-[16px] border border-[#f3e3da] bg-[#fffdfb] p-4 transition hover:border-[#d89c8b]/40 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[#3b2f2f]">{analysis.skin_type}</p>
                    <p className="mt-1 text-xs text-[#8a736f]">{new Date(analysis.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-[#d89c8b]">{analysis.confidence.toFixed(2)}%</p>
                      <p className="text-xs text-[#8a736f]">confidence</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#8a736f]" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </ProtectedLayout>
  )
}
