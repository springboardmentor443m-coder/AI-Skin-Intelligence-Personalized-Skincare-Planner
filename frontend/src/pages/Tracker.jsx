import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  LineChart as ChartIcon, 
  Droplet, 
  Moon, 
  Activity, 
  BookOpen, 
  PlusCircle, 
  CheckCircle, 
  Flame, 
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  Database
} from 'lucide-react';

export const Tracker = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    avg_hydration: 0,
    avg_sleep: 0,
    avg_stress: 0,
    compliance_rate: 0
  });
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState(false);
  const [selectedLogIdx, setSelectedLogIdx] = useState(null);

  // Form states
  const [hydration, setHydration] = useState(70);
  const [sleep, setSleep] = useState(8);
  const [stress, setStress] = useState(3);
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const logsRes = await api.get('/tracker/logs');
      setLogs(logsRes.data);
      if (logsRes.data.length > 0) {
        setSelectedLogIdx(logsRes.data.length - 1);
      } else {
        setSelectedLogIdx(null);
      }
      
      const statsRes = await api.get('/tracker/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load tracker metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setLogging(true);
    setSuccessMsg('');
    try {
      await api.post('/tracker/logs', {
        health_score: 95, // Syncs latest AI assessment score on backend
        hydration_level: hydration,
        sleep_hours: sleep,
        stress_level: stress,
        acne_level: "none",
        dryness_level: "none",
        sensitivity_level: "none",
        notes
      });
      
      setSuccessMsg("Today's skin metrics logged successfully!");
      setNotes('');
      fetchData();
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
    } catch (err) {
      console.error('Failed to submit skin log:', err);
    } finally {
      setLogging(false);
    }
  };

  // Triggers sequential historical logs creation to populate graphics instantly
  const triggerDemoSeeding = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const demoLogs = [
        { daysAgo: 6, score: 70, hydration: 45, sleep: 5.5, stress: 7, notes: "Skin feels dry and tight. Mild redness on cheeks." },
        { daysAgo: 5, score: 72, hydration: 50, sleep: 6, stress: 6, notes: "Dryness is slightly better after applying serum." },
        { daysAgo: 4, score: 75, hydration: 58, sleep: 8, stress: 4, notes: "Skin hydration level improving. Added hyaluronic acid." },
        { daysAgo: 3, score: 79, hydration: 65, sleep: 7.5, stress: 4, notes: "Barrier is feeling stronger. Less sensitivity reported." },
        { daysAgo: 2, score: 83, hydration: 72, sleep: 8, stress: 3, notes: "Very soft skin texture today. Checked compliance." },
        { daysAgo: 1, score: 86, hydration: 80, sleep: 9, stress: 2, notes: "Redness has almost fully cleared up. Sleeping well." },
        { daysAgo: 0, score: 90, hydration: 85, sleep: 8, stress: 2, notes: "Skin looks glowing and healthy! Optimized hydration." }
      ];

      for (const item of demoLogs) {
        const targetDate = new Date();
        targetDate.setDate(now.getDate() - item.daysAgo);
        
        await api.post('/tracker/logs', {
          health_score: item.score,
          hydration_level: item.hydration,
          sleep_hours: item.sleep,
          stress_level: item.stress,
          acne_level: "none",
          dryness_level: "none",
          sensitivity_level: "none",
          notes: item.notes,
          logged_at: targetDate.toISOString()
        });
      }
      await fetchData();
    } catch (err) {
      console.error("Demo seeding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to construct dynamic responsive SVG paths
  const renderSVGChart = () => {
    if (logs.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 text-xs max-w-sm mx-auto space-y-4">
          <div className="p-4 bg-brand-500/10 rounded-full text-brand-500 animate-pulse-soft">
            <ChartIcon className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">No Analytics Curve Available</h4>
            <p className="text-slate-400 leading-relaxed mt-1">
              You need at least 2 logged days of skin parameters to render historical curves and compliance records.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={triggerDemoSeeding}
            className="font-bold text-xs flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:bg-slate-50"
          >
            <Database className="w-3.5 h-3.5" /> Seed 7-Day Demo History
          </Button>
        </div>
      );
    }

    const svgWidth = 500;
    const svgHeight = 220;
    const paddingX = 40;
    const paddingY = 30;

    const chartWidth = svgWidth - paddingX * 2;
    const chartHeight = svgHeight - paddingY * 2;

    const numPoints = logs.length;
    
    // Map values: Health Score (30 to 100), Hydration (0 to 100)
    const pointsScore = logs.map((log, idx) => {
      const x = paddingX + (idx / (numPoints - 1)) * chartWidth;
      const y = paddingY + chartHeight - ((log.health_score - 30) / 70) * chartHeight;
      return { x, y, val: log.health_score, date: new Date(log.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
    });

    const pointsHydration = logs.map((log, idx) => {
      const x = paddingX + (idx / (numPoints - 1)) * chartWidth;
      const y = paddingY + chartHeight - (log.hydration_level / 100) * chartHeight;
      return { x, y, val: log.hydration_level };
    });

    const pathScore = pointsScore.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const pathHydration = pointsHydration.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-brand-500">
              <span className="w-2.5 h-2.5 bg-brand-500 rounded-full inline-block" /> Skin Health Index
            </span>
            <span className="flex items-center gap-1.5 font-bold text-sky-400">
              <span className="w-2.5 h-2.5 bg-sky-400 rounded-full inline-block" /> Hydration Level (%)
            </span>
          </div>
          <span className="text-slate-400 font-medium">Click dots below to inspect historical entries</span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[450px] overflow-visible">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingY + ratio * chartHeight;
              return (
                <line 
                  key={ratio}
                  x1={paddingX} 
                  y1={y} 
                  x2={svgWidth - paddingX} 
                  y2={y} 
                  stroke="rgba(200, 200, 200, 0.08)" 
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Hydration Gradient Fill */}
            <path
              d={`${pathHydration} L ${pointsHydration[numPoints - 1].x} ${paddingY + chartHeight} L ${pointsHydration[0].x} ${paddingY + chartHeight} Z`}
              fill="url(#hydration-grad)"
              opacity="0.08"
            />

            {/* Health Score Line */}
            <path 
              d={pathScore} 
              fill="none" 
              stroke="#D4AF37" 
              strokeWidth={3} 
              strokeLinecap="round" 
              className="drop-shadow-[0_2px_4px_rgba(212,175,55,0.2)]"
            />
            {/* Hydration Line */}
            <path 
              d={pathHydration} 
              fill="none" 
              stroke="#38bdf8" 
              strokeWidth={3} 
              strokeLinecap="round" 
              className="drop-shadow-[0_2px_4px_rgba(56,189,248,0.2)]"
            />

            {/* Interactive Circles - Health Score */}
            {pointsScore.map((p, idx) => (
              <g key={idx} className="cursor-pointer group" onClick={() => setSelectedLogIdx(idx)}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={selectedLogIdx === idx ? 7 : 5} 
                  fill={selectedLogIdx === idx ? '#FAF6F0' : '#D4AF37'} 
                  stroke="#D4AF37" 
                  strokeWidth={2}
                  className="transition-all duration-150 group-hover:scale-125"
                />
                <text 
                  x={p.x} 
                  y={p.y - 12} 
                  textAnchor="middle" 
                  className="text-[9px] font-black fill-slate-700 dark:fill-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {p.val}
                </text>
              </g>
            ))}

            {/* Interactive Circles - Hydration */}
            {pointsHydration.map((p, idx) => (
              <g key={idx} className="cursor-pointer group" onClick={() => setSelectedLogIdx(idx)}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={selectedLogIdx === idx ? 6 : 4} 
                  fill={selectedLogIdx === idx ? '#FAF6F0' : '#38bdf8'} 
                  stroke="#38bdf8" 
                  strokeWidth={1.5}
                />
              </g>
            ))}

            {/* X Axis Labels */}
            {pointsScore.map((p, idx) => (
              <text 
                key={idx}
                x={p.x} 
                y={svgHeight - 10} 
                textAnchor="middle" 
                className="text-[8px] font-bold fill-slate-400"
              >
                {p.date}
              </text>
            ))}

            {/* Gradients Definition */}
            <defs>
              <linearGradient id="hydration-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  };

  // Render routine compliance grid logs
  const renderCalendarLogs = () => {
    const totalDays = 30;
    const today = new Date();
    const calendarDays = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const current = new Date();
      current.setDate(today.getDate() - i);
      const strDate = current.toISOString().slice(0, 10);
      
      const logOnDay = logs.find(log => log.logged_at.slice(0, 10) === strDate);
      calendarDays.push({
        date: current,
        hasLog: !!logOnDay,
        dayNum: current.getDate()
      });
    }

    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-150 dark:border-slate-800/80">
          <Calendar className="w-4 h-4 text-brand-500" /> 30-Day Routine Compliance
        </h4>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {calendarDays.map((d, idx) => (
            <div 
              key={idx} 
              className={`h-11 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold border transition-colors relative group cursor-pointer ${
                d.hasLog 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800 text-slate-400'
              }`}
            >
              <span>{d.dayNum}</span>
              {d.hasLog && <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5" />}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-950 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none z-20">
                {d.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {d.hasLog ? 'Logs Recorded' : 'No entry'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const selectedLog = logs[selectedLogIdx];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          Skin Health & Progress Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Log daily lifestyle parameters and inspect detailed analytics showing skin barrier trends over time.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
        </div>
      )}

      {!loading && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="flex items-start gap-4">
              <div className="p-3.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Avg. Hydration</span>
                <p className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                  {stats.avg_hydration}%
                </p>
              </div>
            </Card>

            <Card className="flex items-start gap-4">
              <div className="p-3.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Avg. Sleep</span>
                <p className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                  {stats.avg_sleep} hrs
                </p>
              </div>
            </Card>

            <Card className="flex items-start gap-4">
              <div className="p-3.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Avg. Stress Index</span>
                <p className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                  {stats.avg_stress} / 10
                </p>
              </div>
            </Card>

            <Card className="flex items-start gap-4">
              <div className="p-3.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Routine Compliance</span>
                <p className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                  {stats.compliance_rate}%
                </p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Analytical Graph & Calendar Display */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Line graph */}
              <Card className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-150 dark:border-slate-800/80">
                  <ChartIcon className="w-4 h-4 text-brand-500" /> Historical Progress Curve
                </h3>
                {renderSVGChart()}
              </Card>

              {/* Inspect Log details */}
              {selectedLog && (
                <Card className="border border-brand-500/15 space-y-3 bg-brand-50/10 dark:bg-slate-900/35 relative overflow-hidden animate-fade-in text-left">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/80">
                    <span className="text-xs font-bold text-slate-500">
                      Diary Entry: {new Date(selectedLog.logged_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="px-2 py-0.5 bg-brand-100/50 dark:bg-brand-950/20 text-brand-500 font-extrabold text-[9px] rounded-lg uppercase tracking-wide">
                      Health Index: {selectedLog.health_score}
                    </span>
                  </div>
                  
                  {/* Grid details (Resolved white-on-white) */}
                  <div className="grid grid-cols-3 gap-2.5 py-1 text-center text-xs">
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Sleep</span>
                      <span className="font-extrabold text-slate-705 dark:text-slate-200">{selectedLog.sleep_hours} hrs</span>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Hydration</span>
                      <span className="font-extrabold text-slate-705 dark:text-slate-200">{selectedLog.hydration_level}%</span>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Stress Scale</span>
                      <span className="font-extrabold text-slate-705 dark:text-slate-200">{selectedLog.stress_level} / 10</span>
                    </div>
                  </div>

                  {selectedLog.notes ? (
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-850/80">
                      "{selectedLog.notes}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-450 italic">No notes recorded for this log entry.</p>
                  )}
                </Card>
              )}

              {/* Scrollable list of past logs (New feature!) */}
              {logs.length > 0 && (
                <Card className="space-y-3.5 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-150 dark:border-slate-800/80">
                    <BookOpen className="w-4 h-4 text-indigo-500" /> Log History Logbook
                  </h4>
                  <div className="max-h-[160px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1.5">
                    {logs.map((log, idx) => (
                      <div 
                        key={log.id} 
                        onClick={() => setSelectedLogIdx(idx)}
                        className={`flex justify-between items-center py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl cursor-pointer transition-colors ${
                          selectedLogIdx === idx ? 'bg-brand-50/20 dark:bg-brand-950/5 border-l-4 border-brand-500 pl-3' : 'pl-2'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-250">
                            {new Date(log.logged_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <p className="text-[10px] text-slate-400 max-w-sm truncate">
                            {log.notes || 'No diary notes...'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-500">
                            Health: <span className="text-brand-500">{log.health_score}</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-450" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Month calendar */}
              <Card>{renderCalendarLogs()}</Card>
            </div>

            {/* Daily tracker entry logging form */}
            <div className="space-y-6">
              <Card className="space-y-4 text-left">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-150 dark:border-slate-800/80">
                  <PlusCircle className="w-4 h-4 text-emerald-500" /> Log Today's Metrics
                </h3>

                {successMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl animate-pulse-soft">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleLogSubmit} className="space-y-4">
                  {/* Hydration Slider */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-sky-500/5 border border-sky-500/10 dark:border-sky-900/20">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-650 dark:text-slate-300">
                      <label className="flex items-center gap-1"><Droplet className="w-3.5 h-3.5 text-sky-400" /> Hydration Level</label>
                      <span className="text-sky-400">{hydration}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100"
                      value={hydration}
                      onChange={(e) => setHydration(parseInt(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>

                  {/* Sleep Slider */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 dark:border-indigo-900/20">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-650 dark:text-slate-300">
                      <label className="flex items-center gap-1"><Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep Hours</label>
                      <span className="text-indigo-400">{sleep} hrs</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="24"
                      value={sleep}
                      onChange={(e) => setSleep(parseInt(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer"
                    />
                  </div>

                  {/* Stress Slider */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 dark:border-rose-900/20">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-650 dark:text-slate-300">
                      <label className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-rose-400" /> Stress Level</label>
                      <span className="text-rose-400">{stress} / 10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10"
                      value={stress}
                      onChange={(e) => setStress(parseInt(e.target.value))}
                      className="w-full accent-rose-400 cursor-pointer"
                    />
                  </div>

                  {/* Text Notes Diary */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-brand-500" /> Diary Notes & Observations
                    </label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Skin barrier feels extremely hydrated today. Mild redness on cheeks has subsided..."
                      className="w-full p-3 bg-slate-50/50 dark:bg-slate-900/35 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-xl text-xs outline-none min-h-[90px] transition-colors"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full cursor-pointer" 
                    isLoading={logging}
                  >
                    Save Log & Sync Graph
                  </Button>
                </form>
              </Card>

              {/* Informational Guidance Panel */}
              <Card className="bg-gradient-to-r from-brand-500 to-orange-400 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-full bg-white/10 skew-x-12 translate-x-4 pointer-events-none" />
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Cellular Science Tip
                </h4>
                <p className="text-[11px] leading-relaxed text-brand-50/90 mt-2 font-medium text-left">
                  Studies show that 7-8 hours of sleep allows your cells to execute maximum metabolic cellular repair. Impaired hydration (under 50%) slows barrier lipid synthesis.
                </p>
              </Card>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default Tracker;
