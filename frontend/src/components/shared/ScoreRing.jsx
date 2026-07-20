import { useEffect, useRef, useState } from 'react';

/**
 * The product's signature visual: a circular gauge swept in the brand gradient
 * (#2D3250 -> #7077A1 -> #F6B17A) that always reads left-to-right as "developing
 * to healthy" skin signal. Used on the landing hero and inside every dashboard
 * so a score always looks and behaves the same way, wherever it appears.
 */
export default function ScoreRing({ score = 0, size = 168, label = 'Skin health score', sublabel }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const [offset, setOffset] = useState(circumference);
  const gradientId = useRef(`ring-gradient-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    const target = circumference - (clamped / 100) * circumference;
    const raf = requestAnimationFrame(() => setOffset(target));
    return () => cancelAnimationFrame(raf);
  }, [clamped, circumference]);

  const tone = clamped >= 75 ? 'text-amber-dark' : clamped >= 45 ? 'text-slate-dark' : 'text-ink-700';

  return (
    <div className="inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
        <defs>
          <linearGradient id={gradientId.current} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2D3250" />
            <stop offset="55%" stopColor="#7077A1" />
            <stop offset="100%" stopColor="#F6B17A" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#F1F2F7" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId.current})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="flex flex-col items-center" style={{ marginTop: `-${size * 0.66}px` }}>
        <span className={`font-display text-4xl font-bold ${tone}`}>{Math.round(clamped)}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">/ 100</span>
      </div>
      <p className="mt-3 text-center font-display text-sm font-semibold text-ink-700">{label}</p>
      {sublabel && <p className="text-center text-xs text-ink-400">{sublabel}</p>}
    </div>
  );
}
