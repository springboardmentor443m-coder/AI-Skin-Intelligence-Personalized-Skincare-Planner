import { X, Sparkles, AlertTriangle, Clock, CheckCircle, Info } from 'lucide-react'
import { getIngredientDetail } from '../data/ingredientDatabase'

export default function IngredientModal({ ingredientName, isOpen, onClose }) {
  if (!isOpen || !ingredientName) return null

  const detail = getIngredientDetail(ingredientName)
  if (!detail) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all">
      <div className="relative w-full max-w-lg rounded-[2rem] bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Ingredient Intelligence</span>
              <h3 className="text-xl font-extrabold text-slate-900">{detail.name}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Breakdown */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          
          {/* Active Formula Tag */}
          <div className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            Formula Concentration: {detail.activePercentage}
          </div>

          {/* Why Recommended */}
          <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" /> Why This Ingredient Was Recommended
            </h4>
            <p className="mt-1.5 text-xs text-emerald-950 leading-relaxed">{detail.whyRecommended}</p>
          </div>

          {/* Suitable For & Avoid If */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Suitable For
              </h4>
              <ul className="mt-2 text-xs text-slate-600 space-y-1">
                {detail.suitableFor.map((item, idx) => (
                  <li key={idx}>✓ {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-rose-50/60 p-4 border border-rose-200">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Avoid If
              </h4>
              <ul className="mt-2 text-xs text-rose-900 space-y-1">
                {detail.avoidIf.map((item, idx) => (
                  <li key={idx}>✕ {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Timing & Side Effects */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-200">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-600" /> Best Time to Use
              </h4>
              <p className="mt-1 text-xs text-amber-950">{detail.bestTimeToUse}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-500" /> Potential Side Effects
              </h4>
              <p className="mt-1 text-xs text-slate-600">{detail.sideEffects}</p>
            </div>
          </div>

          {/* Scientific Explanation */}
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Scientific Dermatological Mechanism</h4>
            <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">{detail.scientificExplanation}</p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  )
}
