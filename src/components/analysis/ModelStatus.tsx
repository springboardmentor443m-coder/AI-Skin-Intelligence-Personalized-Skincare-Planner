import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelStatusValue } from "@/lib/api";

const COPY: Record<ModelStatusValue, string> = {
  checking: "Checking AI model…",
  ready: "AI Model Ready",
  offline: "AI Model Offline",
  unconfigured: "AI Model Not Configured",
};

export function ModelStatus({ status }: { status: ModelStatusValue }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        status === "ready"
          ? "border-success/30 bg-success/10 text-success"
          : status === "checking"
            ? "border-border bg-secondary text-muted-foreground"
            : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
      aria-live="polite"
    >
      {status === "checking" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <span
          className={cn(
            "size-2 rounded-full",
            status === "ready" ? "bg-success" : "bg-destructive",
          )}
        />
      )}
      {COPY[status]}
    </span>
  );
}
