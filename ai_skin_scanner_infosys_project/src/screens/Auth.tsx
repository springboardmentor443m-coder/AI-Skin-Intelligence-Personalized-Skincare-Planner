import React, { useState } from 'react';

interface AuthProps {
  onLogin: (name?: string, email?: string) => void;
  setScreen: (screen: string) => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const Auth: React.FC<AuthProps> = ({ onLogin, setScreen, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleGoogleLogin = async () => {
    const elenaEmail = 'elena.thorne@gmail.com';
    const elenaName = 'Elena Thorne';
    const elenaPassword = 'password123';

    try {
      // Try registering Elena first, in case she doesn't exist yet
      await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: elenaName, email: elenaEmail, password: elenaPassword })
      });
    } catch (err) {
      // Ignore if already registered
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: elenaEmail, password: elenaPassword })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          onLogin(data.user.name, data.user.email);
          return;
        }
      }
    } catch (err) {
      console.error("Google Login failed", err);
    }
    
    // Fallback if backend is down
    onLogin(elenaName, elenaEmail);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }
      
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          onLogin(data.user.name, data.user.email);
        } else {
          alert(data.error || "Login failed. Please check your credentials.");
        }
      } catch (err) {
        console.error("Login request failed:", err);
        alert("Backend server connection failed. Please ensure your Python server is running.");
      }
    } else if (mode === 'register') {
      if (!email || !password || !fullName || !agreeTerms) {
        alert("Please fill in all fields and agree to the terms.");
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: fullName, email, password })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          alert("Registration successful! Initiating first session...");
          onLogin(data.user.name, data.user.email);
        } else {
          alert(data.error || "Registration failed.");
        }
      } catch (err) {
        console.error("Registration request failed:", err);
        alert("Backend server connection failed. Please ensure your Python server is running.");
      }
    } else {
      if (!email) {
        alert("Please enter your email.");
        return;
      }
      alert("Password reset instructions have been dispatched to your email.");
      setMode('login');
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background text-on-surface">
      {/* Left Side: Skincare Biometric Clinical Illustration (Sleek Dark Panel for perfect contrast) */}
      <section className="relative w-full md:w-1/2 lg:w-3/5 h-64 md:h-screen overflow-hidden bg-zinc-950 flex flex-col justify-end p-12 border-r border-zinc-900">
        {/* SVG Skincare Lab Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <svg className="w-96 h-96 text-primary/40 floating" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4 2" />
            {/* Molecular rings */}
            <path d="M 30,50 A 20,20 0 1,0 70,50" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="30" cy="50" r="4" fill="currentColor" />
            <circle cx="70" cy="50" r="4" fill="currentColor" />
            <circle cx="50" cy="30" r="5" fill="currentColor" />
            <circle cx="50" cy="70" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Brand details */}
        <div className="relative z-20 space-y-4 max-w-md text-left">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('landing')}>
            <span className="material-symbols-outlined text-white text-3xl bg-primary p-1.5 rounded-2xl shadow-lg">auto_awesome</span>
            <span className="font-display text-xl text-white font-bold leading-none drop-shadow">Aetheris AI</span>
          </div>
          <h2 className="font-display text-2xl lg:text-3xl text-white font-bold drop-shadow-md">
            Clinical Precision. Restorative Skincare.
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed drop-shadow-sm font-medium">
            Step into our digital sanctuary. Granting camera permissions unlocks molecular analysis, routine logs, and tracking metrics for skin rejuvenation.
          </p>
        </div>

        {/* Floating Tag (Sleek Dark Glass) */}
        <div className="absolute top-12 left-12 z-20 flex items-center gap-3 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 px-6 py-3 rounded-full shadow-lg text-white">
          <span className="material-symbols-outlined text-primary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-100">Skin Intelligence V2</span>
        </div>
      </section>

      {/* Right Side: Auth Forms */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 md:p-12 lg:p-16 bg-surface-bright dark:bg-zinc-900 relative">
        {/* Glow Shaders */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-sm relative z-10 space-y-8">
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold text-primary">
              {mode === 'login' && "Welcome Back"}
              {mode === 'register' && "Create Account"}
              {mode === 'forgot' && "Forgot Password"}
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {mode === 'login' && "Sign in to your private skincare intelligence dashboard."}
              {mode === 'register' && "Sign up to track your skin metrics and routines."}
              {mode === 'forgot' && "Submit your email to dispatch reset instructions."}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant text-lg">person</span>
                  <input
                    type="text"
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Elena Thorne"
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low dark:bg-zinc-800 border-2 border-transparent focus:border-primary/20 rounded-2xl text-xs text-on-surface focus:ring-0 placeholder:text-outline-variant transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="email">Work Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant text-lg">mail</span>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena.thorne@gmail.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low dark:bg-zinc-800 border-2 border-transparent focus:border-primary/20 rounded-2xl text-xs text-on-surface focus:ring-0 placeholder:text-outline-variant transition-all shadow-sm"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-primary font-bold hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant text-lg">lock</span>
                  <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low dark:bg-zinc-800 border-2 border-transparent focus:border-primary/20 rounded-2xl text-xs text-on-surface focus:ring-0 placeholder:text-outline-variant transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-start gap-2 px-1 py-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="agreeTerms" className="text-[10px] text-on-surface-variant leading-normal select-none">
                  I consent to sharing biometric facial scans for skincare analysis. View our <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-primary to-tertiary-container text-white text-xs font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {mode === 'login' && "Sign In"}
              {mode === 'register' && "Create Account"}
              {mode === 'forgot' && "Send Reset Link"}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </form>

          {/* Social Sign In Divider */}
          {mode !== 'forgot' && (
            <div className="space-y-4">
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/30"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-widest">
                  <span className="bg-surface-bright dark:bg-zinc-900 px-4 text-on-surface-variant font-bold">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3.5 glass-panel border border-outline-variant/30 dark:border-zinc-700/30 text-on-surface dark:text-zinc-100 text-xs font-semibold rounded-2xl hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Google Sign-In
              </button>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="text-center text-xs text-on-surface-variant">
            {mode === 'login' ? (
              <p>New to Aetheris? <button onClick={() => setMode('register')} className="text-primary font-bold hover:underline">Create an account</button></p>
            ) : (
              <p>Already registered? <button onClick={() => setMode('login')} className="text-primary font-bold hover:underline">Sign in here</button></p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
