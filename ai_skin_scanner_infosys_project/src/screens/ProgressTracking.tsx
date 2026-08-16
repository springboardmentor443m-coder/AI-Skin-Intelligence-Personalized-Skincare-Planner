import React, { useState, useRef, useEffect } from 'react';
import type { UserProfileData } from '../App';

interface ProgressTrackingProps {
  userProfile: UserProfileData;
}

export const ProgressTracking: React.FC<ProgressTrackingProps> = ({ userProfile }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to format mock dates relative to current date
  const formatMockDate = (daysAgo: number) => {
    const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const mockHistory = [
    { date: formatMockDate(0), score: 84, status: 'Sensitive Skin', change: '+3.2%' },
    { date: formatMockDate(14), score: 81, status: 'Sensitive Skin', change: '+2.5%' },
    { date: formatMockDate(28), score: 76, status: 'Combination Skin', change: '+4.0%' },
    { date: formatMockDate(42), score: 70, status: 'Dry Skin', change: '+8.0%' },
    { date: formatMockDate(56), score: 62, status: 'Stripped barrier', change: 'Baseline' },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/scan/history?email=${encodeURIComponent(userProfile.email)}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch history");
        }
        return res.json();
      })
      .then(data => {
        setScans(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching progress tracking history:", err);
        setLoading(false);
      });
  }, [userProfile.email]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(x, 100)));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(x, 100)));
  };

  // Convert MongoDB scans to display history items
  const displayedHistory = scans.length > 0 ? scans.map((s, idx) => {
    const scanDate = new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const prevScan = scans[idx + 1]; // next scan in descending array is chronologically older
    let change = 'Baseline';
    if (prevScan) {
      const diff = s.metrics.score - prevScan.metrics.score;
      change = diff >= 0 ? `+${diff}%` : `${diff}%`;
    }
    return {
      date: scanDate,
      score: s.metrics.score,
      status: (s.prediction || 'Combination') + ' Skin',
      change: change
    };
  }) : mockHistory;

  // Chart items: take latest 5 items and reverse them to show oldest first
  const chartItems = [...displayedHistory].slice(0, 5).reverse();

  // Map scores to SVG coordinate space
  const chartPoints = (() => {
    if (chartItems.length === 0) return [];
    const width = 800;
    const height = 180;
    const padding = 20;
    return chartItems.map((item, idx) => {
      const x = padding + (idx * (width - 2 * padding)) / Math.max(1, chartItems.length - 1);
      // Map scores ranging 40-100 to coordinates
      const y = height - padding - ((item.score - 40) / 60) * (height - 2 * padding);
      return { x, y, score: item.score, date: item.date };
    });
  })();

  const getSvgPath = () => {
    return chartPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Progress Tracking Logs</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Visually monitor skin cellular reconstruction, routine compliance, and historical health score trends.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-on-surface-variant font-medium">Loading progress tracking metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-card-gap">
          {/* Interactive Before/After slider */}
          <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-2xl border border-white/20 flex flex-col justify-between min-h-[420px]">
            <div>
              <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-2">Cellular Progress (Before &amp; After)</h3>
              <p className="text-[10px] text-on-surface-variant leading-relaxed mb-4">Drag the slider handle to compare Day 1 (stripped barrier redness) with Day 60 (hydrated, glowing cellular repair).</p>
            </div>

            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full h-64 rounded-xl overflow-hidden cursor-ew-resize border border-outline-variant/30 select-none"
            >
              {/* "After" Image (Day 60) - Full size in background */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8Xlao4qscH1mRvX40c3HTFHHZdzgS_pkPWwYMYwXU0_apPrtj5rz9svhq_r7V05S-9cHpsP7zHpCxNT_4WWDqcFVEXKJUhN4pyja7A8dG0ML_XhD0fX0hkDq0fBbsUCKArhl_DIOa6aRGrn_lME9v9wjRpHZ_-s5cYJV803PJ77d_s1peaauH0OuYB-gSvzI_HTMJvUBch7eNTmA6at-9o2C0AjXtyW0DerLa4chkkA1Pace0SbdaHutRoUmAdJtMH7JSLR_RYBVN')` }}
              />
              <div className="absolute bottom-4 right-4 bg-primary/80 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded z-10">
                DAY 60: REPAIRED
              </div>

              {/* "Before" Image (Day 1) - Clipped width on top */}
              <div 
                className="absolute inset-y-0 left-0 bg-cover bg-center border-r-2 border-white"
                style={{ 
                  width: `${sliderPosition}%`,
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9c223VXSRPMjjYBktNAiXsAo9VO8_lmpwbjy7Je-ZLDrtgSSg8REn-Dkh-Rvv9XtgObPalBnYNZMpfUM9eIh9iO0NbyDQ2R3zBE2zNANbE7YH93wJUD-lc_HjoCMueMXGRalCTrRiJr7uIxA3brViE_p0higPUnBN2ECBIkZ6M9kLPAHcPi4RVCXakdD0PP93g9Ea80tTzB9RjZOVYBbKL6IkC9knV5ULjPGcvnSeleV9XHhpXS8zjDNl7akaiSvWk3WSEKO2_odF')`,
                  filter: 'sepia(0.2) saturate(1.4) hue-rotate(330deg)' // Simulated inflammation effect!
                }}
              />
              <div className="absolute bottom-4 left-4 bg-zinc-900/80 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded z-10">
                DAY 1: INFLAMED
              </div>

              {/* Slider bar overlay */}
              <div 
                className="absolute inset-y-0 w-0.5 bg-white pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              />
              {/* Slider handle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg pointer-events-none transform -translate-x-1/2"
                style={{ left: `${sliderPosition}%` }}
              >
                <span className="material-symbols-outlined text-sm font-bold">unfold_more_double</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">
              <span>Scan 1: Redness &amp; stripped lipids</span>
              <span>Scan 12: Resurfaced glow</span>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-2xl border border-white/20 flex flex-col justify-between min-h-[420px]">
            <div>
              <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-2">Historical Skin Score</h3>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">Continuous moisture and elasticity improvement compiled across latest assessment scans.</p>
            </div>

            <div className="relative h-48 w-full my-6">
              {/* Grid */}
              <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
                <div className="border-b border-outline-variant/10"></div>
                <div className="border-b border-outline-variant/10"></div>
                <div className="border-b border-outline-variant/10"></div>
                <div className="border-b border-outline-variant/10"></div>
              </div>

              {/* SVG line */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 180">
                {chartPoints.length > 0 && (
                  <path 
                    d={getSvgPath()} 
                    fill="none" 
                    stroke="#6050af" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                  />
                )}
                {chartPoints.map((p, idx) => (
                  <circle 
                    key={idx} 
                    cx={p.x} 
                    cy={p.y} 
                    r={idx === chartPoints.length - 1 ? 6 : 5} 
                    fill={idx === chartPoints.length - 1 ? '#256960' : '#6050af'} 
                    className={idx === chartPoints.length - 1 ? 'animate-pulse' : ''} 
                  />
                ))}
              </svg>
              
              {/* Custom SVG Tooltips */}
              {chartPoints.length > 0 && (
                <>
                  <div className="absolute bottom-[20px] left-[2%] bg-zinc-900 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
                    {chartPoints[0].score}%
                  </div>
                  <div className="absolute top-[8px] right-[2%] bg-secondary text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
                    Current: {chartPoints[chartPoints.length - 1].score}%
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between text-[9px] text-on-surface-variant font-bold uppercase tracking-widest px-2">
              {chartItems.map((item, idx) => (
                <span key={idx}>{item.date}</span>
              ))}
            </div>
          </div>

          {/* Historical Logs Table */}
          <div className="col-span-12 glass-card p-6 rounded-2xl border border-white/20">
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-4">Historical Assessment Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Evaluation Date</th>
                    <th className="py-3 px-4">Health Score</th>
                    <th className="py-3 px-4">Detected Diagnosis</th>
                    <th className="py-3 px-4">Progress Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {displayedHistory.map((log, i) => (
                    <tr key={i} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold">{log.date}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold ${log.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                          {log.score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant font-medium">{log.status}</td>
                      <td className="py-3.5 px-4 text-secondary font-semibold">{log.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
