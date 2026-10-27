import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const VIRTUAL_ID = "virtual:duckdb-assets";

// Inlines the DuckDB wasm + worker as gzipped base64 so the app works offline from a single file.
const duckdbAssets = (): Plugin => ({
  name: "duckdb-assets",
  resolveId: (id) => (id === VIRTUAL_ID ? `\0${id}` : undefined),
  load(id) {
    if (id !== `\0${VIRTUAL_ID}`) return;
    const pack = (file: string) =>
      gzipSync(readFileSync(resolve("node_modules/@duckdb/duckdb-wasm/dist", file))).toString("base64");
    return `export const wasm = "${pack("duckdb-eh.wasm")}";\nexport const worker = "${pack("duckdb-browser-eh.worker.js")}";`;
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), duckdbAssets(), mode === "html" && viteSingleFile()],
  resolve: { alias: { "@": resolve("src") } },
  build: { outDir: mode === "html" ? "dist-html" : "dist", chunkSizeWarningLimit: 50_000 },
}));
