import { ShieldCheck } from "lucide-react";
import type { SkinAnalysis } from "@/lib/api";

function ConfidenceRing({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-28 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-secondary" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-primary transition-all duration-700"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-semibold">{pct}%</span>
        <span className="text-[10px] text-muted-foreground">Confidence</span>
      </div>
    </div>
  );
}

export function AnalysisResult({ result }: { result: SkinAnalysis }) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-primary" />
        <h3 className="font-display text-base font-semibold">Analysis Result</h3>
      </div>
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-secondary/50 p-5 sm:flex-row">
        <ConfidenceRing value={result.confidence} />
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Predicted condition</p>
          <p className="font-display text-2xl font-semibold">{result.predictionLabel}</p>
          <p className="text-xs text-muted-foreground">Model: {result.modelVersion}</p>
        </div>
      </div>
    </div>
  );
}
