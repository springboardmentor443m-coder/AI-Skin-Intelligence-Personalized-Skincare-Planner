export default function ProgressBar({ value = 0, label, tone = 'amber' }) {
  const clamped = Math.max(0, Math.min(100, value));
  const fillClass = {
    amber: 'bg-amber',
    slate: 'bg-slate',
    ink: 'bg-ink-700',
  }[tone];

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-500">
          <span>{label}</span>
          <span className="font-display font-semibold text-ink-700">{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className={`h-full rounded-full ${fillClass} transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
