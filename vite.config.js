import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Open the dev server in Chrome instead of the system default browser.
// Override with e.g. `BROWSER=firefox npm run dev`.
process.env.BROWSER ??= "google-chrome";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { open: true },
  preview: { open: false },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/unit/**/*.test.{js,jsx}"],
    restoreMocks: true,
  },
});
