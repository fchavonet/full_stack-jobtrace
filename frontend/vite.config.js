import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  test: {
    environment: "jsdom",
    setupFiles: [
      "./tests/helpers/setup.js",
    ],
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    css: false,
    coverage: {
      provider: "v8",
      reporter: [
        "text",
        "html",
      ],
      include: [
        "src/**/*.{js,jsx}",
      ],
      exclude: [
        "src/main.jsx",
      ],
      reportsDirectory: "./coverage",
    },
  },
});