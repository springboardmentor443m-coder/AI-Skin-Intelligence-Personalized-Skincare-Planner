import { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import ProgressBar from '@/components/shared/ProgressBar';
import { baseChartOptions, buildAdherenceBarDataset } from '@/utils/chart_helpers';

const MODELS = [
  { name: 'skin_classifier v4.2', type: 'Computer vision', accuracy: 93, status: 'Live' },
  { name: 'recommendation_engine v2.1', type: 'XGBoost', accuracy: 87, status: 'Live' },
  { name: 'skin_classifier v4.3', type: 'Computer vision', accuracy: 95, status: 'Shadow testing' },
];

const SYSTEM_METRICS = [
  { label: 'API uptime (30d)', value: 99.8 },
  { label: 'Inference latency SLA met', value: 96 },
  { label: 'Queue processed on time', value: 89 },
];

const USAGE_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const USAGE_VALUES = [82, 88, 79, 91, 95, 60, 54];

export default function AdminDashboard() {
  const chartRef = useRef(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SYSTEM_METRICS.map((m) => (
          <div key={m.label} className="card p-5">
            <p className="mb-3 eyebrow">{m.label}</p>
            <ProgressBar value={m.value} tone={m.value >= 95 ? 'amber' : 'slate'} />
          </div>
        ))}
      </div>

      <section className="card p-6">
        <p className="eyebrow">Daily active assessments</p>
        <h3 className="mb-4 font-display text-lg font-bold text-ink-800">Platform usage, last 7 days</h3>
        <div className="h-64">
          <Bar ref={chartRef} data={buildAdherenceBarDataset(USAGE_LABELS, USAGE_VALUES)} options={baseChartOptions} />
        </div>
      </section>

      <section id="models" className="card overflow-hidden">
        <div className="border-b border-ink-100 p-5">
          <p className="eyebrow">ML pipeline</p>
          <h3 className="font-display text-lg font-bold text-ink-800">Model tracking</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3 font-semibold">Model</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Accuracy</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {MODELS.map((m) => (
              <tr key={m.name} className="border-b border-ink-50 last:border-0 hover:bg-surface-sunken">
                <td className="px-5 py-4 font-medium text-ink-800">{m.name}</td>
                <td className="px-5 py-4 text-ink-500">{m.type}</td>
                <td className="px-5 py-4 font-display font-semibold text-ink-800">{m.accuracy}%</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      m.status === 'Live' ? 'bg-amber-light text-ink-800' : 'bg-slate-light text-ink-800'
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
