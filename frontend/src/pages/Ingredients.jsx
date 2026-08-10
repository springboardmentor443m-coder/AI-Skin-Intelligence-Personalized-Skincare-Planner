import React, { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Scan, 
  AlertTriangle, 
  ArrowRightLeft,
  ChevronRight,
  ClipboardPaste,
  HelpCircle
} from 'lucide-react';

export const Ingredients = () => {
  const { user } = useAuth();
  const [ingredientsText, setIngredientsText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Sample pre-sets for easy testing
  const sampleProducts = [
    {
      label: "Anti-Acne BHA Treatment",
      ingredients: "Water, Butylene Glycol, Salicylic Acid, Retinol, Alcohol Denat, Glycerin, Sodium Hyaluronate, Fragrance, Phenoxyethanol"
    },
    {
      label: "Soothing Ceramide Serum",
      ingredients: "Water, Centella Asiatica Extract, Glycerin, Ceramide NP, Ceramide AP, Panthenol, Hyaluronic Acid, Xanthan Gum, Allantoin"
    },
    {
      label: "Brightening AHA Toner",
      ingredients: "Water, Glycolic Acid, Vitamin C, Niacinamide, Glycerin, Lactic Acid, Fragrance, Phenoxyethanol"
    }
  ];

  const handleSamplePaste = (text) => {
    setIngredientsText(text);
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!ingredientsText.trim()) {
      setError('Please paste or type an ingredient list first.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResult(null);

    // Artificial tiny delay to let the radar animation play for visual excellence
    await new Promise(resolve => setTimeout(resolve, 1800));

    try {
      const response = await api.post('/ingredient/analyze', {
        ingredients_text: ingredientsText
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Ingredient analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSafetyBadge = (status) => {
    if (status === 'safe') {
      return (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 shadow-md shadow-emerald-500/5">
          <div className="p-2 bg-emerald-500 text-white rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Formula Status</span>
            <p className="text-base font-black uppercase">Clinically Safe</p>
          </div>
        </div>
      );
    }
    if (status === 'caution') {
      return (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-3 shadow-md shadow-amber-500/5">
          <div className="p-2 bg-amber-500 text-white rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Formula Status</span>
            <p className="text-base font-black uppercase">Caution Flagged</p>
          </div>
        </div>
      );
    }
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-center gap-3 shadow-md shadow-rose-500/5">
        <div className="p-2 bg-rose-500 text-white rounded-xl">
          <ShieldX className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Formula Status</span>
          <p className="text-base font-black uppercase">Unsafe / Irritation Risk</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          Ingredient Intelligence Analyzer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Paste product ingredients to instantly parse allergies, skin type contraindications, and active incompatibility pairings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Input text area */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <ClipboardPaste className="w-4 h-4 text-brand-500" />
              Paste Ingredients
            </h3>

            {/* Test presets */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Quick Test Samples:</span>
              <div className="flex flex-col gap-2">
                {sampleProducts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSamplePaste(p.ingredients)}
                    className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-brand-500 transition-colors duration-150 flex items-center justify-between cursor-pointer"
                  >
                    {p.label}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/10 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <textarea
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="Paste ingredients here (separated by commas). E.g. Water, Niacinamide, Retinol, Salicylic Acid, Fragrance..."
                rows={8}
                className="w-full p-4 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 rounded-2xl text-slate-800 dark:text-slate-200 placeholder-slate-400 font-sans resize-none transition-all duration-200 focus:shadow-md"
              />
              
              <Button
                onClick={handleAnalyze}
                isLoading={analyzing}
                className="w-full py-3 shadow-md"
              >
                Analyze Ingredients
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Holographic scanning radar and results display */}
        <div className="lg:col-span-2">
          {/* Radar Scanning Overlay */}
          {analyzing && (
            <Card className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="radar-circle" style={{ animationDelay: '0s' }} />
                <div className="radar-circle" style={{ animationDelay: '1s' }} />
                <div className="radar-circle" style={{ animationDelay: '2s' }} />
                <div className="w-20 h-20 rounded-full bg-brand-500/5 border border-brand-500/20 flex items-center justify-center text-brand-500 shadow-lg shadow-brand-500/10">
                  <Scan className="w-8 h-8 animate-pulse-soft" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Molecular Scanning</span>
                <p className="text-[10px] text-slate-400">Deconstructing pairings & matching allergy records...</p>
              </div>
            </Card>
          )}

          {/* Initial state: Waiting for input */}
          {!analyzing && !result && (
            <Card className="flex flex-col items-center justify-center py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 rounded-2xl">
              <HelpCircle className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Analyzer Awaiting List</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Paste an ingredient deck in the input card or click a sample preset to verify the scanner.
              </p>
            </Card>
          )}

          {/* Results State */}
          {!analyzing && result && (
            <div className="space-y-6">
              {/* Header Safety Banner & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getSafetyBadge(result.safety_status)}
                
                <Card className="flex items-center justify-around py-3">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total parsed</span>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-100">{result.total_ingredients_analyzed}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 text-emerald-500">Safe elements</span>
                    <p className="text-lg font-black text-emerald-500">{result.safe_count}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 text-rose-500">Flagged</span>
                    <p className="text-lg font-black text-rose-500">{result.flagged_count}</p>
                  </div>
                </Card>
              </div>

              {/* Alert logs */}
              {result.alerts.length > 0 && (
                <Card className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <AlertTriangle className="w-4 h-4 text-rose-500" /> Profiling Warnings & Conflicts
                  </h4>
                  <div className="space-y-3">
                    {result.alerts.map((alert, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 border-l-4 rounded-r-xl text-xs space-y-1 ${
                          alert.severity === 'severe' 
                            ? 'bg-rose-500/5 border-rose-500 text-rose-700 dark:text-rose-400' 
                            : 'bg-amber-500/5 border-amber-500 text-amber-700 dark:text-amber-400'
                        } animate-slide-in`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <p className="font-extrabold capitalize">{alert.ingredient}</p>
                        <p className="text-[11px] leading-relaxed opacity-90">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Unsafe active combinations pairings */}
              {result.unsafe_pairings.length > 0 && (
                <Card className="space-y-3 border-l-4 border-rose-500 bg-rose-500/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pb-2 border-b border-rose-100 dark:border-slate-800">
                    <ShieldX className="w-4 h-4 text-rose-500 animate-pulse-soft" /> Severe Chemical Combination Alert
                  </h4>
                  <div className="space-y-4">
                    {result.unsafe_pairings.map((pair, idx) => (
                      <div 
                        key={idx} 
                        className="text-xs space-y-1.5 animate-slide-in"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex items-center gap-2">
                          {pair.actives.map((act, i) => (
                            <span key={i} className="px-2 py-0.5 bg-rose-500 text-white rounded text-[10px] font-black uppercase">
                              {act}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {pair.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recommendations and Swaps table */}
              {result.safe_swaps.length > 0 && (
                <Card className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-500" /> Safe Ingredient Swaps & Swaps Table
                  </h4>
                  <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase">
                        <tr>
                          <th className="p-3 border-b border-slate-200 dark:border-slate-800">Flagged Ingredient</th>
                          <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-emerald-500">Recommended Swap</th>
                          <th className="p-3 border-b border-slate-200 dark:border-slate-800">Clinical Benefit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                        {result.safe_swaps.map((swap, idx) => (
                          <tr 
                            key={idx} 
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 animate-slide-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <td className="p-3 font-semibold text-rose-500 line-through capitalize">{swap.ingredient}</td>
                            <td className="p-3 font-black text-emerald-500">{swap.swap_with}</td>
                            <td className="p-3 text-[11px] leading-relaxed">{swap.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Green indicator if formula is fully cleared */}
              {result.safety_status === 'safe' && (
                <Card className="p-6 text-center space-y-2 border-l-4 border-emerald-500 bg-emerald-500/5">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2 animate-pulse-soft">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Formula Cleared!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    This product contains zero elements matching your reported allergies, conflicts with your skin type, or incompatible active ingredient pairings. It is safe to use!
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Ingredients;
