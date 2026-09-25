import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function appFallback() {
  return {
    name: "app-fallback",

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (
          req.url &&
          req.url.startsWith("/app") &&
          !req.url.includes(".")
        ) {
          req.url = "/app/index.html";
        }

        next();
      });
    },

    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (
          req.url &&
          req.url.startsWith("/app") &&
          !req.url.includes(".")
        ) {
          req.url = "/app/index.html";
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    appFallback(),
  ],

  build: {
    rollupOptions: {
      input: {
        landing: "index.html",
        app: "app/index.html",
      },
    },
  },
});