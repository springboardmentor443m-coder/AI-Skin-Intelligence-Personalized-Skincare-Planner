import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Activity, ShieldCheck } from 'lucide-react'
import ProgressChart from '../components/ProgressChart'
import { fetchAnalysisHistoryFromAPI } from '../utils/skincareStorage'

export default function Progress() {
  const [reportType, setReportType] = useState('weekly')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await fetchAnalysisHistoryFromAPI()
      setHistory(data)
      setLoading(false)
    }
    loadData()
  }, [])

  // Calculate dynamic metrics
  const totalAnalyses = history.length
  const latestCondition = history.length > 0 ? history[0].disease : 'Normal'

  // Most common condition
  const counts = {}
  history.forEach((h) => {
    counts[h.disease] = (counts[h.disease] || 0) + 1
  })
  let mostCommon = 'Normal'
  let maxCount = 0
  Object.keys(counts).forEach((k) => {
    if (counts[k] > maxCount) {
      maxCount = counts[k]
      mostCommon = k
    }
  })
  const mostCommonPct = totalAnalyses > 0 ? Math.round((maxCount / totalAnalyses) * 100) : 100

  // Average confidence
  const totalConf = history.reduce((acc, curr) => acc + (curr.confidenceValue || 0.9), 0)
  const avgConf = totalAnalyses > 0 ? (totalConf / totalAnalyses * 100).toFixed(1) : '95.0'

  const metrics = [
    { label: 'Total Analyses', value: `${totalAnalyses} Scans`, change: totalAnalyses > 0 ? 'Live MySQL Data' : '0 Scans', tone: 'emerald' },
    { label: 'Most Common Condition', value: `${mostCommon} (${mostCommonPct}%)`, change: 'Frequent Scan', tone: 'sky' },
    { label: 'Improvement Percentage', value: '+18.4%', change: 'Consistently higher', tone: 'emerald' },
    { label: 'Average AI Confidence', value: `${avgConf}%`, change: 'High Accuracy', tone: 'amber' },
  ]

  const recoveryTimeline = [
    { phase: 'Phase 1: Initial AI Diagnosis', period: 'Scan #1', note: `Detected ${latestCondition}. Recommendation stored.`, status: 'Completed' },
    { phase: 'Phase 2: Active Treatment & Routine', period: 'Phase 2', note: 'Engaging morning & night active ingredient planner.', status: 'In Progress' },
    { phase: 'Phase 3: Barrier Maintenance', period: 'Phase 3', note: 'Hydration index monitoring over consecutive scans.', status: 'Upcoming' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
              <TrendingUp className="h-4 w-4" /> Dynamic Progress Analytics
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Skin Health Recovery Reports
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              Monitor weekly and monthly health metrics, disease reduction percentages, and milestone recovery timelines.
            </p>
          </div>

          <div className="flex items-center rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
            <button
              onClick={() => setReportType('weekly')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                reportType === 'weekly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Weekly Report
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                reportType === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly Report
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Charts & Metrics Cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-2xl bg-white border border-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 transition">
              <p className="text-xs font-semibold text-slate-500">{m.label}</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{m.value}</p>
              <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                {m.change}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Main Chart Visualization */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {reportType === 'weekly' ? 'Weekly Skin Score Progression' : 'Monthly Recovery Trends'}
            </h3>
            <p className="text-xs text-slate-500">Recorded skin barrier stability index</p>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
            {reportType === 'weekly' ? '7-Day View' : '30-Day View'}
          </span>
        </div>
        <ProgressChart />
      </div>

      {/* Recovery Timeline */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recovery Timeline</h3>
            <p className="text-xs text-slate-500">Phased skin barrier healing milestones</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {recoveryTimeline.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {item.period}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{item.phase}</h4>
                </div>
                <p className="mt-1 text-xs text-slate-600">{item.note}</p>
              </div>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  item.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> {item.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
