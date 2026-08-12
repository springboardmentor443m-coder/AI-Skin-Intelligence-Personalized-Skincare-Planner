import React from 'react';
import {
  Sparkles,
  Droplet,
  Moon,
  Sun,
  ShieldAlert,
  CheckCircle2,
  Circle,
  Activity,
  Award,
  ChevronRight,
  Flame,
  Sliders,
} from 'lucide-react';

export const UserDashboard = ({
  profile,
  assessment,
  routine,
  products,
  onToggleRoutineStep,
  onNavigateToTab,
  onUpdateLifestyle,
}) => {
  // Calculate weighted health score breakdown
  const calculateScoreBreakdown = () => {
    const skinConditionScore = assessment.overallScore; // 35%
    const lifestyleHabitsScore = Math.min(
      100,
      Math.round((profile.lifestyle.waterIntakeLiters / 2.5) * 50 + (profile.lifestyle.sleepHours / 8) * 50)
    ); // 20%
    const sleepQualityScore = profile.lifestyle.sleepQuality === 'Excellent' ? 95 : profile.lifestyle.sleepQuality === 'Good' ? 85 : 65; // 15%
    const routineConsistencyScore = profile.routineConsistency; // 20%
    const hydrationLevelScore = Math.min(100, Math.round((profile.lifestyle.waterIntakeLiters / 2.5) * 100)); // 10%

    const totalHealthScore = Math.round(
      skinConditionScore * 0.35 +
        lifestyleHabitsScore * 0.2 +
        sleepQualityScore * 0.15 +
        routineConsistencyScore * 0.2 +
        hydrationLevelScore * 0.1
    );

    return {
      skinConditionScore,
      lifestyleHabitsScore,
      sleepQualityScore,
      routineConsistencyScore,
      hydrationLevelScore,
      totalHealthScore,
    };
  };

  const scoreBreakdown = calculateScoreBreakdown();

  const completedMorning = routine.morningSteps.filter((s) => s.completedToday).length;
  const totalMorning = routine.morningSteps.length;
  const completedEvening = routine.eveningSteps.filter((s) => s.completedToday).length;
  const totalEvening = routine.eveningSteps.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Aqua Apple Glass Hero */}
      <div className="aqua-gradient-bg rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-cyan-300/40 aqua-glow relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-white border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>AI Skin Diagnostic Intelligence Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {profile.name}
            </h1>
            <p className="text-cyan-50 text-xs sm:text-sm leading-relaxed font-medium">
              Your skin moisture barrier is operating at <strong className="text-white font-bold">{scoreBreakdown.hydrationLevelScore}% optimal hydration</strong> for your required {profile.skinType || 'Combination'} skin profile with targeted active formulation care.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('assessment')}
              className="px-5 py-3 rounded-2xl bg-white/90 text-cyan-950 font-bold text-xs sm:text-sm hover:bg-white shadow-md transition-all flex items-center space-x-2 shrink-0 active:scale-95"
            >
              <Sliders className="w-4 h-4 text-cyan-700" />
              <span>Run AI Skin Assessment</span>
            </button>
            <button
              onClick={() => onNavigateToTab('routine')}
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/30 transition-all flex items-center space-x-2 shrink-0 active:scale-95 backdrop-blur-md"
            >
              <span>View Skincare Routine</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Row: Weighted Skin Health Score & Sub-scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Skin Health Wheel Card */}
        <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Overall Skin Health Score</h3>
              <p className="text-xs text-slate-500 font-medium">5-factor weighted clinical diagnostic model</p>
            </div>
            <span className="p-2.5 bg-cyan-100 rounded-2xl text-cyan-800">
              <Award className="w-5 h-5" />
            </span>
          </div>

          <div className="flex items-center justify-center my-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#CFFAFE"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="url(#gradientScoreAqua)"
                  strokeWidth="10"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * scoreBreakdown.totalHealthScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradientScoreAqua" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0891B2" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-slate-900">
                  {scoreBreakdown.totalHealthScore}
                </span>
                <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-full border border-cyan-300 mt-1">
                  +4% vs last week
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-cyan-100 text-[11px] text-slate-600 font-medium flex justify-between">
            <span>Profile Skin Type: <strong className="text-cyan-900 font-bold">{profile.skinType}</strong></span>
            <span>Adherence: <strong className="text-cyan-900 font-bold">{profile.routineConsistency}%</strong></span>
          </div>
        </div>

        {/* 5-Factor Weighted Score Breakdown Card */}
        <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-700" />
            <span>5-Factor Clinical Weighting</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Skin Condition (35%)</span>
                <span className="font-extrabold text-cyan-900">{scoreBreakdown.skinConditionScore}/100</span>
              </div>
              <div className="w-full h-2 bg-cyan-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-600 rounded-full"
                  style={{ width: `${scoreBreakdown.skinConditionScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Lifestyle Habits (20%)</span>
                <span className="font-extrabold text-cyan-900">{scoreBreakdown.lifestyleHabitsScore}/100</span>
              </div>
              <div className="w-full h-2 bg-cyan-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${scoreBreakdown.lifestyleHabitsScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Routine Adherence (20%)</span>
                <span className="font-extrabold text-cyan-900">{scoreBreakdown.routineConsistencyScore}/100</span>
              </div>
              <div className="w-full h-2 bg-cyan-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-700 rounded-full"
                  style={{ width: `${scoreBreakdown.routineConsistencyScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Sleep Quality (15%)</span>
                <span className="font-extrabold text-cyan-900">{scoreBreakdown.sleepQualityScore}/100</span>
              </div>
              <div className="w-full h-2 bg-cyan-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-800 rounded-full"
                  style={{ width: `${scoreBreakdown.sleepQualityScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Hydration Level (10%)</span>
                <span className="font-extrabold text-cyan-900">{scoreBreakdown.hydrationLevelScore}/100</span>
              </div>
              <div className="w-full h-2 bg-cyan-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${scoreBreakdown.hydrationLevelScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Skin Profile & Sensitivities Card */}
        <div className="apple-glass-dark rounded-3xl p-6 text-white shadow-xl space-y-4 flex flex-col justify-between border border-cyan-400/30 aqua-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <h3 className="font-extrabold text-base">Active Skin Profile</h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
              {profile.skinType || 'Combination'} Skin
            </span>
          </div>

          <div className="space-y-2 text-xs text-cyan-100 font-medium">
            <p className="flex justify-between border-b border-cyan-500/20 pb-1.5">
              <span>Target Concerns:</span>
              <strong className="text-white font-bold">{(profile.skinConcerns || []).join(', ')}</strong>
            </p>
            <p className="flex justify-between border-b border-cyan-500/20 pb-1.5">
              <span>Barrier Index:</span>
              <strong className="text-cyan-300 font-bold">{assessment.barrierHealthScore}% Healthy</strong>
            </p>
            <p className="flex justify-between">
              <span>Hydration Status:</span>
              <strong className="text-teal-300 font-bold">{assessment.hydrationScore}% Optimal</strong>
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-cyan-500/30 space-y-1">
            <span className="text-[11px] font-bold text-cyan-300 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Sensitivities & Allergies Shield</span>
            </span>
            <p className="text-[11px] text-cyan-100/90 font-medium">
              Active formulations screened against: <strong className="text-white">{(profile.allergies || []).join(', ') || 'None'}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Routine Daily Checklist Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Morning Skincare Checklist */}
        <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-100">
            <div className="flex items-center space-x-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Morning AM Checklist</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {completedMorning} of {totalMorning} steps completed today
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-900 bg-cyan-100 px-3 py-1 rounded-full border border-cyan-300">
              {Math.round((completedMorning / Math.max(totalMorning, 1)) * 100)}% Done
            </span>
          </div>

          <div className="space-y-2">
            {routine.morningSteps.map((step) => (
              <div
                key={step.id}
                onClick={() => onToggleRoutineStep(step.id, 'morning')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  step.completedToday
                    ? 'bg-cyan-50/90 border-cyan-300 text-slate-900'
                    : 'bg-white/80 border-cyan-100 hover:border-cyan-400 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button className="text-cyan-600 transition-transform active:scale-95">
                    {step.completedToday ? (
                      <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">{step.productName}</span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      Step {step.stepNumber}: {step.category} • Compositions: {step.activeIngredients.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evening Skincare Checklist */}
        <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-100">
            <div className="flex items-center space-x-2">
              <Moon className="w-5 h-5 text-cyan-700" />
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Evening PM Checklist</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {completedEvening} of {totalEvening} steps completed
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-900 bg-teal-100 px-3 py-1 rounded-full border border-teal-300">
              {Math.round((completedEvening / Math.max(totalEvening, 1)) * 100)}% Done
            </span>
          </div>

          <div className="space-y-2">
            {routine.eveningSteps.map((step) => (
              <div
                key={step.id}
                onClick={() => onToggleRoutineStep(step.id, 'evening')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  step.completedToday
                    ? 'bg-cyan-50/90 border-cyan-300 text-slate-900'
                    : 'bg-white/80 border-cyan-100 hover:border-cyan-400 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button className="text-cyan-600 transition-transform active:scale-95">
                    {step.completedToday ? (
                      <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">{step.productName}</span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      Step {step.stepNumber}: {step.category} • Compositions: {step.activeIngredients.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Hydration & Sleep Quick Log Tracker */}
      <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
          <Flame className="w-4 h-4 text-cyan-700" />
          <span>Daily Lifestyle Trackers</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/80 border border-cyan-100 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl aqua-gradient-bg text-white">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Water Intake Target</span>
                <span className="text-xs text-cyan-800 font-extrabold">
                  {profile.lifestyle.waterIntakeLiters} Liters logged
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  onUpdateLifestyle(
                    Math.max(0.5, profile.lifestyle.waterIntakeLiters - 0.5),
                    profile.lifestyle.sleepHours
                  )
                }
                className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 text-slate-900 font-black hover:bg-cyan-100"
              >
                -
              </button>
              <button
                onClick={() =>
                  onUpdateLifestyle(
                    profile.lifestyle.waterIntakeLiters + 0.5,
                    profile.lifestyle.sleepHours
                  )
                }
                className="w-8 h-8 rounded-xl aqua-gradient-bg text-white font-black shadow-xs hover:brightness-110"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-cyan-100 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-cyan-700 text-white">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Sleep Duration</span>
                <span className="text-xs text-cyan-800 font-extrabold">
                  {profile.lifestyle.sleepHours} Hours logged ({profile.lifestyle.sleepQuality})
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  onUpdateLifestyle(
                    profile.lifestyle.waterIntakeLiters,
                    Math.max(4, profile.lifestyle.sleepHours - 0.5)
                  )
                }
                className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 text-slate-900 font-black hover:bg-cyan-100"
              >
                -
              </button>
              <button
                onClick={() =>
                  onUpdateLifestyle(
                    profile.lifestyle.waterIntakeLiters,
                    profile.lifestyle.sleepHours + 0.5
                  )
                }
                className="w-8 h-8 rounded-xl bg-cyan-700 text-white font-black shadow-xs hover:brightness-110"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top AI Indian Product Matches */}
      <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Recommended Chemical Compositions</h3>
            <p className="text-xs text-slate-500 font-medium">Sourced from top Indian e-commerce sites (Nykaa, Minimalist, Derma Co, Amazon India)</p>
          </div>
          <button
            onClick={() => onNavigateToTab('products')}
            className="text-xs font-bold text-cyan-700 hover:underline flex items-center space-x-1"
          >
            <span>Explore Store</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="apple-glass-card rounded-2xl p-4 border border-cyan-200 hover:border-cyan-400 transition-all bg-white/90 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-widest bg-cyan-100 px-2 py-0.5 rounded-full">
                  {item.brand}
                </span>
                <span className="bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {item.suitabilityScore}%
                </span>
              </div>

              <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.name}</h4>

              <p className="text-[11px] font-bold text-slate-700 line-clamp-1 bg-cyan-50 p-1.5 rounded-lg border border-cyan-100">
                {item.composition || item.keyIngredients.join(' + ')}
              </p>

              <div className="mt-2 flex items-center justify-between border-t border-cyan-100 pt-2">
                <span className="font-black text-xs text-slate-900">₹{item.priceINR || 499}</span>
                <span className="text-[10px] text-cyan-800 font-bold">{item.storePlatform || 'Nykaa'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
