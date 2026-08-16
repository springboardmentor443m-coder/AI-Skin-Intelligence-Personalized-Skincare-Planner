import React, { useState } from 'react';
import type { UserProfileData, ScanMetrics } from '../App';

interface Client {
  id: number;
  name: string;
  skinType: string;
  lastScan: string;
  status: string;
  nextAppointment: string;
}

interface ConsultantDashboardProps {
  userProfile: UserProfileData;
  scanMetrics: ScanMetrics;
}

export const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ userProfile, scanMetrics }) => {
  const clients: Client[] = [
    { id: 1, name: userProfile.name, skinType: userProfile.skinType, lastScan: 'Today, 10:42 AM', status: `Improving (Score: ${scanMetrics.score})`, nextAppointment: '2026-07-15 14:00' },
    { id: 2, name: 'Marcus Sterling', skinType: 'Oily', lastScan: '3 days ago', status: 'Stable', nextAppointment: '2026-07-12 11:30' },
    { id: 3, name: 'Clara Vance', skinType: 'Dry', lastScan: '1 week ago', status: 'Needs Hydration', nextAppointment: '2026-07-20 09:00' },
  ];

  const [search, setSearch] = useState('');

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Consultant Management Dashboard</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Review active clients, monitor progress histories, and coordinate appointment calendars.</p>
      </div>

      <div className="grid grid-cols-12 gap-card-gap">
        {/* Client List */}
        <div className="col-span-12 lg:col-span-8 glass-card p-6 rounded-2xl border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider">Active Client List</h3>
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-9 pr-4 py-1.5 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Client Name</th>
                  <th className="py-2.5 px-3">Skin Type</th>
                  <th className="py-2.5 px-3">Last Evaluation</th>
                  <th className="py-2.5 px-3">Diagnostic Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface-variant font-medium">
                {filtered.map(client => (
                  <tr key={client.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-on-surface">{client.name}</td>
                    <td className="py-3 px-3">{client.skinType}</td>
                    <td className="py-3 px-3">{client.lastScan}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        client.status.includes('Improving') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => alert(`Opening records file for ${client.name}...`)}
                        className="text-primary font-bold hover:underline cursor-pointer"
                      >
                        Open File
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointment Calendar List */}
        <div className="col-span-12 lg:col-span-4 glass-card p-6 rounded-2xl border border-white/20 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-4">Upcoming Consultations</h3>
            <div className="space-y-3">
              {clients.map(client => (
                <div key={client.id} className="p-3 bg-surface-container-low dark:bg-zinc-800/40 rounded-xl border border-outline-variant/10 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-on-surface">{client.name}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{client.nextAppointment}</p>
                  </div>
                  <button 
                    onClick={() => alert(`Starting video consultation for ${client.name}`)}
                    className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg cursor-pointer"
                    title="Launch session"
                  >
                    <span className="material-symbols-outlined text-base">video_call</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => alert("Opening full appointment booker...")}
            className="w-full mt-6 py-2 border border-primary/20 rounded-xl text-primary font-bold text-[10px] tracking-wider uppercase transition-all hover:bg-primary/5 cursor-pointer"
          >
            Manage Appointments
          </button>
        </div>
      </div>
    </div>
  );
};
