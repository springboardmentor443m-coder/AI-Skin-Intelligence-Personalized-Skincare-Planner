import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';
import { Wand2, User, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';


export default function AuthPage({ onLoginSuccess, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);


  // Fallback handler to support either prop name passed from App.jsx
  const handleAuthCallback = onLoginSuccess || onAuthSuccess;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);


    try {
      if (isLogin) {
        await loginUser(username, password);
        if (handleAuthCallback) {
          handleAuthCallback(username);
        }
      } else {
        // Register user and redirect to login view
        await registerUser(username, password);
        setSuccessMsg('Account created successfully! Please log in to continue.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 text-white relative"
      style={{ backgroundImage: "url('/bg-auth.png')" }}
    >
      <div className="absolute inset-0 bg-slate-950/80 z-0" />

      <div className="relative z-10 max-w-md w-full space-y-6 bg-[#0f172a] p-8 rounded-3xl border border-slate-800 shadow-2xl">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-teal-500/10 rounded-2xl text-teal-400 mb-1 border border-teal-500/20">
            <Wand2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            AI Skin Intelligence
          </h2>

          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
            sign in & upload your image and get your skin assessment results
          </p>
        </div>

        {successMsg && (
          <div className="bg-teal-950/60 border border-teal-500/50 text-teal-300 p-3 rounded-xl text-xs text-center font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/60 border border-rose-500/50 text-rose-300 p-3 rounded-xl text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Username
            </label>

            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>

            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl text-xs transition duration-200 shadow-lg shadow-teal-950/50 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
            }}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            {isLogin ? (
              <span>
                Don't have an account?{' '}
                <strong className="text-teal-400 font-bold hover:underline">
                  Sign up
                </strong>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <strong className="text-teal-400 font-bold hover:underline">
                  Log in
                </strong>
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Encrypted Session Security</span>
        </div>

      </div>
    </div>
  );
}