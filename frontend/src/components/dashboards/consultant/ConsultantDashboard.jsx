import ProgressBar from '@/components/shared/ProgressBar';

const CLIENTS = [
  { id: 1, name: 'Amara Okafor', score: 82, delta: '+6', adherence: 91, lastCheckIn: '2 days ago', flag: null },
  { id: 2, name: 'Priya Nair', score: 58, delta: '-3', adherence: 44, lastCheckIn: '9 days ago', flag: 'Adherence dropping' },
  { id: 3, name: 'Diego Fernández', score: 71, delta: '+1', adherence: 76, lastCheckIn: 'Today', flag: null },
  { id: 4, name: 'Ella Thompson', score: 65, delta: '+9', adherence: 88, lastCheckIn: 'Yesterday', flag: null },
  { id: 5, name: 'Noah Kim', score: 49, delta: '-8', adherence: 30, lastCheckIn: '14 days ago', flag: 'Needs outreach' },
];

export default function ConsultantDashboard({ consultantName = 'your' }) {
  const needsAttention = CLIENTS.filter((c) => c.flag).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="eyebrow">Active clients</p>
          <p className="font-display text-3xl font-bold text-ink-800">{CLIENTS.length}</p>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Avg. adherence</p>
          <p className="font-display text-3xl font-bold text-ink-800">
            {Math.round(CLIENTS.reduce((s, c) => s + c.adherence, 0) / CLIENTS.length)}%
          </p>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Needs attention</p>
          <p className="font-display text-3xl font-bold text-amber-dark">{needsAttention}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-ink-100 p-5">
          <p className="eyebrow">Caseload</p>
          <h3 className="font-display text-lg font-bold text-ink-800">Client progress overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Client</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">Adherence</th>
                <th className="px-5 py-3 font-semibold">Last check-in</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {CLIENTS.map((c) => (
                <tr key={c.id} className="border-b border-ink-50 last:border-0 hover:bg-surface-sunken">
                  <td className="px-5 py-4 font-medium text-ink-800">{c.name}</td>
                  <td className="px-5 py-4">
                    <span className="font-display font-semibold text-ink-800">{c.score}</span>
                    <span className={`ml-2 text-xs font-semibold ${c.delta.startsWith('+') ? 'text-amber-dark' : 'text-ink-400'}`}>
                      {c.delta}
                    </span>
                  </td>
                  <td className="w-40 px-5 py-4">
                    <ProgressBar value={c.adherence} tone={c.adherence >= 70 ? 'amber' : c.adherence >= 45 ? 'slate' : 'ink'} />
                  </td>
                  <td className="px-5 py-4 text-ink-500">{c.lastCheckIn}</td>
                  <td className="px-5 py-4">
                    {c.flag ? (
                      <span className="rounded-full bg-amber-light px-3 py-1 text-xs font-semibold text-ink-800">{c.flag}</span>
                    ) : (
                      <span className="text-xs font-medium text-ink-300">On track</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
