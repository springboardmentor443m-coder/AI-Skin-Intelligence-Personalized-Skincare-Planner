import { BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { SkinPrediction } from "@/lib/api";

export function ConfidenceChart({ distribution }: { distribution: SkinPrediction[] }) {
  if (distribution.length === 0) return null;
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-4 text-primary" />
        <h3 className="font-display text-base font-semibold">AI Confidence Breakdown</h3>
      </div>
      <div className="space-y-3">
        {distribution.map((p) => (
          <div key={p.condition} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{p.label}</span>
              <span className="text-muted-foreground">{Math.round(p.confidence * 100)}%</span>
            </div>
            <Progress value={p.confidence * 100} />
          </div>
        ))}
      </div>
    </div>
  );
}
