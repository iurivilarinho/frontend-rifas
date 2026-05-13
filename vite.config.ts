/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon-180.png",
        "icon-192.png",
        "icon-512.png",
        "icon-512-maskable.png",
        "runtime-config.js",
        "splash/*.png",
      ],
      manifest: {
        id: "/",
        name: "Golden Book — Ebooks e Campanhas",
        short_name: "Golden Book",
        description: "Ebooks digitais com acesso imediato e campanhas de prêmios.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#16a34a",
        background_color: "#f0fdf4",
        lang: "pt-BR",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Catálogo",
            short_name: "Catálogo",
            description: "Ver ações disponíveis.",
            url: "/raffles",
            icons: [{ src: "/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Painel",
            short_name: "Painel",
            description: "Acessar painel administrativo.",
            url: "/panel",
            icons: [{ src: "/icon-192.png", sizes: "192x192" }],
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },
    }),
  ],
});
