import { defineConfig, loadEnv, type Plugin } from "vite";
import {developmentSecurity} from "../scripts/vite-dev-security.mjs";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/* The page's Content-Security-Policy only allows http://localhost:4000 for API calls and images.
   When building for a phone (or any deployed backend), add the real API origin from VITE_API_URL. */
function apiOriginInCsp(apiUrl: string | undefined): Plugin {
  return {
    name: "streamflix-api-origin-csp",
    apply: "build",
    transformIndexHtml(html) {
      if (!apiUrl) return html;
      let origin = "";
      try { origin = new URL(apiUrl).origin; } catch { return html; }
      if (origin === "http://localhost:4000") return html;
      return html.replace(/http:\/\/localhost:4000/g, `http://localhost:4000 ${origin}`);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [developmentSecurity(), apiOriginInCsp(loadEnv(mode, rootDir, "VITE_").VITE_API_URL), react()],
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
    port: 5173,
    strictPort: true,
  },
}));
