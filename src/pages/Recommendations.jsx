import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Star, SlidersHorizontal, CheckSquare, Square, Info, Search, Award } from 'lucide-react'
import { fetchAnalysisHistoryFromAPI } from '../utils/skincareStorage'
import { CONDITIONS, CATEGORIES, getProductsForCondition } from '../data/productsDatabase'
import IngredientModal from '../components/IngredientModal'
import CompareProductsModal from '../components/CompareProductsModal'

export default function Recommendations() {
  const [selectedCondition, setSelectedCondition] = useState('Acne')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedBrand, setSelectedBrand] = useState('All Brands')
  const [selectedSkinTypeFilter, setSelectedSkinTypeFilter] = useState('All Skin Types')
  const [maxPrice, setMaxPrice] = useState(50)
  const [ingredientSearch, setIngredientSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [selectedForCompare, setSelectedForCompare] = useState([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  // Ingredient Intelligence Modal State
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const history = await fetchAnalysisHistoryFromAPI()
      const condition = history.length > 0 ? history[0].disease : 'Acne'
      if (CONDITIONS.includes(condition)) {
        setSelectedCondition(condition)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const currentProducts = getProductsForCondition(selectedCondition)

  // Extract unique brands for brand filter
  const availableBrands = ['All Brands', ...new Set(currentProducts.map((p) => p.brand))]

  const toggleCompare = (product) => {
    setSelectedForCompare((prev) => {
      const exists = prev.some((p) => p.id === product.id)
      if (exists) {
        return prev.filter((p) => p.id !== product.id)
      } else {
        if (prev.length >= 3) {
          alert('You can compare up to 3 products at a time.')
          return prev
        }
        return [...prev, product]
      }
    })
  }

  const openIngredientInfo = (ingName) => {
    setSelectedIngredient(ingName)
    setIsIngredientModalOpen(true)
  }

  // Filter pipeline
  const filteredProducts = currentProducts
    .filter((p) => selectedCategory === 'All Categories' || p.category === selectedCategory)
    .filter((p) => selectedBrand === 'All Brands' || p.brand === selectedBrand)
    .filter((p) => selectedSkinTypeFilter === 'All Skin Types' || p.skinType.includes(selectedSkinTypeFilter))
    .filter((p) => p.numericPrice <= maxPrice)
    .filter((p) => {
      if (!ingredientSearch.trim()) return true
      const q = ingredientSearch.toLowerCase()
      return p.activeIngredients.some((ing) => ing.toLowerCase().includes(q))
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
              <Sparkles className="h-4 w-4" /> Scalable Dynamic Recommendation Engine
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Targeted Skincare Catalog
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              Science-backed formulations dynamically matched to active skin condition indicators, budget parameters, and barrier requirements.
            </p>
          </div>

          {selectedForCompare.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-slate-800 transition shrink-0"
            >
              <CheckSquare className="h-4 w-4 text-emerald-400" />
              Compare Products ({selectedForCompare.length})
            </button>
          )}
        </div>

        {/* Condition Selector Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Target Condition:</p>
          <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
            {CONDITIONS.map((cond) => (
              <button
                key={cond}
                onClick={() => setSelectedCondition(cond)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                  selectedCondition === cond
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-3 flex overflow-x-auto gap-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced Filters Toolbar */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          
          {/* Budget Range Slider */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex justify-between font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600" /> Max Budget:
              </span>
              <span className="text-emerald-700 font-extrabold">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Brand Filter */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-center">
            <span className="font-bold text-slate-700 mb-1">Brand:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl p-1.5 font-semibold text-slate-800 outline-none"
            >
              {availableBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Suitable Skin Type */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-center">
            <span className="font-bold text-slate-700 mb-1">Skin Type:</span>
            <select
              value={selectedSkinTypeFilter}
              onChange={(e) => setSelectedSkinTypeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl p-1.5 font-semibold text-slate-800 outline-none"
            >
              <option value="All Skin Types">All Skin Types</option>
              <option value="Oily">Oily Skin</option>
              <option value="Dry">Dry Skin</option>
              <option value="Sensitive">Sensitive Skin</option>
              <option value="Combination">Combination Skin</option>
            </select>
          </div>

          {/* Ingredient Search Filter */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-center">
            <span className="font-bold text-slate-700 mb-1">Search Active Ingredient:</span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="e.g. Salicylic, Niacinamide"
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                className="w-full bg-transparent font-medium outline-none text-slate-800"
              />
            </div>
          </div>

        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 animate-pulse rounded-[1.75rem] bg-white border border-slate-200" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-slate-500 space-y-3">
          <p className="text-sm font-semibold">No products match your active filters.</p>
          <button
            type="button"
            onClick={() => {
              setMaxPrice(60)
              setSelectedCategory('All Categories')
              setSelectedBrand('All Brands')
              setSelectedSkinTypeFilter('All Skin Types')
              setIngredientSearch('')
            }}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Product Cards Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isCompared = selectedForCompare.some((p) => p.id === product.id)
            return (
              <motion.div
                key={product.id}
                whileHover={{ y: -4 }}
                className={`flex flex-col justify-between rounded-[1.75rem] border bg-white p-5 shadow-sm transition-all ${
                  isCompared ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-400 hover:shadow-lg'
                }`}
              >
                <div>
                  <div className="relative h-48 overflow-hidden rounded-2xl bg-slate-900">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    
                    <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white">
                      {product.category}
                    </span>

                    {/* AI Recommendation Score Badge */}
                    <span className="absolute top-3 right-3 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-white flex items-center gap-1 shadow-md">
                      <Sparkles className="h-3 w-3" /> AI Matched
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-700">{product.brand}</span>
                    <span className="flex items-center gap-1 font-extrabold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {product.rating}
                    </span>
                  </div>

                  <h3 className="mt-1.5 text-base font-bold text-slate-900 leading-snug">{product.name}</h3>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      {product.skinType}
                    </span>
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {product.timeOfDay}
                    </span>
                  </div>

                  {/* Why AI Recommends */}
                  <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
                    <p className="text-[10px] font-extrabold uppercase text-emerald-700 flex items-center gap-1">
                      <Award className="h-3 w-3" /> Why AI Recommends:
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{product.whyAIRecommends}</p>
                  </div>

                  {/* Benefits & Instructions */}
                  <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                    <p className="font-bold text-slate-800">Key Benefits:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {product.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Active Ingredients Click */}
                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <p className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>Active Ingredients:</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">(Click for Science)</span>
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {product.activeIngredients.map((ing, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => openIngredientInfo(ing)}
                          className="rounded bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 transition border border-emerald-200 flex items-center gap-1"
                        >
                          <Info className="h-2.5 w-2.5" /> {ing}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold text-slate-900">{product.price}</span>
                    <button
                      type="button"
                      onClick={() => alert(`Redirecting to store placeholder for ${product.name}`)}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-sm"
                    >
                      Buy Now
                    </button>
                  </div>

                  {/* Checkbox to Compare */}
                  <button
                    type="button"
                    onClick={() => toggleCompare(product)}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition border ${
                      isCompared
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {isCompared ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                    <span>{isCompared ? 'Added to Compare' : 'Add to Compare'}</span>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Ingredient Intelligence Breakdown Modal */}
      <IngredientModal
        ingredientName={selectedIngredient}
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
      />

      {/* Side-by-Side Product Comparison Modal */}
      <CompareProductsModal
        products={selectedForCompare}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  )
}
