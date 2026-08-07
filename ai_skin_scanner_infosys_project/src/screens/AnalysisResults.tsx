import React, { useState, useEffect } from 'react';
import type { ScanMetrics } from '../App';

interface AnalysisResultsProps {
  setScreen: (screen: string) => void;
  scanMetrics: ScanMetrics;
  capturedImage: string | null;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ setScreen, scanMetrics, capturedImage }) => {
  // AI-generated Recommendations states
  const [aiData, setAiData] = useState<{
    summary: string;
    products: { category: string; name: string; brand: string; reason: string }[];
    routine_7_day: any;
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const getProductImage = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('clean')) {
      return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=150&h=150&q=80';
    }
    if (cat.includes('serum') || cat.includes('treatment') || cat.includes('essence')) {
      return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=150&h=150&q=80';
    }
    if (cat.includes('moistur') || cat.includes('cream') || cat.includes('balm')) {
      return 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=150&h=150&q=80';
    }
    if (cat.includes('sun') || cat.includes('spf') || cat.includes('shield') || cat.includes('protect')) {
      return 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=150&h=150&q=80';
    }
    return 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=150&h=150&q=80';
  };

  useEffect(() => {
    setIsLoadingAi(true);
    const storedApiKey = localStorage.getItem('gemini_api_key') || '';
    fetch('http://localhost:5000/api/consultant/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metrics: scanMetrics,
        profile: {
          name: 'Elena Thorne',
          skinType: scanMetrics.skinType
        },
        apiKey: storedApiKey
      })
    })
      .then(res => res.json())
      .then(data => {
        setAiData(data);
        if (data.routine_7_day) {
          localStorage.setItem('ai_skincare_routine_7_day', JSON.stringify(data.routine_7_day));
        }
        if (data.products) {
          localStorage.setItem('ai_products', JSON.stringify(data.products));
        }
        setIsLoadingAi(false);
      })
      .catch(err => {
        console.error("Error fetching AI recommendations:", err);
        setIsLoadingAi(false);
      });
  }, [scanMetrics]);

  const getLevel = (sev: number) => {
    if (sev <= 20) return 'Optimal';
    if (sev <= 40) return 'Mild';
    if (sev <= 70) return 'Moderate';
    return 'High';
  };

  const getColor = (sev: number) => {
    if (sev <= 20) return 'bg-primary';
    if (sev <= 40) return 'bg-emerald-500';
    if (sev <= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const concerns = [
    { name: 'Acne / Congestion', severity: scanMetrics.acne, level: getLevel(scanMetrics.acne), color: getColor(scanMetrics.acne) },
    { name: 'Dryness / Dehydration', severity: scanMetrics.dryness, level: getLevel(scanMetrics.dryness), color: getColor(scanMetrics.dryness) },
    { name: 'Oily Skin (T-Zone Sebum)', severity: scanMetrics.oily, level: getLevel(scanMetrics.oily), color: getColor(scanMetrics.oily) },
    { name: 'Pigmentation / Dark Spots', severity: scanMetrics.pigmentation, level: getLevel(scanMetrics.pigmentation), color: getColor(scanMetrics.pigmentation) },
    { name: 'Redness / Irritation', severity: scanMetrics.redness, level: getLevel(scanMetrics.redness), color: getColor(scanMetrics.redness) },
    { name: 'Fine Lines & Wrinkles', severity: scanMetrics.fineLines, level: getLevel(scanMetrics.fineLines), color: getColor(scanMetrics.fineLines) },
  ];

  const defaultSummary = `Analysis maps a sebum presence of ${scanMetrics.oily}% in your facial T-Zone, causing ${scanMetrics.oily > 60 ? 'pore congestion' : 'minimal shine'}. Concurrently, a redness/irritation level of ${scanMetrics.redness}% is highlighted, suggesting ${scanMetrics.redness > 50 ? 'localized vascular inflammation' : 'normal dermal vascularity'}. Hyperpigmentation indicators are at ${scanMetrics.pigmentation}%, and fine lines represent an index of ${scanMetrics.fineLines}%.`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-primary font-bold tracking-widest text-[10px] uppercase mb-1 block">Dermatological Report</span>
          <h2 className="font-display text-2xl font-bold text-on-surface">Comprehensive Skin Analysis</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Session ID: #AE-29402 • Checked today at 10:42 AM</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setScreen('consultant-chat')}
            className="px-5 py-2.5 rounded-full border border-primary text-primary hover:bg-primary/5 transition-all font-bold text-xs flex items-center gap-2 cursor-pointer bg-white/40 dark:bg-zinc-800/40 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">chat_bubble</span>
            Consult AI Assistant
          </button>
        </div>
      </div>

      {/* Bento Layout */}
      <div className="grid grid-cols-12 gap-card-gap">
        {/* Health Score Circular Dial */}
        <div className="col-span-12 lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col justify-between items-center text-center min-h-[360px] border border-white/20">
          <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider">Skin Health Index</h3>
          
          <div className="relative w-44 h-44 flex items-center justify-center my-4">
            {/* Base conic gradient background */}
            <div className="absolute inset-0 health-ring opacity-20 animate-pulse"></div>
            <div className="absolute inset-3 bg-white dark:bg-zinc-900 rounded-full flex flex-col items-center justify-center shadow-inner">
              <span className="font-display text-5xl font-bold text-primary leading-none">{scanMetrics.score}</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">Health Score</span>
            </div>
            {/* Animated outer ring */}
            <div className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-on-surface">{scanMetrics.skinType || 'Normal'} Skin</p>
            <p className="text-[10px] text-on-surface-variant font-semibold uppercase">Confidence Index: 96.4%</p>
          </div>
        </div>

        {/* Last Uploaded Image */}
        <div className="col-span-12 lg:col-span-4 glass-card p-5 rounded-2xl border border-white/20 flex flex-col justify-between min-h-[360px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider">Last Uploaded Image</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          </div>

          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 border border-outline-variant/10 shadow-lg flex items-center justify-center">
            <img 
              src={capturedImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'} 
              className="w-full h-full object-cover" 
              alt="Last Uploaded Patient Scan"
            />
          </div>

          <div className="mt-2 pt-2 border-t border-outline-variant/10 flex justify-between items-center text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
            <span>Input Resolution: 800px</span>
            <span className="text-primary font-bold">Scan Frame</span>
          </div>
        </div>

        {/* AI summary Assessment */}
        <div className="col-span-12 lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col justify-between min-h-[360px] border border-white/20">
          <div>
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-4">Dermal Summary</h3>
            <div className="bg-primary/5 border border-primary/15 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">AI Medical Assessment</span>
              </div>
              <p className="text-xs text-on-surface dark:text-zinc-200 leading-relaxed font-medium">
                {isLoadingAi ? 'Consulting AI dermatologist...' : (aiData?.summary || defaultSummary)}
              </p>
            </div>

            {/* Condition Detections Section */}
            <div className="mt-4 space-y-2.5 border-t border-outline-variant/15 pt-4">
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Condition Detections</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Acne / Congestion:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${scanMetrics.acneDetected ? 'text-rose-600 bg-rose-500/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                    {scanMetrics.acneDetected ? `Seen (${scanMetrics.acne}%)` : 'Not Seen'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Dark Spots:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${scanMetrics.darkSpotsDetected ? 'text-rose-600 bg-rose-500/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                    {scanMetrics.darkSpotsDetected ? `Seen (${scanMetrics.darkSpots || scanMetrics.pigmentation}%)` : 'Not Seen'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Whiteheads / Blackheads:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${scanMetrics.whiteheadsDetected ? 'text-rose-600 bg-rose-500/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                    {scanMetrics.whiteheadsDetected ? `Seen (${scanMetrics.whiteheads || 30}%)` : 'Not Seen'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/20 pt-3 mt-3">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Skin Age</p>
              <h4 className="text-sm font-bold text-on-surface mt-0.5">26 Years</h4>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cell Turnover</p>
              <h4 className="text-sm font-bold text-secondary mt-0.5">28 Days</h4>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">UV Damage</p>
              <h4 className="text-sm font-bold text-amber-500 mt-0.5">Minimal</h4>
            </div>
          </div>
        </div>

        {/* Severity Metrics Bars */}
        <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-2xl border border-white/20">
          <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-6">Biometric Parameter Analysis</h3>
          <div className="space-y-4">
            {concerns.map((con, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-on-surface">{con.name}</span>
                  <span className="text-on-surface-variant text-[11px]">{con.level} ({con.severity}%)</span>
                </div>
                <div className="w-full bg-surface-container-highest dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${con.color}`} style={{ width: `${con.severity}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Protocols Suggestions */}
        <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-2xl border border-white/20 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-6">AI targeted Product Recommendations</h3>
            
            {isLoadingAi ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-on-surface-variant font-medium">Generating prescription matches...</p>
              </div>
            ) : aiData?.products ? (
              <div className="space-y-4">
                {aiData.products.slice(0, 4).map((prod, idx) => (
                  <div key={idx} className="flex gap-4 p-3 bg-surface-container-low dark:bg-zinc-800/40 rounded-xl border border-outline-variant/10 items-center">
                    <img 
                      src={getProductImage(prod.category)} 
                      className="w-14 h-14 rounded-xl object-cover border border-outline-variant/10 shadow-sm shrink-0" 
                      alt={prod.name}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{prod.category}</span>
                        <h4 className="text-xs font-bold text-on-surface truncate">{prod.name}</h4>
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">{prod.brand}</p>
                      <p className="text-[9px] text-on-surface-variant/80 leading-relaxed mt-1 line-clamp-2" title={prod.reason}>{prod.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">Perform a scan to load recommendations.</p>
            )}
          </div>

          <div className="flex gap-4 pt-6 mt-6 border-t border-outline-variant/10">
            <button 
              onClick={() => setScreen('routine')}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Apply to 7-Day Routine Planner
            </button>
            <button 
              onClick={() => setScreen('products')}
              className="px-5 py-3 border border-outline-variant/30 hover:bg-primary/5 text-primary text-xs font-bold rounded-xl cursor-pointer"
            >
              Shop Matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
