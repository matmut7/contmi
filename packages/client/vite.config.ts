import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    target: "esnext",
    rollupOptions: { treeshake: "smallest" },
  },
  optimizeDeps: {
    exclude: ["@vite/client", "@vite/env"],
    esbuildOptions: {
      target: "esnext",
    },
  },
  plugins: [react()],
});
