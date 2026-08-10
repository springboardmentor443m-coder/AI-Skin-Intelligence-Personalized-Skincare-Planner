import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2, ShieldCheck, Cpu, UploadCloud, FileText } from 'lucide-react'

const STAGES = [
  { id: 1, label: 'Uploading Image Matrix', icon: UploadCloud },
  { id: 2, label: 'Detecting Face & Skin Boundaries', icon: ShieldCheck },
  { id: 3, label: 'Preparing Neural Input Tensors', icon: Cpu },
  { id: 4, label: 'Running Clinical TensorFlow Model', icon: Sparkles },
  { id: 5, label: 'Generating Targeted Skincare Plan', icon: FileText },
]

export default function AnalysisProgressModal({ isOpen }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progressPercent, setProgressPercent] = useState(0)

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setTimeout(() => {
      if (isMounted) {
        setCurrentStep(0)
        setProgressPercent(0)
      }
    }, 0)

    // Advance steps dynamically
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep < STAGES.length) {
          return prevStep + 1
        }
        return prevStep
      })
    }, 150)

    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 95) {
          return prev + 15
        }
        return prev
      })
    }, 40)

    return () => {
      clearInterval(interval)
      clearInterval(progressInterval)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-lg p-4 transition-all">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 text-white shadow-2xl text-center"
      >
        {/* Glow Header Icon */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-30" />
          <Sparkles className="h-10 w-10 text-emerald-400 animate-pulse" />
        </div>

        <h3 className="text-xl font-extrabold tracking-tight text-white">Clinical AI Diagnostic Engine</h3>
        <p className="mt-1 text-xs text-slate-400">Analyzing skin features against medical diagnostic parameters</p>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-right text-[11px] font-bold text-emerald-400">{progressPercent}%</p>

        {/* Stages Checklist */}
        <div className="mt-6 space-y-3 text-left">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon
            const isCompleted = idx < currentStep
            const isCurrent = idx === currentStep

            return (
              <div
                key={stage.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                    : isCurrent
                    ? 'bg-slate-800/80 border-slate-700 text-white font-semibold shadow-md'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-slate-700 text-emerald-400 animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs">{stage.label}</span>
                </div>

                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent shrink-0" />
                ) : (
                  <span className="text-[10px] text-slate-600 font-mono">WAITING</span>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-[11px] text-slate-500">
          Powered by Deep Neural Network Diagnostics
        </p>
      </motion.div>
    </div>
  )
}
