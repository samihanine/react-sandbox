import { type Ref, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { POSTER_HEIGHT, POSTER_WIDTH, type Poster } from "@/posters";

export type PosterHandle = {
  /** The `.poster` element drawn at 600 × 900, used for exports. */
  element: () => HTMLElement | null;
};

type Props = {
  poster: Poster;
  className?: string;
  ref?: Ref<PosterHandle>;
};

/** Renders a poster at its native 600 × 900 size and scales it to fit the available width. */
export function PosterView({ poster, className, ref }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useImperativeHandle(ref, () => ({ element: () => hostRef.current?.querySelector<HTMLElement>(".poster") ?? null }));

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(() => setScale(frame.clientWidth / POSTER_WIDTH));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const root = hostRef.current?.querySelector<HTMLElement>(".poster");
    if (root) poster.draw?.(root);
  }, [poster]);

  return (
    <div ref={frameRef} className={cn("relative aspect-2/3 w-full overflow-hidden bg-white", className)}>
      <div
        ref={hostRef}
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: POSTER_WIDTH, height: POSTER_HEIGHT, transform: `scale(${scale})` }}
        // Poster markup is static design source authored in this repo (src/posters/markup).
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, bundled SVG/HTML markup
        dangerouslySetInnerHTML={{ __html: poster.html }}
      />
    </div>
  );
}
