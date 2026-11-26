import { describe, expect, it } from "vitest";
import { posters } from "@/posters";
import { posterFileName, svgFromDataUrl } from "@/posters/export";

describe("svgFromDataUrl", () => {
  it("decodes URL-encoded SVG data URLs", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>Thé & café</text></svg>';
    expect(svgFromDataUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)).toBe(svg);
  });

  it("decodes base64 SVG data URLs", () => {
    expect(svgFromDataUrl(`data:image/svg+xml;base64,${btoa("<svg/>")}`)).toBe("<svg/>");
  });
});

describe("posters", () => {
  it("have unique slugs and ASCII file names", () => {
    const slugs = posters.map((poster) => poster.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(posterFileName(slug, "png")).toMatch(/^[a-z0-9-]+\.png$/);
  });

  it("each carry the shared illustration library inside their own root", () => {
    for (const poster of posters) {
      expect(poster.html.startsWith('<div class="poster ')).toBe(true);
      expect(poster.html).toContain('id="ill-mamie"');
    }
  });
});
