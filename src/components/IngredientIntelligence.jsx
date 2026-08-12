import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  AlertTriangle,
  Sparkles,
  Zap,
} from 'lucide-react';

export const IngredientIntelligence = ({
  ingredients,
  userProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customFormulaText, setCustomFormulaText] = useState('Salicylic Acid 2%, Niacinamide 10%, Vitamin C 10%, Glycolic Acid 5%, Retinol');
  const [isAnalyzingFormula, setIsAnalyzingFormula] = useState(false);
  const [formulaAnalysisResult, setFormulaAnalysisResult] = useState(null);

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.benefits.some((b) => b.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAnalyzeCustomFormula = async () => {
    if (!customFormulaText.trim()) return;
    setIsAnalyzingFormula(true);
    try {
      const ingList = customFormulaText.split(',').map((s) => s.trim()).filter(Boolean);
      const response = await fetch('/api/ingredient-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingList,
          userProfile,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setFormulaAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error('Error analyzing formula:', err);
    } finally {
      setIsAnalyzingFormula(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="aqua-gradient-bg rounded-3xl p-6 text-white shadow-xl border border-cyan-300/40 aqua-glow relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-white border border-white/30">
            <FlaskConical className="w-3.5 h-3.5 text-cyan-200" />
            <span>Biochemical Ingredient Safety & Interaction Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Chemical Compositions & Interaction Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-cyan-50 font-medium max-w-2xl">
            Analyze active chemical compositions, detect formulation clashes, and protect skin barrier integrity.
          </p>
        </div>
      </div>

      {/* Formula Clash Detector Tool */}
      <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-cyan-100">
          <Zap className="w-5 h-5 text-cyan-700" />
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Chemical Composition Clash & Layering Detector</h3>
            <p className="text-xs text-slate-600 font-medium">Paste ingredients or active chemical compositions to test compatibility with {userProfile.skinType || 'Combination'} skin</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <textarea
            rows={2}
            value={customFormulaText}
            onChange={(e) => setCustomFormulaText(e.target.value)}
            placeholder="Enter ingredients or compositions separated by commas (e.g. Salicylic Acid 2%, Niacinamide 10%, Retinol)..."
            className="w-full p-3.5 border border-cyan-200 bg-white/90 rounded-2xl font-mono text-xs text-slate-900 focus:outline-none focus:border-cyan-500 font-semibold"
          />

          <button
            onClick={handleAnalyzeCustomFormula}
            disabled={isAnalyzingFormula}
            className="px-5 py-3 aqua-gradient-bg text-white font-bold text-xs rounded-2xl shadow-md flex items-center space-x-2 transition-all disabled:opacity-50 active:scale-95 hover:brightness-110"
          >
            {isAnalyzingFormula ? (
              <span>Gemini AI Checking Chemical Compatibility...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Run AI Ingredient Analysis</span>
              </>
            )}
          </button>

          {formulaAnalysisResult && (
            <div className="p-4 bg-white/90 rounded-2xl border border-cyan-200 space-y-3 mt-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-slate-900">Chemical Compatibility Verdict</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900">
                  Safety Rating: {formulaAnalysisResult.safetyScore || 88}/100
                </span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                {formulaAnalysisResult.overallVerdict}
              </p>

              {formulaAnalysisResult.clashesDetected && formulaAnalysisResult.clashesDetected.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-cyan-100">
                  <span className="font-bold text-amber-700 flex items-center space-x-1 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Incompatible Layering Clashes Detected</span>
                  </span>
                  {formulaAnalysisResult.clashesDetected.map((clash, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
                      <strong className="text-slate-900 block mb-0.5 font-bold">{clash.pair?.join(' + ')}</strong>
                      <p className="text-slate-700 font-medium">{clash.reason}</p>
                      <p className="text-cyan-800 font-bold mt-1">Solution: {clash.solution}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ingredient Knowledge Base */}
      <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Chemical Ingredient Dictionary</h3>
            <p className="text-xs text-slate-500 font-medium">Explore active chemical formulations and barrier safety guidelines</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-cyan-700" />
            <input
              type="text"
              placeholder="Search ingredient (e.g. Salicylic Acid)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3.5 py-2 text-xs border border-cyan-200 bg-white/90 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIngredients.map((ing) => (
            <div key={ing.id} className="p-4 rounded-2xl border border-cyan-100 bg-white/90 space-y-3 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-widest block">
                    {ing.category}
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900">{ing.name}</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900">
                  ★ {ing.safetyRating}/10
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">{ing.description}</p>

              <div>
                <span className="text-[11px] font-bold text-slate-900 block mb-1">Key Skin Benefits:</span>
                <div className="flex flex-wrap gap-1">
                  {ing.benefits.map((b, i) => (
                    <span key={i} className="px-2.5 py-0.5 bg-cyan-50 border border-cyan-100 rounded-lg text-[10px] text-cyan-900 font-bold">
                      • {b}
                    </span>
                  ))}
                </div>
              </div>

              {ing.incompatibleIngredients.length > 0 && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-900">
                  <strong className="block text-rose-700 font-bold mb-0.5">Avoid Mixing With:</strong>
                  <span className="font-medium text-slate-700">{ing.incompatibleIngredients.join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
