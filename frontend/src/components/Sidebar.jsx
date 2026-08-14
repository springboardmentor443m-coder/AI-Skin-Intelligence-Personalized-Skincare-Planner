import React from 'react';
import {
  LayoutDashboard,
  RefreshCw,
  Calendar,
  Package,
  BarChart3,
  Activity
} from 'lucide-react';


export default function Sidebar({ activeTab, setActiveTab }) {

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard & Scanner',
      icon: LayoutDashboard
    },
    {
      id: 'comparison',
      label: 'Skin Comparison Report',
      icon: RefreshCw
    },
    {
      id: 'routine',
      label: '7-Day Planner',
      icon: Calendar
    },
    {
      id: 'products',
      label: 'Recommended Products',
      icon: Package
    },
    {
      id: 'analytics',
      label: 'Analytics & Insights',
      icon: BarChart3
    },
  ];


  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 h-full text-slate-200 flex-shrink-0">

      <div className="flex items-center gap-3 mb-8 px-2">

        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white shadow-md shadow-emerald-950/40">
          <Activity className="w-5 h-5 text-white" />
        </div>

        <div>
          <h1 className="text-base font-extrabold text-white tracking-tight leading-none">
            SkinIQ
          </h1>

          <p className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase mt-1">
            Skin Analysis & Insights
          </p>
        </div>

      </div>


      <nav className="space-y-1.5">

        {navItems.map((item) => {

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );

        })}

      </nav>

    </aside>
  );
}