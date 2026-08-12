import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Flame,
  Plus,
  BarChart3,
} from 'lucide-react';

export const ProgressTracking = ({
  logs,
  userProfile,
  onAddLogEntry,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedBeforeIndex, setSelectedBeforeIndex] = useState(0);
  const [selectedAfterIndex, setSelectedAfterIndex] = useState(Math.max(0, logs.length - 1));

  // Form states for new entry
  const [newAcne, setNewAcne] = useState(3);
  const [newHydration, setNewHydration] = useState(8);
  const [newRedness, setNewRedness] = useState(2);
  const [newNotes, setNewNotes] = useState('');

  const handleCreateEntry = (e) => {
    e.preventDefault();
    const entry = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      healthScore: Math.round(75 + newHydration * 2 - newAcne - newRedness),
      acneLevel: newAcne,
      hydrationLevel: newHydration,
      rednessLevel: newRedness,
      routineAdherencePercent: userProfile.routineConsistency,
      notes: newNotes || 'Daily skin health metrics logged.',
    };
    onAddLogEntry(entry);
    setShowLogModal(false);
    setNewNotes('');
  };

  const beforeLog = logs[selectedBeforeIndex] || logs[0];
  const afterLog = logs[selectedAfterIndex] || logs[logs.length - 1];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="aqua-gradient-bg rounded-3xl p-6 text-white shadow-xl border border-cyan-300/40 aqua-glow relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-white border border-white/30">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-200" />
            <span>Telemetry Progress & Longitudinal Skin Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Skin Health Progress & Telemetry History
          </h2>
          <p className="text-xs sm:text-sm text-cyan-50 font-medium max-w-2xl">
            Track 30-day health score trends, skin metrics progress, and routine adherence consistency.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-5 py-2.5 bg-white/90 hover:bg-white text-cyan-900 font-bold text-xs rounded-2xl shadow-md flex items-center space-x-2 transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 text-cyan-700" />
          <span>Log Daily Health Metrics</span>
        </button>
      </div>

      {/* Progress Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="apple-glass rounded-3xl p-5 border border-cyan-200/60 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">Routine Adherence Streak</span>
            <span className="text-3xl font-black text-slate-900">{userProfile.routineConsistency}%</span>
          </div>
          <div className="p-3.5 bg-cyan-100 text-cyan-800 rounded-2xl">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="apple-glass rounded-3xl p-5 border border-cyan-200/60 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">30-Day Score Growth</span>
            <span className="text-3xl font-black text-cyan-700">+10% Score</span>
          </div>
          <div className="p-3.5 bg-cyan-600 text-white rounded-2xl shadow-xs">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="apple-glass rounded-3xl p-5 border border-cyan-200/60 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">Total Telemetry Check-Ins</span>
            <span className="text-3xl font-black text-slate-900">{logs.length} Entries</span>
          </div>
          <div className="p-3.5 bg-cyan-100 text-cyan-800 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Metric Comparison Section */}
      <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-100">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Longitudinal Telemetry Comparator</h3>
            <p className="text-xs text-slate-600 font-medium">Compare skin health metrics over time across different dates</p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div>
              <span className="text-slate-500 font-bold mr-1">Baseline:</span>
              <select
                value={selectedBeforeIndex}
                onChange={(e) => setSelectedBeforeIndex(Number(e.target.value))}
                className="px-3 py-1.5 border border-cyan-200 rounded-xl bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
              >
                {logs.map((l, i) => (
                  <option key={l.id} value={i}>
                    {l.date} (Score: {l.healthScore})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-slate-500 font-bold mr-1">Current:</span>
              <select
                value={selectedAfterIndex}
                onChange={(e) => setSelectedAfterIndex(Number(e.target.value))}
                className="px-3 py-1.5 border border-cyan-200 rounded-xl bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
              >
                {logs.map((l, i) => (
                  <option key={l.id} value={i}>
                    {l.date} (Score: {l.healthScore})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {beforeLog && afterLog && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Baseline Card */}
            <div className="space-y-3 bg-white/80 p-5 rounded-2xl border border-cyan-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-full">
                  BASELINE • {beforeLog.date}
                </span>
                <span className="font-black text-slate-900 text-lg">
                  Score: {beforeLog.healthScore}/100
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Breakout Level:</span>
                  <span className="text-slate-800">{beforeLog.acneLevel || 5}/10</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Hydration Index:</span>
                  <span className="text-cyan-700">{beforeLog.hydrationLevel || 6}/10</span>
                </div>
              </div>
              <p className="text-xs text-slate-700 bg-cyan-50/80 p-3 rounded-xl border border-cyan-100 font-medium">
                "{beforeLog.notes}"
              </p>
            </div>

            {/* Current Card */}
            <div className="space-y-3 bg-white/80 p-5 rounded-2xl border border-cyan-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full shadow-xs">
                  CURRENT • {afterLog.date}
                </span>
                <span className="font-black text-cyan-800 text-lg">
                  Score: {afterLog.healthScore}/100
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Breakout Level:</span>
                  <span className="text-emerald-700">{afterLog.acneLevel || 2}/10</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Hydration Index:</span>
                  <span className="text-cyan-700">{afterLog.hydrationLevel || 9}/10</span>
                </div>
              </div>
              <p className="text-xs text-slate-800 bg-cyan-100/70 p-3 rounded-xl border border-cyan-200 font-medium">
                "{afterLog.notes}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Historical Check-In Logs List */}
      <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900">Telemetry Log History</h3>
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl border border-cyan-100 bg-white/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-cyan-100 text-cyan-800 rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900 block">{log.date}</span>
                  <p className="text-slate-600 font-medium">{log.notes}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <span className="text-slate-500 font-bold block">Health Score</span>
                  <span className="font-black text-cyan-800 text-base">{log.healthScore}/100</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-bold block">Adherence</span>
                  <span className="font-extrabold text-slate-900 text-sm">{log.routineAdherencePercent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="apple-glass rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cyan-300 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-cyan-100">
              <h3 className="font-extrabold text-lg text-slate-900">Log Daily Skin Health Metrics</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-500 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Acne / Breakout Severity (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newAcne}
                  onChange={(e) => setNewAcne(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-bold">{newAcne}/10</span>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Hydration Index (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newHydration}
                  onChange={(e) => setNewHydration(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-bold">{newHydration}/10</span>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Observations / Notes</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="How does your skin feel today? Active ingredients used?"
                  className="w-full p-3 border border-cyan-200 bg-white/90 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-cyan-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl aqua-gradient-bg text-white font-bold shadow-md hover:brightness-110"
                >
                  Save Metrics Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
