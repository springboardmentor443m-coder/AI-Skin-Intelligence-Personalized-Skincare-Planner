import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  RefreshCw,
  Info,
} from 'lucide-react';

export const RoutinePlanner = ({
  routine,
  userProfile,
  assessment,
  onToggleStep,
  onUpdateRoutine,
}) => {
  const [activeTab, setActiveTab] = useState('morning');
  const [isGenerating, setIsGenerating] = useState(false);
  const [seasonalMsg, setSeasonalMsg] = useState(routine.seasonalAdvice);

  const handleRegenerateAiRoutine = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile, assessment }),
      });

      const data = await response.json();
      if (data.success && data.routine) {
        const newRoutine = {
          ...routine,
          morningSteps: data.routine.morningSteps || routine.morningSteps,
          eveningSteps: data.routine.eveningSteps || routine.eveningSteps,
          weeklyTreatments: data.routine.weeklyTreatments || routine.weeklyTreatments,
          seasonalAdvice: data.routine.seasonalAdvice || routine.seasonalAdvice,
          updatedAt: new Date().toISOString(),
        };
        setSeasonalMsg(newRoutine.seasonalAdvice);
        onUpdateRoutine(newRoutine);
      }
    } catch (err) {
      console.error('Error generating routine with AI:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStepsForActiveTab = () => {
    switch (activeTab) {
      case 'morning':
        return routine.morningSteps;
      case 'evening':
        return routine.eveningSteps;
      case 'weekly':
        return routine.weeklyTreatments;
      default:
        return routine.morningSteps;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="aqua-gradient-bg rounded-3xl p-6 text-white shadow-xl border border-cyan-300/40 aqua-glow relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-white border border-white/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>AI Multi-Step Routine Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personalized Skincare Routine
          </h2>
          <p className="text-xs sm:text-sm text-cyan-50 font-medium max-w-2xl">
            Synchronized against required profile ({userProfile.skinType || 'Combination'} skin), target active formulations, and active climate factors.
          </p>
        </div>

        <button
          onClick={handleRegenerateAiRoutine}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-white/90 hover:bg-white text-cyan-900 font-bold text-xs rounded-2xl shadow-md transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50 active:scale-95"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-700" />
              <span>Regenerating with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-700" />
              <span>Regenerate AI Routine</span>
            </>
          )}
        </button>
      </div>

      {/* Seasonal Climate Banner */}
      <div className="apple-glass-card rounded-2xl p-4 flex items-start space-x-3 text-xs border border-cyan-200">
        <Info className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
        <div>
          <span className="text-sm font-extrabold block text-slate-900">Seasonal Climate Skincare Advice</span>
          <p className="mt-0.5 text-slate-700 font-medium leading-relaxed">{seasonalMsg}</p>
        </div>
      </div>

      {/* Schedule Tabs */}
      <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-cyan-100 pb-3">
          <button
            onClick={() => setActiveTab('morning')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeTab === 'morning'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-700 hover:bg-cyan-100/60'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Morning AM ({routine.morningSteps.length} Steps)</span>
          </button>

          <button
            onClick={() => setActiveTab('evening')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeTab === 'evening'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white/80 text-slate-700 hover:bg-cyan-100/60'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Evening PM ({routine.eveningSteps.length} Steps)</span>
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeTab === 'weekly'
                ? 'bg-cyan-800 text-white shadow-xs'
                : 'bg-white/80 text-slate-700 hover:bg-cyan-100/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Weekly Treatments ({routine.weeklyTreatments.length})</span>
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {getStepsForActiveTab().map((step) => (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border transition-all ${
                step.completedToday
                  ? 'bg-cyan-50/90 border-cyan-300'
                  : 'bg-white/90 border-cyan-100 hover:border-cyan-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => onToggleStep(step.id, activeTab)}
                    className="mt-1 transition-transform active:scale-95"
                  >
                    {step.completedToday ? (
                      <CheckCircle2 className="w-6 h-6 text-cyan-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-cyan-500" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900">{step.productName}</h4>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 text-cyan-900">
                        {step.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{step.instructions}</p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {step.activeIngredients.map((act, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-900 border border-cyan-200"
                        >
                          {act}
                        </span>
                      ))}

                      {step.waitTimeMinutes && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-300 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-cyan-700" />
                          <span>Wait {step.waitTimeMinutes} mins before next step</span>
                        </span>
                      )}

                      {step.frequencyDays && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {step.frequencyDays}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                    step.completedToday ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {step.completedToday ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
