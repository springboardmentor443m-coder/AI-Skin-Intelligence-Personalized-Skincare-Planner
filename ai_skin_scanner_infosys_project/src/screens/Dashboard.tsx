import React, { useState } from 'react';
import type { UserProfileData, ScanMetrics } from '../App';

interface DashboardProps {
  setScreen: (screen: string) => void;
  onStartScan: () => void;
  userProfile: UserProfileData;
  scanMetrics: ScanMetrics;
}

export const Dashboard: React.FC<DashboardProps> = ({ setScreen, onStartScan, userProfile, scanMetrics }) => {
  const [waterIntake, setWaterIntake] = useState(1.2); // Current Liters
  const waterTarget = 2.0; // Liters
  const [routineSteps, setRoutineSteps] = useState([
    { id: 1, label: 'pH Balancing Cleanser', desc: 'Step 1 • 2 mins', done: true, time: '07:15 AM' },
    { id: 2, label: 'Vitamin C Serum', desc: 'Step 2 • 5 mins absorption', done: false },
    { id: 3, label: 'Hyaluronic Acid Hydrator', desc: 'Step 3 • Lock moisture', done: false },
    { id: 4, label: 'Broad Spectrum SPF 50', desc: 'Step 4 • UV protection', done: false },
  ]);

  const toggleStep = (id: number) => {
    setRoutineSteps(routineSteps.map(step => 
      step.id === id ? { ...step, done: !step.done, time: !step.done ? new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : undefined } : step
    ));
  };

  const addWater = () => {
    setWaterIntake(prev => parseFloat((Math.min(prev + 0.25, 3.0)).toFixed(2)));
  };

  const routineCompletion = Math.round((routineSteps.filter(s => s.done).length / routineSteps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface mb-1">Welcome back, {userProfile.name}</h2>
          <p className="text-xs text-on-surface-variant font-medium">Your skin is showing positive signs of hydration recovery (+3.2% moisture).</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setScreen('routine')}
            className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant/30 rounded-full text-xs font-bold text-on-surface hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">calendar_add_on</span>
            Log Routine
          </button>
          <button 
            onClick={onStartScan}
            className="flex items-center gap-2 px-5 py-2.5 btn-primary-gradient text-white rounded-full text-xs font-bold shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            Start New Scan
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-card-gap">
        {/* Skin Score Card */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[300px] border border-white/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mb-0.5">Health Score</p>
              <h3 className="font-display text-base font-bold text-on-surface">Overall Analysis</h3>
            </div>
            <div className="bg-primary/10 text-primary p-2 rounded-xl">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </div>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              {/* SVG Ring Gauge */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle className="text-surface-container-highest dark:text-zinc-800" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeWidth="6"></circle>
                <circle 
                  className="text-primary" 
                  cx="64" 
                  cy="64" 
                  fill="transparent" 
                  r="54" 
                  stroke="currentColor" 
                  strokeWidth="8"
                  strokeDasharray={339}
                  strokeDashoffset={339 - (339 * scanMetrics.score) / 100}
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-display font-bold gradient-text leading-none">{scanMetrics.score}</span>
                <span className="text-xs font-bold text-on-surface-variant block">%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between border-t border-outline-variant/20 pt-4 text-center">
            <div>
              <p className="text-[11px] font-bold text-primary">+3.2%</p>
              <p className="text-[9px] text-on-surface-variant font-medium uppercase tracking-wider">Weekly</p>
            </div>
            <div className="border-r border-outline-variant/20 h-8"></div>
            <div>
              <p className="text-[11px] font-bold text-on-surface">Combination</p>
              <p className="text-[9px] text-on-surface-variant font-medium uppercase tracking-wider">Skin Type</p>
            </div>
            <div className="border-r border-outline-variant/20 h-8"></div>
            <div>
              <p className="text-[11px] font-bold text-secondary">Sensitive</p>
              <p className="text-[9px] text-on-surface-variant font-medium uppercase tracking-wider">Status</p>
            </div>
          </div>
        </div>

        {/* Targeted Skincare Recommendations */}
        <div className="col-span-12 md:col-span-6 lg:col-span-5 glass-card rounded-2xl p-6 min-h-[300px] flex flex-col justify-between border border-white/20">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">Biometric Matches</p>
              <h3 className="font-display text-sm font-bold text-on-surface">Targeted Recommendations</h3>
            </div>
            <button onClick={() => setScreen('products')} className="text-[10px] font-bold text-primary hover:underline cursor-pointer">View All</button>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {/* Product 1 */}
            <div 
              onClick={() => setScreen('products')}
              className="flex items-center gap-3 p-3 bg-surface-container-low dark:bg-zinc-800/40 border border-outline-variant/10 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white dark:bg-zinc-950 rounded-lg flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden">
                <span className="material-symbols-outlined text-primary text-xl">water_drop</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">Lumina C+ Serum</h4>
                  <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">98% FIT</span>
                </div>
                <p className="text-[9px] text-on-surface-variant truncate mt-0.5">Active antioxidant formula targeting dark spots.</p>
              </div>
            </div>

            {/* Product 2 */}
            <div 
              onClick={() => setScreen('products')}
              className="flex items-center gap-3 p-3 bg-surface-container-low dark:bg-zinc-800/40 border border-outline-variant/10 rounded-xl hover:border-secondary/20 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white dark:bg-zinc-950 rounded-lg flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden">
                <span className="material-symbols-outlined text-secondary text-xl">healing</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-on-surface truncate group-hover:text-secondary transition-colors">Barrier Bio-Complex</h4>
                  <span className="text-[8px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">92% FIT</span>
                </div>
                <p className="text-[9px] text-on-surface-variant truncate mt-0.5">Soothing lipid repair for sensitive skin.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Morning Routine Checklist */}
        <div className="col-span-12 lg:col-span-3 glass-card rounded-2xl p-6 min-h-[300px] flex flex-col justify-between border border-white/20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">light_mode</span>
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-on-surface leading-tight">Morning Protocol</h3>
                <p className="text-[10px] text-on-surface-variant font-medium">{routineCompletion}% Completed</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {routineSteps.map(step => (
                <div 
                  key={step.id} 
                  onClick={() => toggleStep(step.id)}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center shrink-0 ${
                    step.done 
                      ? 'bg-primary border-primary' 
                      : 'border-primary/40 group-hover:bg-primary/10'
                  }`}>
                    {step.done && <span className="material-symbols-outlined text-xs text-white font-bold">check</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold leading-tight ${step.done ? 'line-through opacity-50' : ''}`}>{step.label}</p>
                    <p className="text-[9px] text-on-surface-variant font-medium mt-0.5">
                      {step.done ? `Completed ${step.time}` : step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setScreen('routine')}
            className="w-full mt-4 py-2 border border-primary/20 hover:bg-primary/5 rounded-xl text-primary font-bold text-[10px] tracking-wider uppercase transition-all"
          >
            View Full Planner
          </button>
        </div>

        {/* Clinical Progress Chart */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-2xl p-6 min-h-[350px] flex flex-col justify-between border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display text-base font-bold text-on-surface">Clinical Progress</h3>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Hydration Index</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Elasticity</span>
                </div>
              </div>
            </div>
            <div className="flex bg-surface-container-low dark:bg-zinc-800 p-1 rounded-xl border border-outline-variant/20">
              <button className="px-3.5 py-1 text-[10px] font-bold bg-white dark:bg-zinc-700 shadow-sm rounded-lg text-on-surface">7 Days</button>
              <button className="px-3.5 py-1 text-[10px] font-semibold text-on-surface-variant">30 Days</button>
            </div>
          </div>

          {/* SVG Clinical Line Chart */}
          <div className="relative h-48 w-full">
            {/* Chart Grid Lines */}
            <div className="absolute inset-0 grid grid-rows-5 pointer-events-none">
              <div className="border-b border-outline-variant/10"></div>
              <div className="border-b border-outline-variant/10"></div>
              <div className="border-b border-outline-variant/10"></div>
              <div className="border-b border-outline-variant/10"></div>
              <div className="border-b border-outline-variant/10"></div>
            </div>

            {/* Paths */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {/* Hydration Index Curve */}
              <path 
                d="M 10 160 Q 150 110 300 130 T 600 70 T 900 40" 
                fill="none" 
                stroke="#6050af" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              <path 
                d="M 10 160 Q 150 110 300 130 T 600 70 T 900 40 L 900 192 L 10 192 Z" 
                fill="url(#hydrationGlow)" 
                opacity="0.08" 
              />
              {/* Elasticity Curve */}
              <path 
                d="M 10 120 Q 150 130 300 90 T 600 110 T 900 60" 
                fill="none" 
                stroke="#256960" 
                strokeWidth="3" 
                strokeDasharray="6 3" 
                strokeLinecap="round" 
              />
              
              <defs>
                <linearGradient id="hydrationGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6050af" />
                  <stop offset="100%" stopColor="#6050af" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing active point */}
            <div className="absolute top-[34px] right-[5%] w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-zinc-900 ring-4 ring-primary/20 shadow-lg animate-pulse"></div>
            <div className="absolute top-[10px] right-[7%] bg-on-surface text-white text-[9px] py-1 px-2 rounded-lg font-bold shadow-md">
              Hydration: 92%
            </div>
          </div>

          <div className="flex justify-between px-2 text-[9px] font-bold text-on-surface-variant tracking-widest uppercase">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Hydration & Life trackers */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 glass-card rounded-2xl p-6 flex flex-col items-center justify-between text-center border border-white/20">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-2xl">water_drop</span>
          </div>
          <div className="my-3">
            <h4 className="font-display text-sm font-bold text-on-surface">Hydration Tracker</h4>
            <p className="text-xs text-on-surface-variant mt-1">
              Target: {waterTarget}L. Drink {Math.max(0, parseFloat((waterTarget - waterIntake).toFixed(2)))}L more today.
            </p>
          </div>

          {/* Hydration glasses bar */}
          <div className="flex gap-2 my-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((cup) => {
              const active = waterIntake >= cup * 0.25;
              return (
                <div key={cup} className="w-7 h-12 bg-primary/10 rounded-lg relative overflow-hidden border border-primary/5">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary-container transition-all duration-500" 
                    style={{ height: active ? '100%' : '0%' }}
                  ></div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={addWater}
            className="flex items-center gap-1.5 text-primary font-bold text-xs hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Add 250ml Intake
          </button>
        </div>

        {/* Quick Actions Panel */}
        <div className="col-span-12 glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/20">
          <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4">Quick Diagnostics</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            <button 
              onClick={onStartScan}
              className="p-4 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-primary mb-1.5 text-xl">photo_camera</span>
              <span className="text-[10px] font-bold text-primary">Camera Scan</span>
            </button>
            <button 
              onClick={() => setScreen('routine')}
              className="p-4 bg-secondary/5 hover:bg-secondary/10 border border-secondary/10 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-secondary mb-1.5 text-xl">schedule</span>
              <span className="text-[10px] font-bold text-secondary">Routine Logs</span>
            </button>
            <button 
              onClick={() => setScreen('products')}
              className="p-4 bg-tertiary/5 hover:bg-tertiary/10 border border-tertiary/10 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-tertiary mb-1.5 text-xl">shopping_cart</span>
              <span className="text-[10px] font-bold text-tertiary">Buy Recommendations</span>
            </button>
            <button 
              onClick={() => setScreen('ingredients')}
              className="p-4 bg-zinc-500/5 hover:bg-zinc-500/10 border border-zinc-500/10 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant mb-1.5 text-xl">science</span>
              <span className="text-[10px] font-bold text-on-surface-variant">Ingredient Check</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
