import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const VIRTUAL_ID = "virtual:duckdb-assets";

// Inlines the DuckDB wasm + worker as gzipped base64 so the app works offline from a single file.
const duckdbAssets = (mode: string): Plugin => ({
  name: "duckdb-assets",
  resolveId: (id) => (id === VIRTUAL_ID ? `\0${id}` : undefined),
  load(id) {
    if (id !== `\0${VIRTUAL_ID}`) return;
    if (mode === "test") return `export const wasm = "";\nexport const worker = "";`;
    const pack = (file: string) =>
      gzipSync(readFileSync(resolve("node_modules/@duckdb/duckdb-wasm/dist", file))).toString("base64");
    return `export const wasm = "${pack("duckdb-eh.wasm")}";\nexport const worker = "${pack("duckdb-browser-eh.worker.js")}";`;
  },
});

// Blocks every network request from the built page: data can never leave the computer.
const CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' 'wasm-unsafe-eval' blob:",
  "worker-src blob:",
  "connect-src data: blob:",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const contentSecurityPolicy = (): Plugin => ({
  name: "content-security-policy",
  apply: "build",
  transformIndexHtml: (html) =>
    html.replace('<meta charset="UTF-8" />', `$&\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), duckdbAssets(mode), contentSecurityPolicy(), mode === "html" && viteSingleFile()],
  resolve: { alias: { "@": resolve("src") } },
  build: { outDir: mode === "html" ? "dist-html" : "dist", chunkSizeWarningLimit: 50_000 },
}));
