import React, { useEffect, useState } from 'react';
import { History, Clock, Image as ImageIcon, Trash2 } from 'lucide-react';
import { getScanHistory, clearScanHistory } from '../services/api';

export default function HistoryView({ activeAnalysis, savedPreviewUrl }) {
  const [scanHistory, setScanHistory] = useState([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [activeAnalysis]);

  const fetchHistory = async () => {
    try {
      const data = await getScanHistory();

      if (data?.history) {
        setScanHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to load history from database:', err);
    }
  };

  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear your complete scan history? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setClearing(true);

      await clearScanHistory();

      setScanHistory([]);
    } catch (err) {
      console.error('Failed to clear scan history:', err);

      alert(
        err.response?.data?.detail ||
          'Failed to clear scan history. Please try again.'
      );
    } finally {
      setClearing(false);
    }
  };

  const currentConcern =
    activeAnalysis?.predicted_class || 'None';

  const currentConfidence = activeAnalysis?.confidence
    ? (activeAnalysis.confidence * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">

      {/* =========================================================
          1. UPLOADED SCAN SESSIONS HISTORY
          WHITE HEADER SECTION
      ========================================================= */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div className="flex items-center gap-3.5">

            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <History className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Uploaded Scan Sessions History
              </h2>

              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Complete chronological log of all past diagnostic uploads
              </p>
            </div>

          </div>


          {/* TOTAL RECORDS + CLEAR HISTORY */}

          <div className="flex items-center gap-3 self-start sm:self-auto">

            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              {scanHistory.length > 0
                ? `${scanHistory.length} Total Saved Records`
                : '0 Total Saved Records'}
            </span>


            <button
              type="button"
              onClick={handleClearHistory}
              disabled={clearing || scanHistory.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />

              <span>
                {clearing ? 'Clearing...' : 'Clear History'}
              </span>
            </button>

          </div>

        </div>

      </div>


      {/* =========================================================
          2. RECENT SCAN LOGS
          DARK ANALYTICS-STYLE SECTION
      ========================================================= */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 text-slate-200">

        {/* Section Header */}

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">

          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">

            <Clock className="w-4 h-4 text-emerald-400" />

            <span>Recent Scan Logs</span>

          </h3>


          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {scanHistory.length} Saved Records
          </span>

        </div>


        {/* =====================================================
            SCAN RECORDS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-3">

          {/* -----------------------------------------------------
              CURRENT / MOST RECENT ACTIVE SCAN
          ----------------------------------------------------- */}

          {savedPreviewUrl && (

            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">

              <div className="flex items-center gap-4">

                {/* Image */}

                <div className="w-16 h-16 bg-slate-950 rounded-xl overflow-hidden border border-emerald-500/30 flex-shrink-0">

                  <img
                    src={savedPreviewUrl}
                    alt="Active Scan"
                    className="w-full h-full object-cover"
                  />

                </div>


                {/* Scan Details */}

                <div>

                  <div className="flex items-center gap-2">

                    <span className="text-sm font-black text-white capitalize">
                      {currentConcern}
                    </span>

                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      Most Recent
                    </span>

                  </div>


                  <span className="text-xs text-slate-400 font-medium block mt-0.5">
                    Uploaded Today at{' '}
                    {new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                </div>

              </div>


              {/* Score */}

              <div className="text-right">

                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
                  Skin Score
                </span>

                <span className="text-lg font-black text-emerald-400">
                  {currentConfidence}%
                </span>

              </div>

            </div>

          )}


          {/* -----------------------------------------------------
              DATABASE SCAN LOGS
          ----------------------------------------------------- */}

          {scanHistory.map((scan, idx) => (

            <div
              key={scan._id || scan.id || idx}
              className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition flex flex-col sm:flex-row items-center justify-between gap-4"
            >

              {/* Left Side */}

              <div className="flex items-center gap-4">

                {/* Image */}

                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 border border-slate-800 overflow-hidden">

                  {scan.image_url ? (
                    <img
                      src={scan.image_url}
                      alt={scan.predicted_class || 'Skin Scan'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}

                </div>


                {/* Details */}

                <div>

                  <p className="text-sm font-black text-white capitalize">
                    {scan.predicted_class || 'Clear Skin'}
                  </p>

                  <span className="text-xs text-slate-400 font-medium">
                    {scan.timestamp
                      ? new Date(scan.timestamp).toLocaleString()
                      : 'Saved Scan'}
                  </span>

                  {scan.age && (
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Age: {scan.age}
                      {scan.gender
                        ? ` • ${scan.gender}`
                        : ''}
                      {scan.skin_type
                        ? ` • ${scan.skin_type}`
                        : ''}
                    </span>
                  )}

                </div>

              </div>


              {/* Score */}

              <span className="text-xs font-bold px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 whitespace-nowrap">

                {(
                  (scan.confidence || 0) * 100
                ).toFixed(1)}
                % Skin Score

              </span>

            </div>

          ))}


          {/* -----------------------------------------------------
              EMPTY STATE
          ----------------------------------------------------- */}

          {!savedPreviewUrl && scanHistory.length === 0 && (

            <div className="text-center p-10 text-slate-500 text-xs font-semibold">

              <ImageIcon className="w-8 h-8 mx-auto mb-3 text-slate-600" />

              <p>
                No scan sessions uploaded yet.
              </p>

              <p className="text-slate-600 mt-1">
                Upload a photo on the Dashboard to view history logs.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}