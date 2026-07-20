import { useRef } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import ScoreRing from '@/components/shared/ScoreRing';
import ProgressBar from '@/components/shared/ProgressBar';
import {
  baseChartOptions,
  buildScoreTrendDataset,
  buildBreakdownDoughnut,
} from '@/utils/chart_helpers';

const TREND_LABELS = ['Jun 1', 'Jun 8', 'Jun 15', 'Jun 22', 'Jun 29', 'Jul 6', 'Jul 13'];
const TREND_VALUES = [58, 61, 64, 63, 68, 71, 74];

const CHECKLIST = [
  { id: 1, label: 'Cleanse + vitamin C serum', done: true },
  { id: 2, label: 'Broad-spectrum SPF 50', done: true },
  { id: 3, label: 'Evening retinol (2x weekly)', done: false },
  { id: 4, label: 'Weekly progress photo', done: false },
];

export default function UserDashboard({ userName = 'Jamie' }) {
  const chartRef = useRef(null);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="card flex flex-col items-center justify-center gap-4 p-8 lg:col-span-1">
        <p className="eyebrow">Today&apos;s reading</p>
        <ScoreRing score={74} sublabel="+3 vs. last check-in" />
        <p className="text-center text-sm text-ink-400">
          Hi {userName} — your barrier strength is trending up. Keep this week&apos;s routine steady.
        </p>
      </section>

      <section className="card p-6 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="eyebrow">6-week trend</p>
            <h3 className="font-display text-lg font-bold text-ink-800">Skin health score</h3>
          </div>
        </div>
        <div className="h-64">
          <Line
            ref={chartRef}
            data={buildScoreTrendDataset(chartRef.current?.ctx, TREND_LABELS, TREND_VALUES)}
            options={baseChartOptions}
          />
        </div>
      </section>

      <section className="card p-6">
        <p className="eyebrow">Metric breakdown</p>
        <h3 className="mb-4 font-display text-lg font-bold text-ink-800">Where the score comes from</h3>
        <div className="h-48">
          <Doughnut
            data={buildBreakdownDoughnut(78, 69, 75)}
            options={{ ...baseChartOptions, scales: undefined, cutout: '65%' }}
          />
        </div>
      </section>

      <section className="card p-6 lg:col-span-2">
        <p className="eyebrow">Today&apos;s checklist</p>
        <h3 className="mb-4 font-display text-lg font-bold text-ink-800">Routine adherence</h3>
        <ul className="mb-5 space-y-3">
          {CHECKLIST.map((item) => (
            <li key={item.id} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] ${
                  item.done ? 'border-amber bg-amber text-ink-800' : 'border-ink-200'
                }`}
              >
                {item.done && '✓'}
              </span>
              <span className={item.done ? 'text-ink-300 line-through' : 'text-ink-700'}>{item.label}</span>
            </li>
          ))}
        </ul>
        <ProgressBar value={50} label="Steps completed today" tone="amber" />
      </section>
    </div>
  );
}
