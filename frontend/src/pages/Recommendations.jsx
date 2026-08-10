import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Sparkles, 
  ShieldCheck, 
  Star, 
  Tags, 
  SlidersHorizontal, 
  ArrowRightLeft, 
  X,
  TrendingDown,
  ShoppingBag,
  DollarSign
} from 'lucide-react';

export const Recommendations = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loadingAlts, setLoadingAlts] = useState(false);

  // Filters state
  const [activeCategory, setActiveCategory] = useState(''); // All, cleanser, toner, serum, moisturizer, sunscreen
  const [budgetLevel, setBudgetLevel] = useState(''); // All, budget, midrange, premium
  const [maxPrice, setMaxPrice] = useState(35); // Max catalog price

  const categories = [
    { value: '', label: 'All Steps' },
    { value: 'cleanser', label: 'Cleansers' },
    { value: 'toner', label: 'Toners' },
    { value: 'serum', label: 'Serums' },
    { value: 'moisturizer', label: 'Moisturizers' },
    { value: 'sunscreen', label: 'Sunscreens' }
  ];

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (budgetLevel) params.budget_level = budgetLevel;
      if (maxPrice < 35) params.max_price = maxPrice;

      const response = await api.get('/recommendation', { params });
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeCategory, budgetLevel, maxPrice]);

  const handleOpenAlternatives = async (product) => {
    setSelectedProduct(product);
    setLoadingAlts(true);
    try {
      const response = await api.get(`/recommendation/alternatives/${product.id}`);
      setAlternatives(response.data);
    } catch (err) {
      console.error('Failed to fetch alternatives:', err);
    } finally {
      setLoadingAlts(false);
    }
  };

  const handleCloseAlternatives = () => {
    setSelectedProduct(null);
    setAlternatives([]);
  };

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${
            i < floor 
              ? 'text-amber-500 fill-amber-500' 
              : 'text-slate-350 dark:text-slate-700'
          }`} 
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          AI Product Recommendation Engine
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tailored skincare catalog matched dynamically to your dry/oily skin concerns. Strict allergy-checked formulas.
        </p>
      </div>

      {/* Filters Catalog Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Selector */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setActiveCategory(c.value)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  activeCategory === c.value
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Sliders and Budget Selectors */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Budget Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <button
                onClick={() => setBudgetLevel('')}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all duration-150 cursor-pointer ${
                  budgetLevel === '' 
                    ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-500'
                }`}
              >
                All Prices
              </button>
              <button
                onClick={() => setBudgetLevel('budget')}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all duration-150 cursor-pointer ${
                  budgetLevel === 'budget' 
                    ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-500'
                }`}
              >
                &lt; $15
              </button>
              <button
                onClick={() => setBudgetLevel('midrange')}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all duration-150 cursor-pointer ${
                  budgetLevel === 'midrange' 
                    ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-500'
                }`}
              >
                $15-$25
              </button>
              <button
                onClick={() => setBudgetLevel('premium')}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all duration-150 cursor-pointer ${
                  budgetLevel === 'premium' 
                    ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-500'
                }`}
              >
                $25+
              </button>
            </div>

            {/* Price Slider */}
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-500" />
              <div className="flex items-center gap-2">
                <span>Max: ${maxPrice}</span>
                <input
                  type="range"
                  min="10"
                  max="35"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
            </div>

          </div>

        </div>
      </Card>

      {/* Recommended Catalog grid */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
        </div>
      )}

      {!loading && products.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-24 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 rounded-2xl">
          <ShoppingBag className="w-12 h-12 text-slate-350 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching products found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Try resetting your budget levels, or widening your maximum price limit.
          </p>
        </Card>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod, index) => {
            // Check if product matching skin type
            const matchesSkin = user?.profile?.skin_type?.toLowerCase() === prod.skin_type.toLowerCase();
            
            return (
              <div
                key={prod.id}
                className="animate-slide-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Card 
                  glass 
                  className="h-full flex flex-col justify-between hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 border border-slate-200/60 dark:border-slate-800/40 relative overflow-hidden group hover:border-brand-500/20"
                >
                  {/* Glowing background ring */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors" />

                  <div className="space-y-3">
                    {/* Badges bar */}
                    <div className="flex flex-wrap gap-1.5 items-center justify-between">
                      <span className="px-2 py-0.5 bg-brand-100/50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-extrabold text-[9px] rounded-lg uppercase tracking-wider">
                        {prod.category}
                      </span>
                      
                      <div className="flex gap-1">
                        {matchesSkin && (
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[8px] rounded uppercase">
                            Skin Type Match
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[8px] rounded uppercase flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-sky-500 shrink-0" /> Safe
                        </span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{prod.brand}</span>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-brand-500 transition-colors">
                        {prod.name}
                      </h4>
                    </div>

                    {/* Rating Review */}
                    <div className="flex items-center gap-2">
                      {renderStars(prod.rating)}
                      <span className="text-[10px] font-bold text-slate-400">({prod.rating})</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {prod.description}
                    </p>

                    {/* Ingredients Checklist */}
                    <div className="text-[10px] text-slate-400 font-medium">
                      <strong className="text-slate-500">Key Ingredients: </strong>
                      <span className="truncate block mt-0.5">{prod.ingredients}</span>
                    </div>
                  </div>

                  {/* Pricing and Action Drawer Trigger */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-bold text-slate-400">$</span>
                      <span className="text-base font-black text-slate-800 dark:text-slate-50">{prod.price.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => handleOpenAlternatives(prod)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-brand-500 hover:text-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:shadow-md hover:shadow-brand-500/10 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Swap / Alt
                    </button>
                  </div>

                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Alternative Products Drawer (Slide-in) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Glass background overlay */}
          <div 
            onClick={handleCloseAlternatives}
            className="absolute inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-md h-full bg-white dark:bg-[#0E0E14] shadow-2xl p-6 flex flex-col justify-between animate-slide-in overflow-y-auto border-l border-slate-200 dark:border-slate-800">
            
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-brand-500 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-brand-500" /> Cheaper Alternatives
                  </h3>
                  <p className="text-[10px] text-slate-400">Comparing options in category "{selectedProduct.category}"</p>
                </div>
                
                <button 
                  onClick={handleCloseAlternatives}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Baseline Product display */}
              <div className="p-3 bg-brand-50/50 dark:bg-slate-900/40 border border-brand-100/50 dark:border-slate-800/40 rounded-xl space-y-1">
                <span className="text-[8px] font-black uppercase text-brand-500 tracking-widest">Base Selection</span>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">{selectedProduct.brand} - {selectedProduct.name}</h4>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Category Pricing:</span>
                  <span className="text-slate-800 dark:text-slate-100 font-extrabold">${selectedProduct.price.toFixed(2)}</span>
                </div>
              </div>

              {/* Alternatives List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available safe swaps:</h4>
                
                {loadingAlts && (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
                  </div>
                )}

                {!loadingAlts && alternatives.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs font-semibold bg-slate-50 dark:bg-slate-900/20 rounded-xl p-4 border border-dashed border-slate-200 dark:border-slate-800">
                    No cheaper alternatives found in this category. Your current choice is already the most budget-friendly safe option!
                  </div>
                )}

                {!loadingAlts && alternatives.map((alt, idx) => {
                  const savings = selectedProduct.price - alt.price;
                  return (
                    <div 
                      key={alt.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/20 rounded-xl space-y-3 transition-colors group relative overflow-hidden"
                    >
                      {/* Savings tag indicator */}
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[8px] px-2 py-0.5 rounded-bl-xl uppercase tracking-wider">
                        Save ${savings.toFixed(2)}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{alt.brand}</span>
                        <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 pr-12 group-hover:text-emerald-500 transition-colors">
                          {alt.name}
                        </h5>
                        <div className="flex items-center gap-2 pt-0.5">
                          {renderStars(alt.rating)}
                          <span className="text-[9px] font-bold text-slate-400">({alt.rating})</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {alt.description}
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850">
                        <div className="flex items-baseline gap-0.5 text-slate-800 dark:text-slate-150">
                          <span className="text-[10px] font-bold">$</span>
                          <span className="text-sm font-black">{alt.price.toFixed(2)}</span>
                        </div>
                        
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] rounded uppercase flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" /> Allergy Safe
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button 
              onClick={handleCloseAlternatives}
              variant="outline" 
              className="w-full mt-6"
            >
              Done / Close Comparison
            </Button>

          </div>
        </div>
      )}
    </div>
  );
};
export default Recommendations;
