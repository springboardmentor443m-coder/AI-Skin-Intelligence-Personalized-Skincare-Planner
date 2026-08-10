import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History as HistoryIcon, Trash2, ArrowRightLeft, ExternalLink, Calendar, ShieldCheck, Search, Filter, Download, LayoutList, Grid } from 'lucide-react'
import { fetchAnalysisHistoryFromAPI, deleteAnalysisRecord } from '../utils/skincareStorage'
import ImageComparisonModal from '../components/ImageComparisonModal'
import { generateClinicalPDFReport } from '../utils/reportGenerator'
import { useAuth } from '../auth/useAuth'
import { useNavigate } from 'react-router-dom'

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [historyItems, setHistoryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedForCompare, setSelectedForCompare] = useState([])
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState(null)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [confidenceFilter, setConfidenceFilter] = useState('All')
  const [viewMode, setViewMode] = useState('timeline') // 'timeline' or 'grid'

  useEffect(() => {
    async function loadHistory() {
      setLoading(true)
      const data = await fetchAnalysisHistoryFromAPI()
      setHistoryItems(data)
      setLoading(false)
    }
    loadHistory()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scan from your history?')) return
    const updated = await deleteAnalysisRecord(id)
    setHistoryItems(updated)
    setSelectedForCompare((prev) => prev.filter((item) => item.id !== id))
  }

  const toggleCompare = (item) => {
    setSelectedForCompare((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      if (exists) {
        return prev.filter((i) => i.id !== item.id)
      }
      if (prev.length >= 2) {
        return [prev[1], item] // Keep last 2
      }
      return [...prev, item]
    })
  }

  const handleExportPDF = (item) => {
    generateClinicalPDFReport({
      userName: user?.full_name || user?.name || 'Patient Profile',
      userEmail: user?.email || '',
      predictionResult: item,
      healthScore: 88,
      date: new Date(item.date).toLocaleDateString(),
    })
  }

  const filteredItems = historyItems
    .filter((item) => {
      const q = searchQuery.toLowerCase()
      const dis = (item.disease || '').toLowerCase()
      const dateStr = (item.date || '').toLowerCase()
      return dis.includes(q) || dateStr.includes(q)
    })
    .filter((item) => {
      if (confidenceFilter === 'High') {
        const confNum = parseFloat((item.confidence || '0').replace('%', ''))
        return confNum >= 90
      }
      return true
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <HistoryIcon className="h-3.5 w-3.5" /> Timeline Records
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Skin Analysis History</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Track your past skin scans, compare progress side-by-side, and export medical PDF reports.
            </p>
          </div>

          {selectedForCompare.length === 2 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 shrink-0"
            >
              <ArrowRightLeft className="h-4 w-4" /> Compare Selected Scans (2)
            </button>
          )}
        </div>

        {/* Search, Filter & View Controls */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by condition or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent font-medium outline-none text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Confidence Scores</option>
                <option value="High">High Confidence (&ge;90%)</option>
              </select>
            </div>

            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                title="Timeline View"
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-[1.5rem] bg-white border border-slate-200 p-5" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="rounded-full bg-slate-100 p-4 text-slate-400">
            <HistoryIcon className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No Matching Scans</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Perform a new skin analysis to add records to your personal timeline.
          </p>
          <button
            onClick={() => navigate('/analysis')}
            className="mt-6 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 shadow-sm text-xs"
          >
            Start Skin Analysis
          </button>
        </div>
      ) : (
        /* Timeline vs Grid Cards Layout */
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          <AnimatePresence>
            {filteredItems.map((item, idx) => {
              const isSelected = selectedForCompare.some((i) => i.id === item.id)
              const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className={`group relative flex flex-col justify-between rounded-[1.5rem] border p-5 shadow-sm transition-all ${
                    viewMode === 'timeline' ? 'sm:flex-row sm:items-center' : ''
                  } ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail Image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-inner">
                      {item.image ? (
                        <img src={item.image} alt={item.disease} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-slate-400 font-medium">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {idx === 0 ? 'Latest Scan' : `Scan #${historyItems.length - idx}`}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="h-3 w-3" /> {formattedDate}
                        </span>
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">{item.disease}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-emerald-600">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> {item.confidence}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 sm:pt-0">
                    <button
                      onClick={() => toggleCompare(item)}
                      className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      {isSelected ? 'Selected' : 'Compare'}
                    </button>

                    <button
                      onClick={() => handleExportPDF(item)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      title="Export PDF Report"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-600" /> PDF
                    </button>

                    <button
                      onClick={() => setSelectedDetail(item)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> Details
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete scan record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparisonModal && selectedForCompare.length === 2 && (
        <ImageComparisonModal
          scanBefore={selectedForCompare[0]}
          scanAfter={selectedForCompare[1]}
          onClose={() => setShowComparisonModal(false)}
        />
      )}

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Scan Record Detail
                </span>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{selectedDetail.disease}</h2>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
                ✕
              </button>
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-700">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span>Confidence Score</span>
                <span className="font-bold text-emerald-600">{selectedDetail.confidence}</span>
              </div>
              {selectedDetail.recommendation && (
                <div className="space-y-3 rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Clinical Description</p>
                  <p className="text-sm leading-relaxed text-slate-200">
                    {typeof selectedDetail.recommendation === 'object'
                      ? selectedDetail.recommendation.description
                      : String(selectedDetail.recommendation)}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => handleExportPDF(selectedDetail)}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-600 transition"
              >
                <Download className="h-4 w-4" /> Download PDF Report
              </button>
              <button onClick={() => setSelectedDetail(null)} className="rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
