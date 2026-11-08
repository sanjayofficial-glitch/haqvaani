import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* Dev/preview proxy solves CORS: the FastAPI (haqvaani/api.py) has no CORS
   middleware and must not be modified, so all /api traffic travels same-origin
   through Vite and lands on the API at http://localhost:8000. For a static
   deployment set VITE_API_BASE at build time (see web/README.md). */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } },
  },
  preview: {
    port: 4173,
    proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } },
  },
  build: { outDir: "dist", target: "es2019", assetsInlineLimit: 0 },
});
