import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin, onRegister }) {
  if (!isOpen) return null;

  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Unisex');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isRegister) {
        await onRegister(fullName, email, password, gender);
      } else {
        await onLogin(email, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Authentication failed. Check details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '32px', position: 'relative' }}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', marginBottom: '12px' }}>
            <Sparkles size={14} color="#818CF8" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#818CF8' }}>MongoDB JWT Auth</span>
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 800 }}>
            {isRegister ? "Create Your Account" : "Welcome Back"}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {isRegister ? "Save assessments & get gender-tailored skincare" : "Log in to view saved skin scans"}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#F43F5E', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Gender Selection Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Gender (For Custom Product Matching)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Male', val: 'Male', icon: '👨' },
                    { label: 'Female', val: 'Female', icon: '👩' },
                    { label: 'Unisex', val: 'Unisex', icon: '⚧️' }
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setGender(g.val)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: gender === g.val ? '1px solid #818CF8' : '1px solid var(--border-glass)',
                        background: gender === g.val ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: gender === g.val ? '#FFFFFF' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{g.icon}</span>
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', fontSize: '13px' }}
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {isLoading ? "Processing..." : (isRegister ? "Register Account" : "Sign In")}
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
            style={{ background: 'transparent', border: 'none', color: '#818CF8', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? "Log In" : "Register"}
          </button>
        </div>

      </div>
    </div>
  );
}
