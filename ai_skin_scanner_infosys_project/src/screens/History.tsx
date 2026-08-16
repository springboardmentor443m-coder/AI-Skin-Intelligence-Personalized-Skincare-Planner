import React, { useState, useEffect } from 'react';
import type { ScanMetrics } from '../App';

interface HistoricalScan {
  id: string;
  email: string;
  timestamp: string;
  image: string;
  prediction: string;
  metrics: ScanMetrics;
}

interface HistoryProps {
  setScreen: (screen: string) => void;
  userEmail: string;
  onSelectScan: (metrics: ScanMetrics, image: string) => void;
}

export const History: React.FC<HistoryProps> = ({ setScreen, userEmail, onSelectScan }) => {
  const [scans, setScans] = useState<HistoricalScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/scan/history?email=${encodeURIComponent(userEmail)}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to retrieve scan history from server.');
        }
        return res.json();
      })
      .then(data => {
        setScans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history:", err);
        setError("Could not retrieve past scan logs. Please check server connection.");
        setLoading(false);
      });
  }, [userEmail]);

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-primary border-primary/40 bg-primary/5';
    if (score >= 60) return 'text-amber-500 border-amber-500/40 bg-amber-500/5';
    return 'text-rose-500 border-rose-500/40 bg-rose-500/5';
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'Unknown Date';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Biometric Scan History</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Review past skin diagnostics, track index variations over time, and recall prior recommendations.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-on-surface-variant font-medium">Fetching history logs from MongoDB...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center glass-card rounded-2xl border border-rose-500/20 bg-rose-500/5 max-w-xl mx-auto space-y-4">
          <span className="material-symbols-outlined text-rose-500 text-4xl">cloud_off</span>
          <h3 className="text-sm font-bold text-on-surface">Connection Offline</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">{error}</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-3xl border border-white/20 max-w-2xl mx-auto space-y-6 select-none">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-primary text-4xl">history</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-on-surface font-display text-lg font-bold">No Scan Records Yet</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed max-w-md mx-auto">
              Your diagnostic calendar is empty. Upload and scan a skin photograph to start recording history and unlock progress graphs.
            </p>
          </div>
          <button 
            onClick={() => setScreen('scan')}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            Start First Dermal Scan
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {scans.map(scan => {
            const m = scan.metrics;
            const healthScore = m.score || 80;
            const skinType = m.skinType || scan.prediction || 'Normal';
            const acneD = m.acneDetected;
            const spotsD = m.darkSpotsDetected;
            const whiteD = m.whiteheadsDetected;

            return (
              <div 
                key={scan.id} 
                className="glass-card p-5 rounded-2xl border border-white/20 flex flex-col md:flex-row items-center gap-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
              >
                {/* Image Preview Container */}
                <div className="relative w-full md:w-32 aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 border border-outline-variant/10 shrink-0 shadow-md">
                  <img 
                    src={scan.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    alt="Past Face Scan Preview"
                  />
                </div>

                {/* Info summary */}
                <div className="flex-1 space-y-2.5 w-full text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-on-surface-variant">{formatDate(scan.timestamp)}</h4>
                      <h3 className="text-sm font-bold text-on-surface mt-0.5">{skinType} Skin Profile</h3>
                    </div>
                    {/* Score badge */}
                    <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getScoreColorClass(healthScore)} flex items-center gap-1.5 shrink-0 self-start sm:self-center shadow-sm`}>
                      <span className="material-symbols-outlined text-sm">health_metrics</span>
                      Health Score: {healthScore}
                    </div>
                  </div>

                  {/* Diagnostic Badges */}
                  <div className="flex flex-wrap gap-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      acneD ? 'text-rose-600 bg-rose-500/10 border border-rose-500/20' : 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/20'
                    }`}>
                      Acne: {acneD ? `Seen (${m.acne}%)` : 'Optimal'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      spotsD ? 'text-rose-600 bg-rose-500/10 border border-rose-500/20' : 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/20'
                    }`}>
                      Dark Spots: {spotsD ? `Seen (${m.darkSpots || m.pigmentation}%)` : 'Optimal'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      whiteD ? 'text-rose-600 bg-rose-500/10 border border-rose-500/20' : 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/20'
                    }`}>
                      Whiteheads: {whiteD ? `Seen (${m.whiteheads || 30}%)` : 'Optimal'}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onSelectScan(m, scan.image)}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:border-primary shrink-0 self-stretch md:self-center"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  View Report
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
