import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERROR_COPY, type AnalysisErrorCode } from "@/lib/api";

export function AnalysisErrorCard({
  code,
  onRetry,
}: {
  code: AnalysisErrorCode;
  onRetry?: () => void;
}) {
  const copy = ERROR_COPY[code];
  return (
    <div className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="space-y-2">
        <p className="text-sm font-medium text-destructive">{copy.title}</p>
        <p className="text-xs text-muted-foreground">{copy.description}</p>
        {onRetry && code !== "AI_API_NOT_CONFIGURED" && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RotateCcw className="size-3.5" />
            Retry Analysis
          </Button>
        )}
      </div>
    </div>
  );
}
