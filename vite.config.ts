import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const REQUIRED_ENV = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"] as const;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Vite inlines these at build time, so a deploy with the variables unset
  // produces a bundle that throws on first paint - a blank page whose only clue
  // is in the browser console. Failing the build instead surfaces it in the
  // Vercel build log, where it is actionable.
  if (command === "build") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const missing = REQUIRED_ENV.filter((key) => !env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variable(s): ${missing.join(", ")}.\n` +
          "Locally: copy .env.example to .env and fill them in.\n" +
          "On Vercel: Project Settings > Environment Variables, then redeploy.",
      );
    }
  }

  return {
    plugins: [react()],
    server: {
      allowedHosts: true,
    },
    build: {
      chunkSizeWarningLimit: 5000,
    },
  };
});
