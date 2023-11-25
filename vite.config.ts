import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    singleThread: true,
    environment: "happy-dom",
    setupFiles: "./setup-tests.ts",
    coverage: {
      reporter: ["text", "json"],
    },
  },
})
