import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
  Cpu,
  Download,
  CheckCircle2,
  Lock,
  Search,
} from 'lucide-react';

export const AdminDashboard = ({ users, onRoleUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [downloadNotice, setDownloadNotice] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleExportSystemLogs = () => {
    setDownloadNotice('System Audit & Usage Logs Exported to CSV.');
    setTimeout(() => setDownloadNotice(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="aqua-gradient-bg rounded-3xl p-6 text-white shadow-xl border border-cyan-300/40 aqua-glow relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-white border border-white/30">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-200" />
            <span>Platform Administration & RBAC Control</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Health & Role Governance
          </h2>
          <p className="text-xs sm:text-sm text-cyan-50 font-medium max-w-2xl">
            Manage user authorization, monitor Gemini AI latency, and audit security compliance.
          </p>
        </div>
        <button
          onClick={handleExportSystemLogs}
          className="px-5 py-2.5 bg-white/90 hover:bg-white text-cyan-900 font-bold text-xs rounded-2xl shadow-md flex items-center space-x-2 transition-all active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4 text-cyan-700" />
          <span>Export Audit Logs</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-glass rounded-3xl p-5 border border-cyan-200/60 shadow-md flex items-center space-x-3">
          <div className="p-3.5 bg-cyan-100 text-cyan-900 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">Total Platform Users</span>
            <span className="text-2xl font-black text-slate-900">1,482</span>
          </div>
        </div>

        <div className="apple-glass rounded-3xl p-5 border border-cyan-200/60 shadow-md flex items-center space-x-3">
          <div className="p-3.5 bg-cyan-600 text-white rounded-2xl shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">AI Assessments Today</span>
            <span className="text-2xl font-black text-cyan-800">348</span>
          </div>
        </div>

        <div className="apple-glass rounded-3xl p-5 border border-cyan-200/60 shadow-md flex items-center space-x-3">
          <div className="p-3.5 bg-teal-100 text-teal-900 rounded-2xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">Gemini Flash Latency</span>
            <span className="text-2xl font-black text-teal-800">180ms</span>
          </div>
        </div>

        <div className="apple-glass rounded-3xl p-5 border border-cyan-200/60 shadow-md flex items-center space-x-3">
          <div className="p-3.5 bg-cyan-100 text-cyan-800 rounded-2xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">Security Status</span>
            <span className="text-2xl font-black text-cyan-800">100% Secure</span>
          </div>
        </div>
      </div>

      {/* User Management & RBAC Table */}
      <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-100">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-slate-500 font-medium">Assign roles to control feature privileges across platform modules</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-cyan-700" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-cyan-200 rounded-xl bg-white/90 font-bold text-slate-900"
              />
            </div>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-cyan-200 rounded-xl bg-white/90 font-bold text-slate-900"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="consultant">Consultant</option>
              <option value="dermatologist">Dermatologist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {downloadNotice && (
          <div className="p-3.5 bg-cyan-100 border border-cyan-300 text-cyan-900 rounded-2xl text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-700" />
            <span>{downloadNotice}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-cyan-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Skin Type</th>
                <th className="py-3 px-3">Current Role</th>
                <th className="py-3 px-3">Access Level</th>
                <th className="py-3 px-3 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-100 font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-cyan-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full aqua-gradient-bg text-white flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 block">{u.name}</span>
                        <span className="text-[10px] text-slate-500">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-bold">{u.skinType}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] border ${
                        u.role === 'admin'
                          ? 'bg-slate-900 text-white border-slate-800'
                          : u.role === 'dermatologist'
                          ? 'bg-teal-100 text-teal-900 border-teal-300'
                          : u.role === 'consultant'
                          ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                          : 'bg-white text-slate-800 border-slate-200'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px] font-medium">
                    {u.role === 'admin'
                      ? 'Full System Authorization'
                      : u.role === 'dermatologist'
                      ? 'Clinical Rx & Telemetry Access'
                      : u.role === 'consultant'
                      ? 'Client Routine Editor Access'
                      : 'Consumer Dashboard Access'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => onRoleUpdate(u.id, e.target.value)}
                      className="px-2.5 py-1 text-xs border border-cyan-200 rounded-xl bg-white font-bold text-slate-900"
                    >
                      <option value="user">User</option>
                      <option value="consultant">Consultant</option>
                      <option value="dermatologist">Dermatologist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
