import { toBlob, toSvg } from "html-to-image";
import { POSTER_HEIGHT, POSTER_WIDTH } from "@/posters";

export type ExportFormat = "png" | "svg";

/** 600 × 900 drawn at ×6 gives 3600 × 5400 px: enough for an A3 print at 300 dpi. */
export const PNG_PIXEL_RATIO = 6;

const options = {
  width: POSTER_WIDTH,
  height: POSTER_HEIGHT,
  // The on-screen poster is scaled down to fit its card; the export is always drawn at full size.
  style: { transform: "none", left: "0", top: "0" },
};

export function posterFileName(slug: string, format: ExportFormat) {
  return `affiche-petits-freres-${slug}.${format}`;
}

/** Decodes the `data:image/svg+xml;charset=utf-8,…` URL returned by html-to-image into the SVG source. */
export function svgFromDataUrl(dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) throw new Error("Invalid data URL");
  const head = dataUrl.slice(0, comma);
  const body = dataUrl.slice(comma + 1);
  return head.endsWith(";base64") ? atob(body) : decodeURIComponent(body);
}

function save(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Custom properties the illustrations read; see `.poster` and the per-poster palettes in posters.css. */
const PALETTE_VARS = [
  "--paper",
  ...["red", "red2", "yel", "yel2", "grn", "grn2", "blu", "blu2", "wht", "brn", "brn2", "krf", "krf2"],
  ...["skin", "skin2", "blush", "ink", "hair", "hair2", "mouth"],
].map((name) => (name.startsWith("--") ? name : `--c-${name}`));

/**
 * html-to-image copies computed styles, which leave out custom properties, so the illustrations
 * (filled with `var(--c-…)`) would come out black. Writing the resolved palette inline fixes that.
 */
function inlinePalette(node: HTMLElement) {
  const computed = getComputedStyle(node);
  for (const name of PALETTE_VARS) {
    const value = computed.getPropertyValue(name).trim();
    if (value) node.style.setProperty(name, value);
  }
}

export async function downloadPoster(node: HTMLElement, slug: string, format: ExportFormat) {
  await document.fonts.ready;
  inlinePalette(node);
  if (format === "svg") {
    const svg = svgFromDataUrl(await toSvg(node, options));
    save(new Blob([svg], { type: "image/svg+xml" }), posterFileName(slug, format));
    return;
  }
  const blob = await toBlob(node, { ...options, pixelRatio: PNG_PIXEL_RATIO });
  if (!blob) throw new Error("Le navigateur n’a pas pu créer l’image.");
  save(blob, posterFileName(slug, format));
}
