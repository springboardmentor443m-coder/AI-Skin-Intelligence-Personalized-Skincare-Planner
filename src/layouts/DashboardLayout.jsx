import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BellRing, PanelLeftOpen, Search } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setCollapsed((value) => !value)} className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600">
                <PanelLeftOpen className="h-4 w-4" />
              </button>
              <div>
                <p className="text-sm font-semibold text-slate-900">Skincare workspace</p>
                <p className="text-xs text-slate-500">Calm, personalized, and beautifully organized</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 sm:flex">
                <Search className="h-4 w-4" />
                Search routines
              </div>
              <button className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600">
                <BellRing className="h-4 w-4" />
              </button>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
