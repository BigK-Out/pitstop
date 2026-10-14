import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Open the dev server in Chrome instead of the system default browser.
// Override with e.g. `BROWSER=firefox npm run dev`.
process.env.BROWSER ??= "google-chrome";

export default defineConfig({
  plugins: [react()],
  server: { open: true },
});
