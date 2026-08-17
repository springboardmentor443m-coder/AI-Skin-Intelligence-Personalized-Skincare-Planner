import * as React from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png"];

export function isValidImage(file: File) {
  return ACCEPTED.includes(file.type.toLowerCase()) || /\.(jpe?g|png)$/i.test(file.name);
}

export function SkinUploader({
  onSelect,
  onInvalid,
}: {
  onSelect: (file: File) => void;
  onInvalid: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const handle = (file: File | null | undefined) => {
    if (!file) return;
    if (!isValidImage(file)) {
      onInvalid();
      return;
    }
    onSelect(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-10 text-center transition-all duration-200",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border bg-secondary/40 hover:border-primary/50 hover:bg-secondary",
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <UploadCloud className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium">Drag &amp; drop your image here</p>
        <p className="text-xs text-muted-foreground">or</p>
        <p className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Browse from device
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        JPG or PNG • Clear, front-facing image recommended
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="sr-only"
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}
