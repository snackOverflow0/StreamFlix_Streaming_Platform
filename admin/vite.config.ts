import { defineConfig } from "vite";
import {developmentSecurity} from "../scripts/vite-dev-security.mjs";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [developmentSecurity(), react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  build: {rollupOptions: {output: {manualChunks(id) {
    if(id.includes("node_modules/@supabase/"))return "supabase";
    if(id.includes("node_modules/lucide-react/"))return "icons";
    if(id.includes("node_modules/@radix-ui/"))return "ui";
  }}}},
  server: {
    headers: {"Cache-Control": "no-store"},
    port: 5174,
    strictPort: true,
  },
});
