import React, { useState, useRef } from 'react';

export const ProgressTracking: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage
  const containerRef = useRef<HTMLDivElement>(null);

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

  const scoreHistory = [
    { date: 'Feb 24', score: 84, status: 'Sensitive', change: '+3.2%' },
    { date: 'Feb 10', score: 81, status: 'Sensitive', change: '+2.5%' },
    { date: 'Jan 27', score: 76, status: 'Inflamed', change: '+4.0%' },
    { date: 'Jan 13', score: 70, status: 'Acne flare', change: '+8.0%' },
    { date: 'Dec 30', score: 62, status: 'Stripped barrier', change: 'Baseline' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Progress Tracking Logs</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Visually monitor skin cellular reconstruction, routine compliance, and historical health score trends.</p>
      </div>

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
            <p className="text-[10px] text-on-surface-variant leading-relaxed">Continuous moisture and elasticity improvement compiled across 60 days.</p>
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
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <path 
                d="M 10 144 L 200 120 L 400 96 L 600 60 L 800 24" 
                fill="none" 
                stroke="#6050af" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
              <circle cx="10" cy="144" r="5" fill="#6050af" />
              <circle cx="200" cy="120" r="5" fill="#6050af" />
              <circle cx="400" cy="96" r="5" fill="#6050af" />
              <circle cx="600" cy="60" r="5" fill="#6050af" />
              <circle cx="800" cy="24" r="6" fill="#256960" className="animate-pulse" />
            </svg>
            
            {/* Custom SVG Tooltips */}
            <div className="absolute bottom-[20px] left-[2%] bg-zinc-900 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">62%</div>
            <div className="absolute top-[8px] right-[2%] bg-secondary text-white text-[8px] px-1.5 py-0.5 rounded font-bold">Current: 84%</div>
          </div>

          <div className="flex justify-between text-[9px] text-on-surface-variant font-bold uppercase tracking-widest px-2">
            <span>Dec 30</span>
            <span>Jan 13</span>
            <span>Jan 27</span>
            <span>Feb 10</span>
            <span>Feb 24</span>
          </div>
        </div>

        {/* Historical Logs List */}
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
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {scoreHistory.map((log, i) => (
                  <tr key={i} className="hover:bg-primary/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold">{log.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${log.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                        {log.score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-medium">{log.status}</td>
                    <td className="py-3.5 px-4 text-secondary font-semibold">{log.change}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-primary font-bold hover:underline cursor-pointer">Compare</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
