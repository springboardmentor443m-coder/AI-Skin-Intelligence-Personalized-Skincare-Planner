import React, { useState } from 'react';
import { TrendingUp, Award, ArrowDownRight, ArrowUpRight, Sparkles, X } from 'lucide-react';

export default function ProgressTracker({ isOpen, onClose, historyList, onCompareIds }) {
  if (!isOpen) return null;

  const [pastId, setPastId] = useState('');
  const [currId, setCurrId] = useState('');
  const [progressResult, setProgressResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompareSubmit = async () => {
    if (!pastId || !currId) return;
    setIsLoading(true);
    try {
      const res = await onCompareIds(pastId, currId);
      if (res && res.progress_report) {
        setProgressResult(res.progress_report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      
      <div className="glass-card" style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', marginBottom: '8px' }}>
            <TrendingUp size={14} color="#10B981" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>Skin Delta Engine</span>
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: 800 }}>Skin Betterment & Progress Tracker</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Compare older face assessment vs newer assessment to see percentage skin improvements</p>
        </div>

        {/* Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Past Assessment (Baseline)</label>
            <select
              value={pastId}
              onChange={(e) => setPastId(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', fontSize: '13px' }}
            >
              <option value="" style={{ background: '#0B0F19' }}>Select Past Scan...</option>
              {historyList && historyList.map((item) => (
                <option key={item._id} value={item._id} style={{ background: '#0B0F19' }}>
                  {new Date(item.timestamp).toLocaleDateString()} — {item.analysis?.skin_concerns?.prediction}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Current Assessment (Recent)</label>
            <select
              value={currId}
              onChange={(e) => setCurrId(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', fontSize: '13px' }}
            >
              <option value="" style={{ background: '#0B0F19' }}>Select Recent Scan...</option>
              {historyList && historyList.map((item) => (
                <option key={item._id} value={item._id} style={{ background: '#0B0F19' }}>
                  {new Date(item.timestamp).toLocaleDateString()} — {item.analysis?.skin_concerns?.prediction}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCompareSubmit}
          disabled={!pastId || !currId || isLoading}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginBottom: '32px', opacity: (!pastId || !currId || isLoading) ? 0.6 : 1 }}
        >
          {isLoading ? "Calculating Delta Score..." : "Analyze Skin Betterment Progress"}
        </button>

        {/* Progress Report View */}
        {progressResult && (
          <div style={{ background: 'rgba(16, 185, 129, 0.04)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '24px' }}>
            
            {/* Score Banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>{progressResult.status}</span>
                <h4 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{progressResult.headline}</h4>
              </div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: '#FFFFFF', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
                {progressResult.overall_betterment_score}%
              </div>
            </div>

            {/* Key Improvements List */}
            {progressResult.key_improvements && progressResult.key_improvements.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#10B981', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowDownRight size={16} /> Significant Concern Reductions
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {progressResult.key_improvements.map((imp, idx) => (
                    <div key={idx} style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{imp.message}</span>
                      <span style={{ fontWeight: 800, color: '#10B981' }}>-{imp.reduction_percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advice */}
            {progressResult.personalized_advice && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                💡 <strong>Dermatologist Note:</strong> {progressResult.personalized_advice}
              </p>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
