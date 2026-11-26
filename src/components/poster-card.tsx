import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type PosterHandle, PosterView } from "@/components/poster-view";
import { Button } from "@/components/ui/button";
import type { Poster } from "@/posters";
import { downloadPoster, type ExportFormat } from "@/posters/export";

const FORMATS: { format: ExportFormat; label: string; hint: string }[] = [
  { format: "png", label: "PNG", hint: "Image 3600 × 5400 px, pour imprimer" },
  { format: "svg", label: "SVG", hint: "Vectoriel, pour retoucher ou agrandir" },
];

export function PosterCard({ poster, index }: { poster: Poster; index: number }) {
  const view = useRef<PosterHandle>(null);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setZoomed(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [zoomed]);

  const download = async (format: ExportFormat) => {
    const node = view.current?.element();
    if (!node) return;
    setBusy(format);
    try {
      await downloadPoster(node, poster.slug, format);
      toast.success(`« ${poster.title} » téléchargée en ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Le téléchargement a échoué : ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <article id={poster.slug} className="flex min-w-0 scroll-mt-6 flex-col gap-4">
      <button
        type="button"
        onClick={() => setZoomed(true)}
        className="focus-visible:ring-ring/50 cursor-zoom-in overflow-hidden rounded-md shadow-[0_1px_2px_rgb(0_0_0/0.08),0_18px_40px_-18px_rgb(0_0_0/0.35)] outline-none focus-visible:ring-3"
        aria-label={`Agrandir l’affiche « ${poster.title} »`}
      >
        <PosterView ref={view} poster={poster} />
      </button>

      <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1">
        <span className="text-muted-foreground row-span-3 font-serif text-2xl tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-base font-semibold">{poster.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{poster.description}</p>
        {poster.inspiration && <p className="text-muted-foreground/80 text-xs italic">{poster.inspiration}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {FORMATS.map(({ format, label, hint }) => (
          <Button
            key={format}
            variant="outline"
            disabled={busy !== null}
            onClick={() => download(format)}
            title={hint}
            className="flex-1"
          >
            {busy === format ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
            Télécharger en {label}
          </Button>
        ))}
      </div>

      {zoomed && (
        <button
          type="button"
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-5"
          aria-label="Fermer l’aperçu"
        >
          <PosterView poster={poster} className="w-[min(92vw,calc(94vh*2/3))] rounded-sm shadow-2xl" />
          <span className="fixed inset-x-0 bottom-3 text-center text-xs tracking-wide text-white/60">
            Cliquer ou Échap pour fermer
          </span>
        </button>
      )}
    </article>
  );
}
