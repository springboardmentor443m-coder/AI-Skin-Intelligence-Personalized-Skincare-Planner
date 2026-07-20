import Head from 'next/head';
import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import UserDashboard from '@/components/dashboards/user/UserDashboard';
import ConsultantDashboard from '@/components/dashboards/consultant/ConsultantDashboard';
import DermatologistDashboard from '@/components/dashboards/dermatologist/DermatologistDashboard';
import AdminDashboard from '@/components/dashboards/admin/AdminDashboard';

const DASHBOARD_BY_ROLE = {
  user: UserDashboard,
  consultant: ConsultantDashboard,
  dermatologist: DermatologistDashboard,
  admin: AdminDashboard,
};

const ROLE_TITLES = {
  user: 'Your skin dashboard',
  consultant: 'Client caseload',
  dermatologist: 'Patient panel',
  admin: 'System overview',
};

export default function DashboardPage() {
  // In production this comes from the authenticated session (JWT claims),
  // not local state — kept simple here since this is the frontend-only build.
  const [role, setRole] = useState('user');
  const [userName, setUserName] = useState('Jamie');

  useEffect(() => {
    const savedRole = window.localStorage.getItem('asi_demo_role');
    if (savedRole) setRole(savedRole);
  }, []);

  function changeRole(next) {
    setRole(next);
    window.localStorage.setItem('asi_demo_role', next);
  }

  const ActiveDashboard = DASHBOARD_BY_ROLE[role];

  return (
    <>
      <Head><title>Dashboard — AI Skin Intelligence</title></Head>
      <Navbar role={role} userName={userName} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">{role}</p>
            <h1 className="font-display text-2xl font-bold text-ink-800">{ROLE_TITLES[role]}</h1>
          </div>

          {/* Demo-only role switcher so every dashboard variant is reachable without a live backend */}
          <div className="flex gap-1 rounded-full border border-ink-100 bg-white p-1 text-xs">
            {Object.keys(DASHBOARD_BY_ROLE).map((r) => (
              <button
                key={r}
                onClick={() => changeRole(r)}
                className={`rounded-full px-3 py-1.5 font-semibold capitalize transition-colors ${
                  role === r ? 'bg-ink-700 text-white' : 'text-ink-400 hover:text-ink-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <ActiveDashboard userName={userName} consultantName={userName} />
      </main>
    </>
  );
}
