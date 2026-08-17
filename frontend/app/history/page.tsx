'use client'

import { useMemo, useState } from 'react'
import { compareAnalyses } from '@/lib/api'
import { ProtectedLayout } from '@/components/protected-layout'
import { useAnalysisHistory } from '@/hooks/use-skin-analysis'
import { motion } from 'framer-motion'
import { Calendar, Filter, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function HistoryPage() {
  const { history, isLoading } = useAnalysisHistory()
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)
  const [filterBy, setFilterBy] = useState<'all' | 'condition'>('all')
  const [compareSelection, setCompareSelection] = useState<string[]>([])
  const [comparison, setComparison] = useState<any>(null)
  const [isComparing, setIsComparing] = useState(false)

  const handleCompare = async () => {
    if (compareSelection.length !== 2) return

    try {
      setIsComparing(true)

      const result = await compareAnalyses(
        compareSelection[0],
        compareSelection[1]
      )

      setComparison(result)
    } catch (error) {
      console.error('Comparison failed:', error)
    } finally {
      setIsComparing(false)
    }
  }

  const sortedHistory = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    )

    if (filterBy === 'condition') {
      return sorted.filter(
        (analysis) => analysis.conditions?.length > 0
      )
    }

    return sorted
  }, [history, filterBy])


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#d89c8b] border-t-transparent"></div>
            <p className="text-[#8a736f]">Loading your skincare journal...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="mx-auto max-w-5xl space-y-8 p-6 sm:p-8 lg:p-10">
        <div className="rounded-[28px] border border-[#f3e3da] bg-[linear-gradient(135deg,#fffdfb_0%,#fff8f3_100%)] p-6 shadow-[0_18px_50px_rgba(59,47,47,0.06)]">
          <span className="section-kicker">Skincare journal</span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#3b2f2f] sm:text-4xl">Your analysis history</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8a736f] sm:text-base">
            Review your progress over time with a calmer, more premium view of each skincare check-in.
          </p>
        </div>

        <div className="glass-card flex flex-wrap items-center gap-3 p-4">
          <Filter className="h-5 w-5 text-[#8a736f]" />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterBy('all')} className={`rounded-full px-4 py-2 text-sm font-medium transition ${filterBy === 'all' ? 'bg-[#d89c8b] text-white shadow-sm' : 'bg-[#fff8f3] text-[#3b2f2f] hover:bg-[#f8ede7]'}`}>
              All results
            </button>
            <button onClick={() => setFilterBy('condition')} className={`rounded-full px-4 py-2 text-sm font-medium transition ${filterBy === 'condition' ? 'bg-[#d89c8b] text-white shadow-sm' : 'bg-[#fff8f3] text-[#3b2f2f] hover:bg-[#f8ede7]'}`}>
              By condition
            </button>
          </div>
        </div>

        {sortedHistory.length === 0 ? (
          <motion.div className="glass-card p-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2eb] text-[#d89c8b]">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-[#3b2f2f]">No analyses yet</h3>
            <p className="mt-2 text-[#8a736f]">Start your first skin analysis to see it appear here.</p>
            <Link href="/upload" className="premium-button mt-6">
              Analyze now
            </Link>
          </motion.div>
        ) : (
          <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
            {sortedHistory.map((analysis) => (
              <motion.div
                key={analysis.id}
                variants={item}
                className={`w-full rounded-[24px] border bg-white/80 p-5 text-left shadow-[0_16px_45px_rgba(59,47,47,0.04)] transition ${
                  compareSelection.includes(String(analysis.id))
                    ? 'border-[#d89c8b] ring-2 ring-[#d89c8b]/20'
                    : 'border-[#f3e3da]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()

                        const id = String(analysis.id)

                        setCompareSelection((current) => {
                          if (current.includes(id)) {
                            return current.filter((item) => item !== id)
                          }

                          if (current.length >= 2) {
                            return current
                          }

                          return [...current, id]
                        })
                      }}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        compareSelection.includes(String(analysis.id))
                          ? 'bg-[#d89c8b] text-white'
                          : 'bg-[#fff2eb] text-[#c98b72] hover:bg-[#f8ede7]'
                      }`}
                    >
                      {compareSelection.includes(String(analysis.id))
                        ? '✓ Selected'
                        : 'Select for comparison'}
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#fff2eb] text-[#d89c8b]">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#3b2f2f]">{analysis.skin_type}</h3>
                        <p className="mt-1 text-sm text-[#8a736f]">{new Date(analysis.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#fff8f3] px-3 py-1 text-xs font-semibold text-[#c98b72]">{analysis.confidence.toFixed(2)}% match</span>
                      {analysis.conditions.slice(0, 3).map((cond, i) => (
                        <span key={i} className="rounded-full border border-[#f3e3da] bg-white px-3 py-1 text-xs font-medium text-[#8a736f]">{cond}</span>
                      ))}
                      {analysis.conditions.length > 3 && <span className="rounded-full bg-[#f8ede7] px-3 py-1 text-xs font-medium text-[#8a736f]">+{analysis.conditions.length - 3} more</span>}
                    </div>
                  </div>
                  <motion.div animate={{ rotate: selectedAnalysis === analysis.id ? 90 : 0 }} className="text-[#8a736f]">
                    <ChevronRight className="h-5 w-5" />
                  </motion.div>
                </div>

                {selectedAnalysis === analysis.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 space-y-4 border-t border-[#f3e3da] pt-6">
                    {Object.entries(analysis.severity_scores).length > 0 && (
                      <div>
                        <p className="mb-3 text-sm font-semibold text-[#3b2f2f]">Severity scores</p>
                        <div className="space-y-2">
                          {Object.entries(analysis.severity_scores).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3">
                              <span className="w-24 text-sm capitalize text-[#8a736f]">{key}</span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f8ede7]">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(value as number) * 100}%` }} transition={{ delay: 0.08, duration: 0.4 }} className="h-full rounded-full bg-gradient-to-r from-[#d89c8b] to-[#f2c6b4]" />
                              </div>
                              <span className="w-12 text-right text-sm font-medium text-[#3b2f2f]">{Math.round((value as number) * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.conditions.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-semibold text-[#3b2f2f]">All conditions</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.conditions.map((cond, i) => (
                            <span key={i} className="rounded-full bg-[#fff8f3] px-3 py-1.5 text-xs font-medium text-[#c98b72]">{cond}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-semibold text-[#3b2f2f]">Recommendations ({analysis.recommendations.length})</p>
                        <div className="space-y-2">
                          {analysis.recommendations.map((rec, i) => (
                            <div key={i} className="rounded-[14px] border border-[#f3e3da] bg-[#fffdfb] p-3 text-sm">
                              <p className="font-semibold text-[#3b2f2f]">{rec.product_type}</p>
                              <p className="mt-1 text-[#8a736f]">{rec.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {sortedHistory.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6 text-center"
          >
            <p className="text-[#8a736f]">
              Select two analyses to compare your progress.
            </p>

            <p className="mt-2 text-sm text-[#c98b72]">
              {compareSelection.length}/2 selected
            </p>

            <button
              type="button"
              className="premium-button mt-4 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={compareSelection.length !== 2 || isComparing}
              onClick={handleCompare}
            >
              {isComparing ? 'Comparing...' : 'Compare results'}
            </button>

            {comparison && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-[24px] border border-[#f3e3da] bg-white p-6 text-left shadow-[0_16px_45px_rgba(59,47,47,0.04)]"
              >
                <h2 className="text-xl font-semibold text-[#3b2f2f]">
                  Comparison Results
                </h2>

                {/* Analysis 1 */}
                <div className="mt-5 rounded-[18px] border border-[#f3e3da] bg-[#fffdfb] p-5">
                  <p className="text-sm font-semibold text-[#8a736f]">
                    Previous Analysis
                  </p>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[#3b2f2f]">
                        {comparison.analysis1.skin_type}
                      </p>

                      <p className="text-sm text-[#8a736f]">
                        {new Date(comparison.analysis1.timestamp).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>

                    <div className="rounded-full bg-[#fff2eb] px-4 py-2 text-sm font-semibold text-[#c98b72]">
                      {comparison.analysis1.confidence.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Analysis 2 */}
                <div className="mt-4 rounded-[18px] border border-[#f3e3da] bg-[#fffdfb] p-5">
                  <p className="text-sm font-semibold text-[#8a736f]">
                    Current Analysis
                  </p>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[#3b2f2f]">
                        {comparison.analysis2.skin_type}
                      </p>

                      <p className="text-sm text-[#8a736f]">
                        {new Date(comparison.analysis2.timestamp).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>

                    <div className="rounded-full bg-[#fff2eb] px-4 py-2 text-sm font-semibold text-[#c98b72]">
                      {comparison.analysis2.confidence.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Comparison Summary */}
                <div className="mt-4 rounded-[18px] border border-[#f3e3da] bg-[#fff8f3] p-5">
                  <p className="text-sm font-semibold text-[#8a736f]">
                    Progress
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#8a736f]">
                        Confidence change
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-[#3b2f2f]">
                        {comparison.comparison.confidence_change > 0 ? '+' : ''}
                        {comparison.comparison.confidence_change.toFixed(2)}%
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#c98b72]">
                      {comparison.comparison.confidence_status}
                    </span>
                  </div>
                </div>

                {/* Conditions Added */}
                {comparison.comparison.conditions_added?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-[#3b2f2f]">
                      Conditions added
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {comparison.comparison.conditions_added.map(
                        (condition: string) => (
                          <span
                            key={condition}
                            className="rounded-full bg-[#fff2eb] px-3 py-1.5 text-xs font-medium text-[#c98b72]"
                          >
                            {condition}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Conditions Removed */}
                {comparison.comparison.conditions_removed?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-[#3b2f2f]">
                      Conditions improved / removed
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {comparison.comparison.conditions_removed.map(
                        (condition: string) => (
                          <span
                            key={condition}
                            className="rounded-full bg-[#f8ede7] px-3 py-1.5 text-xs font-medium text-[#8a736f]"
                          >
                            {condition}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </ProtectedLayout>
  )
}
