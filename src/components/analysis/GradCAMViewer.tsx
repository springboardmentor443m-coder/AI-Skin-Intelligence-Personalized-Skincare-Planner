import { Eye } from "lucide-react";

export function GradCAMViewer({
  originalUrl,
  gradcamUrl,
}: {
  originalUrl: string | null;
  gradcamUrl: string | null;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Eye className="size-4 text-primary" />
        <h3 className="font-display text-base font-semibold">AI Attention Map</h3>
      </div>
      {gradcamUrl ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="space-y-2">
              <img
                src={originalUrl ?? gradcamUrl}
                alt="Original uploaded skin photo"
                className="w-full rounded-xl border border-border object-cover"
              />
              <figcaption className="text-xs text-muted-foreground">Original Image</figcaption>
            </figure>
            <figure className="space-y-2">
              <img
                src={gradcamUrl}
                alt="Grad-CAM heatmap highlighting regions that influenced the prediction"
                className="w-full rounded-xl border border-border object-cover"
              />
              <figcaption className="text-xs text-muted-foreground">Grad-CAM</figcaption>
            </figure>
          </div>
          <p className="text-xs text-muted-foreground">
            Grad-CAM highlights image regions that influenced the model prediction.
          </p>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          Attention visualization is not available for this analysis.
        </p>
      )}
    </div>
  );
}
