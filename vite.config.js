import { copyFileSync } from "fs";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/full_stack-jobtrace/",
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "gh-pages-fallback",
      closeBundle() {
        copyFileSync("dist/index.html", "dist/404.html");
      }
    }
  ],
  server: {
    host: "0.0.0.0",
    port: 3000
  }
});
