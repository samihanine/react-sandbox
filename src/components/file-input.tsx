import { FileUpIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type FileInputProps = {
  accept?: string;
  disabled?: boolean;
  onFile: (file: File) => void;
  hint?: string;
};

export function FileInput({ accept, disabled, onFile, hint }: FileInputProps) {
  const [dragging, setDragging] = useState(false);

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) pick(e.dataTransfer.files);
      }}
      className={cn(
        "hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
        dragging && "border-primary bg-muted/50",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <FileUpIcon className="text-muted-foreground size-10" />
      <span className="text-lg font-medium">Drop a file here or click to browse</span>
      {hint && <span className="text-muted-foreground text-sm">{hint}</span>}
      <input
        type="file"
        className="sr-only"
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}
