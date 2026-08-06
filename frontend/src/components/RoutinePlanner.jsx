import React, { useState, useEffect } from 'react';
import { Calendar, Sun, Moon, Sparkles, CheckCircle2, Circle, RefreshCw, Trophy } from 'lucide-react';

export default function RoutinePlanner({ weeklyRoutine, analysisId }) {
  if (!weeklyRoutine || !weeklyRoutine.weekly_calendar) return null;

  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});

  const storageKey = `ticked_routine_steps_${analysisId || 'default'}`;

  // Load ticked steps from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading ticked steps", e);
    }
  }, [storageKey]);

  const toggleStep = (dayName, timeOfDay, stepKey) => {
    const key = `${dayName}_${timeOfDay}_${stepKey}`;
    const updated = {
      ...completedSteps,
      [key]: !completedSteps[key]
    };
    setCompletedSteps(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving ticked steps", e);
    }
  };

  const resetCurrentDay = (dayName) => {
    const updated = { ...completedSteps };
    Object.keys(updated).forEach(k => {
      if (k.startsWith(`${dayName}_`)) {
        delete updated[k];
      }
    });
    setCompletedSteps(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const calendar = weeklyRoutine.weekly_calendar;
  const currentDayPlan = calendar[activeDayIdx] || calendar[0];
  const dayName = currentDayPlan?.day || "Monday";

  // Calculate daily completion stats
  const amSteps = currentDayPlan?.am_routine ? Object.entries(currentDayPlan.am_routine) : [];
  const pmSteps = currentDayPlan?.pm_routine ? Object.entries(currentDayPlan.pm_routine) : [];
  const totalDailySteps = amSteps.length + pmSteps.length;
  
  let tickedCount = 0;
  amSteps.forEach(([key]) => {
    if (completedSteps[`${dayName}_AM_${key}`]) tickedCount++;
  });
  pmSteps.forEach(([key]) => {
    if (completedSteps[`${dayName}_PM_${key}`]) tickedCount++;
  });

  const dailyProgressPct = totalDailySteps > 0 ? Math.round((tickedCount / totalDailySteps) * 100) : 0;

  return (
    <section style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', marginBottom: '12px' }}>
          <Sparkles size={14} color="#818CF8" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#818CF8' }}>
            {weeklyRoutine.engine || "Groq LLM Llama-3.3 70B Dermatologist Engine"}
          </span>
        </div>
        <h3 style={{ fontSize: '32px', fontWeight: 800 }}>
          7-Day Interactive Routine Tracker
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
          Tick off your daily AM & PM skincare steps as you complete them! Progress saves automatically.
        </p>
      </div>

      {/* Clinical Assessment Box if provided by LLM */}
      {weeklyRoutine.dermatologist_assessment && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', borderColor: 'rgba(99, 102, 241, 0.3)', background: 'rgba(99, 102, 241, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
            <Sparkles size={16} /> Clinical AI Assessment
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5 }}>
            {weeklyRoutine.dermatologist_assessment}
          </p>
        </div>
      )}

      {/* Days Tabs (Monday to Sunday) */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {calendar.map((dayItem, idx) => (
          <button
            key={idx}
            onClick={() => setActiveDayIdx(idx)}
            className="glass-pill"
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: activeDayIdx === idx ? '1px solid #818CF8' : '1px solid rgba(255, 255, 255, 0.08)',
              background: activeDayIdx === idx ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)' : 'rgba(255, 255, 255, 0.03)',
              color: activeDayIdx === idx ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: activeDayIdx === idx ? 700 : 500,
              transition: 'all 0.2s ease'
            }}
          >
            {dayItem.day}
          </button>
        ))}
      </div>

      {/* Day Details View */}
      {currentDayPlan && (
        <div className="glass-card" style={{ padding: '32px' }}>
          
          {/* Day Title, Phase Badge & Interactive Progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h4 style={{ fontSize: '24px', fontWeight: 800 }}>{currentDayPlan.day} Schedule</h4>
                <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px', background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  {currentDayPlan.cycle_phase || "Skin Cycling Phase"}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {tickedCount} of {totalDailySteps} steps completed today
              </p>
            </div>

            {/* Daily Completion Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ minWidth: '160px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  <span style={{ color: dailyProgressPct === 100 ? '#10B981' : '#818CF8' }}>
                    {dailyProgressPct === 100 ? "🎉 All Completed!" : `${dailyProgressPct}% Done`}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${dailyProgressPct}%`, height: '100%', background: dailyProgressPct === 100 ? 'linear-gradient(90deg, #10B981, #06B6D4)' : 'linear-gradient(90deg, #6366F1, #818CF8)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>

              {tickedCount > 0 && (
                <button
                  onClick={() => resetCurrentDay(dayName)}
                  title="Reset Day's Progress"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                >
                  <RefreshCw size={14} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Interactive AM / PM Routines Split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            
            {/* AM Routine */}
            <div style={{ background: 'rgba(245, 158, 11, 0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', fontWeight: 700, marginBottom: '16px' }}>
                <Sun size={20} /> AM Morning Routine
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {amSteps.map(([stepKey, text]) => {
                  const isChecked = !!completedSteps[`${dayName}_AM_${stepKey}`];
                  return (
                    <div
                      key={stepKey}
                      onClick={() => toggleStep(dayName, 'AM', stepKey)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isChecked ? (
                        <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <Circle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <span style={{ fontSize: '13px', lineHeight: 1.4, textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: isChecked ? 400 : 500 }}>
                        {text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PM Routine */}
            <div style={{ background: 'rgba(99, 102, 241, 0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontWeight: 700, marginBottom: '16px' }}>
                <Moon size={20} /> PM Night Routine
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pmSteps.map(([stepKey, text]) => {
                  const isChecked = !!completedSteps[`${dayName}_PM_${stepKey}`];
                  return (
                    <div
                      key={stepKey}
                      onClick={() => toggleStep(dayName, 'PM', stepKey)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isChecked ? (
                        <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <Circle size={18} color="#818CF8" style={{ flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <span style={{ fontSize: '13px', lineHeight: 1.4, textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: isChecked ? 400 : 500 }}>
                        {text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Dermatologist Tip */}
          {currentDayPlan.dermatologist_tip && (
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} style={{ flexShrink: 0 }} />
              <span><strong>Dermatologist Tip:</strong> {currentDayPlan.dermatologist_tip}</span>
            </div>
          )}

        </div>
      )}

    </section>
  );
}
