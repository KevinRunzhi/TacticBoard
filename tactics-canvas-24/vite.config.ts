import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
const tauriHost = process.env.TAURI_DEV_HOST;

export default defineConfig(({ mode }) => ({
  clearScreen: false,
  server: {
    host: tauriHost || "::",
    port: 8080,
    strictPort: true,
    hmr: tauriHost
      ? {
          host: tauriHost,
          port: 8081,
          protocol: "ws",
          overlay: false,
        }
      : {
          overlay: false,
        },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
