import { useState } from 'react';

const PERIOD_STYLES = {
  morning: { label: 'Morning', chip: 'bg-amber-light text-ink-800' },
  evening: { label: 'Evening', chip: 'bg-ink-700 text-white' },
  weekly: { label: 'Weekly', chip: 'bg-slate-light text-ink-800' },
  seasonal: { label: 'Seasonal', chip: 'bg-slate text-white' },
};

/**
 * A single reorderable step in the routine planner. Parent page owns the
 * step list and reorders it on drop; this component only reports drag events.
 */
export default function RoutineCard({ step, index, onDragStart, onDragOver, onDrop, onToggleDone }) {
  const [dragging, setDragging] = useState(false);
  const period = PERIOD_STYLES[step.period] || PERIOD_STYLES.morning;

  return (
    <div
      draggable
      onDragStart={(e) => {
        setDragging(true);
        onDragStart?.(e, index);
      }}
      onDragEnd={() => setDragging(false)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, index);
      }}
      onDrop={(e) => onDrop?.(e, index)}
      className={`card flex cursor-grab items-center gap-4 p-4 transition-shadow active:cursor-grabbing ${
        dragging ? 'opacity-50 shadow-none' : ''
      }`}
    >
      <span className="text-ink-300" aria-hidden="true">⠿⠿</span>

      <button
        onClick={() => onToggleDone?.(step.id)}
        aria-label={step.done ? 'Mark step incomplete' : 'Mark step complete'}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          step.done ? 'border-amber bg-amber text-ink-800' : 'border-ink-200'
        }`}
      >
        {step.done && '✓'}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate font-display text-sm font-semibold ${step.done ? 'text-ink-300 line-through' : 'text-ink-800'}`}>
          {step.product_name}
        </p>
        <p className="truncate text-xs text-ink-400">{step.instruction}</p>
      </div>

      <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${period.chip}`}>
        {period.label}
      </span>
    </div>
  );
}
