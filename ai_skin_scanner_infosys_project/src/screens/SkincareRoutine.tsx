import React, { useState, useEffect } from 'react';

interface RoutineStep {
  id: number;
  name: string;
  desc: string;
  done: boolean;
  time: string;
}

export const SkincareRoutine: React.FC = () => {
  const [reminders, setReminders] = useState(true);
  
  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const getTodayDayName = (): 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
    const name = daysOfWeek[todayIndex];
    return (name === 'Sunday' ? 'Sunday' : name) as any;
  };

  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>(getTodayDayName());
  
  // Track step completion states per day
  const [morningSteps, setMorningSteps] = useState<Record<string, RoutineStep[]>>({});
  const [nightSteps, setNightSteps] = useState<Record<string, RoutineStep[]>>({});
  
  const [hasAiRoutine, setHasAiRoutine] = useState(false);
  const [targetDisease, setTargetDisease] = useState<string>('General Wellness Protocol');

  useEffect(() => {
    const rawMetrics = localStorage.getItem('scanMetrics');
    if (rawMetrics) {
      try {
        const metrics = JSON.parse(rawMetrics);
        if (metrics.acneDetected) {
          setTargetDisease('Acne & Pore Congestion Treatment Protocol');
        } else if (metrics.darkSpotsDetected) {
          setTargetDisease('Hyperpigmentation & Dark Spots Protocol');
        } else if (metrics.whiteheadsDetected) {
          setTargetDisease('Excess Sebum & Whitehead Control Protocol');
        } else if (metrics.redness > 55) {
          setTargetDisease('Vascular Redness & Sensitivity Protocol');
        } else if (metrics.skinType) {
          setTargetDisease(`${metrics.skinType} Skin Balancing Protocol`);
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }, []);

  useEffect(() => {
    const rawRoutine = localStorage.getItem('ai_skincare_routine_7_day');
    if (rawRoutine) {
      try {
        const parsed = JSON.parse(rawRoutine);
        setHasAiRoutine(true);

        const mSteps: Record<string, RoutineStep[]> = {};
        const nSteps: Record<string, RoutineStep[]> = {};

        days.forEach(day => {
          const dayRoutine = parsed[day] || { morning: [], evening: [] };
          
          mSteps[day] = dayRoutine.morning.map((stepStr: string, idx: number) => ({
            id: idx + 1,
            name: stepStr.split('.')[0] || stepStr,
            desc: stepStr,
            done: false,
            time: '2 mins'
          }));

          nSteps[day] = dayRoutine.evening.map((stepStr: string, idx: number) => ({
            id: idx + 1,
            name: stepStr.split('.')[0] || stepStr,
            desc: stepStr,
            done: false,
            time: '3 mins'
          }));
        });

        setMorningSteps(mSteps);
        setNightSteps(nSteps);

      } catch (err) {
        console.error("Error parsing AI routine:", err);
      }
    }
  }, []);

  // Standard static fallback steps if no AI routine is set
  const defaultMorning = [
    { id: 1, name: 'pH Balancing Gel Cleanser', desc: 'Wash with lukewarm water to remove overnight residue.', done: true, time: '2 mins' },
    { id: 2, name: 'Lumina C+ Molecular Serum', desc: 'Apply 4 drops to cheeks and forehead. Let absorb for 3 mins.', done: false, time: '5 mins' },
    { id: 3, name: 'Niacinamide Hydrating Gel', desc: 'Soothes skin barrier and balances T-Zone oil production.', done: false, time: '1 min' },
    { id: 4, name: 'Broad Spectrum SPF 50', desc: 'Essential UV screen. Reapply after 3 hours.', done: false, time: '2 mins' },
  ];

  const defaultNight = [
    { id: 1, name: 'Squalane Milky Cleanser', desc: 'Double cleanse to remove daily pollutants and SPF.', done: false, time: '3 mins' },
    { id: 2, name: 'Barrier Bio-Complex', desc: 'Centella and Ceramide treatment targeting red patches.', done: false, time: '2 mins' },
    { id: 3, name: 'Night Repair Retinol Essence', desc: 'Apply pea-sized amount. Boosts cell turnover and fine lines.', done: false, time: '4 mins' },
    { id: 4, name: 'Ultra Nourishing Ceramide Cream', desc: 'Heavy occlusion to lock in hydration overnight.', done: false, time: '2 mins' },
  ];

  // Helper getters for current steps
  const getCurrentMorningSteps = (): RoutineStep[] => {
    if (hasAiRoutine && morningSteps[selectedDay]) {
      return morningSteps[selectedDay];
    }
    return defaultMorning;
  };

  const getCurrentNightSteps = (): RoutineStep[] => {
    if (hasAiRoutine && nightSteps[selectedDay]) {
      return nightSteps[selectedDay];
    }
    return defaultNight;
  };

  const toggleMorning = (id: number) => {
    if (hasAiRoutine) {
      setMorningSteps(prev => ({
        ...prev,
        [selectedDay]: prev[selectedDay].map(s => s.id === id ? { ...s, done: !s.done } : s)
      }));
    } else {
      // Fallback
    }
  };

  const toggleNight = (id: number) => {
    if (hasAiRoutine) {
      setNightSteps(prev => ({
        ...prev,
        [selectedDay]: prev[selectedDay].map(s => s.id === id ? { ...s, done: !s.done } : s)
      }));
    } else {
      // Fallback
    }
  };

  const currentM = getCurrentMorningSteps();
  const currentN = getCurrentNightSteps();

  const morningPercent = currentM.length ? Math.round((currentM.filter(s => s.done).length / currentM.length) * 100) : 0;
  const nightPercent = currentN.length ? Math.round((currentN.filter(s => s.done).length / currentN.length) * 100) : 0;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">Personalized Routine Planner</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            {hasAiRoutine ? 'Dynamic 7-day week plan generated by Aetheris AI Skincare Consultant.' : 'Clinical daily protocol formulated by AI based on T-Zone sebum profiles.'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low dark:bg-zinc-800 px-4 py-2 rounded-full border border-outline-variant/20 shadow-sm self-start md:self-center">
          <span className="material-symbols-outlined text-primary text-lg">notifications_active</span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Reminders</span>
          <button 
            onClick={() => setReminders(!reminders)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${reminders ? 'bg-primary' : 'bg-outline-variant'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${reminders ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* Target Disease Protocol Banner */}
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Active Clinical Target Plan</span>
            <h3 className="text-sm font-bold text-on-surface mt-0.5">{targetDisease}</h3>
          </div>
        </div>
        <span className="hidden sm:inline-block text-[10px] bg-white dark:bg-zinc-800 border border-outline-variant/30 text-on-surface-variant px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
          7-Day Plan by Skin Disease
        </span>
      </div>

      {/* 7-Day Horizontal Selector */}
      {hasAiRoutine && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-variant/10 scrollbar-none">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all shrink-0 cursor-pointer ${
                selectedDay === day 
                  ? 'bg-primary text-white shadow-md animate-pulse' 
                  : 'bg-surface-container-low dark:bg-zinc-800 text-on-surface-variant border border-outline-variant/10 hover:border-primary/50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* Routine Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-card-gap">
        {/* Morning Protocol */}
        <div className="glass-card p-6 rounded-2xl border border-white/20 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">light_mode</span>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-on-surface">Morning Routine</h3>
                  <p className="text-[10px] text-on-surface-variant font-medium">Target: Hydrate & Protect</p>
                </div>
              </div>
              <span className="text-xs bg-amber-500/15 text-amber-600 px-3 py-1 rounded-full font-bold shadow-sm">
                {morningPercent}% Completed
              </span>
            </div>

            <div className="space-y-4">
              {currentM.map(step => (
                <div 
                  key={step.id} 
                  onClick={() => toggleMorning(step.id)}
                  className="flex gap-4 p-3 hover:bg-primary/5 rounded-xl cursor-pointer transition-colors group text-left"
                >
                  <div className={`w-5.5 h-5.5 rounded border-2 transition-all flex items-center justify-center shrink-0 ${
                    step.done ? 'bg-primary border-primary' : 'border-primary/40 group-hover:bg-primary/10'
                  }`}>
                    {step.done && <span className="material-symbols-outlined text-xs text-white font-bold">check</span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold leading-tight ${step.done ? 'line-through opacity-50' : ''}`}>{step.name}</h4>
                      <span className="text-[9px] text-on-surface-variant/70 font-semibold uppercase">{step.time}</span>
                    </div>
                    <p className={`text-[10px] text-on-surface-variant leading-relaxed mt-1 ${step.done ? 'opacity-40' : ''}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/10 pt-4 mt-6 flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
            <span>Total Duration: ~10 minutes</span>
            <button className="text-primary font-bold hover:underline">Add Custom Step</button>
          </div>
        </div>

        {/* Night Protocol */}
        <div className="glass-card p-6 rounded-2xl border border-white/20 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">nights_stay</span>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-on-surface">Night Routine</h3>
                  <p className="text-[10px] text-on-surface-variant font-medium">Target: Repair & Renew</p>
                </div>
              </div>
              <span className="text-xs bg-primary/15 text-primary px-3 py-1 rounded-full font-bold shadow-sm">
                {nightPercent}% Completed
              </span>
            </div>

            <div className="space-y-4">
              {currentN.map(step => (
                <div 
                  key={step.id} 
                  onClick={() => toggleNight(step.id)}
                  className="flex gap-4 p-3 hover:bg-primary/5 rounded-xl cursor-pointer transition-colors group text-left"
                >
                  <div className={`w-5.5 h-5.5 rounded border-2 transition-all flex items-center justify-center shrink-0 ${
                    step.done ? 'bg-primary border-primary' : 'border-primary/40 group-hover:bg-primary/10'
                  }`}>
                    {step.done && <span className="material-symbols-outlined text-xs text-white font-bold">check</span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold leading-tight ${step.done ? 'line-through opacity-50' : ''}`}>{step.name}</h4>
                      <span className="text-[9px] text-on-surface-variant/70 font-semibold uppercase">{step.time}</span>
                    </div>
                    <p className={`text-[10px] text-on-surface-variant leading-relaxed mt-1 ${step.done ? 'opacity-40' : ''}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/10 pt-4 mt-6 flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
            <span>Total Duration: ~11 minutes</span>
            <button className="text-primary font-bold hover:underline">Add Custom Step</button>
          </div>
        </div>
      </div>
    </div>
  );
};
