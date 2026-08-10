import { X, Star, Sparkles, ShoppingBag } from 'lucide-react'

export default function CompareProductsModal({ isOpen, onClose, products = [] }) {
  if (!isOpen || !products || products.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all">
      <div className="relative w-full max-w-4xl rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> Side-by-Side Product Comparison
            </div>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">Compare Skincare Formulations</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="mt-6 overflow-x-auto flex-1 pr-1">
          <div className="grid grid-cols-3 gap-6 min-w-[650px]">
            {products.map((product, idx) => (
              <div key={idx} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm space-y-4">
                <div>
                  <div className="h-36 overflow-hidden rounded-xl bg-slate-900">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{product.brand}</span>
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-500" /> {product.rating}
                    </span>
                  </div>
                  <h4 className="mt-1 text-base font-bold text-slate-900 leading-tight">{product.name}</h4>

                  {/* AI Recommendation Match Score */}
                  <div className="mt-3 rounded-xl bg-emerald-500/10 p-2.5 border border-emerald-500/20 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">AI Compatibility Match</span>
                    <span className="text-sm font-extrabold text-emerald-700">{product.aiMatchScore || '96%'}</span>
                  </div>

                  {/* Feature Rows */}
                  <div className="mt-4 space-y-3 text-xs border-t border-slate-200 pt-3">
                    <div>
                      <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Price</p>
                      <p className="text-sm font-extrabold text-slate-900">{product.price}</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Best For</p>
                      <p className="text-slate-600 font-medium">{product.bestFor}</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Active Ingredients</p>
                      <p className="text-emerald-700 font-semibold">{product.ingredients}</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Key Benefits</p>
                      <p className="text-slate-500 leading-snug">{product.benefits || 'Dermatologist tested formula.'}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Buy placeholder clicked for ${product.name}`)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-sm"
                >
                  <ShoppingBag className="h-4 w-4" /> Buy Now ({product.price})
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  )
}
