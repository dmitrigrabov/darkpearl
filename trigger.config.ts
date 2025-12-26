import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_ggneceextgunzowhlsql",
  runtime: "node",
  logLevel: "info",
  maxDuration: 60,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
    },
  },
  dirs: ["./supabase/trigger"],
});
