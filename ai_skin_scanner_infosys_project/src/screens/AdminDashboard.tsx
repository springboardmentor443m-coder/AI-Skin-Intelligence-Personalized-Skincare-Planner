import React from 'react';
import type { UserProfileData } from '../App';

interface AdminDashboardProps {
  userProfile: UserProfileData;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userProfile }) => {
  const stats = [
    { label: 'Total Users', value: '18,294', change: '+12.4%', icon: 'group' },
    { label: 'Active Users', value: '4,892', change: '+8.2%', icon: 'bolt' },
    { label: 'Daily AI Scans', value: '1,204', change: '+18.6%', icon: 'photo_camera' },
    { label: 'Model Accuracy', value: '91.56%', change: '+1.8%', icon: 'psychology' },
  ];

  const logs = [
    { user: userProfile.name, action: 'Scan Completed', status: 'Success', time: '10:42 AM' },
    { user: 'Marcus Sterling', action: 'Routine Logged', status: 'Success', time: '10:15 AM' },
    { user: 'Clara Vance', action: 'Profile Created', status: 'Success', time: '09:48 AM' },
    { user: 'System Worker', action: 'Dermal Model Training', status: '91.56% Acc', time: '08:00 AM' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Platform Administration</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Monitor neural model performance, check platform resource status, and audit user activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl border border-white/20 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-display font-bold text-on-surface">{stat.value}</h3>
              <span className="text-[9px] font-bold text-secondary">{stat.change} vs last wk</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* System Health */}
        <div className="glass-card p-6 rounded-2xl border border-white/20 space-y-4">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/10 pb-2">System Health Status</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-on-surface">Neural Scanner Inference (API)</span>
              <span className="text-secondary font-bold">Operational (42ms)</span>
            </div>
            <div className="w-full bg-surface-container-highest dark:bg-zinc-800 h-1.5 rounded-full">
              <div className="bg-secondary w-full h-full rounded-full"></div>
            </div>

            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-on-surface">Biometrics Database Cluster</span>
              <span className="text-secondary font-bold">Operational (99.98%)</span>
            </div>
            <div className="w-full bg-surface-container-highest dark:bg-zinc-800 h-1.5 rounded-full">
              <div className="bg-secondary w-[99%] h-full rounded-full"></div>
            </div>

            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-on-surface">Webcam Stream Signalling Nodes</span>
              <span className="text-secondary font-bold">Operational</span>
            </div>
            <div className="w-full bg-surface-container-highest dark:bg-zinc-800 h-1.5 rounded-full">
              <div className="bg-secondary w-full h-full rounded-full"></div>
            </div>
          </div>
        </div>

        {/* User Management & Auditing */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/20 space-y-4">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/10 pb-2">Recent Administrator Audit Logs</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2 px-3">Subject</th>
                  <th className="py-2 px-3">Action Item</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface-variant font-medium">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-primary/5 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-on-surface">{log.user}</td>
                    <td className="py-2.5 px-3">{log.action}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-secondary/10 text-secondary">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
