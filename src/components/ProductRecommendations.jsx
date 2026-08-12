import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  ArrowRightLeft,
  X,
  ExternalLink,
  Check,
  Sparkles,
} from 'lucide-react';

export const ProductRecommendations = ({
  products,
  userProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [comparingProducts, setComparingProducts] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const categoriesList = [
    'all',
    'Face Wash',
    'Serum',
    'Moisturizer',
    'Sunscreen',
    'Night Care',
    'Face Masks',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.composition && p.composition.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.keyIngredients.some((i) => i.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesBudget = selectedBudget === 'all' || p.budgetTier === selectedBudget;

    return matchesSearch && matchesCategory && matchesBudget;
  });

  const toggleCompare = (product) => {
    if (comparingProducts.find((p) => p.id === product.id)) {
      setComparingProducts(comparingProducts.filter((p) => p.id !== product.id));
    } else {
      if (comparingProducts.length < 3) {
        setComparingProducts([...comparingProducts, product]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner - Aqua Apple Glass Header */}
      <div className="aqua-gradient-bg rounded-3xl p-6 text-white shadow-xl border border-cyan-300/40 aqua-glow relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-white border border-white/30">
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-200" />
            <span>Indian E-Commerce Skincare Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Active Chemical Compositions & Indian Store Catalog
          </h2>
          <p className="text-xs sm:text-sm text-cyan-50 font-medium max-w-2xl">
            Curated active chemical compositions sourced from top Indian e-commerce sites (Nykaa, Amazon India, Flipkart, Minimalist, Derma Co) suited for {userProfile.skinType || 'Combination'} skin.
          </p>
        </div>

        {comparingProducts.length > 0 && (
          <button
            onClick={() => setShowComparisonModal(true)}
            className="px-5 py-2.5 bg-white/90 hover:bg-white text-cyan-900 font-bold text-xs rounded-2xl shadow-md flex items-center space-x-2 transition-all active:scale-95 shrink-0"
          >
            <ArrowRightLeft className="w-4 h-4 text-cyan-700" />
            <span>Compare ({comparingProducts.length}) Compositions</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="apple-glass rounded-3xl p-5 border border-cyan-200/60 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-cyan-700" />
            <input
              type="text"
              placeholder="Search chemical composition or Indian store (e.g. Salicylic Acid, Nykaa, Niacinamide)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-xs border border-cyan-200 bg-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium text-slate-900"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-cyan-700" />
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="px-3.5 py-2.5 text-xs border border-cyan-200 rounded-2xl bg-white/80 font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Indian Price Tiers (₹, ₹₹)</option>
              <option value="₹">Under ₹500 (Budget)</option>
              <option value="₹₹">₹500 - ₹999 (Mid-range)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-cyan-100">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-white/80 text-slate-700 hover:bg-cyan-100/60 border border-cyan-100'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((p) => {
          const isComparing = comparingProducts.some((c) => c.id === p.id);
          return (
            <div
              key={p.id}
              className="apple-glass rounded-3xl p-5 border border-cyan-200/60 shadow-md hover:border-cyan-400 transition-all flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-widest bg-cyan-100 px-2.5 py-1 rounded-full">
                    {p.brand}
                  </span>
                  <span className="bg-cyan-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {p.suitabilityScore}% Match
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-slate-900 leading-snug">{p.name}</h4>

                {/* Active Chemical Composition Highlight Box */}
                <div className="bg-cyan-50/90 border border-cyan-200 p-3 rounded-2xl space-y-1">
                  <span className="text-[10px] font-extrabold text-cyan-900 uppercase tracking-wider block flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-cyan-600" />
                    <span>Chemical Composition</span>
                  </span>
                  <p className="text-xs font-bold text-slate-800">{p.composition || p.keyIngredients.join(' + ')}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {p.description}
                </p>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Available On:
                  </span>
                  <span className="text-xs font-bold text-cyan-900 bg-white/90 border border-cyan-200 px-2.5 py-1 rounded-xl inline-block">
                    🛒 {p.storePlatform || 'Nykaa & Amazon India'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xl font-black text-slate-900">₹{p.priceINR || 499}</span>
                  <span className="text-[10px] text-cyan-800 font-bold block">★ {p.rating} Rating</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <a
                    href={p.buyUrl || 'https://www.nykaa.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1 transition-all"
                    title={`Buy on ${p.storePlatform || 'Indian Store'}`}
                  >
                    <span>Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => toggleCompare(p)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                      isComparing
                        ? 'bg-cyan-100 text-cyan-900 border-cyan-400'
                        : 'bg-white text-slate-700 border-cyan-200 hover:bg-cyan-50'
                    }`}
                    title="Compare Compositions"
                  >
                    {isComparing ? <Check className="w-3.5 h-3.5 text-cyan-800" /> : '+ Compare'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Product Comparison Modal */}
      {showComparisonModal && comparingProducts.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="apple-glass rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-cyan-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-100 mb-4">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-5 h-5 text-cyan-700" />
                <h3 className="font-extrabold text-xl text-slate-900">Side-by-Side Chemical Composition Comparison</h3>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="text-slate-500 hover:text-slate-900 p-1 rounded-full hover:bg-cyan-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {comparingProducts.map((prod) => (
                <div key={prod.id} className="p-4 rounded-2xl border border-cyan-200 bg-white/90 space-y-3 shadow-xs">
                  <span className="text-[10px] font-extrabold text-cyan-800 block uppercase">{prod.brand}</span>
                  <h4 className="font-extrabold text-base text-slate-900">{prod.name}</h4>

                  <div className="bg-cyan-50 p-2.5 rounded-xl border border-cyan-200 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-900 block">Chemical Composition:</span>
                    <strong className="text-xs font-bold text-slate-800">{prod.composition || prod.keyIngredients.join(' + ')}</strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 font-medium">Match Score:</span>
                    <strong className="text-cyan-700 block text-base font-bold">{prod.suitabilityScore}% Match</strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 font-medium">Indian Price & Store:</span>
                    <strong className="text-slate-900 block font-bold">₹{prod.priceINR || 499} ({prod.storePlatform || 'Nykaa'})</strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 font-medium">Target Concerns:</span>
                    <p className="text-slate-700 text-[11px] font-medium">{prod.bestForConcerns.join(', ')}</p>
                  </div>

                  <a
                    href={prod.buyUrl || 'https://www.nykaa.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-xs"
                  >
                    <span>Buy on {prod.storePlatform?.split('&')[0] || 'Store'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
