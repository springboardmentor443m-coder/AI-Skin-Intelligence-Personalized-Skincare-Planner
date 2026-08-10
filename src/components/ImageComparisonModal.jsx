import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

export default function ImageComparisonModal({ scanBefore, scanAfter, onClose }) {
  if (!scanBefore || !scanAfter) return null

  // Calculate changes
  const confBefore = parseFloat(scanBefore.confidence || '90')
  const confAfter = parseFloat(scanAfter.confidence || '90')
  const confDiff = (confAfter - confBefore).toFixed(1)

  const dateBeforeStr = new Date(scanBefore.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const dateAfterStr = new Date(scanAfter.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  const isImproved = scanAfter.disease === 'Normal' || confAfter >= confBefore

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" /> Healthcare Image Comparison
              </div>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Before & After Recovery Progress</h2>
              <p className="text-xs text-slate-500">Visual scan alignment and clinical AI change metrics</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Visual Comparison Grid */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Before Scan */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between pb-3">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  BEFORE ({dateBeforeStr})
                </span>
                <span className="text-xs font-medium text-slate-500">Initial Scan</span>
              </div>
              <div className="relative h-64 overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                {scanBefore.image ? (
                  <img src={scanBefore.image} alt="Before scan" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">No Image Preview</div>
                )}
              </div>
              <div className="mt-4 rounded-xl bg-white p-3.5 shadow-sm border border-slate-200/80">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Condition</p>
                <p className="text-lg font-bold text-slate-900">{scanBefore.disease}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Confidence Score:</span>
                  <span className="font-semibold text-slate-800">{scanBefore.confidence}</span>
                </div>
              </div>
            </div>

            {/* After Scan */}
            <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="flex items-center justify-between pb-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  LATEST ({dateAfterStr})
                </span>
                <span className="text-xs font-medium text-emerald-700">Follow-up Scan</span>
              </div>
              <div className="relative h-64 overflow-hidden rounded-xl border border-emerald-300 bg-slate-900">
                {scanAfter.image ? (
                  <img src={scanAfter.image} alt="After scan" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">No Image Preview</div>
                )}
              </div>
              <div className="mt-4 rounded-xl bg-white p-3.5 shadow-sm border border-emerald-200">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Condition</p>
                <p className="text-lg font-bold text-slate-900">{scanAfter.disease}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Confidence Score:</span>
                  <span className="font-semibold text-emerald-700">{scanAfter.confidence}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change & Progress Summary */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Comparison Metrics</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-4 border border-white/10">
                <p className="text-xs text-slate-400">Prediction Shift</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <span>{scanBefore.disease}</span>
                  <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300">{scanAfter.disease}</span>
                </div>
              </div>

              <div className="rounded-xl bg-white/10 p-4 border border-white/10">
                <p className="text-xs text-slate-400">Confidence Change</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {confDiff > 0 ? `+${confDiff}%` : `${confDiff}%`}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4 border border-white/10">
                <p className="text-xs text-slate-400">Improvement Indicator</p>
                <div className="mt-2 flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isImproved ? 'Calmer Barrier (+15%)' : 'Monitoring Progress'}</span>
                </div>
              </div>
            </div>

            {/* Timeline & Recovery Bar */}
            <div className="mt-5 rounded-xl bg-white/5 p-4 border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Recovery Timeline</span>
                <span className="font-semibold text-emerald-300">75% Restored</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Skin barrier inflammation has decreased significantly between {dateBeforeStr} and {dateAfterStr}. Continue morning barrier hydration and nightly gentleness.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Done Comparing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
