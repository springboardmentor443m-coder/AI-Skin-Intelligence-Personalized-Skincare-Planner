import React from 'react';
import { X, Calendar, Clock, ArrowRight, TrendingUp } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, historyList, onSelectHistoryItem, onOpenProgressTracker }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(11, 15, 25, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'flex-end' }}>
      
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', height: '100vh', borderRadius: 0, padding: '32px 24px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-glass)' }}>
        
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Scan History</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Past assessment records saved in MongoDB</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Compare Progress Trigger Button */}
        <button
          onClick={() => { onClose(); onOpenProgressTracker(); }}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginBottom: '20px', fontSize: '13px', background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)' }}
        >
          <TrendingUp size={16} />
          <span>Track Progress / Betterment</span>
        </button>

        {/* History Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(!historyList || historyList.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px' }}>No saved assessment scans found yet.</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>Upload a face image while logged in to save history!</p>
            </div>
          ) : (
            historyList.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const stype = item.analysis?.skin_type?.prediction || "Unknown";
              const sconcern = item.analysis?.skin_concerns?.prediction || "Unknown";

              return (
                <div
                  key={item._id}
                  onClick={() => { onSelectHistoryItem(item); onClose(); }}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#818CF8'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {dateStr}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {timeStr}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#818CF8' }}>{stype} Skin</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}> • </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#F43F5E' }}>{sconcern}</span>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
