import { Lightbulb } from "lucide-react";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";

export function SkinInsights({ label, confidence }: { label: string; confidence: number }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 text-primary" />
        <h3 className="font-display text-base font-semibold">Skin Insights</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        The uploaded image was classified most strongly as <span className="font-medium text-foreground">{label}</span>{" "}
        by the AI model, with a confidence of {Math.round(confidence * 100)}%. Visible patterns in the photo — such as
        texture, tone and redness — influenced this classification. Lighting, camera quality and makeup can affect the
        result, so consider re-testing with a clear, well-lit, makeup-free photo.
      </p>
      <p className="rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Important:</span> This AI result is for educational and
        informational purposes only and is not a medical diagnosis. {MEDICAL_DISCLAIMER}
      </p>
    </div>
  );
}
