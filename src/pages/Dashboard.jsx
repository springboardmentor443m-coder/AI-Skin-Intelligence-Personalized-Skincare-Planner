import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  Bot,
  History as HistoryIcon,
  Activity,
  ArrowRightLeft,
  PlusCircle,
  PieChart as PieIcon,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useAuth } from '../auth/useAuth'
import { fetchAnalysisHistoryFromAPI } from '../utils/skincareStorage'
import { calculateSkinHealthScore } from '../utils/healthScoreCalculator'
import ProgressChart from '../components/ProgressChart'
import ImageComparisonModal from '../components/ImageComparisonModal'
import NotificationPanel from '../components/NotificationPanel'

const COLORS = ['#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6']

export default function Dashboard() {
  const { user } = useAuth()
  const [allScans, setAllScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCompareModal, setShowCompareModal] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await fetchAnalysisHistoryFromAPI()
      setAllScans(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const userName = user?.full_name || user?.name || 'User'
  const latestScan = allScans.length > 0 ? allScans[0] : null
  const prevScan = allScans.length > 1 ? allScans[1] : null

  // Calculate weighted health score
  const healthMetrics = calculateSkinHealthScore({
    condition: latestScan?.disease || 'Normal',
    sleepHours: 7.5,
    waterIntake: 2.5,
    lifestyle: 'Moderate',
    routineCompletionRate: 85,
  })

  // Condition Distribution Analytics Data for Recharts
  const conditionCounts = {}
  allScans.forEach((s) => {
    const dis = s.disease || 'Normal'
    conditionCounts[dis] = (conditionCounts[dis] || 0) + 1
  })

  const pieData = Object.keys(conditionCounts).map((key) => ({
    name: key,
    value: conditionCounts[key],
  }))

  // Timeline Confidence Bar Chart Data
  const barData = allScans.slice(0, 6).reverse().map((s, idx) => ({
    scan: `Scan ${idx + 1}`,
    disease: s.disease,
    confidence: parseFloat(s.confidence.replace('%', '')) || 85,
  }))

  const avgConfidence = allScans.length > 0
    ? (allScans.reduce((acc, s) => acc + (parseFloat(s.confidence.replace('%', '')) || 85), 0) / allScans.length).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600 p-6 text-white shadow-xl sm:p-8"
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              <span>👋 Welcome Back</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl tracking-tight">
              Hello, {userName}!
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-100 border border-emerald-300/30">
                Skin Health Status: <strong>{healthMetrics.statusTier}</strong>
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white border border-white/20">
                Total Analyses: {allScans.length}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-emerald-50 max-w-xl">
              {latestScan
                ? `Latest AI evaluation detected ${latestScan.disease} (${latestScan.confidence}). Follow your personalized clinical plan below.`
                : 'Run your first skin scan to receive AI diagnostics and a personalized weekly plan.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link
              to="/analysis"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-900 shadow-md transition hover:bg-emerald-50 hover:scale-[1.02]"
            >
              <Camera className="h-4 w-4 text-emerald-600" />
              Analyze Skin
            </Link>
            <Link
              to="/weekly-plan"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950/80 px-5 py-3 text-xs font-bold text-white border border-white/20 backdrop-blur-md transition hover:bg-slate-900 hover:scale-[1.02]"
            >
              <Bot className="h-4 w-4 text-sky-400" />
              Weekly Plan
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500/20 px-5 py-3 text-xs font-bold text-emerald-100 border border-emerald-400/40 backdrop-blur-md transition hover:bg-emerald-500/30 hover:scale-[1.02]"
            >
              <HistoryIcon className="h-4 w-4" />
              View History
            </Link>
          </div>
        </div>
      </motion.section>

      {/* In-App Notifications Bar */}
      <NotificationPanel />

      {/* Main Cards Row */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Weighted Skin Health Score Card */}
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Weighted Health Engine</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Dynamic Clinical Score</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {healthMetrics.statusTier}
            </span>
          </div>

          {loading ? (
            <div className="mt-6 flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Circle Score Display */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[12px] border-emerald-500/20 bg-slate-50 shadow-inner">
                  <span className="text-4xl font-extrabold text-emerald-600">{healthMetrics.score}</span>
                  <span className="absolute bottom-2 text-[10px] font-bold text-slate-400">/ 100</span>
                </div>
                <span className="mt-2 text-xs font-semibold text-slate-500">Clinical Weighted Index</span>
              </div>

              {/* Progress Breakdown Indicators */}
              <div className="flex-1 space-y-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span>Condition Parameter (30%)</span>
                    <span className="font-extrabold text-emerald-600">{healthMetrics.breakdown.conditionScore}/100</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span>Lifestyle & Sleep (30%)</span>
                    <span className="font-extrabold text-indigo-600">{healthMetrics.breakdown.sleepScore}/100</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span>Hydration & Routine (30%)</span>
                    <span className="font-extrabold text-sky-600">{healthMetrics.breakdown.hydrationScore}/100</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Analysis Card */}
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <Activity className="h-5 w-5" />
                <h2 className="text-xl font-bold text-slate-900">Recent Analysis</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {latestScan ? new Date(latestScan.date).toLocaleDateString() : 'No Scans'}
              </span>
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ) : latestScan ? (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disease</p>
                    <p className="text-xl font-extrabold text-slate-900">{latestScan.disease}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</p>
                    <p className="text-lg font-bold text-emerald-600">{latestScan.confidence}</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-600">
                  {latestScan.recommendation?.description || 'AI evaluation stored in your database history.'}
                </p>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-8 text-center">
                <PlusCircle className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-600">No predictions recorded yet</p>
                <Link
                  to="/analysis"
                  className="mt-3 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                >
                  Upload First Image
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
            <Link
              to="/analysis"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Quick View Result
            </Link>

            {prevScan && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Compare Scans
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Grid (Recharts) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Condition Distribution Chart */}
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-emerald-600" /> Condition Distribution Analytics
            </h3>
            <span className="text-xs font-semibold text-slate-500">{allScans.length} Total Records</span>
          </div>

          {pieData.length > 0 ? (
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-8 text-center text-xs text-slate-400">Run skin scans to visualize condition distribution</p>
          )}
        </div>

        {/* Model Confidence & Improvement Trend Chart */}
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Scan Confidence Trend
            </h3>
            <span className="text-xs font-bold text-emerald-600">Avg Confidence: {avgConfidence}%</span>
          </div>

          {barData.length > 0 ? (
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="scan" textAnchor="middle" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="confidence" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-8 text-center text-xs text-slate-400">Scan timeline confidence trends will render here</p>
          )}
        </div>
      </div>

      {/* Progress Chart Visualization */}
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ProgressChart />
      </div>

      {/* Comparison Modal */}
      {showCompareModal && latestScan && prevScan && (
        <ImageComparisonModal
          scanBefore={prevScan}
          scanAfter={latestScan}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  )
}
