import React from 'react';
import { LogOut, ShieldCheck, Sparkles, History } from 'lucide-react';


export default function Header({ username, onLogout, setActiveTab }) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">

      <div className="flex items-center gap-3.5">

        <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-950/20">
          <Sparkles className="w-6 h-6" />
        </div>

        <div>
          <h1 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight leading-none">
            AI Skin Intelligence & Personalized Skincare Planner
          </h1>

          <p className="text-xs text-emerald-700 font-bold tracking-wider uppercase mt-1">
            Clinical Facial Analytics & Regimen Studio
          </p>
        </div>

      </div>


      <div className="flex items-center gap-3">

        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>FastAPI & Groq Active</span>
        </div>


        <button
          onClick={() => setActiveTab('history')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300/80 text-xs font-extrabold transition cursor-pointer shadow-2xs"
        >
          <History className="w-4 h-4 text-emerald-700" />
          <span>My History</span>
        </button>


        <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 rounded-xl border border-slate-300/80 text-xs font-black text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>{username}</span>
        </div>


        <button
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer rounded-xl hover:bg-rose-50"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>

      </div>

    </header>
  );
}