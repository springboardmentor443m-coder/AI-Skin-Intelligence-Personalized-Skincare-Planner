import { ImageIcon, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImagePreview({
  url,
  name,
  onChange,
  onRemove,
}: {
  url: string;
  name: string;
  onChange: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ImageIcon className="size-4 text-primary" />
        Selected image
      </div>
      <img
        src={url}
        alt="Preview of the uploaded skin photo"
        className="mx-auto w-full max-w-[500px] rounded-xl border border-border object-cover shadow-soft"
      />
      <p className="truncate text-xs text-muted-foreground">{name}</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onChange}>
          <RefreshCcw className="size-3.5" />
          Change image
        </Button>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="size-3.5" />
          Remove
        </Button>
      </div>
    </div>
  );
}
