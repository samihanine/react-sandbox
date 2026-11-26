import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), mode === "html" && viteSingleFile()],
  resolve: { alias: { "@": resolve("src") } },
  build: { outDir: mode === "html" ? "dist-html" : "dist" },
}));
