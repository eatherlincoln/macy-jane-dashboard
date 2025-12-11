import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@supabaseClient": path.resolve(__dirname, "src/lib/supabaseClient")
    }
  },
  server: supabaseUrl
    ? {
        // Proxy Supabase edge functions during local dev to bypass CORS issues.
        proxy: {
          "/functions": {
            target: supabaseUrl,
            changeOrigin: true
          }
        }
      }
    : undefined
});
