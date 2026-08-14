import React from 'react';
import { Wand2, LogOut, User } from 'lucide-react';


export default function Navbar({ username, onLogout }) {
  return (
    <nav className="bg-slate-800/90 border-b border-slate-700/80 sticky top-0 z-40 backdrop-blur-md">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <div className="flex items-center gap-2.5">

          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 ring-1 ring-emerald-500/20">
            <Wand2 className="w-5 h-5" />
          </div>

          <span className="font-bold text-lg text-white tracking-tight">
            GlowAI
            <span className="text-emerald-400 font-normal text-sm sm:inline hidden">
              {' '}| Skin Intelligence
            </span>
          </span>

        </div>


        <div className="flex items-center gap-4">

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-700/50 text-slate-300 text-sm">

            <User className="w-4 h-4 text-emerald-400" />

            <span className="font-medium text-slate-200">
              {username || 'User'}
            </span>

          </div>


          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition text-sm font-medium cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>

      </div>

    </nav>
  );
}