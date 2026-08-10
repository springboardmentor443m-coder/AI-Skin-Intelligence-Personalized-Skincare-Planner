import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Calendar, 
  CloudSnow, 
  RotateCw, 
  CheckCircle2, 
  BookmarkCheck,
  Award
} from 'lucide-react';

export const Routines = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('morning'); // morning, evening, weekly, seasonal
  
  // Track daily checkbox states, persist to localStorage
  const [completedSteps, setCompletedSteps] = useState({});

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const response = await api.get('/routine/latest');
      setRoutines(response.data);
    } catch (err) {
      console.error('Failed to fetch routines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  // Load completion states from localStorage on routines load
  useEffect(() => {
    if (routines.length > 0 && user) {
      const today = new Date().toISOString().slice(0, 10);
      const savedStates = {};
      
      routines.forEach(r => {
        r.steps.forEach(step => {
          const key = `completion_${user.id}_${today}_${r.routine_type}_${step.step_order}`;
          const isDone = localStorage.getItem(key) === 'true';
          savedStates[key] = isDone;
        });
      });
      setCompletedSteps(savedStates);
    }
  }, [routines, user]);

  const handleStepToggle = (routineType, stepOrder) => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const key = `completion_${user.id}_${today}_${routineType}_${stepOrder}`;
    
    setCompletedSteps(prev => {
      const updatedValue = !prev[key];
      localStorage.setItem(key, updatedValue ? 'true' : 'false');
      return {
        ...prev,
        [key]: updatedValue
      };
    });
  };

  const regenerateRoutines = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/routine/generate');
      setRoutines(response.data);
      
      // Reset daily completion on rebuild
      const today = new Date().toISOString().slice(0, 10);
      routines.forEach(r => {
        r.steps.forEach(step => {
          const key = `completion_${user.id}_${today}_${r.routine_type}_${step.step_order}`;
          localStorage.removeItem(key);
        });
      });
      setCompletedSteps({});
    } catch (err) {
      console.error('Failed to regenerate routines:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getActiveRoutine = () => {
    if (activeTab === 'seasonal') {
      // Default to winter for current season (July can be summer, let's show summer)
      return routines.find(r => r.routine_type === 'summer');
    }
    return routines.find(r => r.routine_type === activeTab);
  };

  const activeRoutine = getActiveRoutine();
  const today = user ? new Date().toISOString().slice(0, 10) : '';

  // Calculate compliance statistics
  const getComplianceStats = () => {
    if (!activeRoutine || !user) return { total: 0, completed: 0, percent: 0 };
    const rType = activeRoutine.routine_type;
    let total = activeRoutine.steps.length;
    let completed = 0;

    activeRoutine.steps.forEach(step => {
      const key = `completion_${user.id}_${today}_${rType}_${step.step_order}`;
      if (completedSteps[key]) completed;
      if (completedSteps[key]) completed++;
    });

    return {
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const stats = getComplianceStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            Skincare Routine Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scientifically mapped steps optimized for skin barriers, concern management, and cellular repair.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={regenerateRoutines}
          isLoading={generating}
          className="cursor-pointer"
        >
          <RotateCw className="w-4 h-4 mr-2" /> Re-generate Routine
        </Button>
      </div>

      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('morning')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'morning' 
              ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
              : 'text-slate-500 hover:text-brand-500'
          }`}
        >
          <Sun className={`w-4 h-4 ${activeTab === 'morning' ? 'text-amber-500 animate-spin-slow' : ''}`} /> Morning (AM)
        </button>
        
        <button
          onClick={() => setActiveTab('evening')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'evening' 
              ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
              : 'text-slate-500 hover:text-brand-500'
          }`}
        >
          <Moon className={`w-4 h-4 ${activeTab === 'evening' ? 'text-blue-400 animate-pulse' : ''}`} /> Evening (PM)
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'weekly' 
              ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
              : 'text-slate-500 hover:text-brand-500'
          }`}
        >
          <Calendar className="w-4 h-4" /> Weekly Exfoliations
        </button>

        <button
          onClick={() => setActiveTab('seasonal')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'seasonal' 
              ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
              : 'text-slate-500 hover:text-brand-500'
          }`}
        >
          <CloudSnow className="w-4 h-4" /> Seasonal (Summer/Winter)
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
        </div>
      )}

      {/* Main Routine Display */}
      {!loading && activeRoutine && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Steps Display Panel (Staggered Animation) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <BookmarkCheck className="w-4 h-4 text-brand-500" /> 
              Step-By-Step Program ({activeTab === 'seasonal' ? 'Summer Adjustments' : activeRoutine.routine_type + ' routine'})
            </h3>
            
            {activeRoutine.steps.map((step, index) => {
              const isChecked = completedSteps[`completion_${user?.id}_${today}_${activeRoutine.routine_type}_${step.step_order}`] || false;
              
              return (
                <div 
                  key={step.step_order}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card 
                    glass 
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 ${
                      isChecked 
                        ? 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/5 opacity-80' 
                        : ''
                    }`}
                  >
                    {/* Step Number Circle */}
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isChecked 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-brand-50 dark:bg-slate-800 text-brand-500'
                    }`}>
                      {step.step_order}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-brand-100/50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-extrabold text-[10px] rounded-lg uppercase tracking-wide">
                          {step.action}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {step.product_name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        <strong className="text-slate-500">Key Elements: </strong> {step.ingredients}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        {step.instructions}
                      </p>
                    </div>

                    {/* Completion Checkbox */}
                    <div className="self-end sm:self-center pt-2 sm:pt-0">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleStepToggle(activeRoutine.routine_type, step.step_order)}
                          className="w-5 h-5 rounded-lg text-emerald-500 border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className={`text-[10px] uppercase font-bold ${isChecked ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {isChecked ? 'Done' : 'Mark Done'}
                        </span>
                      </label>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Compliance & Floating SVG Side Cards */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* AM/PM Floating visual element */}
            <Card className="flex flex-col items-center justify-center py-8 text-center relative overflow-hidden bg-gradient-to-br from-slate-50 to-brand-50/20 dark:from-slate-900 dark:to-slate-900/10">
              {activeTab === 'morning' && (
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl animate-pulse-soft" />
                  <Sun className="w-16 h-16 text-amber-500 animate-spin-slow drop-shadow-md" />
                </div>
              )}
              {activeTab === 'evening' && (
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse-soft" />
                  <Moon className="w-16 h-16 text-blue-400 animate-bounce-slow drop-shadow-md" />
                </div>
              )}
              {activeTab === 'weekly' && (
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  <Calendar className="w-16 h-16 text-indigo-500 drop-shadow-md" />
                </div>
              )}
              {activeTab === 'seasonal' && (
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  <CloudSnow className="w-16 h-16 text-sky-400 drop-shadow-md" />
                </div>
              )}

              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">
                {activeTab} Schedule
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                {activeTab === 'morning' && 'Lock in hydration and shield against UV oxidative cell stress.'}
                {activeTab === 'evening' && 'Unwind structural grime and apply target cellular repair treatments.'}
                {activeTab === 'weekly' && 'Deep clarify pores and shed stubborn dead skin layers.'}
                {activeTab === 'seasonal' && 'Shift lipid-hydration balancing dynamically as weather changes.'}
              </p>
            </Card>

            {/* Compliance Progress Bar Card */}
            <Card className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" /> Daily Compliance Tracker
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Today's Progress</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{stats.percent}%</span>
                </div>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{stats.completed} of {stats.total} steps done</span>
                  <span>{stats.percent === 100 ? 'Perfect Score!' : 'Keep going'}</span>
                </div>
              </div>

              {/* Celebration Banner */}
              {stats.percent === 100 && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-center text-xs font-bold animate-pulse-soft flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" /> Routine Completed! Your skin thanks you! ✨
                </div>
              )}
            </Card>
          </div>

        </div>
      )}
    </div>
  );
};
export default Routines;
