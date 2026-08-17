import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyzeButton({
  onClick,
  loading,
  disabled,
}: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <Button onClick={onClick} disabled={loading || disabled} size="lg" className="w-full">
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
      {loading ? "Analyzing your skin…" : "Analyze Skin"}
    </Button>
  );
}
