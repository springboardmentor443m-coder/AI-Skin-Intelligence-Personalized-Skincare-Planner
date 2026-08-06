import React from 'react';
import { Sparkles, User, History, LogOut, CheckCircle2 } from 'lucide-react';

export default function Navbar({ currentUser, onOpenAuth, onOpenHistory, onLogout }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, padding: '16px 24px', background: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}>
            <Sparkles size={22} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }} className="text-gradient">
              AI Skin Intelligence
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Personalized Skincare Planner</p>
          </div>
        </div>

        {/* Status Pill & User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          <div className="glass-pill" style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
            <CheckCircle2 size={14} color="#10B981" />
            <span>FastAPI & Groq API Active</span>
          </div>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={onOpenHistory} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <History size={16} color="#818CF8" />
                <span>My Scans</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <User size={16} color="#818CF8" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{currentUser.full_name}</span>
              </div>

              <button onClick={onLogout} title="Logout" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
              <User size={16} />
              <span>Login / Register</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
