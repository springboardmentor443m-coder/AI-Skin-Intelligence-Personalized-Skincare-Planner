import Head from 'next/head';
import { useRef, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import RoutineCard from '@/components/routine/RoutineCard';
import ProgressBar from '@/components/shared/ProgressBar';

const INITIAL_STEPS = [
  { id: 's1', period: 'morning', product_name: 'Gentle gel cleanser', instruction: 'Lukewarm water, 30 seconds', done: true },
  { id: 's2', period: 'morning', product_name: 'Vitamin C serum (10%)', instruction: 'Pat dry first, wait 1 minute', done: true },
  { id: 's3', period: 'morning', product_name: 'Broad-spectrum SPF 50', instruction: 'Reapply at midday if outdoors', done: false },
  { id: 's4', period: 'evening', product_name: 'Oil cleanser (double cleanse)', instruction: 'Massage 60 seconds, emulsify, rinse', done: false },
  { id: 's5', period: 'evening', product_name: 'Retinol 0.3%', instruction: '2x weekly, buffer with moisturizer', done: false },
  { id: 's6', period: 'weekly', product_name: 'Enzyme exfoliating mask', instruction: 'Sunday evenings, 10 minutes', done: false },
];

export default function RoutinePlannerPage() {
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const dragIndex = useRef(null);

  function handleDragStart(e, index) {
    dragIndex.current = index;
  }

  function handleDragOver(_e, index) {
    if (dragIndex.current === null || dragIndex.current === index) return;
    setSteps((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex.current, 1);
      next.splice(index, 0, moved);
      dragIndex.current = index;
      return next;
    });
  }

  function handleDrop() {
    dragIndex.current = null;
  }

  function toggleDone(id) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }

  const completed = steps.filter((s) => s.done).length;
  const completionPct = Math.round((completed / steps.length) * 100);

  const grouped = ['morning', 'evening', 'weekly'].map((period) => ({
    period,
    items: steps.filter((s) => s.period === period),
  }));

  return (
    <>
      <Head><title>Routine planner — AI Skin Intelligence</title></Head>
      <Navbar role="user" userName="Jamie" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Generated from your latest assessment</p>
            <h1 className="font-display text-2xl font-bold text-ink-800">Your routine</h1>
          </div>
          <div className="w-48">
            <ProgressBar value={completionPct} label="Completed today" tone="amber" />
          </div>
        </div>

        <p className="mb-6 text-sm text-ink-400">Drag any step to reorder it within your day.</p>

        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.period}>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-400">
                {group.period}
              </h2>
              <div className="space-y-3">
                {group.items.map((step) => {
                  const globalIndex = steps.findIndex((s) => s.id === step.id);
                  return (
                    <RoutineCard
                      key={step.id}
                      step={step}
                      index={globalIndex}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onToggleDone={toggleDone}
                    />
                  );
                })}
                {group.items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-ink-100 p-4 text-center text-xs text-ink-300">
                    Nothing scheduled for this period yet.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
